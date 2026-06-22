import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useLocation, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { AdminLayout, SidebarTab } from "@/components/admin/AdminLayout";

// Import Admin Pages
import { Dashboard as AdminDashboard } from "./Dashboard";
import { Farmers as AdminFarmers } from "./Farmers";
import { FarmerDetail } from "./FarmerDetail";
import { Farms as AdminFarms } from "./Farms";
import { Devices as AdminDevices } from "./Devices";
import { Weather as AdminWeather } from "./Weather";
import { Scanner as AdminScanner } from "./Scanner";
import { Complaints as AdminComplaints } from "./Complaints";
import { Feedback as AdminFeedback } from "./Feedback";
import { Subscriptions as AdminSubscriptions } from "./Subscriptions";
import { Notifications as AdminNotifications, SystemNotification } from "./Notifications";
import { Analytics as AdminAnalytics } from "./Analytics";
import { SettingsModule as AdminSettings } from "./Settings";
import { SystemLogs as AdminLogs } from "./SystemLogs";

export const AdminPortalWrapper = () => {
  const { user, role, loading: authLoading } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  // Tab Navigation & Details View
  const [selectedFarmer, setSelectedFarmer] = useState<any | null>(null);

  // Core Data Lists
  const [users, setUsers] = useState<any[]>([]);
  const [subscriptions, setSubscriptions] = useState<any[]>([]);
  const [scans, setScans] = useState<any[]>([]);
  const [complaints, setComplaints] = useState<any[]>([]);
  const [feedbacks, setFeedbacks] = useState<any[]>([]);
  const [weatherAlerts, setWeatherAlerts] = useState<any[]>([]);

  // Farms and Devices tables states
  const [farms, setFarms] = useState<any[]>([]);
  const [devices, setDevices] = useState<any[]>([]);
  const [farmsMissing, setFarmsMissing] = useState<boolean>(false);
  const [devicesMissing, setDevicesMissing] = useState<boolean>(false);
  const [farmsErrorMsg, setFarmsErrorMsg] = useState<string>("");
  const [devicesErrorMsg, setDevicesErrorMsg] = useState<string>("");
  
  // Profiles diagnostic states
  const [profilesMissing, setProfilesMissing] = useState<boolean>(false);
  const [profilesSchemaIncomplete, setProfilesSchemaIncomplete] = useState<boolean>(false);
  const [profilesErrorMsg, setProfilesErrorMsg] = useState<string>("");
  
  // Live Events Ticker
  const [notifications, setNotifications] = useState<SystemNotification[]>([]);
  const [dataLoading, setDataLoading] = useState<boolean>(true);

  // Unified data fetch from Supabase
  const loadPortalData = async () => {
    if (!user || (role !== "admin" && role !== "super_admin") || !supabase) return;
    setDataLoading(true);

    if (user.id === "test-user-id") {
      // 1. Initialize mock datasets in localStorage if they don't exist
      if (!localStorage.getItem("farmalert_mock_users")) {
        const initialUsers = [
          {
            id: "local-profile-test-farmer-id",
            user_id: "test-farmer-id",
            name: "Nikunj Bariya",
            phone: "9999900000",
            village: "Rampura",
            taluka: "Jambughoda",
            district: "Panchmahal",
            state: "Gujarat",
            crop_type: "Wheat",
            land_size: 5,
            preferred_language: "gu",
            profile_completed: true,
            onboarding_completed: true,
            created_at: new Date(Date.now() - 5 * 24 * 3600 * 1000).toISOString(),
            updated_at: new Date().toISOString(),
            profile_image_url: null,
            role: "farmer",
            is_suspended: false
          },
          {
            id: "farmer-2",
            user_id: "farmer-2-id",
            name: "Ramesh Patel",
            phone: "9876543210",
            village: "Vasad",
            taluka: "Anand",
            district: "Anand",
            state: "Gujarat",
            crop_type: "Cotton",
            land_size: 12,
            preferred_language: "gu",
            profile_completed: true,
            onboarding_completed: true,
            created_at: new Date(Date.now() - 10 * 24 * 3600 * 1000).toISOString(),
            updated_at: new Date().toISOString(),
            profile_image_url: null,
            role: "farmer",
            is_suspended: false
          },
          {
            id: "farmer-3",
            user_id: "farmer-3-id",
            name: "Sanjay Shah",
            phone: "9123456789",
            village: "Karamsad",
            taluka: "Anand",
            district: "Anand",
            state: "Gujarat",
            crop_type: "Rice",
            land_size: 8,
            preferred_language: "hi",
            profile_completed: true,
            onboarding_completed: true,
            created_at: new Date(Date.now() - 15 * 24 * 3600 * 1000).toISOString(),
            updated_at: new Date().toISOString(),
            profile_image_url: null,
            role: "farmer",
            is_suspended: false
          },
          {
            id: "admin-1",
            user_id: "test-user-id",
            name: "FarmAlert Super Admin",
            phone: "9999999999",
            village: "Jambughoda",
            taluka: "Jambughoda",
            district: "Panchmahal",
            state: "Gujarat",
            crop_type: null,
            land_size: null,
            preferred_language: "en",
            profile_completed: true,
            onboarding_completed: true,
            created_at: new Date(Date.now() - 30 * 24 * 3600 * 1000).toISOString(),
            updated_at: new Date().toISOString(),
            profile_image_url: null,
            role: "super_admin",
            is_suspended: false
          }
        ];
        localStorage.setItem("farmalert_mock_users", JSON.stringify(initialUsers));
      }

      if (!localStorage.getItem("farmalert_mock_subscriptions")) {
        const initialSubscriptions = [
          {
            id: "sub-1",
            user_id: "test-farmer-id",
            plan_type: "PRO",
            subscription_status: "active",
            started_at: new Date(Date.now() - 4 * 24 * 3600 * 1000).toISOString(),
            updated_at: new Date().toISOString()
          },
          {
            id: "sub-2",
            user_id: "farmer-2-id",
            plan_type: "PREMIUM",
            subscription_status: "active",
            started_at: new Date(Date.now() - 9 * 24 * 3600 * 1000).toISOString(),
            updated_at: new Date().toISOString()
          }
        ];
        localStorage.setItem("farmalert_mock_subscriptions", JSON.stringify(initialSubscriptions));
      }

      if (!localStorage.getItem("farmalert_mock_scans")) {
        const initialScans = [
          {
            id: "scan-1",
            user_id: "test-farmer-id",
            image_url: "https://images.unsplash.com/photo-1592417817098-8f3d6eb19675",
            crop_name: "Wheat",
            disease_name: "Brown Rust",
            confidence_score: 89,
            recommendation: "Apply Propiconazole 25% EC fungicide and ensure good aeration between crop rows.",
            created_at: new Date(Date.now() - 1 * 24 * 3600 * 1000).toISOString()
          },
          {
            id: "scan-2",
            user_id: "farmer-2-id",
            image_url: "https://images.unsplash.com/photo-1598902108854-10e335adac99",
            crop_name: "Cotton",
            disease_name: "Aphids Infestation",
            confidence_score: 92,
            recommendation: "Spray Neem oil (1500 ppm) or consult local extension agent for imidacloprid application.",
            created_at: new Date(Date.now() - 3 * 24 * 3600 * 1000).toISOString()
          }
        ];
        localStorage.setItem("farmalert_mock_scans", JSON.stringify(initialScans));
      }

      if (!localStorage.getItem("farmalert_mock_complaints")) {
        const initialComplaints = [
          {
            id: "complaint-1",
            user_id: "test-farmer-id",
            name: "Nikunj Bariya",
            phone: "9999900000",
            village: "Rampura",
            taluka: "Jambughoda",
            district: "Panchmahal",
            category: "Weather Issue",
            subject: "Weather forecast not showing local village updates",
            message: "The weather forecast page only shows Panchmahal district weather, not Jambughoda or Rampura village specifically.",
            status: "Pending",
            admin_reply: null,
            created_at: new Date(Date.now() - 2 * 24 * 3600 * 1000).toISOString(),
            updated_at: new Date(Date.now() - 2 * 24 * 3600 * 1000).toISOString()
          }
        ];
        localStorage.setItem("farmalert_mock_complaints", JSON.stringify(initialComplaints));
      }

      if (!localStorage.getItem("farmalert_mock_feedbacks")) {
        const initialFeedbacks = [
          {
            id: "feedback-1",
            user_id: "farmer-3-id",
            rating: 5,
            feedback_message: "Farming tips in Gujarati are extremely helpful. Thank you!",
            language: "gu",
            created_at: new Date(Date.now() - 6 * 24 * 3600 * 1000).toISOString()
          }
        ];
        localStorage.setItem("farmalert_mock_feedbacks", JSON.stringify(initialFeedbacks));
      }

      if (!localStorage.getItem("farmalert_mock_weather_alerts")) {
        const initialWeatherAlerts = [
          {
            id: "alert-1",
            title: "Heavy Rainfall Warning",
            description: "Very heavy rainfall expected over Panchmahal and adjoining talukas. Risk of waterlogging.",
            severity: "orange",
            district: "Panchmahal",
            state: "Gujarat",
            is_active: true,
            created_at: new Date(Date.now() - 12 * 3600 * 1000).toISOString()
          }
        ];
        localStorage.setItem("farmalert_mock_weather_alerts", JSON.stringify(initialWeatherAlerts));
      }

      if (!localStorage.getItem("farmalert_mock_farms")) {
        const initialFarms = [
          { id: "farm-1", user_id: "test-farmer-id", farm_name: "Rampura Main Farm", area_acres: 5, primary_crop: "Wheat", soil_type: "Black Soil", created_at: new Date(Date.now() - 20 * 24 * 3600 * 1000).toISOString() }
        ];
        localStorage.setItem("farmalert_mock_farms", JSON.stringify(initialFarms));
      }

      if (!localStorage.getItem("farmalert_mock_devices")) {
        const initialDevices = [
          { id: "device-1", device_uid: "SN-MOIST-001", farm_id: "farm-1", device_type: "soil_moisture", status: "online", battery_level: 84, last_communication: new Date().toISOString() }
        ];
        localStorage.setItem("farmalert_mock_devices", JSON.stringify(initialDevices));
      }

      // 2. Load from localStorage state
      setUsers(JSON.parse(localStorage.getItem("farmalert_mock_users") || "[]"));
      setSubscriptions(JSON.parse(localStorage.getItem("farmalert_mock_subscriptions") || "[]"));
      setScans(JSON.parse(localStorage.getItem("farmalert_mock_scans") || "[]"));
      setComplaints(JSON.parse(localStorage.getItem("farmalert_mock_complaints") || "[]"));
      setFeedbacks(JSON.parse(localStorage.getItem("farmalert_mock_feedbacks") || "[]"));
      setWeatherAlerts(JSON.parse(localStorage.getItem("farmalert_mock_weather_alerts") || "[]"));
      setFarms(JSON.parse(localStorage.getItem("farmalert_mock_farms") || "[]"));
      setDevices(JSON.parse(localStorage.getItem("farmalert_mock_devices") || "[]"));

      setFarmsMissing(false);
      setDevicesMissing(false);
      setProfilesMissing(false);
      setProfilesSchemaIncomplete(false);
      setDataLoading(false);
      return;
    }

    // 1. Profiles (Farmers)
    try {
      const { data: profs, error: profsError } = await supabase
        .from("profiles")
        .select("*")
        .order("created_at", { ascending: false });
      
      if (profsError) {
        setProfilesErrorMsg(profsError.message);
        if (profsError.code === "42703" || profsError.message.includes("role") || profsError.message.includes("suspended")) {
          setProfilesSchemaIncomplete(true);
        } else if (profsError.code === "42P01" || profsError.message.includes("does not exist")) {
          setProfilesMissing(true);
        }
      } else {
        setUsers(profs || []);
        setProfilesMissing(false);
        setProfilesSchemaIncomplete(false);
      }
    } catch (err: any) {
      console.error("Error loading profiles:", err);
      setProfilesErrorMsg(err.message || "Failed to load profiles");
    }

    // 2. Subscriptions
    try {
      const { data: subs } = await supabase
        .from("user_subscriptions")
        .select("*")
        .order("updated_at", { ascending: false });
      setSubscriptions(subs || []);
    } catch (err) {
      console.error("Error loading user_subscriptions:", err);
    }

    // 3. Scan History
    try {
      const { data: scanData } = await supabase
        .from("scan_history")
        .select("*")
        .order("created_at", { ascending: false });
      setScans(scanData || []);
    } catch (err) {
      console.error("Error loading scan_history:", err);
    }

    // 4. Complaints
    try {
      const { data: comps } = await supabase
        .from("complaints")
        .select("*")
        .order("created_at", { ascending: false });
      setComplaints(comps || []);
    } catch (err) {
      console.error("Error loading complaints:", err);
    }

    // 5. Feedback
    try {
      const { data: feeds } = await supabase
        .from("feedback")
        .select("*")
        .order("created_at", { ascending: false });
      setFeedbacks(feeds || []);
    } catch (err) {
      console.error("Error loading feedback:", err);
    }

    // 6. Weather Alerts
    try {
      const { data: alerts } = await supabase
        .from("weather_alerts")
        .select("*")
        .order("created_at", { ascending: false });
      setWeatherAlerts(alerts || []);
    } catch (err) {
      console.error("Error loading weather_alerts:", err);
    }

    // 7. Check Farms table existence programmatically
    try {
      const { data: farmsData, error: farmsError } = await supabase
        .from("farms")
        .select("*");
      
      if (farmsError) {
        setFarmsErrorMsg(farmsError.message);
        if (farmsError.code === "42P01" || farmsError.message.includes("does not exist")) {
          setFarmsMissing(true);
        }
      } else {
        setFarms(farmsData || []);
        setFarmsMissing(false);
      }
    } catch (err) {
      console.error("Error loading farms:", err);
    }

    // 8. Check Devices table existence programmatically
    try {
      const { data: devicesData, error: devicesError } = await supabase
        .from("devices")
        .select("*");
      
      if (devicesError) {
        setDevicesErrorMsg(devicesError.message);
        if (devicesError.code === "42P01" || devicesError.message.includes("does not exist")) {
          setDevicesMissing(true);
        }
      } else {
        setDevices(devicesData || []);
        setDevicesMissing(false);
      }
    } catch (err) {
      console.error("Error loading devices:", err);
    }

    setDataLoading(false);
  };

  // Trigger load on auth state completion
  useEffect(() => {
    if (user && (role === "admin" || role === "super_admin")) {
      void loadPortalData();
    }
  }, [user, role]);

  // Supabase Realtime Channels Event Listeners
  useEffect(() => {
    if (!user || (role !== "admin" && role !== "super_admin") || !supabase || user.id === "test-user-id") return;

    // A. Listen to complaints updates
    const complaintsChannel = supabase
      .channel("complaints-changes")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "complaints" },
        (payload) => {
          const newTicket = payload.new;
          setComplaints(prev => [newTicket, ...prev]);
          addNotification({
            type: "complaint",
            title: "New Support Ticket",
            message: `${newTicket.name || "A user"} filed a ticket: "${newTicket.subject}"`
          });
        }
      )
      .subscribe();

    // B. Listen to feedback reviews
    const feedbackChannel = supabase
      .channel("feedback-changes")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "feedback" },
        (payload) => {
          const newFeed = payload.new;
          setFeedbacks(prev => [newFeed, ...prev]);
          addNotification({
            type: "feedback",
            title: "New Review Received",
            message: `Rating: ${newFeed.rating} ★ - "${(newFeed.feedback_message || "").substring(0, 40)}..."`
          });
        }
      )
      .subscribe();

    // C. Listen to scan activities
    const scanChannel = supabase
      .channel("scan-changes")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "scan_history" },
        (payload) => {
          const newScan = payload.new;
          setScans(prev => [newScan, ...prev]);
          addNotification({
            type: "scan",
            title: "AI Crop Health Scan",
            message: `Crop: ${newScan.crop_name} diagnosed with ${newScan.disease_name} (${newScan.confidence_score}%)`
          });
        }
      )
      .subscribe();

    // D. Listen to user signups
    const profilesChannel = supabase
      .channel("profile-changes")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "profiles" },
        (payload) => {
          const newProfile = payload.new;
          setUsers(prev => [newProfile, ...prev]);
          addNotification({
            type: "system",
            title: "New Farmer Signup",
            message: `${newProfile.name || "A new farmer"} has registered on the platform.`
          });
        }
      )
      .subscribe();

    // E. Listen to subscriptions
    const subChannel = supabase
      .channel("subscription-changes")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "user_subscriptions" },
        (payload) => {
          const newSub = payload.new;
          setSubscriptions(prev => [newSub, ...prev]);
          addNotification({
            type: "subscription",
            title: "User Subscription Upgrade",
            message: `User ${newSub.user_id} upgraded to plan: ${newSub.plan_type}`
          });
        }
      )
      .subscribe();

    return () => {
      void supabase.removeChannel(complaintsChannel);
      void supabase.removeChannel(feedbackChannel);
      void supabase.removeChannel(scanChannel);
      void supabase.removeChannel(profilesChannel);
      void supabase.removeChannel(subChannel);
    };
  }, [user, role]);

  // Helper to add dynamic system notification logs
  const addNotification = (notif: { type: SystemNotification["type"]; title: string; message: string }) => {
    const fresh: SystemNotification = {
      id: Math.random().toString(),
      type: notif.type,
      title: notif.title,
      message: notif.message,
      timestamp: new Date(),
      read: false
    };
    setNotifications(prev => [fresh, ...prev]);
  };

  const handleMarkAsRead = (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };

  const handleClearAll = () => {
    setNotifications([]);
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-900 text-white">
        <div className="h-10 w-10 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-xs uppercase tracking-wider text-slate-400">Verifying session...</p>
      </div>
    );
  }

  // Redirect to Login if no active session or unauthorized
  if (!user || (role !== "admin" && role !== "super_admin")) {
    window.location.href = "/login";
    return null;
  }

  if (dataLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 text-slate-600">
        <div className="h-8 w-8 border-3 border-primary border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Synchronising database...</p>
      </div>
    );
  }

  const getSubPath = (): SidebarTab => {
    const path = location.pathname;
    if (path.includes("/admin/farmers")) return "users";
    if (path.includes("/admin/complaints")) return "complaints";
    if (path.includes("/admin/feedback")) return "feedback";
    if (path.includes("/admin/subscriptions")) return "subscriptions";
    if (path.includes("/admin/weather")) return "alerts";
    if (path.includes("/admin/analytics")) return "analytics";
    if (path.includes("/admin/settings")) return "settings";
    if (path.includes("/admin/logs")) return "logs";
    if (path.includes("/admin/farms")) return "farms";
    if (path.includes("/admin/devices")) return "devices";
    if (path.includes("/admin/scanner")) return "scanner";
    if (path.includes("/admin/notifications")) return "notifications";
    return "dashboard";
  };

  const activeTab = getSubPath();

  const renderTabContent = () => {
    if (selectedFarmer) {
      return (
        <FarmerDetail 
          farmer={selectedFarmer} 
          subscriptions={subscriptions}
          onBack={() => setSelectedFarmer(null)} 
          onRefresh={loadPortalData}
        />
      );
    }

    switch (activeTab) {
      case "dashboard":
        return (
          <AdminDashboard 
            users={users} 
            subscriptions={subscriptions} 
            complaints={complaints} 
            feedbacks={feedbacks} 
            scans={scans} 
            weatherAlerts={weatherAlerts} 
            farmsMissing={farmsMissing}
            devicesMissing={devicesMissing}
            farmsCount={farms.length}
            devicesCount={devices.length}
            profilesMissing={profilesMissing}
            profilesSchemaIncomplete={profilesSchemaIncomplete}
            profilesErrorMsg={profilesErrorMsg}
          />
        );
      case "users":
        return (
          <AdminFarmers 
            users={users} 
            subscriptions={subscriptions} 
            onSelectFarmer={setSelectedFarmer} 
            onRefresh={loadPortalData}
            profilesMissing={profilesMissing}
            profilesSchemaIncomplete={profilesSchemaIncomplete}
            profilesErrorMsg={profilesErrorMsg}
          />
        );
      case "farms":
        return (
          <AdminFarms 
            farms={farms} 
            isMissing={farmsMissing} 
            errorMsg={farmsErrorMsg} 
          />
        );
      case "devices":
        return (
          <AdminDevices 
            devices={devices} 
            isMissing={devicesMissing} 
            errorMsg={devicesErrorMsg} 
          />
        );
      case "alerts":
        return (
          <AdminWeather 
            weatherAlerts={weatherAlerts} 
            users={users} 
            onRefresh={loadPortalData}
          />
        );
      case "scanner":
        return <AdminScanner scans={scans} />;
      case "complaints":
        return <AdminComplaints complaints={complaints} onRefresh={loadPortalData} />;
      case "feedback":
        return <AdminFeedback feedbacks={feedbacks} users={users} />;
      case "subscriptions":
        return <AdminSubscriptions subscriptions={subscriptions} users={users} />;
      case "notifications":
        return (
          <AdminNotifications 
            notifications={notifications} 
            onMarkAsRead={handleMarkAsRead} 
            onClearAll={handleClearAll} 
          />
        );
      case "analytics":
        return (
          <AdminAnalytics 
            users={users} 
            subscriptions={subscriptions} 
            scans={scans} 
            complaints={complaints} 
            feedbacks={feedbacks} 
            weatherAlerts={weatherAlerts} 
          />
        );
      case "settings":
        return <AdminSettings />;
      case "logs":
        return (
          <AdminLogs 
            users={users} 
            subscriptions={subscriptions} 
            scans={scans} 
            complaints={complaints} 
            feedbacks={feedbacks} 
            weatherAlerts={weatherAlerts} 
            onRefresh={loadPortalData}
          />
        );
      default:
        return <div className="text-slate-500">View not resolved.</div>;
    }
  };

  return (
    <AdminLayout>
      {renderTabContent()}
    </AdminLayout>
  );
};
