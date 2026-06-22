import { supabase } from "@/integrations/supabase/client";
import { Database } from "@/types/database.types";

type FarmerAlert = Database["public"]["Tables"]["farmer_alerts"]["Row"];

export class AlertsService {
  /**
   * Fetch unread alerts for a specific user
   */
  static async getUnreadAlerts(userId: string): Promise<FarmerAlert[]> {
    if (userId === "test-farmer-id" || userId === "test-user-id") {
      const stored = localStorage.getItem(`farmalert_alerts_${userId}`);
      if (stored) {
        try { return JSON.parse(stored); } catch { }
      }
      const mockAlerts: FarmerAlert[] = [
        {
          id: "alert-1",
          user_id: userId,
          alert_type: "weather",
          message: "Heavy rain expected. Ensure proper drainage for your crops.",
          severity: "warning",
          is_read: false,
          created_at: new Date().toISOString()
        }
      ];
      localStorage.setItem(`farmalert_alerts_${userId}`, JSON.stringify(mockAlerts));
      return mockAlerts;
    }
    try {
      const { data, error } = await supabase
        .from("farmer_alerts")
        .select("*")
        .eq("user_id", userId)
        .eq("is_read", false)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error("Error fetching alerts:", error);
      return [];
    }
  }

  /**
   * Mark an alert as read
   */
  static async markAsRead(alertId: string): Promise<void> {
    if (alertId.startsWith("alert-")) {
      const userId = localStorage.getItem("sb-jipmjrgsqhjknbtkjhel-auth-token")?.includes("test-user-id") ? "test-user-id" : "test-farmer-id";
      const stored = localStorage.getItem(`farmalert_alerts_${userId}`);
      if (stored) {
        try {
          const alerts: FarmerAlert[] = JSON.parse(stored);
          const updated = alerts.filter(a => a.id !== alertId);
          localStorage.setItem(`farmalert_alerts_${userId}`, JSON.stringify(updated));
        } catch { }
      }
      return;
    }
    try {
      const { error } = await supabase
        .from("farmer_alerts")
        .update({ is_read: true })
        .eq("id", alertId);

      if (error) throw error;
    } catch (error) {
      console.error("Error marking alert as read:", error);
    }
  }

  /**
   * Trigger dynamic system alerts (Usually a backend function, mocked here for scalable architecture)
   */
  static async generateSmartAlerts(userId: string, weatherCondition: string, cropType: string): Promise<void> {
    if (userId === "test-farmer-id" || userId === "test-user-id") {
      return;
    }
    try {
      const alertsToCreate = [];

      if (weatherCondition.toLowerCase().includes("rain")) {
        alertsToCreate.push({
          user_id: userId,
          alert_type: "weather",
          message: "Heavy rain expected. Ensure proper drainage for your crops.",
          severity: "warning"
        });
      }

      if (cropType === "Cotton" && weatherCondition.toLowerCase().includes("humid")) {
        alertsToCreate.push({
          user_id: userId,
          alert_type: "pest",
          message: "High humidity may cause pest issues in Cotton. Monitor closely.",
          severity: "info"
        });
      }

      if (alertsToCreate.length > 0) {
        // Only insert if they don't already exist recently to avoid spam (pseudo-logic here)
        await supabase.from("farmer_alerts").insert(alertsToCreate);
      }
    } catch (error) {
      console.error("Error generating smart alerts:", error);
    }
  }
}
