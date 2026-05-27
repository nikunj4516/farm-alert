import type { Language } from "@/contexts/LanguageContext";

const gujaratiRange = /[\u0A80-\u0AFF]/;
const hindiRange = /[\u0900-\u097F]/;

const romanizedGujarati = [
  "havaman",
  "varsad",
  "samachar",
  "madad",
  "kheti",
  "sujav",
  "mahiti",
  "maru",
  "khata",
];

const romanizedHindi = [
  "mausam",
  "mosam",
  "barish",
  "baarish",
  "madad",
  "kheti",
  "sujhav",
  "salah",
  "mera",
  "khata",
];

export const speechLocales: Record<Language, string> = {
  gu: "gu-IN",
  hi: "hi-IN",
  en: "en-IN",
};

const containsAny = (text: string, terms: string[]) => terms.some((term) => text.includes(term));

export const detectVoiceLanguage = (transcript: string, fallback: Language = "gu"): Language => {
  const normalized = transcript.trim().toLowerCase();

  if (gujaratiRange.test(normalized)) return "gu";
  if (hindiRange.test(normalized)) return "hi";
  if (containsAny(normalized, romanizedGujarati)) return "gu";
  if (containsAny(normalized, romanizedHindi)) return "hi";

  return fallback;
};

export const getSpeechLocale = (language: Language) => speechLocales[language] || speechLocales.en;

