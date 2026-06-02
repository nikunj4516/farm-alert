import { RotateCcw } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface DevResetButtonProps {
  className?: string;
}

const DevResetButton = ({ className = "" }: DevResetButtonProps) => {
  const handleReset = async () => {
    // Confirm action
    if (!confirm("Reset app to initial state? You'll need to log in again.")) {
      return;
    }

    try {
      // Sign out
      await supabase.auth.signOut();

      // Clear all localStorage items related to FarmAlert
      const keysToRemove = [
        "farmalert_language_selected",
        "farmalert_profile_completed",
        "farmalert_onboarding_completed",
        "farmalert_subscribed",
        "farmalert_subscription_active",
        "farmalert_language_selected",
        "farmalert_selected_location",
        "farmalert_subscription_checked_at",
      ];

      keysToRemove.forEach(key => localStorage.removeItem(key));

      // Clear session storage
      sessionStorage.clear();

      // Reload and navigate to splash
      window.location.href = "/";
    } catch (error) {
      console.error("Reset failed:", error);
      alert("Reset failed. Please try again.");
    }
  };

  return (
    <button
      onClick={handleReset}
      title="Reset app to splash screen (Dev only)"
      className={`flex items-center gap-2 px-3 py-2 rounded-lg bg-blue-500 text-white text-sm font-medium hover:bg-blue-600 transition-colors active:scale-95 ${className}`}
    >
      <RotateCcw className="w-4 h-4" />
      Reset App
    </button>
  );
};

export default DevResetButton;
