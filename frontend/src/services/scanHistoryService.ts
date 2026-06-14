import { supabase } from "@/integrations/supabase/client";

export interface ScanHistory {
  id: string;
  user_id: string;
  image_url: string;
  crop_name: string;
  disease_name: string;
  confidence_score: number;
  recommendation: string;
  created_at: string;
}

const generateUUID = (): string => {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
};

export class ScanHistoryService {
  private static getLocalScans(): ScanHistory[] {
    if (typeof window === "undefined") return [];
    return JSON.parse(localStorage.getItem("farmalert_scan_history_db") || "[]");
  }

  private static saveLocalScans(scans: ScanHistory[]) {
    if (typeof window !== "undefined") {
      localStorage.setItem("farmalert_scan_history_db", JSON.stringify(scans));
    }
  }

  /**
   * Save a scan result to database, with localStorage fallback
   */
  static async saveScan(scanData: Omit<ScanHistory, "id" | "created_at">): Promise<ScanHistory> {
    const id = generateUUID();
    const created_at = new Date().toISOString();
    const newScan: ScanHistory = {
      ...scanData,
      id,
      created_at
    };

    try {
      const { data, error } = await supabase
        .from("scan_history")
        .insert({
          id: newScan.id,
          user_id: newScan.user_id,
          image_url: newScan.image_url,
          crop_name: newScan.crop_name,
          disease_name: newScan.disease_name,
          confidence_score: newScan.confidence_score,
          recommendation: newScan.recommendation
        })
        .select()
        .single();

      if (error) throw error;
      
      // Save locally as well for offline cache sync
      const scans = this.getLocalScans();
      scans.unshift(data as ScanHistory);
      this.saveLocalScans(scans);
      
      return data as ScanHistory;
    } catch (err) {
      console.warn("Supabase saveScan failed, falling back to local storage:", err);
      const scans = this.getLocalScans();
      scans.unshift(newScan);
      this.saveLocalScans(scans);
      return newScan;
    }
  }

  /**
   * Fetch all scan history for a user
   */
  static async getScans(userId: string): Promise<ScanHistory[]> {
    try {
      const { data, error } = await supabase
        .from("scan_history")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      
      // Sync local cache
      if (data) {
        this.saveLocalScans(data as ScanHistory[]);
      }
      return (data || []) as ScanHistory[];
    } catch (err) {
      console.warn("Supabase getScans failed, using local cache:", err);
      const scans = this.getLocalScans();
      return scans.filter((s) => s.user_id === userId);
    }
  }

}
