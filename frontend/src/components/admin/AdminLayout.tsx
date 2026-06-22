import React, { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate, useLocation } from "react-router-dom";
import { 
  LayoutDashboard, Users, CloudSun, Scan, ClipboardList, MessageSquare, 
  CreditCard, Bell, TrendingUp, Settings, FileText, LogOut, Menu, X, Shield,
  Layers, Cpu
} from "lucide-react";

export type SidebarTab = 
  | "dashboard"
  | "users"
  | "farms"
  | "devices"
  | "alerts"
  | "scanner"
  | "complaints"
  | "feedback"
  | "subscriptions"
  | "notifications"
  | "analytics"
  | "settings"
  | "logs";

interface LayoutProps {
  children: React.ReactNode;
}

const getRouteForTab = (tab: SidebarTab) => {
  if (tab === "users") return "/admin/farmers";
  if (tab === "alerts") return "/admin/weather";
  return `/admin/${tab}`;
};

const getTabFromRoute = (pathname: string): SidebarTab => {
  if (pathname.includes("/admin/farmers")) return "users";
  if (pathname.includes("/admin/weather")) return "alerts";
  const parts = pathname.split("/");
  const lastPart = parts[parts.length - 1];
  if (lastPart === "admin" || !lastPart) return "dashboard";
  return lastPart as SidebarTab;
};

export const AdminLayout: React.FC<LayoutProps> = ({ children }) => {
  const { user, role, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const activeTab = getTabFromRoute(location.pathname);

  const menuItems = [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
    { id: "users", label: "User Management", icon: Users },
    { id: "farms", label: "Farm Management", icon: Layers },
    { id: "devices", label: "Device Management", icon: Cpu },
    { id: "alerts", label: "Alert Management", icon: CloudSun },
    { id: "scanner", label: "Disease Scanner", icon: Scan },
    { id: "complaints", label: "Complaint Management", icon: ClipboardList },
    { id: "feedback", label: "Feedback Management", icon: MessageSquare },
    { id: "subscriptions", label: "Subscription Management", icon: CreditCard },
    { id: "notifications", label: "Notification Center", icon: Bell },
    { id: "analytics", label: "Analytics Dashboard", icon: TrendingUp },
    { id: "settings", label: "Settings Module", icon: Settings },
    { id: "logs", label: "System Logs", icon: FileText }
  ] as const;

  const handleNavClick = (tabId: SidebarTab) => {
    navigate(getRouteForTab(tabId));
    setIsMobileOpen(false);
  };

  const handleSignOut = async () => {
    await signOut();
    navigate("/login");
  };

  const getRoleBadgeColor = (roleStr: typeof role) => {
    switch (roleStr) {
      case "super_admin":
        return "bg-purple-100 text-purple-700 border-purple-200";
      case "admin":
        return "bg-blue-100 text-blue-700 border-blue-200";
      default:
        return "bg-slate-100 text-slate-700 border-slate-200";
    }
  };

  return (
    <div className="min-h-screen flex bg-slate-50 w-full">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex flex-col w-64 bg-slate-900 text-slate-300 border-r border-slate-800 shrink-0">
        {/* Brand Header */}
        <div className="h-16 flex items-center px-6 border-b border-slate-800 gap-2">
          <div className="bg-primary p-1.5 rounded-lg text-white">
            <Shield className="h-5 w-5" />
          </div>
          <div>
            <h1 className="font-bold text-white tracking-wide text-sm leading-none">FarmAlert</h1>
            <span className="text-[10px] text-primary font-semibold tracking-widest uppercase">Admin Panel</span>
          </div>
        </div>

        {/* Nav Links */}
        <nav className="flex-1 py-6 px-4 space-y-1 overflow-y-auto">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                  isActive 
                    ? "bg-primary text-white shadow-md shadow-primary/10 font-semibold" 
                    : "hover:bg-slate-800/60 hover:text-white"
                }`}
              >
                <Icon className={`h-4 w-4 shrink-0 ${isActive ? "text-white" : "text-slate-400 group-hover:text-white"}`} />
                {item.label}
              </button>
            );
          })}
        </nav>

        {/* User Card */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/40">
          <div className="flex items-center gap-3 mb-3">
            <div className="h-9 w-9 rounded-full bg-slate-800 flex items-center justify-center border border-slate-700">
              <span className="text-sm font-bold text-white uppercase">
                {user?.email?.[0] || "A"}
              </span>
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-semibold text-white truncate">{user?.email || "admin@example.com"}</p>
              <span className={`inline-block px-2 py-0.5 mt-0.5 rounded-full text-[9px] font-bold border uppercase tracking-wider ${getRoleBadgeColor(role)}`}>
                {role?.replace("_", " ") || "admin"}
              </span>
            </div>
          </div>
          <button 
            onClick={handleSignOut}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-slate-800/80 hover:bg-red-950/40 hover:text-red-400 border border-slate-700/60 hover:border-red-900/60 rounded-lg text-xs font-semibold transition-all duration-200"
          >
            <LogOut className="h-3.5 w-3.5" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Mobile Top Bar */}
      <div className="lg:hidden fixed top-0 left-0 right-0 h-16 bg-slate-900 border-b border-slate-800 flex items-center justify-between px-6 z-50">
        <div className="flex items-center gap-2">
          <div className="bg-primary p-1 rounded-lg text-white">
            <Shield className="h-4 w-4" />
          </div>
          <div>
            <h1 className="font-bold text-white text-sm">FarmAlert</h1>
            <span className="text-[8px] text-primary font-semibold tracking-wider uppercase">Admin</span>
          </div>
        </div>
        <button
          onClick={() => setIsMobileOpen(!isMobileOpen)}
          className="text-slate-400 hover:text-white"
        >
          {isMobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {/* Mobile Menu Backdrop */}
      {isMobileOpen && (
        <div 
          onClick={() => setIsMobileOpen(false)}
          className="lg:hidden fixed inset-0 bg-black/60 z-40"
        />
      )}

      {/* Mobile Sidebar */}
      <aside className={`lg:hidden fixed top-0 bottom-0 left-0 w-64 bg-slate-900 text-slate-300 border-r border-slate-800 z-50 flex flex-col transition-transform duration-300 ease-in-out ${
        isMobileOpen ? "translate-x-0" : "-translate-x-full"
      }`}>
        <div className="h-16 flex items-center px-6 border-b border-slate-800 gap-2">
          <div className="bg-primary p-1.5 rounded-lg text-white">
            <Shield className="h-5 w-5" />
          </div>
          <div>
            <h1 className="font-bold text-white text-sm">FarmAlert</h1>
            <span className="text-[8px] text-primary font-semibold tracking-wider uppercase">Admin Panel</span>
          </div>
        </div>

        <nav className="flex-1 py-6 px-4 space-y-1 overflow-y-auto">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                  isActive 
                    ? "bg-primary text-white shadow-md shadow-primary/10 font-semibold" 
                    : "hover:bg-slate-800/60 hover:text-white"
                }`}
              >
                <Icon className={`h-4 w-4 shrink-0 ${isActive ? "text-white" : "text-slate-400 group-hover:text-white"}`} />
                {item.label}
              </button>
            );
          })}
        </nav>

        <div className="p-4 border-t border-slate-800 bg-slate-950/40">
          <div className="flex items-center gap-3 mb-3">
            <div className="h-9 w-9 rounded-full bg-slate-800 flex items-center justify-center border border-slate-700">
              <span className="text-sm font-bold text-white uppercase">
                {user?.email?.[0] || "A"}
              </span>
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-semibold text-white truncate">{user?.email || "admin@example.com"}</p>
              <span className={`inline-block px-2 py-0.5 mt-0.5 rounded-full text-[9px] font-bold border uppercase tracking-wider ${getRoleBadgeColor(role)}`}>
                {role?.replace("_", " ") || "admin"}
              </span>
            </div>
          </div>
          <button 
            onClick={handleSignOut}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-slate-800/80 hover:bg-red-950/40 hover:text-red-400 border border-slate-700/60 hover:border-red-900/60 rounded-lg text-xs font-semibold transition-all duration-200"
          >
            <LogOut className="h-3.5 w-3.5" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-x-hidden pt-16 lg:pt-0">
        <main className="flex-1 p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
};
