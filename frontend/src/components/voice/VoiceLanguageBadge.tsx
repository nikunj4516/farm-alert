import type { Language } from "@/contexts/LanguageContext";

const voiceLanguageLabels: Record<Language, string> = {
  gu: "ગુજરાતી",
  hi: "हिन्दी",
  en: "English",
};

interface VoiceLanguageBadgeProps {
  language: Language;
}

const VoiceLanguageBadge = ({ language }: VoiceLanguageBadgeProps) => (
  <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-black text-primary">
    {voiceLanguageLabels[language]}
  </span>
);

export default VoiceLanguageBadge;

