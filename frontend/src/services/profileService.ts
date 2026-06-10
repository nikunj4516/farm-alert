import { supabase } from "@/integrations/supabase/client";
import { Database } from "@/types/database.types";
import { getSavedSelectedLocation } from "@/services/gujaratLocationService";

export type Profile = Database["public"]["Tables"]["profiles"]["Row"];
export type ProfileUpdate = Database["public"]["Tables"]["profiles"]["Update"];
export type ProfileInsert = Database["public"]["Tables"]["profiles"]["Insert"];

const legacyProfileKeys = new Set([
  "name",
  "phone",
  "village",
  "taluka",
  "district",
  "state",
  "crop_type",
  "land_size",
  "preferred_language",
  "profile_image_url",
  "profile_completed",
  "onboarding_completed",
  "latitude",
  "longitude",
]);
const profileImageBuckets = ["Profile", "profile storge", "profile-storage", "profile-images"];

const getErrorMessage = (error: unknown) => {
  if (error instanceof Error) return error.message;
  if (error && typeof error === "object" && "message" in error) {
    return String((error as { message?: unknown }).message);
  }
  return "Unable to save profile";
};

const isMissingProfileColumnError = (error: unknown) => {
  const errorLike = error as { code?: string; message?: string; details?: string } | null;
  const message = `${errorLike?.message || ""} ${errorLike?.details || ""}`.toLowerCase();

  return (
    errorLike?.code === "PGRST204" ||
    (message.includes("column") && message.includes("profiles") && message.includes("schema cache"))
  );
};

const toLegacyProfilePayload = (profile: ProfileUpdate) =>
  Object.fromEntries(Object.entries(profile).filter(([key]) => legacyProfileKeys.has(key))) as ProfileUpdate;

const toMinimalProfilePayload = (profile: ProfileUpdate | Record<string, unknown>) =>
  Object.fromEntries(
    Object.entries(profile).filter(([key]) =>
      ["name", "phone", "village", "taluka", "district", "crop_type", "land_size"].includes(key)
    )
  ) as ProfileUpdate;

const getMissingColumnName = (error: unknown) => {
  const message = getErrorMessage(error);
  return message.match(/'([^']+)'\s+column/)?.[1] || message.match(/Could not find the '([^']+)' column/)?.[1];
};

const withoutColumn = (profile: ProfileUpdate, columnName: string) => {
  const { [columnName]: _removed, ...rest } = profile as Record<string, unknown>;
  return rest as ProfileUpdate;
};

const getImageExtension = (file: File) => {
  const extension = file.name.split(".").pop()?.toLowerCase();
  if (extension && ["jpg", "jpeg", "png", "webp"].includes(extension)) return extension;
  if (file.type === "image/png") return "png";
  if (file.type === "image/webp") return "webp";
  return "jpg";
};

const compressProfileImage = async (file: File): Promise<File> =>
  new Promise((resolve) => {
    const image = new Image();
    const objectUrl = URL.createObjectURL(file);

    image.onload = () => {
      URL.revokeObjectURL(objectUrl);
      const canvas = document.createElement("canvas");
      const maxSize = 720;
      const sourceSize = Math.min(image.width, image.height);
      const sourceX = Math.max(0, Math.round((image.width - sourceSize) / 2));
      const sourceY = Math.max(0, Math.round((image.height - sourceSize) / 2));
      const outputSize = Math.min(maxSize, sourceSize);
      canvas.width = Math.max(1, outputSize);
      canvas.height = Math.max(1, outputSize);
      const context = canvas.getContext("2d");

      if (!context) {
        resolve(file);
        return;
      }

      context.drawImage(image, sourceX, sourceY, sourceSize, sourceSize, 0, 0, canvas.width, canvas.height);
      canvas.toBlob(
        (blob) => {
          if (!blob) {
            resolve(file);
            return;
          }
          resolve(new File([blob], file.name.replace(/\.[^.]+$/, ".jpg"), { type: "image/jpeg" }));
        },
        "image/jpeg",
        0.82
      );
    };

    image.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      resolve(file);
    };

    image.src = objectUrl;
  });

export class ProfileService {
  static isProfileComplete(profile?: Partial<Profile> | null) {
    if (!profile) return false;
    const extra = profile as Partial<Profile> & { profile_completed?: boolean | null; onboarding_completed?: boolean | null };
    const savedLocation = typeof window !== "undefined" ? getSavedSelectedLocation() : null;
    const hasSavedHierarchy = Boolean(
      (profile.district || savedLocation?.district) &&
      (profile.taluka || savedLocation?.taluka)
    );
    const hasLocalCompletion = typeof window !== "undefined" && localStorage.getItem("farmalert_profile_completed") === "true";

    return Boolean(
      extra.profile_completed ||
      extra.onboarding_completed ||
      (hasLocalCompletion && profile.name && hasSavedHierarchy && (profile.crop_type || profile.land_size)) ||
      (profile.name && hasSavedHierarchy && (profile.crop_type || profile.land_size))
    );
  }

  /**
   * Fetches the user's profile and preferences
   */
  static async getProfile(userId: string): Promise<Profile | null> {
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("user_id", userId)
      .maybeSingle();

    if (error) {
      console.error("Error fetching profile:", error);
      throw error;
    }

    if (data) {
      let imageUrl = data.profile_image_url;

      // 1. Local Storage Fallback
      if (!imageUrl && typeof window !== "undefined") {
        imageUrl = localStorage.getItem(`farmalert_profile_image_url_${userId}`);
      }

      // 2. Auth Metadata Fallback
      if (!imageUrl) {
        try {
          const { data: { user } } = await supabase.auth.getUser();
          if (user && user.id === userId) {
            imageUrl = user.user_metadata?.avatar_url || user.user_metadata?.profile_image_url || null;
          }
        } catch (authErr) {
          console.warn("Could not fetch user metadata for profile image fallback:", authErr);
        }
      }

      if (imageUrl && !data.profile_image_url) {
        data.profile_image_url = imageUrl;
      }
    }

    return data;
  }

  /**
   * Update the user's profile
   */
  static async updateProfile(userId: string, updates: ProfileUpdate): Promise<Profile> {
    let payload = updates;
    let lastError: unknown = null;

    // Cache profile image url in localStorage if specified
    if (updates.profile_image_url && typeof window !== "undefined") {
      localStorage.setItem(`farmalert_profile_image_url_${userId}`, updates.profile_image_url);
    }

    for (let attempt = 0; attempt < 20; attempt += 1) {
      const { data, error } = await supabase
        .from("profiles")
        .update(payload)
        .eq("user_id", userId)
        .select()
        .single();

      if (!error) return data;

      lastError = error;

      if (!isMissingProfileColumnError(error)) {
        console.error("Error updating profile:", error);
        throw new Error(getErrorMessage(error));
      }

      const missingColumn = getMissingColumnName(error);
      payload = missingColumn ? withoutColumn(payload, missingColumn) : toLegacyProfilePayload(payload);

      if (Object.keys(payload).length === 0) {
        const currentProfile = await this.getProfile(userId);
        if (currentProfile) return currentProfile;
        break;
      }
    }

    console.error("Error updating profile:", lastError);
    throw new Error(getErrorMessage(lastError));
  }

  /**
   * Create or update the user's profile using user_id as the stable key.
   */
  static async upsertProfile(userId: string, profile: ProfileUpdate | Record<string, unknown>): Promise<Profile> {
    const saveProfile = async (payload: ProfileUpdate) =>
      supabase
        .from("profiles")
        .upsert(
          {
            ...payload,
            user_id: userId,
          } as ProfileInsert,
          { onConflict: "user_id" }
        )
        .select()
        .single();

    let payload = profile as ProfileUpdate;
    let lastError: unknown = null;

    // Cache profile image url in localStorage if specified
    if (payload.profile_image_url && typeof window !== "undefined") {
      localStorage.setItem(`farmalert_profile_image_url_${userId}`, payload.profile_image_url);
    }

    for (let attempt = 0; attempt < 20; attempt += 1) {
      const { data, error } = await saveProfile(payload);

      if (!error) return data;

      lastError = error;

      if (!isMissingProfileColumnError(error)) {
        console.error("Error saving profile:", error);
        throw new Error(getErrorMessage(error));
      }

      const missingColumn = getMissingColumnName(error);
      payload = missingColumn ? withoutColumn(payload, missingColumn) : toLegacyProfilePayload(payload);

      if (Object.keys(payload).length === 0) break;
    }

    console.error("Error saving profile:", lastError);
    if (isMissingProfileColumnError(lastError)) {
      let minimalPayload = toMinimalProfilePayload(profile as Record<string, unknown>);

      for (let attempt = 0; attempt < 10 && Object.keys(minimalPayload).length > 0; attempt += 1) {
        const { data, error } = await saveProfile(minimalPayload);
        if (!error) return data;

        lastError = error;
        if (!isMissingProfileColumnError(error)) break;

        const missingColumn = getMissingColumnName(error);
        if (!missingColumn) break;
        minimalPayload = withoutColumn(minimalPayload, missingColumn);
      }
    }

    throw new Error(getErrorMessage(lastError));
  }

  static getErrorMessage(error: unknown) {
    return getErrorMessage(error);
  }

  static async uploadProfileImage(userId: string, file: File): Promise<string> {
    if (!file.type.startsWith("image/")) {
      throw new Error("Please choose an image file.");
    }

    if (file.size > 8 * 1024 * 1024) {
      throw new Error("Profile image must be smaller than 8 MB.");
    }

    const compressedFile = await compressProfileImage(file);
    const extension = getImageExtension(compressedFile);
    const version = Date.now();
    const uniqueId = (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") 
      ? crypto.randomUUID() 
      : `${version}-${Math.random().toString(36).slice(2)}`;
    const filePath = `${userId}/profile-${version}-${uniqueId}.${extension}`;
    let uploadedBucket = profileImageBuckets[0];
    let uploadError: unknown = null;

    for (const bucket of profileImageBuckets) {
      const { error } = await supabase.storage.from(bucket).upload(filePath, compressedFile, {
        cacheControl: "3600",
        contentType: compressedFile.type || `image/${extension}`,
        upsert: true,
      });

      if (!error) {
        uploadedBucket = bucket;
        uploadError = null;
        break;
      }

      uploadError = error;

      if (!error.message.toLowerCase().includes("bucket not found")) {
        break;
      }
    }

    if (uploadError) {
      console.error("Error uploading profile image:", uploadError);
      throw new Error(
        getErrorMessage(uploadError).includes("Bucket not found")
          ? "Profile image storage bucket was not found. Create a public bucket named Profile."
          : getErrorMessage(uploadError)
      );
    }

    const { data } = supabase.storage.from(uploadedBucket).getPublicUrl(filePath);
    const imageUrl = `${data.publicUrl}?v=${version}`;

    // Store in localStorage cache immediately
    if (typeof window !== "undefined") {
      localStorage.setItem(`farmalert_profile_image_url_${userId}`, imageUrl);
    }

    try {
      await this.updateProfile(userId, { profile_image_url: imageUrl } as ProfileUpdate);
    } catch (error) {
      if (!isMissingProfileColumnError(error)) {
        throw error;
      }

      await supabase.auth.updateUser({
        data: {
          avatar_url: imageUrl,
          profile_image_url: imageUrl,
        },
      });
    }

    return imageUrl;
  }
}
