import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MessageSquare, Star, LifeBuoy, AlertTriangle, ListTodo, ShieldAlert, Sparkles, Send, Upload, FileImage, Loader2 } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { ComplaintService, Complaint, Feedback } from "@/services/complaintService";
import { toast } from "@/components/ui/use-toast";
import AdminPanel from "./AdminPanel";

interface SupportCenterModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  userId: string;
  userName?: string;
  userPhone?: string;
  userVillage?: string;
}

const SupportCenterModal = ({
  isOpen,
  onOpenChange,
  userId,
  userName = "Farmer",
  userPhone = "",
  userVillage = "Vasad",
}: SupportCenterModalProps) => {
  const { language, t } = useLanguage();
  const [activeTab, setActiveTab] = useState<string>("feedback");
  const [isAdminView, setIsAdminView] = useState<boolean>(false);

  // Feedback States
  const [rating, setRating] = useState<number>(0);
  const [favFeature, setFavFeature] = useState<string>("");
  const [suggestions, setSuggestions] = useState<string>("");
  const [submittingFeedback, setSubmittingFeedback] = useState<boolean>(false);

  // Complaint States
  const [complaintName, setComplaintName] = useState<string>(userName);
  const [complaintPhone, setComplaintPhone] = useState<string>(userPhone);
  const [complaintVillage, setComplaintVillage] = useState<string>(userVillage);
  const [complaintCategory, setComplaintCategory] = useState<string>("Weather Issue");
  const [complaintMessage, setComplaintMessage] = useState<string>("");
  const [screenshotFile, setScreenshotFile] = useState<File | null>(null);
  const [screenshotPreview, setScreenshotPreview] = useState<string | null>(null);
  const [submittingComplaint, setSubmittingComplaint] = useState<boolean>(false);

  // User Complaints List
  const [userComplaints, setUserComplaints] = useState<Complaint[]>([]);
  const [loadingComplaints, setLoadingComplaints] = useState<boolean>(false);

  // Re-fetch complaints when tab changes or modal opens
  const fetchUserComplaints = async () => {
    if (!userId) return;
    setLoadingComplaints(true);
    try {
      const list = await ComplaintService.getComplaints(userId);
      setUserComplaints(list);
    } catch (err) {
      console.error("Failed to load user complaints", err);
    } finally {
      setLoadingComplaints(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      setComplaintName(userName);
      setComplaintPhone(userPhone);
      setComplaintVillage(userVillage);
      fetchUserComplaints();
    }
  }, [isOpen, userId, userName, userPhone, userVillage]);

  useEffect(() => {
    if (activeTab === "my-complaints") {
      fetchUserComplaints();
    }
  }, [activeTab]);

  // Handle local status update events
  useEffect(() => {
    const handleUpdate = () => {
      void fetchUserComplaints();
    };
    window.addEventListener("farmalert_complaint_updated", handleUpdate);
    return () => {
      window.removeEventListener("farmalert_complaint_updated", handleUpdate);
    };
  }, []);

  const handleScreenshotChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: "File too large",
          description: "Please upload a screenshot smaller than 5MB.",
          variant: "destructive",
        });
        return;
      }
      setScreenshotFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setScreenshotPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleFeedbackSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (rating === 0) {
      toast({
        title: language === "gu" ? "કૃપા કરીને રેટિંગ પસંદ કરો" : language === "hi" ? "कृपया रेटिंग चुनें" : "Please select a rating",
        description: language === "gu" ? "તમારો રેટિંગ આપવો જરૂરી છે." : "Star rating is required.",
        variant: "destructive",
      });
      return;
    }

    setSubmittingFeedback(true);
    try {
      await ComplaintService.submitFeedback({
        user_id: userId,
        rating,
        favorite_feature: favFeature || "None specified",
        suggestions: suggestions || "None specified",
      });

      toast({
        title: language === "gu" ? "પ્રતિભાવ સબમિટ થયો!" : language === "hi" ? "प्रतिक्रिया सबमिट की गई!" : "Feedback Submitted!",
        description: language === "gu" ? "પ્રતિભાવ આપવા બદલ આભાર." : "Thank you for your valuable input.",
      });

      // Reset
      setRating(0);
      setFavFeature("");
      setSuggestions("");
      setActiveTab("my-complaints");
    } catch (err) {
      toast({
        title: "Submission failed",
        description: err instanceof Error ? err.message : "Error submitting feedback",
        variant: "destructive",
      });
    } finally {
      setSubmittingFeedback(false);
    }
  };

  const handleComplaintSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!complaintName || !complaintPhone || !complaintMessage) {
      toast({
        title: "Fields required",
        description: "Please fill out all required fields.",
        variant: "destructive",
      });
      return;
    }

    setSubmittingComplaint(true);
    try {
      // If we had a real file upload to storage:
      // const screenshotUrl = screenshotFile ? await StorageService.upload(screenshotFile) : null;
      // Here we simulate the URL using base64 preview or a mock path
      const mockScreenshotUrl = screenshotPreview || null;

      await ComplaintService.submitComplaint({
        user_id: userId,
        name: complaintName,
        phone: complaintPhone,
        village: complaintVillage,
        category: complaintCategory,
        message: complaintMessage,
        screenshot_url: mockScreenshotUrl,
      });

      toast({
        title: language === "gu" ? "ફરિયાદ સફળતાપૂર્વક નોંધાઈ!" : language === "hi" ? "शिकायत सफलतापूर्वक दर्ज की गई!" : "Complaint Registered!",
        description: language === "gu" ? "અમે ટૂંક સમયમાં તમારો સંપર્ક કરીશું." : "We will review your complaint shortly.",
      });

      // Reset
      setComplaintMessage("");
      setScreenshotFile(null);
      setScreenshotPreview(null);
      setActiveTab("my-complaints");
    } catch (err) {
      toast({
        title: "Registration failed",
        description: err instanceof Error ? err.message : "Error registering complaint",
        variant: "destructive",
      });
    } finally {
      setSubmittingComplaint(false);
    }
  };

  const copy = {
    title: language === "gu" ? "મદદ અને સહાયતા કેન્દ્ર" : language === "hi" ? "सहायता और शिकायत केंद्र" : "Help & Support Center",
    desc: language === "gu" ? "અમને જણાવો કે અમે તમારી કેવી રીતે મદદ કરી શકીએ." : language === "hi" ? "हमें बताएं कि हम आपकी कैसे मदद कर सकते हैं।" : "Let us know how we can support your farming journey.",
    feedbackTab: language === "gu" ? "પ્રતિભાવ" : language === "hi" ? "फीडबैक" : "Feedback",
    complaintTab: language === "gu" ? "ફરિયાદ કરો" : language === "hi" ? "शिकायत दर्ज करें" : "File Complaint",
    myComplaints: language === "gu" ? "મારી ફરિયાદો" : language === "hi" ? "मेरी शिकायतें" : "My Complaints",
    adminView: language === "gu" ? "એડમિન પેનલ" : language === "hi" ? "एडमिन पैनल" : "Admin Panel",
    fullName: language === "gu" ? "આખું નામ" : language === "hi" ? "पूरा नाम" : "Full Name",
    phone: language === "gu" ? "ફોન નંબર" : language === "hi" ? "फ़ोन नंबर" : "Phone Number",
    village: language === "gu" ? "ગામ" : language === "hi" ? "गाँव" : "Village/Location",
    category: language === "gu" ? "કેટેગરી" : language === "hi" ? "श्रेणी" : "Category",
    message: language === "gu" ? "તમારો સંદેશો" : language === "hi" ? "आपका संदेश" : "Description / Message",
    screenshot: language === "gu" ? "સ્ક્રીનશોટ ઉમેરો (વૈકલ્પિક)" : language === "hi" ? "स्क्रीनशॉट अपलोड करें (वैकल्पिक)" : "Upload Screenshot (Optional)",
    submit: language === "gu" ? "સબમિટ કરો" : language === "hi" ? "सबमिट करें" : "Submit",
  };

  const categories = [
    { value: "Weather Issue", label: language === "gu" ? "હવામાન માહિતી પ્રશ્ન" : language === "hi" ? "मौसम संबंधी समस्या" : "Weather Issue" },
    { value: "Translation Issue", label: language === "gu" ? "ભાષાંતર પ્રશ્ન" : language === "hi" ? "अनुवाद समस्या" : "Translation Issue" },
    { value: "News Issue", label: language === "gu" ? "સમાચાર પ્રશ્ન" : language === "hi" ? "समाचार संबंधी समस्या" : "News Issue" },
    { value: "Alert Issue", label: language === "gu" ? "ચેતવણી મેસેજ પ્રશ્ન" : language === "hi" ? "अलर्ट संबंधी समस्या" : "Alert Issue" },
    { value: "Profile Issue", label: language === "gu" ? "પ્રોફાઇલ સંબંધિત પ્રશ્ન" : language === "hi" ? "प्रोफ़ाइल समस्या" : "Profile Issue" },
    { value: "Bug Report", label: language === "gu" ? "એપ બગ (ક્ષતિ)" : language === "hi" ? "ऐप बग रिपोर्ट" : "App Bug Report" },
    { value: "Feature Request", label: language === "gu" ? "નવી સુવિધા પ્રસ્તાવ" : language === "hi" ? "फ़ीचर अनुरोध" : "Feature Request" },
    { value: "Other", label: language === "gu" ? "અન્ય" : language === "hi" ? "अन्य" : "Other Issue" },
  ];

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[580px] w-full max-h-[85vh] overflow-y-auto rounded-3xl p-6 bg-gradient-to-b from-card via-card to-background border-primary/10">
        <DialogHeader className="pb-3 border-b border-border">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                <LifeBuoy className="w-5 h-5 animate-pulse" />
              </div>
              <div className="text-left">
                <DialogTitle className="text-xl font-bold text-foreground">
                  {isAdminView ? copy.adminView : copy.title}
                </DialogTitle>
                <DialogDescription className="text-xs text-muted-foreground font-semibold mt-0.5">
                  {isAdminView ? "Review and respond to farmer grievances." : copy.desc}
                </DialogDescription>
              </div>
            </div>
            
            {/* Developer/Admin Portal Toggle */}
            <button
              onClick={() => setIsAdminView(!isAdminView)}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black border transition-all ${
                isAdminView 
                  ? "bg-amber-100 text-amber-800 border-amber-300 shadow-sm"
                  : "bg-muted text-muted-foreground border-border hover:bg-primary/10 hover:text-primary"
              }`}
            >
              <ShieldAlert className="w-3.5 h-3.5" />
              {isAdminView ? "Farmer Portal" : "Test Admin Panel"}
            </button>
          </div>
        </DialogHeader>

        {isAdminView ? (
          <AdminPanel onBackToPortal={() => setIsAdminView(false)} />
        ) : (
          <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-4 w-full">
            <TabsList className="grid grid-cols-3 w-full bg-muted/60 p-1 rounded-xl">
              <TabsTrigger value="feedback" className="rounded-lg text-xs font-black py-2">
                <MessageSquare className="w-3.5 h-3.5 mr-1" />
                {copy.feedbackTab}
              </TabsTrigger>
              <TabsTrigger value="complaint" className="rounded-lg text-xs font-black py-2">
                <AlertTriangle className="w-3.5 h-3.5 mr-1" />
                {copy.complaintTab}
              </TabsTrigger>
              <TabsTrigger value="my-complaints" className="rounded-lg text-xs font-black py-2 relative">
                <ListTodo className="w-3.5 h-3.5 mr-1" />
                {copy.myComplaints}
                {userComplaints.filter(c => c.status === "Pending").length > 0 && (
                  <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-red-500 border-2 border-card"></span>
                )}
              </TabsTrigger>
            </TabsList>

            {/* FEEDBACK TAB CONTENT */}
            <TabsContent value="feedback" className="mt-4 animate-in fade-in duration-200">
              <form onSubmit={handleFeedbackSubmit} className="space-y-4">
                <div className="bg-primary/5 border border-primary/10 rounded-2xl p-4 text-center space-y-3">
                  <div className="inline-flex items-center gap-1.5 bg-[#DCFCE7] text-[#16A34A] px-2.5 py-1 rounded-full text-[10px] font-black">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>RATE FARMalert</span>
                  </div>
                  <h4 className="text-sm font-bold text-foreground">
                    {language === "gu" ? "તમારો અનુભવ કેવો રહ્યો?" : language === "hi" ? "आपका अनुभव कैसा रहा?" : "How is your experience with FarmAlert?"}
                  </h4>
                  <div className="flex justify-center gap-3">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setRating(star)}
                        className="text-3xl transition-transform active:scale-125 focus:outline-none"
                      >
                        {star <= rating ? "★" : "☆"}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-3.5">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-muted-foreground uppercase tracking-wide">
                      {language === "gu" ? "તમને કઈ સુવિધા સૌથી વધુ ગમી?" : language === "hi" ? "आपको कौन सी सुविधा सबसे ज्यादा पसंद आई?" : "What feature do you like most?"}
                    </label>
                    <input
                      type="text"
                      value={favFeature}
                      onChange={(e) => setFavFeature(e.target.value)}
                      placeholder={language === "gu" ? "દા.ત., હવામાન સ્માર્ટ ચેતવણીઓ, રોગ સ્કેનર..." : "e.g., Weather Risk Alerts, disease scanner..."}
                      className="w-full text-xs text-foreground py-2.5 px-3 border border-border rounded-xl bg-background outline-none focus:border-primary"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-muted-foreground uppercase tracking-wide">
                      {language === "gu" ? "સુધારણા માટેના સૂચનો" : language === "hi" ? "सुधार के लिए आपके सुझाव" : "Suggestions for improvement"}
                    </label>
                    <textarea
                      value={suggestions}
                      onChange={(e) => setSuggestions(e.target.value)}
                      rows={3}
                      placeholder={language === "gu" ? "એપને વધુ સારી બનાવવા માટે તમારું મંતવ્ય આપો..." : "Share what we should add or change..."}
                      className="w-full text-xs text-foreground py-2.5 px-3 border border-border rounded-xl bg-background outline-none focus:border-primary resize-none"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={submittingFeedback || rating === 0}
                  className="w-full bg-primary hover:bg-primary/95 text-white py-3 rounded-xl text-sm font-black flex items-center justify-center gap-1.5 transition-all shadow-sm active:scale-98 disabled:opacity-50 mt-2"
                >
                  {submittingFeedback ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      {copy.submit}
                    </>
                  )}
                </button>
              </form>
            </TabsContent>

            {/* COMPLAINT TAB CONTENT */}
            <TabsContent value="complaint" className="mt-4 animate-in fade-in duration-200">
              <form onSubmit={handleComplaintSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-muted-foreground uppercase tracking-wide">
                      {copy.fullName} *
                    </label>
                    <input
                      type="text"
                      value={complaintName}
                      onChange={(e) => setComplaintName(e.target.value)}
                      required
                      className="w-full text-xs text-foreground py-2.5 px-3 border border-border rounded-xl bg-background outline-none focus:border-primary"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-muted-foreground uppercase tracking-wide">
                      {copy.phone} *
                    </label>
                    <input
                      type="tel"
                      value={complaintPhone}
                      onChange={(e) => setComplaintPhone(e.target.value)}
                      required
                      className="w-full text-xs text-foreground py-2.5 px-3 border border-border rounded-xl bg-background outline-none focus:border-primary"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-muted-foreground uppercase tracking-wide">
                      {copy.village}
                    </label>
                    <input
                      type="text"
                      value={complaintVillage}
                      onChange={(e) => setComplaintVillage(e.target.value)}
                      className="w-full text-xs text-foreground py-2.5 px-3 border border-border rounded-xl bg-background outline-none focus:border-primary"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-muted-foreground uppercase tracking-wide">
                      {copy.category}
                    </label>
                    <select
                      value={complaintCategory}
                      onChange={(e) => setComplaintCategory(e.target.value)}
                      className="w-full text-xs text-foreground py-2.5 px-2 border border-border rounded-xl bg-background outline-none focus:border-primary"
                    >
                      {categories.map((c) => (
                        <option key={c.value} value={c.value}>
                          {c.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-muted-foreground uppercase tracking-wide">
                    {copy.message} *
                  </label>
                  <textarea
                    value={complaintMessage}
                    onChange={(e) => setComplaintMessage(e.target.value)}
                    required
                    rows={4}
                    placeholder={
                      language === "gu"
                        ? "વિગતવાર વર્ણન લખો (કયો પ્રશ્ન ક્યારથી છે)..."
                        : "Describe the issue in detail (when did it happen, details)..."
                    }
                    className="w-full text-xs text-foreground py-2.5 px-3 border border-border rounded-xl bg-background outline-none focus:border-primary resize-none"
                  />
                </div>

                {/* Screenshot Uploader */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-muted-foreground uppercase tracking-wide">
                    {copy.screenshot}
                  </label>
                  <div className="flex items-center gap-3">
                    <label className="flex items-center gap-2 px-4 py-2.5 bg-background border border-dashed border-border rounded-xl cursor-pointer hover:bg-muted text-xs font-bold text-foreground transition-all">
                      <Upload className="w-4 h-4 text-primary" />
                      <span>{screenshotFile ? "Change Image" : "Choose Image"}</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleScreenshotChange}
                        className="hidden"
                      />
                    </label>
                    {screenshotPreview && (
                      <div className="relative w-12 h-12 border border-border rounded-xl overflow-hidden shadow-sm flex items-center justify-center bg-background shrink-0">
                        <img src={screenshotPreview} alt="Screenshot preview" className="w-full h-full object-cover" />
                        <button
                          type="button"
                          onClick={() => {
                            setScreenshotFile(null);
                            setScreenshotPreview(null);
                          }}
                          className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full text-[8px] font-black text-white flex items-center justify-center border border-card"
                        >
                          ×
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={submittingComplaint}
                  className="w-full bg-primary hover:bg-primary/95 text-white py-3 rounded-xl text-sm font-black flex items-center justify-center gap-1.5 transition-all shadow-sm active:scale-98 disabled:opacity-50 mt-2"
                >
                  {submittingComplaint ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      {language === "gu" ? "ફરિયાદ દાખલ કરો" : "Register Complaint"}
                    </>
                  )}
                </button>
              </form>
            </TabsContent>

            {/* MY COMPLAINTS LIST TAB */}
            <TabsContent value="my-complaints" className="mt-4 animate-in fade-in duration-200">
              {loadingComplaints ? (
                <div className="flex flex-col items-center justify-center py-12">
                  <Loader2 className="w-8 h-8 text-primary animate-spin" />
                  <p className="text-xs text-muted-foreground font-semibold mt-2">Loading complaints...</p>
                </div>
              ) : userComplaints.length === 0 ? (
                <div className="text-center py-12 border border-dashed border-border rounded-2xl bg-muted/20">
                  <span className="text-3xl">📭</span>
                  <p className="text-sm font-bold text-foreground mt-3">
                    {language === "gu" ? "કોઈ ફરિયાદ મળી નથી." : "No complaints filed."}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {language === "gu" ? "જ્યારે તમે કોઈ ફરિયાદ નોંધો છો ત્યારે તે અહીં દેખાશે." : "Your submitted issues and status tracking will appear here."}
                  </p>
                </div>
              ) : (
                <div className="space-y-3.5 max-h-[45vh] overflow-y-auto pr-1">
                  {userComplaints.map((c) => {
                    const statusColors = {
                      Pending: "bg-yellow-50 text-yellow-700 border-yellow-200",
                      "In Review": "bg-blue-50 text-blue-700 border-blue-200",
                      Resolved: "bg-emerald-50 text-emerald-700 border-emerald-200",
                      Rejected: "bg-red-50 text-red-700 border-red-200",
                    };

                    const statusLabels = {
                      Pending: language === "gu" ? "બાકી (Pending)" : "Pending",
                      "In Review": language === "gu" ? "તપાસ હેઠળ (In Review)" : "In Review",
                      Resolved: language === "gu" ? "ઉકેલાયેલ (Resolved)" : "Resolved",
                      Rejected: language === "gu" ? "અસ્વીકાર (Rejected)" : "Rejected",
                    };

                    return (
                      <div
                        key={c.id}
                        className="p-4 rounded-2xl border border-border bg-card shadow-sm space-y-3 text-left hover:border-primary/20 transition-colors"
                      >
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-[10px] font-black text-primary font-mono tracking-tight bg-primary/5 px-2 py-0.5 rounded-full">
                            TICKET: {c.id.substring(0, 8).toUpperCase()}
                          </span>
                          <span
                            className={`text-[10px] font-bold border px-2 py-0.5 rounded-full ${
                              statusColors[c.status] || "bg-muted text-muted-foreground border-border"
                            }`}
                          >
                            {statusLabels[c.status] || c.status}
                          </span>
                        </div>

                        <div>
                          <p className="text-xs font-black text-foreground uppercase tracking-wide">
                            {categories.find(cat => cat.value === c.category)?.label || c.category}
                          </p>
                          <p className="text-xs font-semibold text-muted-foreground mt-0.5 whitespace-pre-wrap leading-relaxed">
                            {c.message}
                          </p>
                        </div>

                        {c.screenshot_url && (
                          <div className="flex items-center gap-1.5 text-[10px] font-black text-primary bg-primary/5 border border-primary/10 px-2 py-1.5 rounded-xl w-fit cursor-pointer hover:bg-primary/10">
                            <FileImage className="w-3.5 h-3.5" />
                            <span>View Attached Screenshot</span>
                          </div>
                        )}

                        <div className="flex items-center justify-between border-t border-border pt-2.5 text-[10px] text-muted-foreground font-semibold">
                          <span>Filed: {new Date(c.created_at).toLocaleDateString()}</span>
                          <span>Village: {c.village}</span>
                        </div>

                        {/* Admin Response Section */}
                        {c.admin_reply && (
                          <div className="p-3 bg-muted/40 border border-border rounded-xl space-y-1.5">
                            <div className="flex items-center gap-1.5 text-[10px] font-black text-amber-800">
                              <ShieldAlert className="w-3.5 h-3.5" />
                              <span>OFFICIAL REPLY FROM FARMalert SUPPORT:</span>
                            </div>
                            <p className="text-xs font-semibold text-foreground leading-relaxed">
                              {c.admin_reply}
                            </p>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </TabsContent>
          </Tabs>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default SupportCenterModal;
