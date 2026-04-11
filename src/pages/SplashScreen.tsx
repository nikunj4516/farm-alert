import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import logo from "@/assets/farmalert-logo.png";
import { useLanguage, Language, languageNames } from "@/contexts/LanguageContext";

const languages: { id: Language; flag: string }[] = [
  { id: "gu", flag: "🇮🇳" },
  { id: "hi", flag: "🇮🇳" },
  { id: "en", flag: "🌐" },
];

const SplashScreen = () => {
  const navigate = useNavigate();
  const { language, setLanguage, t } = useLanguage();
  const [showLangPicker, setShowLangPicker] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setShowLangPicker(true), 1800);
    return () => clearTimeout(timer);
  }, []);

  const handleContinue = () => {
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-6">
      <motion.div
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="text-center space-y-4"
      >
        <motion.img
          src={logo}
          alt="FarmAlert Solutions"
          className="w-44 h-44 mx-auto"
          animate={{ scale: [1, 1.05, 1] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="text-muted-foreground text-farmer-base font-semibold"
        >
          {t("splash_tagline")}
        </motion.p>
      </motion.div>

      <AnimatePresence>
        {showLangPicker && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="mt-10 w-full max-w-[320px] space-y-5"
          >
            <p className="text-center text-farmer-base font-bold text-foreground">
              🌐 {t("choose_language")}
            </p>
            <div className="space-y-2">
              {languages.map((lang) => (
                <button
                  key={lang.id}
                  onClick={() => setLanguage(lang.id)}
                  className={`w-full flex items-center gap-3 py-4 px-5 rounded-lg border-2 text-farmer-base font-bold transition-colors touch-manipulation ${
                    language === lang.id
                      ? "bg-primary text-primary-foreground border-primary"
                      : "bg-card text-foreground border-border"
                  }`}
                >
                  <span className="text-xl">{lang.flag}</span>
                  {languageNames[lang.id]}
                </button>
              ))}
            </div>
            <button
              onClick={handleContinue}
              className="w-full bg-primary text-primary-foreground rounded-lg py-5 text-farmer-lg font-bold active:scale-95 transition-transform touch-manipulation"
            >
              {language === "en" ? "Continue →" : language === "hi" ? "आगे बढ़ें →" : "આગળ વધો →"}
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {!showLangPicker && (
        <div className="flex items-center justify-center gap-2 pt-8">
          <div className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: "0ms" }} />
          <div className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: "150ms" }} />
          <div className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: "300ms" }} />
        </div>
      )}

      <p className="absolute bottom-10 text-muted-foreground text-farmer-sm font-medium">
        {t("splash_footer")}
      </p>
    </div>
  );
};

export default SplashScreen;
