import { useMemo, useRef, useState } from "react";
import { Loader2, Mic, MicOff, Volume2 } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Language } from "@/contexts/LanguageContext";
import { detectVoiceLanguage } from "@/services/languageDetectionService";
import { getVoiceResponse, getVoiceText, speakText, stopSpeaking } from "@/services/textToSpeechService";
import { parseVoiceCommand, type VoiceCommandResult } from "@/services/voiceCommandEngine";
import { isVoiceRecognitionSupported, VoiceRecognitionService, type VoiceRecognitionState } from "@/services/voiceRecognitionService";
import VoiceStatusIndicator from "./VoiceStatusIndicator";
import VoiceWaveAnimation from "./VoiceWaveAnimation";

interface VoiceAssistantButtonProps {
  language: Language;
  className?: string;
  onCommand: (command: VoiceCommandResult) => void;
}

const VoiceAssistantButton = ({ language, className, onCommand }: VoiceAssistantButtonProps) => {
  const service = useMemo(() => new VoiceRecognitionService(), []);
  const timeoutRef = useRef<number | null>(null);
  const [voiceState, setVoiceState] = useState<VoiceRecognitionState>("idle");
  const [transcript, setTranscript] = useState("");
  const [detectedLanguage, setDetectedLanguage] = useState<Language>(language);

  const clearStatusLater = (delay = 1900) => {
    if (timeoutRef.current) window.clearTimeout(timeoutRef.current);
    timeoutRef.current = window.setTimeout(() => {
      setVoiceState("idle");
      setTranscript("");
    }, 2600);
  };

  const handleStop = () => {
    service.stop();
    stopSpeaking();
    setVoiceState("idle");
  };

  const handleStart = () => {
    if (!isVoiceRecognitionSupported()) {
      setDetectedLanguage(language);
      setTranscript(getVoiceText("unsupportedShort", language));
      setVoiceState("error");
      void speakText(getVoiceResponse("unsupported", language), language);
      clearStatusLater();
      return;
    }

    setTranscript("");
    setDetectedLanguage(language);
    service.start(language, {
      onStart: () => setVoiceState("listening"),
      onInterim: (text) => {
        setTranscript(text);
        setDetectedLanguage(detectVoiceLanguage(text, language));
      },
      onResult: (text) => {
        const command = parseVoiceCommand(text, language);
        setDetectedLanguage(command.language);
        setTranscript(text);
        setVoiceState("processing");
        onCommand(command);

        window.setTimeout(() => {
          setVoiceState("speaking");
          void speakText(getVoiceResponse(command.action, command.language), command.language).then(clearStatusLater);
        }, 250);
      },
      onError: (errorKey) => {
        setVoiceState("error");
        setTranscript(getVoiceText(`errors.${errorKey}`, language));
        if (errorKey === "microphone_permission" || errorKey === "unsupported") {
          void speakText(getVoiceText(`errors.${errorKey}`, language), language);
        }
        clearStatusLater(errorKey === "no_speech" ? 1400 : 2200);
      },
      onEnd: () => {
        setVoiceState((current) => (current === "listening" ? "idle" : current));
      },
    });
  };

  const isActive = voiceState === "listening" || voiceState === "processing" || voiceState === "speaking";

  return (
    <div className="relative">
      <button
        id="voice-assistant-btn"
        type="button"
        onClick={isActive ? handleStop : handleStart}
        aria-label={isActive ? "Stop voice assistant" : "Start voice assistant"}
        className={cn(
          "relative flex h-10 w-10 touch-manipulation items-center justify-center rounded-full transition-all active:scale-90",
          isActive
            ? "bg-primary-foreground text-primary shadow-elevated ring-4 ring-primary-foreground/20"
            : "bg-accent/10 text-accent",
          voiceState === "error" && "bg-destructive text-destructive-foreground",
          className
        )}
      >
        {voiceState === "processing" ? (
          <Loader2 className="h-5 w-5 animate-spin" />
        ) : voiceState === "speaking" ? (
          <Volume2 className="h-5 w-5" />
        ) : voiceState === "listening" ? (
          <MicOff className="h-5 w-5" />
        ) : (
          <Mic className="h-5 w-5" />
        )}
        {isActive && <span className="absolute inset-0 rounded-full border border-current opacity-30 animate-ping" />}
      </button>
      {isActive && (
        <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 text-primary-foreground">
          <VoiceWaveAnimation active />
        </div>
      )}
      {(voiceState !== "idle" || transcript) && (
        <VoiceStatusIndicator language={detectedLanguage} state={voiceState} transcript={transcript} />
      )}
    </div>
  );
};

export default VoiceAssistantButton;
