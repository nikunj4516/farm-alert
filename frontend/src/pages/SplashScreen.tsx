import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Check, ArrowRight } from "lucide-react";
import logo from "@/assets/farmalert-logo.png";
import { useLanguage, Language, languageNames } from "@/contexts/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";

const indiaFlagUrl = "https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/svg/1f1ee-1f1f3.svg";

const languages: { id: Language; script: string }[] = [
  { id: "gu", script: "ક" },
  { id: "hi", script: "अ" },
  { id: "en", script: "A" },
];

const SplashScreen = () => {
  const navigate = useNavigate();
  const { language, setLanguage, t } = useLanguage();
  const { user, loading } = useAuth();

  useEffect(() => {
    if (!loading && user) {
      navigate("/dashboard", { replace: true });
    }
  }, [user, loading, navigate]);

  const handleContinue = () => {
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-between px-6 py-10">
      <div className="flex-1 flex flex-col items-center justify-center">
        <motion.div
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="text-center space-y-4"
        >
          <motion.div
            className="w-28 h-28 mx-auto bg-primary/10 rounded-3xl flex items-center justify-center"
            animate={{ scale: [1, 1.04, 1] }}
            transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
          >
            <img
              src={logo}
              alt="FarmAlert Solutions"
              className="w-20 h-20"
            />
          </motion.div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">FarmAlert</h1>
            <motion.p
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="text-muted-foreground text-sm font-medium mt-1"
            >
              {t("splash_tagline")}
            </motion.p>
          </div>
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
        className="w-full max-w-[360px] space-y-5"
      >
        <div className="text-center space-y-1">
          <p className="text-base font-semibold text-foreground">
            {t("choose_language")}
          </p>
          <p className="text-sm text-muted-foreground">
            {t("choose_language_subtitle")}
          </p>
        </div>

        <div className="space-y-2.5">
          {languages.map((lang) => {
            const isSelected = language === lang.id;
            return (
              <motion.button
                key={lang.id}
                whileTap={{ scale: 0.97 }}
                onClick={() => setLanguage(lang.id)}
                className={`w-full flex items-center gap-4 py-3.5 px-5 rounded-xl border-2 text-base font-semibold transition-all touch-manipulation ${
                  isSelected
                    ? "bg-primary text-primary-foreground border-primary shadow-elevated"
                    : "bg-card text-foreground border-border shadow-card hover:border-primary/30"
                }`}
              >
                <span className="w-10 h-10 rounded-xl bg-primary-foreground/20 flex items-center justify-center text-lg font-bold shrink-0"
                  style={!isSelected ? { background: 'hsl(var(--muted))', color: 'hsl(var(--muted-foreground))' } : {}}
                >
                  {lang.script}
                </span>
                <span className="flex-1 text-left">{languageNames[lang.id]}</span>
                {isSelected && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="w-7 h-7 rounded-full bg-primary-foreground/20 flex items-center justify-center"
                  >
                    <Check className="w-4 h-4" />
                  </motion.div>
                )}
              </motion.button>
            );
          })}
        </div>

        <motion.button
          whileTap={{ scale: 0.96 }}
          onClick={handleContinue}
          className="w-full flex items-center justify-center gap-2 bg-primary text-primary-foreground rounded-xl py-3.5 text-base font-semibold shadow-md touch-manipulation transition-transform active:scale-[0.98]"
        >
          {language === "en" ? "Continue" : language === "hi" ? "आगे बढ़ें" : "આગળ વધો"}
          <ArrowRight className="w-5 h-5" />
        </motion.button>
      </motion.div>

      <p className="text-muted-foreground text-sm font-medium mt-6 flex items-center gap-2">
        <span>{t("splash_footer")}</span>
        <img src={indiaFlagUrl} alt="India" className="h-4 w-4" />
      </p>
    </div>
  );
};

export default SplashScreen;
