import { supabase } from "@/integrations/supabase/client";

export const SUBSCRIPTION_ACTIVE_KEY = "farmalert_subscription_active";
export const SUBSCRIPTION_TIER_KEY = "farmalert_subscription_tier";
export const SUBSCRIPTION_DENIED_MESSAGE_KEY = "farmalert_subscription_required";
export const SUBSCRIPTION_CHECKED_AT_KEY = "farmalert_subscription_checked_at";
const SUBSCRIPTION_CHECK_FRESH_MS = 5 * 60 * 1000;

export const hasFreshLocalSubscription = () => {
  const checkedAt = Number(localStorage.getItem(SUBSCRIPTION_CHECKED_AT_KEY) || 0);
  return localStorage.getItem(SUBSCRIPTION_ACTIVE_KEY) === "true" && Date.now() - checkedAt < SUBSCRIPTION_CHECK_FRESH_MS;
};

export const getSavedSubscriptionTier = (): "free" | "premium" | "pro" => {
  if (localStorage.getItem(SUBSCRIPTION_ACTIVE_KEY) !== "true") return "free";
  return (localStorage.getItem(SUBSCRIPTION_TIER_KEY) as "premium" | "pro") || "free";
};

export const getActiveSubscriptionTier = async (userId: string): Promise<"free" | "premium" | "pro"> => {
  const { data, error } = await supabase
    .from("subscriptions")
    .select("status, expires_at, plan")
    .eq("user_id", userId)
    .eq("status", "active")
    .maybeSingle();

  if (error || !data) {
    localStorage.removeItem(SUBSCRIPTION_ACTIVE_KEY);
    localStorage.setItem(SUBSCRIPTION_TIER_KEY, "free");
    localStorage.setItem(SUBSCRIPTION_CHECKED_AT_KEY, String(Date.now()));
    return "free";
  }

  const isActive = !data.expires_at || new Date(data.expires_at).getTime() > Date.now();
  if (isActive) {
    localStorage.setItem(SUBSCRIPTION_ACTIVE_KEY, "true");
    const tier = data.plan === "daily" ? "pro" : "premium";
    localStorage.setItem(SUBSCRIPTION_TIER_KEY, tier);
    localStorage.setItem(SUBSCRIPTION_CHECKED_AT_KEY, String(Date.now()));
    return tier;
  } else {
    localStorage.removeItem(SUBSCRIPTION_ACTIVE_KEY);
    localStorage.setItem(SUBSCRIPTION_TIER_KEY, "free");
    localStorage.setItem(SUBSCRIPTION_CHECKED_AT_KEY, String(Date.now()));
    return "free";
  }
};

export const hasActiveSubscription = async (userId: string): Promise<boolean> => {
  const tier = await getActiveSubscriptionTier(userId);
  return tier !== "free";
};

export const markSubscriptionRequired = () => {
  localStorage.setItem(SUBSCRIPTION_DENIED_MESSAGE_KEY, "true");
  localStorage.removeItem(SUBSCRIPTION_ACTIVE_KEY);
  localStorage.setItem(SUBSCRIPTION_TIER_KEY, "free");
  localStorage.setItem(SUBSCRIPTION_CHECKED_AT_KEY, String(Date.now()));
};

export const consumeSubscriptionRequiredMessage = () => {
  const shouldShow = localStorage.getItem(SUBSCRIPTION_DENIED_MESSAGE_KEY) === "true";
  localStorage.removeItem(SUBSCRIPTION_DENIED_MESSAGE_KEY);
  return shouldShow;
};
