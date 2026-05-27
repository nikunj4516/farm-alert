import type { Language } from "@/contexts/LanguageContext";
import { detectVoiceLanguage } from "./languageDetectionService";

export type VoiceCommandAction = "weather" | "tips" | "news" | "profile" | "about" | "helpline" | "unknown";

export interface VoiceCommandResult {
  action: VoiceCommandAction;
  transcript: string;
  normalizedTranscript: string;
  language: Language;
  confidence: number;
  matchedPhrase?: string;
}

const commandPhrases: Record<Exclude<VoiceCommandAction, "unknown">, string[]> = {
  weather: [
    "હવામાન",
    "મોસમ",
    "વરસાદ",
    "તાપમાન",
    "मौसम",
    "बारिश",
    "तापमान",
    "weather",
    "rain",
    "temperature",
    "forecast",
    "show weather",
    "open weather",
    "havaman",
    "mausam",
    "mosam",
    "varsad",
    "barish",
    "baarish",
    "tapman",
  ],
  tips: [
    "ટિપ્સ",
    "ખેતી",
    "સલાહ",
    "માહિતી",
    "टिप्स",
    "खेती",
    "सलाह",
    "सुझाव",
    "tips",
    "farming",
    "show farming tips",
    "open farming tips",
    "kheti",
    "salah",
    "sujav",
    "sujhav",
    "mahiti",
  ],
  news: [
    "સમાચાર",
    "ખબર",
    "બજાર",
    "ભાવ",
    "समाचार",
    "खबर",
    "बाज़ार",
    "बाजार",
    "भाव",
    "news",
    "open news",
    "show news",
    "agriculture news",
    "samachar",
    "khabar",
    "bajar",
    "bazaar",
    "bhav",
  ],
  profile: [
    "પ્રોફાઇલ",
    "મારું ખાતું",
    "મારી માહિતી",
    "प्रोफाइल",
    "मेरा खाता",
    "मेरी जानकारी",
    "profile",
    "account",
    "maru",
    "mera",
    "khata",
    "jankari",
  ],
  about: [
    "અમારા વિશે",
    "કંપની",
    "સ્થાપક",
    "हमारे बारे",
    "कंपनी",
    "संस्थापक",
    "about",
    "open about",
    "company",
    "founder",
    "અમારા વિષે",
  ],
  helpline: [
    "મદદ",
    "મદદ નંબર",
    "હેલ્પલાઇન",
    "કોલ",
    "फोन",
    "मदद",
    "हेल्पलाइन",
    "कॉल",
    "call",
    "helpline",
    "toll free",
    "kisan",
    "farmer helpline",
    "phone",
    "madad",
    "number",
  ],
};

const normalizeTranscript = (transcript: string) =>
  transcript
    .toLowerCase()
    .replace(/[^\p{L}\p{M}\p{N}\s]/gu, " ")
    .replace(/\s+/g, " ")
    .trim();

const scorePhrase = (command: string, phrase: string) => {
  if (command.includes(phrase)) return phrase.length >= 6 ? 1 : 0.88;

  const compactCommand = command.replace(/\s/g, "");
  const compactPhrase = phrase.replace(/\s/g, "");
  if (compactCommand.includes(compactPhrase)) return 0.78;

  return 0;
};

export const parseVoiceCommand = (transcript: string, fallbackLanguage: Language = "gu"): VoiceCommandResult => {
  const normalizedTranscript = normalizeTranscript(transcript);
  const language = detectVoiceLanguage(normalizedTranscript, fallbackLanguage);
  let best: VoiceCommandResult = {
    action: "unknown",
    transcript,
    normalizedTranscript,
    language,
    confidence: 0,
  };

  (Object.keys(commandPhrases) as Exclude<VoiceCommandAction, "unknown">[]).forEach((action) => {
    commandPhrases[action].forEach((phrase) => {
      const score = scorePhrase(normalizedTranscript, phrase.toLowerCase());
      if (score > best.confidence) {
        best = {
          action,
          transcript,
          normalizedTranscript,
          language,
          confidence: score,
          matchedPhrase: phrase,
        };
      }
    });
  });

  return best.confidence >= 0.55 ? best : { ...best, action: "unknown" };
};
