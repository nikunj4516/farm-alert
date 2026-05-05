import { useRef, useState } from "react";
import { Mic, MicOff } from "lucide-react";
import { cn } from "@/lib/utils";
import { Language, useLanguage } from "@/contexts/LanguageContext";

type SpeechRecognitionConstructor = new () => SpeechRecognition;

interface SpeechRecognitionEvent extends Event {
  results: {
    [index: number]: {
      [index: number]: {
        transcript: string;
      };
    };
  };
}

interface SpeechRecognition extends EventTarget {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  maxAlternatives: number;
  onend: (() => void) | null;
  onerror: (() => void) | null;
  onresult: ((event: SpeechRecognitionEvent) => void) | null;
  start: () => void;
  stop: () => void;
}

interface VoiceCommandButtonProps {
  className?: string;
  onCommand: (transcript: string) => void;
}

const speechLanguage: Record<Language, string> = {
  gu: "gu-IN",
  hi: "hi-IN",
  en: "en-IN",
};

const VoiceCommandButton = ({ className, onCommand }: VoiceCommandButtonProps) => {
  const { language } = useLanguage();
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const [listening, setListening] = useState(false);
  const [message, setMessage] = useState("");

  const startListening = () => {
    const SpeechRecognitionApi =
      (window as typeof window & { SpeechRecognition?: SpeechRecognitionConstructor }).SpeechRecognition ||
      (window as typeof window & { webkitSpeechRecognition?: SpeechRecognitionConstructor }).webkitSpeechRecognition;

    if (!SpeechRecognitionApi) {
      setMessage("Voice is not supported in this browser.");
      return;
    }

    const recognition = new SpeechRecognitionApi();
    recognitionRef.current = recognition;
    recognition.lang = speechLanguage[language];
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onresult = (event) => {
      const transcript = event.results[0]?.[0]?.transcript?.trim();
      if (!transcript) return;
      setMessage(transcript);
      onCommand(transcript);
    };

    recognition.onerror = () => {
      setListening(false);
      setMessage("Could not hear clearly. Try again.");
    };

    recognition.onend = () => {
      setListening(false);
    };

    setMessage("");
    setListening(true);
    recognition.start();
  };

  const stopListening = () => {
    recognitionRef.current?.stop();
    setListening(false);
  };

  return (
    <div className="relative">
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
        <div className="absolute right-0 top-12 z-50 max-w-[220px] rounded-xl border border-border bg-card px-3 py-2 text-xs font-semibold text-foreground shadow-elevated">
          {message}
        </div>
      )}
    </div>
  );
};

export default VoiceCommandButton;
