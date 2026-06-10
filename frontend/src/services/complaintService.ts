import { supabase } from "@/integrations/supabase/client";

export interface Complaint {
  id: string;
  user_id: string;
  name: string;
  phone: string;
  village: string;
  category: string;
  message: string;
  screenshot_url?: string | null;
  status: "Pending" | "In Review" | "Resolved" | "Rejected";
  admin_reply?: string | null;
  created_at: string;
  updated_at: string;
}

export interface Feedback {
  id: string;
  user_id: string;
  rating: number;
  favorite_feature: string;
  suggestions: string;
  created_at: string;
}

export interface AdminNotification {
  id: string;
  message: string;
  complaint_id: string;
  farmer_name: string;
  created_at: string;
  read: boolean;
}

const isRelationMissingError = (error: any): boolean => {
  if (!error) return false;
  const msg = String(error.message || "").toLowerCase();
  return msg.includes("does not exist") || msg.includes("not found") || error.code === "PGRST204" || error.status === 404;
};

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

export class ComplaintService {
  // Helper for localStorage complaints
  private static getLocalComplaints(): Complaint[] {
    if (typeof window === "undefined") return [];
    return JSON.parse(localStorage.getItem("farmalert_complaints_db") || "[]");
  }

  private static saveLocalComplaints(complaints: Complaint[]) {
    if (typeof window !== "undefined") {
      localStorage.setItem("farmalert_complaints_db", JSON.stringify(complaints));
    }
  }

  // Helper for localStorage feedbacks
  private static getLocalFeedbacks(): Feedback[] {
    if (typeof window === "undefined") return [];
    return JSON.parse(localStorage.getItem("farmalert_feedbacks_db") || "[]");
  }

  private static saveLocalFeedbacks(feedbacks: Feedback[]) {
    if (typeof window !== "undefined") {
      localStorage.setItem("farmalert_feedbacks_db", JSON.stringify(feedbacks));
    }
  }

  // Helper for admin notifications
  static getAdminNotifications(): AdminNotification[] {
    if (typeof window === "undefined") return [];
    return JSON.parse(localStorage.getItem("farmalert_admin_notifications") || "[]");
  }

  static saveAdminNotifications(notifications: AdminNotification[]) {
    if (typeof window !== "undefined") {
      localStorage.setItem("farmalert_admin_notifications", JSON.stringify(notifications));
    }
  }

  static addAdminNotification(complaintId: string, farmerName: string, category: string) {
    const notifications = this.getAdminNotifications();
    const newNotif: AdminNotification = {
      id: generateUUID(),
      message: `New complaint filed by ${farmerName} under category "${category}".`,
      complaint_id: complaintId,
      farmer_name: farmerName,
      created_at: new Date().toISOString(),
      read: false,
    };
    notifications.unshift(newNotif);
    this.saveAdminNotifications(notifications);

    // Fire window event for active admins
    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("farmalert_new_complaint", { detail: newNotif }));
    }
  }

  static clearAdminNotification(id: string) {
    const notifications = this.getAdminNotifications();
    const updated = notifications.map(n => n.id === id ? { ...n, read: true } : n);
    this.saveAdminNotifications(updated);
  }

  static clearAllAdminNotifications() {
    this.saveAdminNotifications([]);
  }

  /**
   * Submit a new complaint (attempts Supabase table, falls back to LocalStorage database)
   */
  static async submitComplaint(complaintData: Omit<Complaint, "id" | "status" | "created_at" | "updated_at">): Promise<Complaint> {
    const id = generateUUID();
    const now = new Date().toISOString();
    const newComplaint: Complaint = {
      ...complaintData,
      id,
      status: "Pending",
      created_at: now,
      updated_at: now,
    };

    try {
      const { data, error } = await supabase
        .from("complaints")
        .insert({
          id: newComplaint.id,
          user_id: newComplaint.user_id,
          name: newComplaint.name,
          phone: newComplaint.phone,
          village: newComplaint.village,
          category: newComplaint.category,
          message: newComplaint.message,
          screenshot_url: newComplaint.screenshot_url,
          status: newComplaint.status,
        })
        .select()
        .single();

      if (error) throw error;
      
      this.addAdminNotification(id, newComplaint.name, newComplaint.category);
      return data as Complaint;
    } catch (err) {
      console.warn("Supabase complaint submission failed, falling back to local storage:", err);
      // Fallback to local storage database
      const complaints = this.getLocalComplaints();
      complaints.unshift(newComplaint);
      this.saveLocalComplaints(complaints);
      
      this.addAdminNotification(id, newComplaint.name, newComplaint.category);
      return newComplaint;
    }
  }

  /**
   * Fetch all complaints for a specific user
   */
  static async getComplaints(userId: string): Promise<Complaint[]> {
    try {
      const { data, error } = await supabase
        .from("complaints")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as Complaint[];
    } catch (err) {
      console.warn("Supabase getComplaints failed, falling back to local storage:", err);
      const complaints = this.getLocalComplaints();
      return complaints.filter(c => c.user_id === userId);
    }
  }

  /**
   * Admin: Get all complaints across all users
   */
  static async getAllComplaints(): Promise<Complaint[]> {
    try {
      const { data, error } = await supabase
        .from("complaints")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as Complaint[];
    } catch (err) {
      console.warn("Supabase getAllComplaints failed, falling back to local storage:", err);
      return this.getLocalComplaints();
    }
  }

  /**
   * Admin: Update the status and/or reply of a complaint
   */
  static async updateComplaintStatus(
    complaintId: string, 
    status: Complaint["status"], 
    adminReply?: string | null
  ): Promise<Complaint> {
    const now = new Date().toISOString();

    try {
      const { data, error } = await supabase
        .from("complaints")
        .update({
          status,
          admin_reply: adminReply,
          updated_at: now
        })
        .eq("id", complaintId)
        .select()
        .single();

      if (error) throw error;
      return data as Complaint;
    } catch (err) {
      console.warn("Supabase updateComplaintStatus failed, falling back to local storage:", err);
      const complaints = this.getLocalComplaints();
      const index = complaints.findIndex(c => c.id === complaintId);
      if (index === -1) {
        throw new Error("Complaint not found in database.");
      }
      
      const updatedComplaint: Complaint = {
        ...complaints[index],
        status,
        admin_reply: adminReply,
        updated_at: now
      };
      
      complaints[index] = updatedComplaint;
      this.saveLocalComplaints(complaints);
      
      // Trigger local notification event so farmer UI updates immediately if open
      if (typeof window !== "undefined") {
        window.dispatchEvent(new CustomEvent("farmalert_complaint_updated", { detail: updatedComplaint }));
      }

      return updatedComplaint;
    }
  }

  /**
   * Submit feedback
   */
  static async submitFeedback(feedbackData: Omit<Feedback, "id" | "created_at">): Promise<Feedback> {
    const id = generateUUID();
    const newFeedback: Feedback = {
      ...feedbackData,
      id,
      created_at: new Date().toISOString(),
    };

    try {
      const { data, error } = await supabase
        .from("feedbacks")
        .insert({
          id: newFeedback.id,
          user_id: newFeedback.user_id,
          rating: newFeedback.rating,
          favorite_feature: newFeedback.favorite_feature,
          suggestions: newFeedback.suggestions,
        })
        .select()
        .single();

      if (error) throw error;
      return data as Feedback;
    } catch (err) {
      console.warn("Supabase feedback submission failed, falling back to local storage:", err);
      const feedbacks = this.getLocalFeedbacks();
      feedbacks.unshift(newFeedback);
      this.saveLocalFeedbacks(feedbacks);
      return newFeedback;
    }
  }

  /**
   * Admin: Get all feedback submissions
   */
  static async getAllFeedbacks(): Promise<Feedback[]> {
    try {
      const { data, error } = await supabase
        .from("feedbacks")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as Feedback[];
    } catch (err) {
      console.warn("Supabase getAllFeedbacks failed, falling back to local storage:", err);
      return this.getLocalFeedbacks();
    }
  }
}
