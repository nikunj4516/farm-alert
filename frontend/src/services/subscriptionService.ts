import { supabase } from "@/integrations/supabase/client";

export const hasActiveSubscription = async (userId: string) => {
  const { data, error } = await supabase
    .from("subscriptions")
    .select("status, expires_at")
    .eq("user_id", userId)
    .eq("status", "active")
    .maybeSingle();

  if (error || !data) {
    return false;
  }

  if (!data.expires_at) {
    return true;
  }

  return new Date(data.expires_at).getTime() > Date.now();
};
