import { useEffect, useRef, useState } from "react";
import { Mic, MicOff } from "lucide-react";
import { cn } from "@/lib/utils";
import { Language, useLanguage } from "@/contexts/LanguageContext";

type SpeechRecognitionConstructor = new () => SpeechRecognition;

interface SpeechRecognitionResultItem {
  transcript: string;
  confidence: number;
}

interface SpeechRecognitionResult {
  [index: number]: SpeechRecognitionResultItem;
  isFinal: boolean;
  length: number;
}

interface SpeechRecognitionResultList {
  [index: number]: SpeechRecognitionResult;
  length: number;
}

interface SpeechRecognitionEvent extends Event {
  results: SpeechRecognitionResultList;
  resultIndex: number;
}

interface SpeechRecognitionErrorEvent extends Event {
  error: string;
}

interface SpeechRecognition extends EventTarget {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  maxAlternatives: number;
  onend: (() => void) | null;
  onerror: ((event: SpeechRecognitionErrorEvent) => void) | null;
  onresult: ((event: SpeechRecognitionEvent) => void) | null;
  start: () => void;
  stop: () => void;
  abort: () => void;
}

interface VoiceCommandButtonProps {
  className?: string;
  helpText?: string;
  lang?: string;
  onCommand: (transcript: string) => void;
}

const speechLanguage: Record<Language, string> = {
  gu: "gu-IN",
  hi: "hi-IN",
  en: "en-IN",
};

const voiceErrorMessages: Record<Language, Record<string, string>> = {
  en: {
    "not-allowed": "Please allow microphone permission.",
    "service-not-allowed": "Please allow microphone permission.",
    "no-speech": "No voice detected. Tap mic and speak clearly.",
    "audio-capture": "Microphone not found. Check your mic.",
    network: "Voice needs internet in this browser. Try again.",
    default: "Could not hear clearly. Try again.",
  },
  hi: {
    "not-allowed": "कृपया माइक्रोफ़ोन की अनुमति दें।",
    "service-not-allowed": "कृपया माइक्रोफ़ोन की अनुमति दें।",
    "no-speech": "आवाज़ नहीं मिली। माइक दबाएँ और स्पष्ट बोलें।",
    "audio-capture": "माइक्रोफ़ोन नहीं मिला। माइक जाँचें।",
    network: "इस ब्राउज़र में इंटरनेट चाहिए। फिर कोशिश करें।",
    default: "सुनाई नहीं दिया। फिर कोशिश करें।",
  },
  gu: {
    "not-allowed": "કૃપા કરી માઇક્રોફોન પરવાનગી આપો.",
    "service-not-allowed": "કૃપા કરી માઇક્રોફોન પરવાનગી આપો.",
    "no-speech": "અવાજ ન મળ્યો. માઇક દબાવો અને સ્પષ્ટ બોલો.",
    "audio-capture": "માઇક્રોફોન ન મળ્યો. માઇક તપાસો.",
    network: "આ બ્રાઉઝરમાં ઇન્ટરનેટ જોઈએ. ફરી ટ્રાય કરો.",
    default: "સ્પષ્ટ સંભળાયું નહીં. ફરી ટ્રાય કરો.",
  },
};

const listeningText: Record<Language, string> = {
  en: "Listening…",
  hi: "सुन रहा हूँ…",
  gu: "સાંભળી રહ્યો છું…",
};

const notSupportedText: Record<Language, string> = {
  en: "Voice not supported in this browser.",
  hi: "इस ब्राउज़र में वॉइस उपलब्ध नहीं।",
  gu: "આ બ્રાઉઝરમાં વૉઇસ ઉપલબ્ધ નથી.",
};

// Auto-stop after 8 s of silence; dismiss result message after 3 s
const LISTEN_TIMEOUT_MS = 8000;
const MESSAGE_DISMISS_MS = 3000;

const VoiceCommandButton = ({ className, helpText, lang, onCommand }: VoiceCommandButtonProps) => {
  const { language } = useLanguage();
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const listenTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const dismissTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [listening, setListening] = useState(false);
  const [message, setMessage] = useState("");
  const [isInterim, setIsInterim] = useState(false);

  // Stop recognition and clear timers on unmount
  useEffect(() => {
    return () => {
      recognitionRef.current?.abort();
      if (listenTimerRef.current) clearTimeout(listenTimerRef.current);
      if (dismissTimerRef.current) clearTimeout(dismissTimerRef.current);
    };
  }, []);

  const clearDismissTimer = () => {
    if (dismissTimerRef.current) {
      clearTimeout(dismissTimerRef.current);
      dismissTimerRef.current = null;
    }
  };

  const scheduleMessageDismiss = () => {
    clearDismissTimer();
    dismissTimerRef.current = setTimeout(() => {
      setMessage("");
      setIsInterim(false);
    }, MESSAGE_DISMISS_MS);
  };

  const getErrorMessage = (error: string) => {
    const msgs = voiceErrorMessages[language];
    return msgs[error] ?? msgs.default;
  };

  const startListening = () => {
    const SpeechRecognitionApi =
      (window as typeof window & { SpeechRecognition?: SpeechRecognitionConstructor }).SpeechRecognition ||
      (window as typeof window & { webkitSpeechRecognition?: SpeechRecognitionConstructor }).webkitSpeechRecognition;

    if (!SpeechRecognitionApi) {
      setMessage(notSupportedText[language]);
      scheduleMessageDismiss();
      return;
    }

    clearDismissTimer();

    const recognition = new SpeechRecognitionApi();
    recognitionRef.current = recognition;
    recognition.lang = lang || speechLanguage[language] || "en-IN";
    recognition.continuous = false;
    recognition.interimResults = true;
    // 3 alternatives let the result handler fall back to the next if the first is empty
    recognition.maxAlternatives = 3;

    recognition.onresult = (event) => {
      // Reset the auto-stop timer whenever results arrive
      if (listenTimerRef.current) clearTimeout(listenTimerRef.current);

      let interimTranscript = "";
      let finalTranscript = "";

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        // Pick the first non-empty alternative
        let best = "";
        for (let j = 0; j < result.length; j++) {
          if (result[j].transcript?.trim()) {
            best = result[j].transcript.trim();
            break;
          }
        }
        if (result.isFinal) {
          finalTranscript += best;
        } else {
          interimTranscript += best;
        }
      }

      if (finalTranscript) {
        setIsInterim(false);
        setMessage(finalTranscript);
        onCommand(finalTranscript);
        scheduleMessageDismiss();
      } else if (interimTranscript) {
        setIsInterim(true);
        setMessage(interimTranscript);
      }
    };

    recognition.onerror = (event) => {
      if (listenTimerRef.current) clearTimeout(listenTimerRef.current);
      setListening(false);
      setIsInterim(false);
      setMessage(getErrorMessage(event.error));
      scheduleMessageDismiss();
    };

    recognition.onend = () => {
      if (listenTimerRef.current) clearTimeout(listenTimerRef.current);
      setListening(false);
      setIsInterim(false);
    };

    setMessage(helpText || listeningText[language]);
    setIsInterim(false);
    setListening(true);

    // Auto-stop if no final result within the timeout
    listenTimerRef.current = setTimeout(() => {
      recognition.stop();
    }, LISTEN_TIMEOUT_MS);

    recognition.start();
  };

  const stopListening = () => {
    if (listenTimerRef.current) clearTimeout(listenTimerRef.current);
    recognitionRef.current?.stop();
    setListening(false);
  };

  return (
    <div className="relative">
      {/* Outer ping ring visible while recording */}
      {listening && (
        <span className="absolute inset-0 rounded-full animate-ping bg-destructive/40 pointer-events-none" />
      )}
      <button
        type="button"
        onClick={listening ? stopListening : startListening}
        aria-label={listening ? "Stop voice command" : "Start voice command"}
        className={cn(
          "w-10 h-10 rounded-full flex items-center justify-center touch-manipulation transition-all",
          listening
            ? "bg-destructive text-destructive-foreground shadow-elevated animate-pulse"
            : "bg-accent/10 text-accent active:scale-90",
          className
        )}
      >
        {listening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
      </button>
      {message && (
        <div
          aria-live="polite"
          className={cn(
            "absolute right-0 top-12 z-50 max-w-[220px] rounded-xl border border-border bg-card px-3 py-2 text-xs font-semibold shadow-elevated",
            isInterim ? "text-muted-foreground italic" : "text-foreground"
          )}
        >
          {message}
        </div>
      )}
    </div>
  );
};

export default VoiceCommandButton;
