import { supabase } from "@/integrations/supabase/client";
import { Database } from "@/types/database.types";

export type Profile = Database["public"]["Tables"]["profiles"]["Row"];
export type ProfileUpdate = Database["public"]["Tables"]["profiles"]["Update"];
export type ProfileInsert = Database["public"]["Tables"]["profiles"]["Insert"];

const legacyProfileKeys = new Set(["name", "phone", "village", "district", "crop_type", "land_size"]);
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

const getMissingColumnName = (error: unknown) => {
  const message = getErrorMessage(error);
  return message.match(/'([^']+)'\s+column/)?.[1];
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

export class ProfileService {
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

    return data;
  }

  /**
   * Update the user's profile
   */
  static async updateProfile(userId: string, updates: ProfileUpdate): Promise<Profile> {
    let payload = updates;
    let lastError: unknown = null;

    for (let attempt = 0; attempt < 6; attempt += 1) {
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

      if (Object.keys(payload).length === 0) break;
    }

    console.error("Error updating profile:", lastError);
    throw new Error(getErrorMessage(lastError));
  }

  /**
   * Create or update the user's profile using user_id as the stable key.
   */
  static async upsertProfile(userId: string, profile: ProfileUpdate): Promise<Profile> {
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

    let payload = profile;
    let lastError: unknown = null;

    for (let attempt = 0; attempt < 6; attempt += 1) {
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
    throw new Error(getErrorMessage(lastError));
  }

  static getErrorMessage(error: unknown) {
    return getErrorMessage(error);
  }

  static async uploadProfileImage(userId: string, file: File): Promise<string> {
    if (!file.type.startsWith("image/")) {
      throw new Error("Please choose an image file.");
    }

    if (file.size > 2 * 1024 * 1024) {
      throw new Error("Profile image must be smaller than 2 MB.");
    }

    const extension = getImageExtension(file);
    const filePath = `${userId}/profile-${Date.now()}.${extension}`;
    let uploadedBucket = profileImageBuckets[0];
    let uploadError: unknown = null;

    for (const bucket of profileImageBuckets) {
      const { error } = await supabase.storage.from(bucket).upload(filePath, file, {
        cacheControl: "3600",
        contentType: file.type || `image/${extension}`,
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
    const imageUrl = data.publicUrl;

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
