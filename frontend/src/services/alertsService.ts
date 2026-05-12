import { supabase } from "@/integrations/supabase/client";
import { Database } from "@/types/database.types";

type FarmerAlert = Database["public"]["Tables"]["farmer_alerts"]["Row"];

export class AlertsService {
  /**
   * Fetch unread alerts for a specific user
   */
  static async getUnreadAlerts(userId: string): Promise<FarmerAlert[]> {
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
