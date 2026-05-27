import type { Language } from "@/contexts/LanguageContext";
import type { VoiceCommandAction } from "./voiceCommandEngine";
import { getSpeechLocale } from "./languageDetectionService";
import en from "@/locales/en.json";
import gu from "@/locales/gu.json";
import hi from "@/locales/hi.json";

const localeDictionaries: Record<Language, Record<string, unknown>> = { en, hi, gu };

const getNestedLocaleValue = (language: Language, key: string) =>
  key.split(".").reduce<unknown>((current, segment) => {
    if (!current || typeof current !== "object" || Array.isArray(current)) return undefined;
    return (current as Record<string, unknown>)[segment];
  }, localeDictionaries[language]);

export const getVoiceText = (key: string, language: Language) => {
  const localized = getNestedLocaleValue(language, `voice.${key}`);
  const fallback = getNestedLocaleValue("en", `voice.${key}`);
  return (typeof localized === "string" ? localized : typeof fallback === "string" ? fallback : key) as string;
};

export const isSpeechSynthesisSupported = () => typeof window !== "undefined" && "speechSynthesis" in window;

export const getVoiceResponse = (action: VoiceCommandAction | "unsupported" | "error" | "emergency", language: Language) =>
  getVoiceText(`responses.${action}`, language);

export const stopSpeaking = () => {
  if (!isSpeechSynthesisSupported()) return;
  window.speechSynthesis.cancel();
};

export const speakText = (text: string, language: Language): Promise<void> =>
  new Promise((resolve) => {
    if (!isSpeechSynthesisSupported() || !text) {
      resolve();
      return;
    }

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    const locale = getSpeechLocale(language);
    const voices = window.speechSynthesis.getVoices();
    const matchingVoice = voices.find((voice) => voice.lang.toLowerCase().startsWith(locale.toLowerCase().slice(0, 2)));

    utterance.lang = locale;
    utterance.rate = language === "en" ? 0.95 : 0.9;
    utterance.pitch = 1;
    if (matchingVoice) utterance.voice = matchingVoice;
    utterance.onend = () => resolve();
    utterance.onerror = () => resolve();
    window.speechSynthesis.speak(utterance);
  });
