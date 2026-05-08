import { useEffect, useRef, useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";

interface WakeWordListenerProps {
  onWakeWord: () => void;
}

const WakeWordListener = ({ onWakeWord }: WakeWordListenerProps) => {
  const { language } = useLanguage();
  const recognitionRef = useRef<any>(null);
  const [isSupported, setIsSupported] = useState(true);

  useEffect(() => {
    const SpeechRecognitionApi =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognitionApi) {
      setIsSupported(false);
      return;
    }

    const recognition = new SpeechRecognitionApi();
    recognitionRef.current = recognition;
    
    // Use continuous to keep listening
    recognition.continuous = true;
    recognition.interimResults = false;
    recognition.lang = language === "en" ? "en-IN" : language === "gu" ? "gu-IN" : "hi-IN";

    recognition.onresult = (event: any) => {
      const last = event.results.length - 1;
      const transcript = event.results[last][0].transcript.toLowerCase();
      
      // Check for wake word variants
      if (
        transcript.includes("hey farm") || 
        transcript.includes("hey farmalert") || 
        transcript.includes("farm alert") ||
        transcript.includes("hello farmalert")
      ) {
        onWakeWord();
      }
    };

    recognition.onerror = (event: any) => {
      // Ignore common errors in continuous listening like no-speech
      if (event.error !== "no-speech") {
        console.warn("Wake word listener error:", event.error);
      }
    };

    recognition.onend = () => {
      // Auto-restart if it stops, a common workaround for Web Speech API continuous mode
      try {
        recognition.start();
      } catch (e) {
        console.warn("Could not restart wake word listener");
      }
    };

    try {
      recognition.start();
    } catch (e) {
      console.warn("Could not start wake word listener. User interaction might be required.");
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.onend = null; // Prevent restart loop
        recognitionRef.current.stop();
      }
    };
  }, [language, onWakeWord]);

  if (!isSupported) return null;

  return null; // This is a background component, no UI
};

export default WakeWordListener;
