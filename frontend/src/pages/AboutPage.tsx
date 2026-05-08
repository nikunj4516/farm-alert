import { motion } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, ArrowRight, CloudLightning, Globe, ShieldCheck, Smartphone, TrendingUp, Users } from "lucide-react";
import logo from "@/assets/farmalert-logo.png";
import founderImg from "@/assets/farmer.jpeg";

const AboutPage = () => {
  const navigate = useNavigate();

  const features = [
    { icon: <CloudLightning className="w-5 h-5" />, title: "Smart Weather Alerts" },
    { icon: <Smartphone className="w-5 h-5" />, title: "Farmer-Friendly Interface" },
    { icon: <TrendingUp className="w-5 h-5" />, title: "Affordable Digital Services" },
    { icon: <Globe className="w-5 h-5" />, title: "Agriculture-Focused Innovation" },
    { icon: <ShieldCheck className="w-5 h-5" />, title: "Future-Ready Technology" },
    { icon: <Users className="w-5 h-5" />, title: "Trusted Support System" },
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
    <div className="min-h-screen bg-[#F9FAFB] text-[#111827] font-sans selection:bg-[#DCFCE7] selection:text-[#16A34A] overflow-x-hidden">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 bg-white/80 backdrop-blur-md border-b border-gray-100 z-50">
        <div className="max-w-[600px] mx-auto px-4 h-16 flex items-center justify-between">
          <button 
            onClick={() => navigate(-1)} 
            className="p-2 -ml-2 rounded-full hover:bg-gray-100 transition-colors touch-manipulation"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2">
            <img src={logo} alt="FarmAlert" className="w-7 h-7 rounded-md" />
            <span className="font-extrabold text-lg text-primary">FarmAlert</span>
          </div>
          <div className="w-9" /> {/* Spacer for centering */}
        </div>
      </nav>

      <main className="max-w-[600px] mx-auto pt-24 pb-20 px-5 space-y-16">
        
        {/* Hero Section */}
        <motion.section 
          initial="hidden"
          animate="visible"
          variants={fadeInUp}
          className="text-center space-y-6 pt-4"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#DCFCE7] text-[#16A34A] text-xs font-bold mb-2">
            <Globe className="w-3.5 h-3.5" />
            <span>Digital Agriculture</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold leading-tight tracking-tight">
            Empowering Farmers Through <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#16A34A] to-emerald-400">Smart Technology</span>
          </h1>
          <p className="text-gray-600 text-[15px] leading-relaxed">
            Farmalert Solutions Pvt. Ltd. is building modern digital solutions for agriculture — helping farmers access weather insights, smart farming tools, quality products, and future-ready services in one platform.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <Link 
              to="/subscription"
              className="w-full flex items-center justify-center gap-2 bg-[#16A34A] hover:bg-[#15803d] text-white py-3.5 px-6 rounded-2xl font-semibold shadow-[0_8px_16px_-6px_rgba(22,163,74,0.4)] transition-all active:scale-[0.98]"
            >
              Explore Services
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link 
              to="/dashboard"
              className="w-full flex items-center justify-center gap-2 bg-white hover:bg-gray-50 text-[#111827] border border-gray-200 py-3.5 px-6 rounded-2xl font-semibold shadow-sm transition-all active:scale-[0.98]"
            >
              Join Farmers Network
            </Link>
          </div>
        </motion.section>

        {/* About Section */}
        <motion.section 
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
          variants={fadeInUp}
          className="bg-white rounded-3xl p-6 sm:p-8 shadow-[0_2px_20px_-8px_rgba(0,0,0,0.05)] border border-gray-100"
        >
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <span className="w-1.5 h-6 bg-[#16A34A] rounded-full inline-block"></span>
            Who We Are
          </h2>
          <div className="space-y-4 text-gray-600 text-[15px] leading-relaxed">
            <p>
              Farmalert Solutions Pvt. Ltd. is an agriculture-focused technology startup created with a vision to simplify farming using digital innovation.
            </p>
            <p>
              We aim to bridge the gap between farmers and technology by providing practical, affordable, and easy-to-use solutions that support daily agricultural needs.
            </p>
            <p>
              From weather alerts and crop updates to agriculture services and future e-commerce support, our mission is to create a connected farming ecosystem for every farmer.
            </p>
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
            className="bg-gradient-to-br from-[#16A34A] to-emerald-600 rounded-3xl p-6 sm:p-8 text-white shadow-[0_10px_30px_-10px_rgba(22,163,74,0.4)]"
          >
            <h3 className="text-xl font-bold mb-3 flex items-center gap-2">
              <span className="text-2xl">👁️</span> Our Vision
            </h3>
            <p className="text-emerald-50 text-[15px] leading-relaxed">
              To build a smarter and digitally connected agriculture ecosystem that empowers every farmer with accessible technology.
            </p>
          </motion.div>
          
          <motion.div 
            variants={fadeInUp}
            whileHover={{ y: -4 }}
            className="bg-white rounded-3xl p-6 sm:p-8 border border-[#DCFCE7] shadow-[0_4px_20px_-10px_rgba(22,163,74,0.15)]"
          >
            <h3 className="text-xl font-bold mb-3 text-[#16A34A] flex items-center gap-2">
              <span className="text-2xl">🎯</span> Our Mission
            </h3>
            <p className="text-gray-600 text-[15px] leading-relaxed">
              To provide trusted agriculture solutions through innovation, simplicity, and farmer-focused digital services.
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
          <motion.h2 variants={fadeInUp} className="text-2xl font-bold text-center">
            Why Choose Us
          </motion.h2>
          <div className="grid grid-cols-2 gap-3 sm:gap-4">
            {features.map((feature, i) => (
              <motion.div 
                key={i}
                variants={fadeInUp}
                className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex flex-col items-center text-center gap-3 hover:shadow-md transition-shadow"
              >
                <div className="w-10 h-10 rounded-full bg-[#DCFCE7] text-[#16A34A] flex items-center justify-center">
                  {feature.icon}
                </div>
                <span className="text-[13px] font-semibold leading-tight text-gray-800">
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
          className="bg-white rounded-3xl p-6 sm:p-8 shadow-[0_2px_20px_-8px_rgba(0,0,0,0.05)] border border-gray-100 relative overflow-hidden"
        >
          {/* Decorative background element */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-[#DCFCE7] rounded-full blur-3xl -mr-10 -mt-10 opacity-60"></div>
          
          <h2 className="text-center text-sm font-bold text-[#16A34A] uppercase tracking-wider mb-6">
            Meet The Founder
          </h2>
          
          <div className="flex flex-col items-center text-center space-y-4 relative z-10">
            <div className="relative">
              <div className="w-28 h-28 rounded-full p-1 bg-gradient-to-br from-[#16A34A] to-emerald-300 shadow-lg">
                <img 
                  src={founderImg} 
                  alt="Nikunj Bariya" 
                  className="w-full h-full object-cover rounded-full border-2 border-white"
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
                className="absolute bottom-0 right-0 bg-[#0A66C2] text-white p-1.5 rounded-full border-2 border-white shadow-sm hover:scale-110 transition-transform"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/></svg>
              </a>
            </div>
            
            <div>
              <h3 className="text-xl font-bold text-gray-900">Nikunj Bariya</h3>
              <p className="text-[#16A34A] text-sm font-medium mt-0.5">Co-Founder & Mobile Application Developer</p>
            </div>
            
            <p className="text-gray-600 text-[14px] leading-relaxed max-w-sm mx-auto">
              Passionate about technology and innovation, Nikunj Bariya started Farmalert with a vision to modernize agriculture through digital solutions that are practical, scalable, and accessible for farmers across India.
            </p>
            
            <div className="pt-2">
              <div className="relative inline-block">
                <span className="absolute -top-3 -left-3 text-4xl text-[#DCFCE7] font-serif">"</span>
                <p className="text-gray-800 font-medium italic relative z-10 px-4">
                  Technology should support the people who feed the world.
                </p>
                <span className="absolute -bottom-4 -right-3 text-4xl text-[#DCFCE7] font-serif">"</span>
              </div>
            </div>
          </div>
        </motion.section>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 py-8 px-5">
        <div className="max-w-[600px] mx-auto flex flex-col items-center text-center space-y-4">
          <div className="flex items-center gap-2 opacity-80">
            <img src={logo} alt="FarmAlert" className="w-6 h-6 rounded-md grayscale" />
            <span className="font-bold text-gray-600">FarmAlert Solutions Pvt. Ltd.</span>
          </div>
          <p className="text-xs text-gray-500 max-w-xs">
            Empowering agriculture through smart, accessible, and trusted digital technology.
          </p>
          <div className="pt-2 text-xs font-medium text-gray-400">
            &copy; {new Date().getFullYear()} FarmAlert. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
};

export default AboutPage;
