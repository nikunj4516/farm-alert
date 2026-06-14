import { supabase } from "@/integrations/supabase/client";

export interface Complaint {
  id: string;
  user_id: string;
  name: string;
  phone: string;
  village: string;
  taluka: string;
  district: string;
  category: string;
  subject: string;
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
  feedback_message: string;
  language: string;
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
          taluka: newComplaint.taluka,
          district: newComplaint.district,
          category: newComplaint.category,
          subject: newComplaint.subject,
          message: newComplaint.message,
          screenshot_url: newComplaint.screenshot_url,
          status: newComplaint.status,
        })
        .select()
        .single();

      if (error) throw error;
      
      return data as Complaint;
    } catch (err) {
      console.warn("Supabase complaint submission failed, falling back to local storage:", err);
      const complaints = this.getLocalComplaints();
      complaints.unshift(newComplaint);
      this.saveLocalComplaints(complaints);
      
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
      return (data || []) as Complaint[];
    } catch (err) {
      console.warn("Supabase getComplaints failed, falling back to local storage:", err);
      const complaints = this.getLocalComplaints();
      return complaints.filter(c => c.user_id === userId);
    }
  }

  /**
   * Submit feedback (to the new singular 'feedback' table)
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
        .from("feedback")
        .insert({
          id: newFeedback.id,
          user_id: newFeedback.user_id,
          rating: newFeedback.rating,
          feedback_message: newFeedback.feedback_message,
          language: newFeedback.language
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
}
