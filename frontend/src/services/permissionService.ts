import { supabase } from "@/integrations/supabase/client";
import { getSavedSubscriptionTier } from "./subscriptionService";

export interface PlanPermission {
  plan_type: "FREE" | "PREMIUM" | "PRO";
  feature_name: string;
  is_enabled: boolean;
}

// Default safety fallback definitions
const DEFAULT_PERMISSIONS: PlanPermission[] = [
  { plan_type: "FREE", feature_name: "Weather", is_enabled: true },
  { plan_type: "FREE", feature_name: "News", is_enabled: true },
  { plan_type: "FREE", feature_name: "Tips", is_enabled: true },
  
  { plan_type: "PREMIUM", feature_name: "Weather", is_enabled: true },
  { plan_type: "PREMIUM", feature_name: "News", is_enabled: true },
  { plan_type: "PREMIUM", feature_name: "Tips", is_enabled: true },
  { plan_type: "PREMIUM", feature_name: "Advanced Alerts", is_enabled: true },
  { plan_type: "PREMIUM", feature_name: "WhatsApp Alerts", is_enabled: true },
  { plan_type: "PREMIUM", feature_name: "AI Recommendations", is_enabled: true },
  
  { plan_type: "PRO", feature_name: "Weather", is_enabled: true },
  { plan_type: "PRO", feature_name: "News", is_enabled: true },
  { plan_type: "PRO", feature_name: "Tips", is_enabled: true },
  { plan_type: "PRO", feature_name: "Advanced Alerts", is_enabled: true },
  { plan_type: "PRO", feature_name: "WhatsApp Alerts", is_enabled: true },
  { plan_type: "PRO", feature_name: "AI Recommendations", is_enabled: true },
  { plan_type: "PRO", feature_name: "Disease Scanner", is_enabled: true },
  { plan_type: "PRO", feature_name: "Voice Assistant", is_enabled: true },
  { plan_type: "PRO", feature_name: "SMS Alerts", is_enabled: true }
];

export class PermissionService {
  private static cachedPermissions: PlanPermission[] = [];

  /**
   * Fetch permission definitions from the database and cache them in localStorage
   */
  static async syncPermissions(): Promise<PlanPermission[]> {
    try {
      const { data, error } = await supabase
        .from("plan_permissions")
        .select("plan_type, feature_name, is_enabled");

      if (error) {
        console.warn("Error fetching permissions from database, using local cache:", error);
        return this.getLocalPermissions();
      }

      if (data && data.length > 0) {
        this.cachedPermissions = data as PlanPermission[];
        this.saveLocalPermissions(this.cachedPermissions);
        return this.cachedPermissions;
      }
    } catch (err) {
      console.warn("Exception fetching plan permissions, using local cache:", err);
    }
    return this.getLocalPermissions();
  }

  private static getLocalPermissions(): PlanPermission[] {
    if (typeof window === "undefined") return DEFAULT_PERMISSIONS;
    const stored = localStorage.getItem("farmalert_permissions");
    if (!stored) {
      this.saveLocalPermissions(DEFAULT_PERMISSIONS);
      return DEFAULT_PERMISSIONS;
    }
    try {
      return JSON.parse(stored);
    } catch {
      return DEFAULT_PERMISSIONS;
    }
  }

  private static saveLocalPermissions(perms: PlanPermission[]) {
    if (typeof window !== "undefined") {
      localStorage.setItem("farmalert_permissions", JSON.stringify(perms));
    }
  }

  /**
   * Central permission engine check. Dynamic and responsive to plan switches.
   */
  static hasPermission(featureName: string): boolean {
    const tier = getSavedSubscriptionTier().toUpperCase() as "FREE" | "PREMIUM" | "PRO";
    const perms = this.cachedPermissions.length > 0 ? this.cachedPermissions : this.getLocalPermissions();
    
    // Check for explicit match
    const mapping = perms.find(
      (p) => p.plan_type === tier && p.feature_name.toLowerCase() === featureName.toLowerCase()
    );

    if (mapping) {
      return mapping.is_enabled;
    }

    // Default safety filters
    if (tier === "PRO") return true;
    if (tier === "PREMIUM") {
      return ["weather", "news", "tips", "advanced alerts", "whatsapp alerts", "ai recommendations"].includes(featureName.toLowerCase());
    }
    return ["weather", "news", "tips"].includes(featureName.toLowerCase());
  }
}
