import { supabase } from "@/integrations/supabase/client";

export const SUBSCRIPTION_ACTIVE_KEY = "farmalert_subscription_active";
export const SUBSCRIPTION_DENIED_MESSAGE_KEY = "farmalert_subscription_required";
export const SUBSCRIPTION_CHECKED_AT_KEY = "farmalert_subscription_checked_at";
const SUBSCRIPTION_CHECK_FRESH_MS = 5 * 60 * 1000;

export const hasFreshLocalSubscription = () => {
  const checkedAt = Number(localStorage.getItem(SUBSCRIPTION_CHECKED_AT_KEY) || 0);
  return localStorage.getItem(SUBSCRIPTION_ACTIVE_KEY) === "true" && Date.now() - checkedAt < SUBSCRIPTION_CHECK_FRESH_MS;
};

export const hasActiveSubscription = async (userId: string) => {
  const { data, error } = await supabase
    .from("subscriptions")
    .select("status, expires_at")
    .eq("user_id", userId)
    .eq("status", "active")
    .maybeSingle();

  if (error || !data) {
    localStorage.removeItem(SUBSCRIPTION_ACTIVE_KEY);
    localStorage.setItem(SUBSCRIPTION_CHECKED_AT_KEY, String(Date.now()));
    return false;
  }

  if (!data.expires_at) {
    localStorage.setItem(SUBSCRIPTION_ACTIVE_KEY, "true");
    localStorage.setItem(SUBSCRIPTION_CHECKED_AT_KEY, String(Date.now()));
    return true;
  }

  const isActive = new Date(data.expires_at).getTime() > Date.now();
  if (isActive) {
    localStorage.setItem(SUBSCRIPTION_ACTIVE_KEY, "true");
  } else {
    localStorage.removeItem(SUBSCRIPTION_ACTIVE_KEY);
  }
  localStorage.setItem(SUBSCRIPTION_CHECKED_AT_KEY, String(Date.now()));
  return isActive;
};

export const markSubscriptionRequired = () => {
  localStorage.setItem(SUBSCRIPTION_DENIED_MESSAGE_KEY, "true");
  localStorage.removeItem(SUBSCRIPTION_ACTIVE_KEY);
  localStorage.setItem(SUBSCRIPTION_CHECKED_AT_KEY, String(Date.now()));
};

export const consumeSubscriptionRequiredMessage = () => {
  const shouldShow = localStorage.getItem(SUBSCRIPTION_DENIED_MESSAGE_KEY) === "true";
  localStorage.removeItem(SUBSCRIPTION_DENIED_MESSAGE_KEY);
  return shouldShow;
};
