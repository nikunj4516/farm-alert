import { useState, useEffect } from "react";
import { ComplaintService, Complaint, Feedback } from "@/services/complaintService";
import { Search, Filter, MessageSquare, ClipboardCheck, ArrowLeft, Download, ShieldAlert, Sparkles, AlertTriangle } from "lucide-react";
import { toast } from "@/components/ui/use-toast";

interface AdminPanelProps {
  onBackToPortal?: () => void;
}

const AdminPanel = ({ onBackToPortal }: AdminPanelProps) => {
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Filter & Search States
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<string>("All");
  const [categoryFilter, setCategoryFilter] = useState<string>("All");

  // Selection & Reply States
  const [selectedComplaint, setSelectedComplaint] = useState<Complaint | null>(null);
  const [replyText, setReplyText] = useState<string>("");
  const [statusUpdate, setStatusUpdate] = useState<Complaint["status"]>("Pending");
  const [updating, setUpdating] = useState<boolean>(false);

  // Tab View
  const [adminTab, setAdminTab] = useState<"complaints" | "feedbacks">("complaints");

  const loadAdminData = async () => {
    setLoading(true);
    try {
      const allComp = await ComplaintService.getAllComplaints();
      const allFeed = await ComplaintService.getAllFeedbacks();
      setComplaints(allComp);
      setFeedbacks(allFeed);
    } catch (err) {
      console.error("Failed to load admin dashboard data", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadAdminData();
  }, []);

  // Listen to new complaint events to update list live!
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
      const updated = await ComplaintService.updateComplaintStatus(
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

    const headers = ["Ticket ID", "Farmer Name", "Phone", "Village", "Category", "Message", "Status", "Admin Reply", "Created At"];
    const rows = complaints.map(c => [
      c.id,
      c.name,
      c.phone,
      c.village,
      c.category,
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
    link.setAttribute("download", `farmalert_complaints_report_${new Date().toISOString().substring(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast({
      title: "Report Downloaded",
      description: "Complaints spreadsheet CSV downloaded successfully.",
    });
  };

  // Filter complaints list
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

  // Calculate statistics
  const pendingCount = complaints.filter(c => c.status === "Pending").length;
  const resolvedCount = complaints.filter(c => c.status === "Resolved").length;
  const inReviewCount = complaints.filter(c => c.status === "In Review").length;
  const totalCount = complaints.length;

  const averageRating = feedbacks.length > 0 
    ? (feedbacks.reduce((sum, f) => sum + f.rating, 0) / feedbacks.length).toFixed(1)
    : "0.0";

  return (
    <div className="space-y-4 animate-in fade-in duration-300 text-left">
      
      {/* Admin Panel Header Actions */}
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
            onClick={handleDownloadCSV}
            className="flex items-center gap-1 px-2.5 py-1 text-[10px] font-black bg-primary/10 text-primary border border-primary/20 rounded-lg hover:bg-primary/25 transition-all"
          >
            <Download className="w-3 h-3" />
            <span>Download CSV Report</span>
          </button>
        </div>
      </div>

      {/* Metrics Banner */}
      <div className="grid grid-cols-4 gap-2">
        <div className="p-3 bg-muted/40 border border-border rounded-xl">
          <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wide">Pending</p>
          <p className="text-xl font-black text-yellow-600 mt-1">{pendingCount}</p>
        </div>
        <div className="p-3 bg-muted/40 border border-border rounded-xl">
          <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wide">In Review</p>
          <p className="text-xl font-black text-blue-600 mt-1">{inReviewCount}</p>
        </div>
        <div className="p-3 bg-muted/40 border border-border rounded-xl">
          <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wide">Resolved</p>
          <p className="text-xl font-black text-emerald-600 mt-1">{resolvedCount}</p>
        </div>
        <div className="p-3 bg-muted/40 border border-border rounded-xl">
          <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wide">Avg Rating</p>
          <p className="text-xl font-black text-primary mt-1">★ {averageRating}</p>
        </div>
      </div>

      {/* Selector Tabs */}
      <div className="flex gap-2 border-b border-border pb-2">
        <button
          onClick={() => { setAdminTab("complaints"); setSelectedComplaint(null); }}
          className={`px-3 py-1.5 text-xs font-black rounded-lg transition-all ${
            adminTab === "complaints"
              ? "bg-primary text-white shadow-sm"
              : "text-muted-foreground hover:bg-muted"
          }`}
        >
          Complaints ({totalCount})
        </button>
        <button
          onClick={() => { setAdminTab("feedbacks"); setSelectedComplaint(null); }}
          className={`px-3 py-1.5 text-xs font-black rounded-lg transition-all ${
            adminTab === "feedbacks"
              ? "bg-primary text-white shadow-sm"
              : "text-muted-foreground hover:bg-muted"
          }`}
        >
          Farmer Feedbacks ({feedbacks.length})
        </button>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-xs text-muted-foreground font-semibold mt-2">Loading system reports...</p>
        </div>
      ) : adminTab === "feedbacks" ? (
        /* FEEDBACKS LIST VIEW */
        <div className="space-y-2.5 max-h-[40vh] overflow-y-auto pr-1">
          {feedbacks.length === 0 ? (
            <p className="text-xs text-muted-foreground font-bold py-6 text-center">No feedback reports submitted yet.</p>
          ) : (
            feedbacks.map((f) => (
              <div key={f.id} className="p-3 bg-card border border-border rounded-xl space-y-2">
                <div className="flex items-center justify-between text-[10px] text-muted-foreground font-bold">
                  <span>Farmer ID: {f.user_id.substring(0, 8).toUpperCase()}</span>
                  <span>{new Date(f.created_at).toLocaleDateString()}</span>
                </div>
                <div className="flex gap-1.5 text-amber-500 text-sm">
                  {Array.from({ length: f.rating }).map((_, i) => (
                    <span key={i}>★</span>
                  ))}
                  {Array.from({ length: 5 - f.rating }).map((_, i) => (
                    <span key={i} className="text-muted/40">☆</span>
                  ))}
                </div>
                <div>
                  <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Favorite Feature</p>
                  <p className="text-xs font-semibold text-foreground mt-0.5">{f.favorite_feature}</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Suggestions</p>
                  <p className="text-xs font-semibold text-muted-foreground mt-0.5 leading-relaxed">{f.suggestions}</p>
                </div>
              </div>
            ))
          )}
        </div>
      ) : selectedComplaint ? (
        /* EDIT / RESPONSE COMPLAINT VIEW */
        <div className="p-4 bg-card border border-border rounded-2xl space-y-4 animate-in slide-in-from-right-3 duration-300">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-bold text-foreground">Respond to Grievance</h4>
            <button
              onClick={() => { setSelectedComplaint(null); setReplyText(""); }}
              className="text-xs font-black text-primary hover:underline"
            >
              Cancel
            </button>
          </div>

          <div className="space-y-2 text-xs border-b border-border pb-3">
            <div className="grid grid-cols-2 gap-2 text-muted-foreground">
              <p><strong>Farmer:</strong> {selectedComplaint.name}</p>
              <p><strong>Phone:</strong> {selectedComplaint.phone}</p>
              <p><strong>Village:</strong> {selectedComplaint.village}</p>
              <p><strong>Category:</strong> {selectedComplaint.category}</p>
            </div>
            <p className="mt-2 bg-muted/30 p-2.5 rounded-xl border border-border leading-relaxed font-semibold text-foreground whitespace-pre-wrap">
              "{selectedComplaint.message}"
            </p>
            {selectedComplaint.screenshot_url && (
              <div className="mt-2 space-y-1">
                <p className="text-[10px] font-bold text-muted-foreground uppercase">Attached Screenshot Preview:</p>
                <div className="w-40 h-32 border border-border rounded-xl overflow-hidden shadow-sm bg-background">
                  <img src={selectedComplaint.screenshot_url} alt="Attached screenshot" className="w-full h-full object-cover" />
                </div>
              </div>
            )}
          </div>

          <form onSubmit={handleUpdateComplaint} className="space-y-3.5">
            <div className="space-y-1">
              <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Update Status</label>
              <select
                value={statusUpdate}
                onChange={(e) => setStatusUpdate(e.target.value as Complaint["status"])}
                className="w-full text-xs text-foreground py-2 px-3 border border-border rounded-xl bg-background outline-none focus:border-primary"
              >
                <option value="Pending">Pending</option>
                <option value="In Review">In Review</option>
                <option value="Resolved">Resolved</option>
                <option value="Rejected">Rejected</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Reply / Answer</label>
              <textarea
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                rows={3}
                required
                placeholder="Type your reply to the farmer here. It will appear on their dashboard instantly..."
                className="w-full text-xs text-foreground py-2 px-3 border border-border rounded-xl bg-background outline-none focus:border-primary resize-none"
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
        /* COMPLAINTS LIST VIEW */
        <div className="space-y-3">
          {/* Search & Filters */}
          <div className="space-y-2">
            <div className="relative">
              <Search className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search complaints by farmer name, phone, message..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full text-xs pl-9 pr-3 py-2.5 border border-border rounded-xl bg-background outline-none focus:border-primary font-semibold"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] font-bold text-muted-foreground uppercase shrink-0">Status:</span>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full text-[10px] text-foreground py-1 px-1.5 border border-border rounded-lg bg-background outline-none focus:border-primary font-black"
                >
                  <option value="All">All Statuses</option>
                  <option value="Pending">Pending</option>
                  <option value="In Review">In Review</option>
                  <option value="Resolved">Resolved</option>
                  <option value="Rejected">Rejected</option>
                </select>
              </div>

              <div className="flex items-center gap-1.5">
                <span className="text-[10px] font-bold text-muted-foreground uppercase shrink-0">Category:</span>
                <select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  className="w-full text-[10px] text-foreground py-1 px-1.5 border border-border rounded-lg bg-background outline-none focus:border-primary font-black"
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

          {/* List */}
          <div className="space-y-2.5 max-h-[35vh] overflow-y-auto pr-1">
            {filteredComplaints.length === 0 ? (
              <p className="text-xs text-muted-foreground font-bold py-8 text-center bg-muted/10 border border-dashed border-border rounded-xl">
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
                    className="w-full p-3.5 bg-card border border-border rounded-2xl hover:border-primary/30 transition-all flex flex-col gap-2 shadow-sm text-left active:scale-[0.99]"
                  >
                    <div className="flex items-center justify-between w-full">
                      <span className="text-[10px] font-black text-primary font-mono bg-primary/5 px-2 py-0.5 rounded-full">
                        FA-{c.id.substring(0, 8).toUpperCase()}
                      </span>
                      <span
                        className={`text-[9px] font-bold border px-1.5 py-0.5 rounded-full ${
                          statusColors[c.status] || "bg-muted text-muted-foreground"
                        }`}
                      >
                        {c.status}
                      </span>
                    </div>

                    <div>
                      <p className="text-xs font-black text-foreground">{c.name} ({c.village})</p>
                      <p className="text-xs font-semibold text-muted-foreground line-clamp-2 mt-0.5 leading-relaxed">
                        "{c.message}"
                      </p>
                    </div>

                    <div className="flex items-center justify-between text-[9px] text-muted-foreground font-semibold border-t border-border/60 pt-2 w-full">
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
  );
};

export default AdminPanel;
