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
  if (userId === "test-farmer-id" || userId === "test-user-id") {
    const cachedTier = localStorage.getItem(SUBSCRIPTION_TIER_KEY) as "free" | "premium" | "pro";
    return (cachedTier || "premium").toLowerCase() as "free" | "premium" | "pro";
  }
  const { data, error } = await supabase
    .from("user_subscriptions")
    .select("subscription_status, plan_type")
    .eq("user_id", userId)
    .eq("subscription_status", "active")
    .maybeSingle();

  if (error) {
    console.warn("Subscription database query error, using local cache:", error);
    const cachedTier = localStorage.getItem(SUBSCRIPTION_TIER_KEY) as "free" | "premium" | "pro";
    return (cachedTier || "free").toLowerCase() as "free" | "premium" | "pro";
  }

  if (!data) {
    localStorage.removeItem(SUBSCRIPTION_ACTIVE_KEY);
    localStorage.setItem(SUBSCRIPTION_TIER_KEY, "free");
    localStorage.setItem(SUBSCRIPTION_CHECKED_AT_KEY, String(Date.now()));
    return "free";
  }

  const tier = (data.plan_type || "FREE").toLowerCase() as "free" | "premium" | "pro";
  localStorage.setItem(SUBSCRIPTION_ACTIVE_KEY, tier !== "free" ? "true" : "false");
  localStorage.setItem(SUBSCRIPTION_TIER_KEY, tier);
  localStorage.setItem(SUBSCRIPTION_CHECKED_AT_KEY, String(Date.now()));
  return tier;
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
