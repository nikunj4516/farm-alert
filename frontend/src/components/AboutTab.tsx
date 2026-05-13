import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowRight, CloudLightning, Globe, ShieldCheck, Smartphone, TrendingUp, Users, Eye, Target } from "lucide-react";
import logo from "@/assets/farmalert-logo.png";
import founderImg from "@/assets/user-dp.jpg";
import { useLanguage } from "@/contexts/LanguageContext";

const AboutTab = () => {
  const { t } = useLanguage();

  const features = [
    { icon: <img src="https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/master/Emojis/Travel%20and%20places/Cloud%20with%20Lightning.png" alt="weather" className="w-6 h-6 drop-shadow-sm" />, title: t("feature_weather") },
    { icon: <img src="https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/master/Emojis/Objects/Mobile%20Phone.png" alt="mobile" className="w-6 h-6 drop-shadow-sm" />, title: t("feature_interface") },
    { icon: <img src="https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/master/Emojis/Objects/Chart%20Increasing.png" alt="growth" className="w-6 h-6 drop-shadow-sm" />, title: t("feature_affordable") },
    { icon: <img src="https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/master/Emojis/Travel%20and%20places/Globe%20Showing%20Asia-Australia.png" alt="globe" className="w-6 h-6 drop-shadow-sm" />, title: t("feature_innovation") },
    { icon: <img src="https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/master/Emojis/Objects/Shield.png" alt="security" className="w-6 h-6 drop-shadow-sm" />, title: t("feature_future") },
    { icon: <img src="https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/master/Emojis/People/People%20Hugging.png" alt="support" className="w-6 h-6 drop-shadow-sm" />, title: t("feature_support") },
  ];

  const fadeInUp = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } }
  };

  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  return (
    <div className="space-y-16 pb-12">
      
      {/* Hero Section */}
      <motion.section 
        initial="hidden"
        animate="visible"
        variants={fadeInUp}
        className="text-center space-y-6 pt-4"
      >
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#DCFCE7] text-[#16A34A] text-xs font-bold mb-2">
          <img src="https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/master/Emojis/Travel%20and%20places/Globe%20Showing%20Asia-Australia.png" alt="globe" className="w-4 h-4 drop-shadow-sm" />
          <span>{t("about_tagline")}</span>
        </div>
        <h1 className="text-2xl font-bold leading-tight tracking-tight">
          {t("about_title_1")} <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#16A34A] to-emerald-400">{t("about_title_2")}</span>
        </h1>
        <p className="text-muted-foreground text-sm sm:text-base leading-relaxed max-w-md mx-auto">
          {t("about_desc")}
        </p>
        <div className="flex flex-col sm:flex-row gap-3 pt-2">
          <Link 
            to="/subscription"
            className="w-full flex items-center justify-center gap-2 bg-[#16A34A] hover:bg-[#15803d] text-white py-3.5 px-6 rounded-xl font-semibold shadow-md transition-all active:scale-[0.98]"
          >
            {t("about_explore")}
            <ArrowRight className="w-4 h-4" />
          </Link>
          <button 
            className="w-full flex items-center justify-center gap-2 bg-card hover:bg-muted text-foreground border border-border py-3.5 px-6 rounded-xl font-semibold shadow-sm transition-all active:scale-[0.98]"
          >
            {t("about_join")}
          </button>
        </div>
      </motion.section>

      {/* About Section */}
      <motion.section 
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-50px" }}
        variants={fadeInUp}
        className="bg-card rounded-2xl p-6 sm:p-8 shadow-sm border border-border"
      >
        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2 text-foreground">
          <span className="w-1.5 h-6 bg-[#16A34A] rounded-full inline-block"></span>
          {t("about_who_we_are")}
        </h2>
        <div className="space-y-4 text-muted-foreground text-sm sm:text-base leading-relaxed">
          <p>{t("about_who_desc_1")}</p>
          <p>{t("about_who_desc_2")}</p>
          <p>{t("about_who_desc_3")}</p>
        </div>
      </motion.section>

      {/* Vision & Mission Cards */}
      <motion.section 
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-50px" }}
        variants={staggerContainer}
        className="grid gap-4"
      >
        <motion.div 
          variants={fadeInUp}
          whileHover={{ y: -4 }}
          className="bg-gradient-to-br from-[#16A34A] to-emerald-600 rounded-2xl p-6 sm:p-8 text-white shadow-md"
        >
          <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
            <img src="https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/master/Emojis/Smilies/Eye.png" alt="vision" className="w-7 h-7 drop-shadow-sm" /> {t("about_vision_title")}
          </h3>
          <p className="text-emerald-50 text-sm sm:text-base leading-relaxed">
            {t("about_vision_desc")}
          </p>
        </motion.div>
        
        <motion.div 
          variants={fadeInUp}
          whileHover={{ y: -4 }}
          className="bg-card rounded-2xl p-6 sm:p-8 border border-[#DCFCE7] shadow-sm"
        >
          <h3 className="text-lg font-semibold mb-3 text-[#16A34A] flex items-center gap-2">
            <img src="https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/master/Emojis/Activities/Direct%20Hit.png" alt="mission" className="w-7 h-7 drop-shadow-sm" /> {t("about_mission_title")}
          </h3>
          <p className="text-muted-foreground text-sm sm:text-base leading-relaxed">
            {t("about_mission_desc")}
          </p>
        </motion.div>
      </motion.section>

      {/* Why Choose Us */}
      <motion.section 
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-50px" }}
        variants={staggerContainer}
        className="space-y-6"
      >
        <motion.h2 variants={fadeInUp} className="text-lg font-semibold text-center text-foreground">
          {t("about_why_choose")}
        </motion.h2>
        <div className="grid grid-cols-2 gap-3 sm:gap-4">
          {features.map((feature, i) => (
            <motion.div 
              key={i}
              variants={fadeInUp}
              className="bg-card p-4 rounded-2xl border border-border shadow-sm flex flex-col items-center text-center gap-3 hover:shadow-md transition-shadow"
            >
              <div className="w-10 h-10 rounded-full bg-[#DCFCE7] text-[#16A34A] flex items-center justify-center">
                {feature.icon}
              </div>
              <span className="text-sm font-semibold leading-tight text-foreground">
                {feature.title}
              </span>
            </motion.div>
          ))}
        </div>
      </motion.section>

      {/* Founder Section */}
      <motion.section 
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-50px" }}
        variants={fadeInUp}
        className="bg-card rounded-2xl p-6 sm:p-8 shadow-sm border border-border relative overflow-hidden"
      >
        <div className="absolute top-0 right-0 w-32 h-32 bg-[#DCFCE7] rounded-full blur-3xl -mr-10 -mt-10 opacity-60 pointer-events-none"></div>
        
        <h2 className="text-center text-sm font-semibold text-[#16A34A] uppercase tracking-wider mb-6 relative z-10">
          {t("about_founder_title")}
        </h2>
        
        <div className="flex flex-col items-center text-center space-y-4 relative z-10">
          <div className="relative">
            <div className="w-32 h-32 rounded-full p-1 bg-gradient-to-br from-[#16A34A] to-emerald-300 shadow-xl overflow-hidden">
              <img 
                src={founderImg} 
                alt={t("founder_name")} 
                className="w-full h-full object-cover rounded-full border-2 border-background"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src = "https://ui-avatars.com/api/?name=Nikunj+Bariya&background=16A34A&color=fff&size=200";
                }}
              />
            </div>
            <a 
              href="https://linkedin.com" 
              target="_blank" 
              rel="noreferrer"
              className="absolute bottom-1 right-1 bg-[#0A66C2] text-white p-2 rounded-full border-2 border-background shadow-md hover:scale-110 transition-transform"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/></svg>
            </a>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold text-foreground">{t("founder_name")}</h3>
            <p className="text-[#16A34A] text-sm font-medium mt-0.5">{t("founder_role")}</p>
          </div>
          
          <p className="text-muted-foreground text-sm sm:text-base leading-relaxed max-w-sm mx-auto">
            {t("founder_desc")}
          </p>
          
          <div className="pt-2">
            <div className="relative inline-block">
              <span className="absolute -top-3 -left-3 text-4xl text-[#DCFCE7] font-serif">"</span>
              <p className="text-foreground font-medium italic relative z-10 px-4">
                {t("founder_quote")}
              </p>
              <span className="absolute -bottom-4 -right-3 text-4xl text-[#DCFCE7] font-serif">"</span>
            </div>
          </div>
        </div>
      </motion.section>

      {/* Footer Section */}
      <footer className="pt-8 pb-4">
        <div className="flex flex-col items-center text-center space-y-4">
          <div className="flex items-center gap-2 opacity-80">
            <img src={logo} alt="FarmAlert" className="w-6 h-6 rounded-md grayscale" />
            <span className="font-bold text-muted-foreground">FarmAlert Solutions Pvt. Ltd.</span>
          </div>
          <p className="text-xs text-muted-foreground max-w-xs">
            {t("footer_text")}
          </p>
          <div className="pt-2 text-xs font-medium text-muted-foreground/60">
            &copy; {new Date().getFullYear()} {t("footer_rights")}
          </div>
        </div>
      </footer>
    </div>
  );
};

export default AboutTab;
