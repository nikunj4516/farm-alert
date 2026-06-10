import { useState, useEffect } from "react";
import { ComplaintService, Complaint, Feedback } from "@/services/complaintService";
import { ScanHistoryService, ScanHistory } from "@/services/scanHistoryService";
import { supabase } from "@/integrations/supabase/client";
import { Search, Filter, MessageSquare, ClipboardCheck, ArrowLeft, Download, ShieldAlert, Sparkles, AlertTriangle, Users, History, CreditCard, BarChart3, Star, CheckCircle, Clock } from "lucide-react";
import { toast } from "@/components/ui/use-toast";
import { getDistrictLabel, getLocationLabel } from "@/services/gujaratLocationService";

interface AdminPanelProps {
  onBackToPortal?: () => void;
}

interface UserProfile {
  user_id: string;
  name: string;
  phone: string;
  village: string;
  taluka: string;
  district: string;
  crop_type: string;
  land_size: number;
  subscription_active: boolean;
  created_at: string;
}

interface SubscriptionLog {
  id: string;
  user_id: string;
  plan_type: string;
  subscription_status: string;
  updated_at: string;
}

const AdminPanel = ({ onBackToPortal }: AdminPanelProps) => {
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [subscriptions, setSubscriptions] = useState<SubscriptionLog[]>([]);
  const [scans, setScans] = useState<ScanHistory[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Active Tab: analytics, users, complaints, feedbacks, subscriptions, scans
  const [adminTab, setAdminTab] = useState<"analytics" | "users" | "complaints" | "feedbacks" | "subscriptions" | "scans">("analytics");

  // Search & Filter States
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<string>("All");
  const [categoryFilter, setCategoryFilter] = useState<string>("All");

  // Selection & Reply States
  const [selectedComplaint, setSelectedComplaint] = useState<Complaint | null>(null);
  const [replyText, setReplyText] = useState<string>("");
  const [statusUpdate, setStatusUpdate] = useState<Complaint["status"]>("Pending");
  const [updating, setUpdating] = useState<boolean>(false);

  const loadAdminData = async () => {
    setLoading(true);
    try {
      // 1. Fetch complaints & feedbacks
      const allComp = await ComplaintService.getAllComplaints();
      const allFeed = await ComplaintService.getAllFeedbacks();
      setComplaints(allComp);
      setFeedbacks(allFeed);

      // 2. Fetch users/profiles
      const { data: profilesData, error: profilesError } = await supabase
        .from("profiles")
        .select("*")
        .order("created_at", { ascending: false });

      if (profilesError) {
        console.warn("Failed to fetch profiles from database, using mock/local:", profilesError);
        // Local/mock fallback
        setUsers([
          { user_id: "u1", name: "Nikunj Patel", phone: "9876543210", village: "Motera", taluka: "gandhinagar", district: "gandhinagar", crop_type: "Cotton", land_size: 5, subscription_active: true, created_at: new Date().toISOString() },
          { user_id: "u2", name: "Ramesh Bhai", phone: "9823456789", village: "Vasad", taluka: "anand", district: "anand", crop_type: "Wheat", land_size: 8, subscription_active: false, created_at: new Date(Date.now() - 86400000).toISOString() },
          { user_id: "u3", name: "Dinesh Kumar", phone: "9900887766", village: "Gondal", taluka: "rajkot", district: "rajkot", crop_type: "Groundnut", land_size: 3, subscription_active: true, created_at: new Date(Date.now() - 172800000).toISOString() }
        ]);
      } else {
        setUsers((profilesData || []) as UserProfile[]);
      }

      // 3. Fetch subscription logs
      const { data: subsData, error: subsError } = await supabase
        .from("user_subscriptions")
        .select("*")
        .order("updated_at", { ascending: false });

      if (subsError) {
        console.warn("Failed to fetch subscriptions, using mock:", subsError);
        setSubscriptions([
          { id: "s1", user_id: "u1", plan_type: "PRO", subscription_status: "active", updated_at: new Date().toISOString() },
          { id: "s2", user_id: "u3", plan_type: "PREMIUM", subscription_status: "active", updated_at: new Date(Date.now() - 86400000).toISOString() }
        ]);
      } else {
        setSubscriptions((subsData || []) as SubscriptionLog[]);
      }

      // 4. Fetch crop disease scans
      const scansData = await ScanHistoryService.getAllScans();
      setScans(scansData);

    } catch (err) {
      console.error("Failed to load admin dashboard data", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadAdminData();
  }, []);

  // Listen to new complaints
  useEffect(() => {
    const handleNewComp = () => {
      void loadAdminData();
    };
    window.addEventListener("farmalert_new_complaint", handleNewComp);
    return () => {
      window.removeEventListener("farmalert_new_complaint", handleNewComp);
    };
  }, []);

  const handleUpdateComplaint = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedComplaint) return;

    setUpdating(true);
    try {
      await ComplaintService.updateComplaintStatus(
        selectedComplaint.id,
        statusUpdate,
        replyText || null
      );

      toast({
        title: "Ticket Updated",
        description: `Complaint ${selectedComplaint.id.substring(0, 8).toUpperCase()} updated to "${statusUpdate}".`,
      });

      setSelectedComplaint(null);
      setReplyText("");
      void loadAdminData();
    } catch (err) {
      toast({
        title: "Update failed",
        description: err instanceof Error ? err.message : "Error updating complaint",
        variant: "destructive",
      });
    } finally {
      setUpdating(false);
    }
  };

  // Export report to CSV
  const handleDownloadCSV = () => {
    if (complaints.length === 0) {
      toast({
        title: "No data to export",
        description: "There are no complaints available to download.",
        variant: "destructive",
      });
      return;
    }

    const headers = ["Ticket ID", "Farmer Name", "Phone", "Village", "Taluka", "District", "Category", "Subject", "Message", "Status", "Admin Reply", "Created At"];
    const rows = complaints.map(c => [
      c.id,
      c.name,
      c.phone,
      c.village,
      c.taluka || "",
      c.district || "",
      c.category,
      c.subject || "",
      c.message.replace(/,/g, " "),
      c.status,
      (c.admin_reply || "").replace(/,/g, " "),
      c.created_at
    ]);

    const csvContent = "data:text/csv;charset=utf-8," 
      + [headers.join(","), ...rows.map(e => e.join(","))].join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `farmalert_complaints_${new Date().toISOString().substring(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast({
      title: "Report Downloaded",
      description: "Complaints CSV spreadsheet downloaded successfully.",
    });
  };

  // Filter complaints
  const filteredComplaints = complaints.filter((c) => {
    const matchesSearch = 
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.phone.includes(searchQuery) ||
      c.message.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.id.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = statusFilter === "All" || c.status === statusFilter;
    const matchesCategory = categoryFilter === "All" || c.category === categoryFilter;

    return matchesSearch && matchesStatus && matchesCategory;
  });

  // Analytics helper calculations
  const totalUsers = users.length;
  const premiumCount = subscriptions.filter(s => s.plan_type === "PREMIUM" && s.subscription_status === "active").length;
  const proCount = subscriptions.filter(s => s.plan_type === "PRO" && s.subscription_status === "active").length;
  const pendingCount = complaints.filter(c => c.status === "Pending").length;
  const resolvedCount = complaints.filter(c => c.status === "Resolved").length;
  const averageRating = feedbacks.length > 0 
    ? (feedbacks.reduce((sum, f) => sum + f.rating, 0) / feedbacks.length).toFixed(1)
    : "0.0";

  // Calculate top crop disease from scans
  const getTopDisease = () => {
    if (scans.length === 0) return "None Yet";
    const counts: Record<string, number> = {};
    scans.forEach(s => {
      const name = s.disease_name.split(" (")[0];
      counts[name] = (counts[name] || 0) + 1;
    });
    const sorted = Object.entries(counts).sort((a, b) => b[1] - a[1]);
    return sorted[0] ? `${sorted[0][0]} (${sorted[0][1]} times)` : "None";
  };

  return (
    <div className="space-y-4 animate-in fade-in duration-300 text-left">
      
      {/* Top Header Actions */}
      <div className="flex items-center justify-between border-b border-border pb-3">
        <button
          onClick={onBackToPortal}
          className="flex items-center gap-1.5 text-xs font-bold text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Farmer Portal</span>
        </button>

        <div className="flex gap-2">
          <button
            onClick={loadAdminData}
            className="p-1 text-slate-500 hover:text-slate-800 transition-colors"
            title="Refresh Data"
          >
            <RefreshCwIcon className="w-4 h-4" />
          </button>
          <button
            onClick={handleDownloadCSV}
            className="flex items-center gap-1 px-2.5 py-1 text-[10px] font-black bg-primary/10 text-primary border border-primary/20 rounded-lg hover:bg-primary/25 transition-all"
          >
            <Download className="w-3 h-3" />
            <span>Download CSV Report</span>
          </button>
        </div>
      </div>

      {/* Modern Horizontal Navigation Tabs */}
      <div className="flex gap-1 border-b border-border pb-2 overflow-x-auto scrollbar-none">
        <button
          onClick={() => setAdminTab("analytics")}
          className={`px-3 py-1.5 text-xs font-black rounded-lg transition-all shrink-0 flex items-center gap-1 ${
            adminTab === "analytics" ? "bg-primary text-white shadow-sm" : "text-muted-foreground hover:bg-muted"
          }`}
        >
          <BarChart3 className="w-3.5 h-3.5" />
          Analytics
        </button>
        <button
          onClick={() => setAdminTab("users")}
          className={`px-3 py-1.5 text-xs font-black rounded-lg transition-all shrink-0 flex items-center gap-1 ${
            adminTab === "users" ? "bg-primary text-white shadow-sm" : "text-muted-foreground hover:bg-muted"
          }`}
        >
          <Users className="w-3.5 h-3.5" />
          Users ({totalUsers})
        </button>
        <button
          onClick={() => setAdminTab("complaints")}
          className={`px-3 py-1.5 text-xs font-black rounded-lg transition-all shrink-0 flex items-center gap-1 ${
            adminTab === "complaints" ? "bg-primary text-white shadow-sm" : "text-muted-foreground hover:bg-muted"
          }`}
        >
          <ClipboardCheck className="w-3.5 h-3.5" />
          Complaints ({complaints.length})
        </button>
        <button
          onClick={() => setAdminTab("feedbacks")}
          className={`px-3 py-1.5 text-xs font-black rounded-lg transition-all shrink-0 flex items-center gap-1 ${
            adminTab === "feedbacks" ? "bg-primary text-white shadow-sm" : "text-muted-foreground hover:bg-muted"
          }`}
        >
          <MessageSquare className="w-3.5 h-3.5" />
          Feedback ({feedbacks.length})
        </button>
        <button
          onClick={() => setAdminTab("subscriptions")}
          className={`px-3 py-1.5 text-xs font-black rounded-lg transition-all shrink-0 flex items-center gap-1 ${
            adminTab === "subscriptions" ? "bg-primary text-white shadow-sm" : "text-muted-foreground hover:bg-muted"
          }`}
        >
          <CreditCard className="w-3.5 h-3.5" />
          Subscriptions
        </button>
        <button
          onClick={() => setAdminTab("scans")}
          className={`px-3 py-1.5 text-xs font-black rounded-lg transition-all shrink-0 flex items-center gap-1 ${
            adminTab === "scans" ? "bg-primary text-white shadow-sm" : "text-muted-foreground hover:bg-muted"
          }`}
        >
          <History className="w-3.5 h-3.5" />
          Scans ({scans.length})
        </button>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <RefreshCwIcon className="w-8 h-8 text-primary animate-spin mx-auto" />
          <p className="text-xs text-muted-foreground font-semibold mt-2 font-mono">Querying system database...</p>
        </div>
      ) : (
        <div className="space-y-4">
          {/* TAB 1: ANALYTICS WIDGETS */}
          {adminTab === "analytics" && (
            <div className="space-y-4 animate-in fade-in duration-200">
              <h3 className="text-xs font-black text-slate-400 uppercase tracking-wider">Operational KPI Metrics</h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                <div className="p-4 bg-white border border-slate-200 rounded-2xl shadow-sm flex items-center gap-3">
                  <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
                    <Users className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Total Users</p>
                    <p className="text-xl font-black text-slate-800 mt-0.5">{totalUsers}</p>
                  </div>
                </div>

                <div className="p-4 bg-white border border-slate-200 rounded-2xl shadow-sm flex items-center gap-3">
                  <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
                    <CreditCard className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Active Subscriptions</p>
                    <p className="text-xl font-black text-slate-800 mt-0.5">{premiumCount + proCount}</p>
                  </div>
                </div>

                <div className="p-4 bg-white border border-slate-200 rounded-2xl shadow-sm flex items-center gap-3">
                  <div className="p-3 bg-rose-50 text-rose-600 rounded-xl">
                    <ClipboardCheck className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Resolved Issues</p>
                    <p className="text-xl font-black text-slate-800 mt-0.5">{resolvedCount} / {complaints.length}</p>
                  </div>
                </div>

                <div className="p-4 bg-white border border-slate-200 rounded-2xl shadow-sm flex items-center gap-3">
                  <div className="p-3 bg-yellow-50 text-amber-500 rounded-xl">
                    <Star className="w-5 h-5 fill-amber-500" />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Farmer App Rating</p>
                    <p className="text-xl font-black text-slate-800 mt-0.5">★ {averageRating}</p>
                  </div>
                </div>

                <div className="p-4 bg-white border border-slate-200 rounded-2xl shadow-sm flex items-center gap-3 col-span-2">
                  <div className="p-3 bg-purple-50 text-purple-600 rounded-xl">
                    <History className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Top Diagnosed Spore</p>
                    <p className="text-xs font-black text-purple-700 mt-0.5 truncate max-w-[200px]">{getTopDisease()}</p>
                  </div>
                </div>
              </div>

              {/* Sub Tier Details */}
              <div className="grid grid-cols-2 gap-3 pt-2">
                <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl">
                  <h4 className="text-xs font-black text-slate-700 uppercase">Premium Tier Active</h4>
                  <p className="text-2xl font-black text-emerald-600 mt-1">{premiumCount} farmers</p>
                  <p className="text-[9px] text-slate-400 font-bold mt-0.5">Subscribed to Village-Level Alerts</p>
                </div>
                <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl">
                  <h4 className="text-xs font-black text-slate-700 uppercase">Pro Tier Active</h4>
                  <p className="text-2xl font-black text-blue-600 mt-1">{proCount} farmers</p>
                  <p className="text-[9px] text-slate-400 font-bold mt-0.5">Unrestricted AI Scans & Voice Assistant</p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: USERS LIST */}
          {adminTab === "users" && (
            <div className="space-y-3 animate-in fade-in duration-200">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-black text-slate-400 uppercase tracking-wider">Registered Farmers Database</h3>
                <span className="text-[10px] font-black text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">{users.length} total</span>
              </div>
              <div className="space-y-2.5 max-h-[50vh] overflow-y-auto pr-1">
                {users.length === 0 ? (
                  <p className="text-xs text-muted-foreground font-bold py-6 text-center">No farmers found in profile table.</p>
                ) : (
                  users.map((u) => (
                    <div key={u.user_id} className="p-3 bg-white border border-slate-200 rounded-2xl flex items-center justify-between hover:border-slate-300 transition-all shadow-sm">
                      <div className="space-y-1">
                        <div className="flex items-center gap-1.5">
                          <p className="text-xs font-black text-slate-800">{u.name || "Unnamed Farmer"}</p>
                          <span className={`text-[8px] font-black px-1.5 py-0.2 rounded-full ${
                            u.subscription_active 
                              ? "bg-emerald-100 text-emerald-700" 
                              : "bg-slate-100 text-slate-500"
                          }`}>
                            {u.subscription_active ? "SUBSCRIBED" : "FREE PLAN"}
                          </span>
                        </div>
                        <p className="text-[10px] text-slate-500 font-semibold">
                          Phone: {u.phone || "N/A"} • Crop: {u.crop_type || "N/A"} ({u.land_size || 0} Acres)
                        </p>
                        <p className="text-[9px] text-slate-400 font-medium">
                          Location: {getLocationLabel(u.village, "en") || "N/A"}, {getLocationLabel(u.taluka, "en") || "N/A"}, {getDistrictLabel(u.district, "en") || "N/A"}
                        </p>
                      </div>
                      <span className="text-[9px] text-slate-400 font-mono">
                        {new Date(u.created_at || Date.now()).toLocaleDateString()}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* TAB 3: COMPLAINTS */}
          {adminTab === "complaints" && (
            <div className="space-y-3">
              {selectedComplaint ? (
                /* Respond to Complaint */
                <div className="p-4 bg-white border border-slate-200 rounded-2xl space-y-4 animate-in slide-in-from-right-3 duration-300">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-bold text-slate-800">Respond to Grievance ticket</h4>
                    <button
                      onClick={() => { setSelectedComplaint(null); setReplyText(""); }}
                      className="text-xs font-black text-primary hover:underline"
                    >
                      Cancel
                    </button>
                  </div>

                  <div className="space-y-2 text-xs border-b border-slate-100 pb-3">
                    <div className="grid grid-cols-2 gap-2 text-slate-500 font-semibold">
                      <p><strong>Farmer:</strong> {selectedComplaint.name}</p>
                      <p><strong>Phone:</strong> {selectedComplaint.phone}</p>
                      <p><strong>Village:</strong> {selectedComplaint.village}</p>
                      <p><strong>Taluka:</strong> {getLocationLabel(selectedComplaint.taluka, "en") || "N/A"}</p>
                      <p><strong>District:</strong> {getDistrictLabel(selectedComplaint.district, "en") || "N/A"}</p>
                      <p><strong>Category:</strong> {selectedComplaint.category}</p>
                      <p className="col-span-2"><strong>Subject:</strong> {selectedComplaint.subject || "N/A"}</p>
                    </div>
                    <p className="mt-2 bg-slate-50 p-2.5 rounded-xl border border-slate-200 leading-relaxed font-semibold text-slate-800 whitespace-pre-wrap">
                      "{selectedComplaint.message}"
                    </p>
                    {selectedComplaint.screenshot_url && (
                      <div className="mt-2 space-y-1">
                        <p className="text-[10px] font-bold text-slate-400 uppercase">Attached Screenshot:</p>
                        <div className="w-40 h-32 border border-slate-200 rounded-xl overflow-hidden shadow-sm bg-slate-100">
                          <img src={selectedComplaint.screenshot_url} alt="Attached screenshot" className="w-full h-full object-cover" />
                        </div>
                      </div>
                    )}
                  </div>

                  <form onSubmit={handleUpdateComplaint} className="space-y-3">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Update Ticket Status</label>
                      <select
                        value={statusUpdate}
                        onChange={(e) => setStatusUpdate(e.target.value as Complaint["status"])}
                        className="w-full text-xs text-slate-800 py-2 px-3 border border-slate-200 rounded-xl bg-white outline-none focus:border-primary"
                      >
                        <option value="Pending">Pending</option>
                        <option value="In Review">In Review</option>
                        <option value="Resolved">Resolved</option>
                        <option value="Rejected">Rejected</option>
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Official Response Reply</label>
                      <textarea
                        value={replyText}
                        onChange={(e) => setReplyText(e.target.value)}
                        rows={3}
                        required
                        placeholder="Type reply here. The farmer will see this update instantly..."
                        className="w-full text-xs text-slate-800 py-2 px-3 border border-slate-200 rounded-xl bg-white outline-none focus:border-primary resize-none"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={updating}
                      className="w-full bg-primary hover:bg-primary/95 text-white py-2.5 rounded-xl text-xs font-black flex items-center justify-center gap-1.5 transition-all shadow-sm active:scale-98 disabled:opacity-50"
                    >
                      {updating ? "Updating..." : "Submit Reply & Update Status"}
                    </button>
                  </form>
                </div>
              ) : (
                /* Grievance Grid List */
                <div className="space-y-3">
                  <div className="space-y-2">
                    <div className="relative">
                      <Search className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                      <input
                        type="text"
                        placeholder="Search tickets by name, phone, description..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full text-xs pl-9 pr-3 py-2.5 border border-slate-200 rounded-xl bg-white outline-none focus:border-primary font-semibold"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div className="flex items-center gap-1.5">
                        <span className="text-[9px] font-bold text-slate-400 uppercase shrink-0">Status:</span>
                        <select
                          value={statusFilter}
                          onChange={(e) => setStatusFilter(e.target.value)}
                          className="w-full text-[9px] text-slate-700 py-1 px-1.5 border border-slate-200 rounded-lg bg-white outline-none focus:border-primary font-black"
                        >
                          <option value="All">All Statuses</option>
                          <option value="Pending">Pending</option>
                          <option value="In Review">In Review</option>
                          <option value="Resolved">Resolved</option>
                          <option value="Rejected">Rejected</option>
                        </select>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <span className="text-[9px] font-bold text-slate-400 uppercase shrink-0">Cat:</span>
                        <select
                          value={categoryFilter}
                          onChange={(e) => setCategoryFilter(e.target.value)}
                          className="w-full text-[9px] text-slate-700 py-1 px-1.5 border border-slate-200 rounded-lg bg-white outline-none focus:border-primary font-black"
                        >
                          <option value="All">All Categories</option>
                          <option value="Weather Issue">Weather Issue</option>
                          <option value="Translation Issue">Translation Issue</option>
                          <option value="News Issue">News Issue</option>
                          <option value="Alert Issue">Alert Issue</option>
                          <option value="Profile Issue">Profile Issue</option>
                          <option value="Bug Report">Bug Report</option>
                          <option value="Feature Request">Feature Request</option>
                          <option value="Other">Other</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2.5 max-h-[42vh] overflow-y-auto pr-1">
                    {filteredComplaints.length === 0 ? (
                      <p className="text-xs text-slate-400 font-bold py-8 text-center bg-slate-50 border border-dashed border-slate-200 rounded-2xl">
                        No matching complaints found.
                      </p>
                    ) : (
                      filteredComplaints.map((c) => {
                        const statusColors = {
                          Pending: "bg-yellow-50 text-yellow-700 border-yellow-200",
                          "In Review": "bg-blue-50 text-blue-700 border-blue-200",
                          Resolved: "bg-emerald-50 text-emerald-700 border-emerald-200",
                          Rejected: "bg-red-50 text-red-700 border-red-200",
                        };

                        return (
                          <button
                            key={c.id}
                            onClick={() => {
                              setSelectedComplaint(c);
                              setStatusUpdate(c.status);
                              setReplyText(c.admin_reply || "");
                            }}
                            className="w-full p-3.5 bg-white border border-slate-200 rounded-2xl hover:border-primary/30 transition-all flex flex-col gap-2 shadow-sm text-left active:scale-[0.99]"
                          >
                            <div className="flex items-center justify-between w-full">
                              <span className="text-[9px] font-black text-primary font-mono bg-primary/5 px-2 py-0.5 rounded-full">
                                FA-{c.id.substring(0, 8).toUpperCase()}
                              </span>
                              <span className={`text-[9px] font-bold border px-1.5 py-0.5 rounded-full ${statusColors[c.status] || "bg-muted text-muted-foreground"}`}>
                                {c.status}
                              </span>
                            </div>

                            <div>
                              <p className="text-xs font-black text-slate-800">{c.name} ({getLocationLabel(c.village, "en") || c.village})</p>
                              {c.subject && <p className="text-[10px] font-black text-slate-600 mt-0.5">Subject: {c.subject}</p>}
                              <p className="text-xs font-semibold text-slate-500 line-clamp-2 mt-0.5 leading-relaxed">
                                "{c.message}"
                              </p>
                            </div>

                            <div className="flex items-center justify-between text-[9px] text-slate-400 font-semibold border-t border-slate-100 pt-2 w-full">
                              <span>Cat: {c.category}</span>
                              <span>Filed: {new Date(c.created_at).toLocaleDateString()}</span>
                            </div>
                          </button>
                        );
                      })
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 4: FEEDBACK LOGS */}
          {adminTab === "feedbacks" && (
            <div className="space-y-3 animate-in fade-in duration-200">
              <h3 className="text-xs font-black text-slate-400 uppercase tracking-wider">Farmer Feedback logs</h3>
              <div className="space-y-2.5 max-h-[50vh] overflow-y-auto pr-1">
                {feedbacks.length === 0 ? (
                  <p className="text-xs text-muted-foreground font-bold py-6 text-center">No feedback reports submitted yet.</p>
                ) : (
                  feedbacks.map((f) => (
                    <div key={f.id} className="p-3.5 bg-white border border-slate-200 rounded-2xl space-y-2 shadow-sm">
                      <div className="flex items-center justify-between text-[9px] text-slate-400 font-bold">
                        <span>Farmer ID: {f.user_id.substring(0, 8).toUpperCase()}</span>
                        <span>Lang: {f.language?.toUpperCase() || "GU"} • {new Date(f.created_at).toLocaleDateString()}</span>
                      </div>
                      <div className="flex gap-1 text-amber-500 text-sm">
                        {Array.from({ length: f.rating }).map((_, i) => <span key={i}>★</span>)}
                        {Array.from({ length: 5 - f.rating }).map((_, i) => <span key={i} className="text-slate-200">★</span>)}
                      </div>
                      <div>
                        <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Message / Suggestion</p>
                        <p className="text-xs font-semibold text-slate-700 mt-0.5 leading-relaxed">"{f.feedback_message}"</p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* TAB 5: SUBSCRIPTIONS */}
          {adminTab === "subscriptions" && (
            <div className="space-y-3 animate-in fade-in duration-200">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-black text-slate-400 uppercase tracking-wider">Subscription Logs</h3>
                <span className="text-[10px] font-black text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">{subscriptions.length} records</span>
              </div>
              <div className="space-y-2.5 max-h-[50vh] overflow-y-auto pr-1">
                {subscriptions.length === 0 ? (
                  <p className="text-xs text-slate-400 font-bold py-6 text-center">No subscriptions active in DB.</p>
                ) : (
                  subscriptions.map((s) => (
                    <div key={s.id} className="p-3.5 bg-white border border-slate-200 rounded-2xl flex items-center justify-between hover:border-slate-300 transition-all shadow-sm">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className={`text-[9px] font-black px-2 py-0.5 rounded-full ${
                            s.plan_type === "PRO" 
                              ? "bg-blue-100 text-blue-700" 
                              : s.plan_type === "PREMIUM"
                                ? "bg-emerald-100 text-emerald-700"
                                : "bg-slate-100 text-slate-600"
                          }`}>
                            {s.plan_type} PLAN
                          </span>
                          <span className={`text-[9px] font-bold ${s.subscription_status === "active" ? "text-emerald-600" : "text-slate-400"}`}>
                            {s.subscription_status.toUpperCase()}
                          </span>
                        </div>
                        <p className="text-[10px] text-slate-500 font-semibold">Farmer ID: {s.user_id.substring(0, 8).toUpperCase()}</p>
                      </div>
                      <span className="text-[9px] text-slate-400 font-mono">
                        Updated: {new Date(s.updated_at).toLocaleDateString()}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* TAB 6: DISEASE SCANS */}
          {adminTab === "scans" && (
            <div className="space-y-3 animate-in fade-in duration-200">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-black text-slate-400 uppercase tracking-wider">AI Crop Disease Scans Log</h3>
                <span className="text-[10px] font-black text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">{scans.length} scans</span>
              </div>
              <div className="space-y-2.5 max-h-[50vh] overflow-y-auto pr-1">
                {scans.length === 0 ? (
                  <p className="text-xs text-slate-400 font-bold py-6 text-center">No AI scans completed yet.</p>
                ) : (
                  scans.map((scan) => (
                    <div key={scan.id} className="p-3 bg-white border border-slate-200 rounded-2xl flex items-start justify-between shadow-sm gap-2">
                      <div className="flex items-start gap-2.5 min-w-0">
                        {scan.image_url ? (
                          <img src={scan.image_url} alt="" className="w-10 h-10 rounded-lg object-cover border border-slate-200 shrink-0" />
                        ) : (
                          <div className="w-10 h-10 rounded-lg bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 shrink-0">
                            <Clock className="w-5 h-5" />
                          </div>
                        )}
                        <div className="min-w-0">
                          <p className="text-xs font-black text-slate-800 truncate">{scan.crop_name.split(" ")[0]} - {scan.disease_name.split(" (")[0]}</p>
                          <p className="text-[10px] text-slate-500 font-semibold leading-normal truncate max-w-[240px]">
                            Rec: {scan.recommendation}
                          </p>
                          <p className="text-[9px] text-slate-400 font-medium">Farmer ID: {scan.user_id.substring(0, 8).toUpperCase()}</p>
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        <span className="text-[9px] font-black text-emerald-700 bg-emerald-50 border border-emerald-100 px-1.5 py-0.5 rounded-md">
                          {scan.confidence_score}%
                        </span>
                        <p className="text-[8px] text-slate-400 font-mono mt-1">{new Date(scan.created_at).toLocaleDateString()}</p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// Simple inline micro icon helper to avoid missing import errors
const RefreshCwIcon = ({ className }: { className?: string }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182m0-4.991v4.99" />
  </svg>
);

export default AdminPanel;
