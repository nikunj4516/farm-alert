import type { Language } from "@/contexts/LanguageContext";
import { getSpeechLocale } from "./languageDetectionService";

export type VoiceRecognitionState = "idle" | "listening" | "processing" | "speaking" | "error";

interface BrowserSpeechRecognitionAlternative {
  transcript: string;
  confidence?: number;
}

interface BrowserSpeechRecognitionResult {
  isFinal: boolean;
  0: BrowserSpeechRecognitionAlternative;
}

interface BrowserSpeechRecognitionEvent extends Event {
  resultIndex: number;
  results: {
    length: number;
    [index: number]: BrowserSpeechRecognitionResult;
  };
}

interface BrowserSpeechRecognitionErrorEvent extends Event {
  error: string;
}

interface BrowserSpeechRecognition extends EventTarget {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  maxAlternatives: number;
  onstart: (() => void) | null;
  onend: (() => void) | null;
  onerror: ((event: BrowserSpeechRecognitionErrorEvent) => void) | null;
  onresult: ((event: BrowserSpeechRecognitionEvent) => void) | null;
  start: () => void;
  stop: () => void;
  abort: () => void;
}

type BrowserSpeechRecognitionConstructor = new () => BrowserSpeechRecognition;

interface VoiceRecognitionCallbacks {
  onStart?: () => void;
  onInterim?: (transcript: string) => void;
  onResult?: (transcript: string) => void;
  onError?: (message: string) => void;
  onEnd?: () => void;
}

const getRecognitionConstructor = () => {
  if (typeof window === "undefined") return null;
  const browserWindow = window as typeof window & {
    SpeechRecognition?: BrowserSpeechRecognitionConstructor;
    webkitSpeechRecognition?: BrowserSpeechRecognitionConstructor;
  };
  return browserWindow.SpeechRecognition || browserWindow.webkitSpeechRecognition || null;
};

export const isVoiceRecognitionSupported = () => Boolean(getRecognitionConstructor());

export const getVoiceErrorMessage = (error: string) => {
  if (error === "not-allowed" || error === "service-not-allowed") return "microphone_permission";
  if (error === "no-speech") return "no_speech";
  if (error === "audio-capture") return "microphone_missing";
  if (error === "network") return "network";
  return "unclear";
};

export class VoiceRecognitionService {
  private recognition: BrowserSpeechRecognition | null = null;

  start(language: Language, callbacks: VoiceRecognitionCallbacks, continuous = false) {
    const Recognition = getRecognitionConstructor();

    if (!Recognition) {
      callbacks.onError?.("unsupported");
      return;
    }

    this.stop();
    this.recognition = new Recognition();
    this.recognition.lang = getSpeechLocale(language);
    this.recognition.continuous = continuous;
    this.recognition.interimResults = true;
    this.recognition.maxAlternatives = 1;

    this.recognition.onstart = () => callbacks.onStart?.();
    this.recognition.onend = () => callbacks.onEnd?.();
    this.recognition.onerror = (event) => callbacks.onError?.(getVoiceErrorMessage(event.error));
    this.recognition.onresult = (event) => {
      let finalTranscript = "";
      let interimTranscript = "";

      for (let index = event.resultIndex; index < event.results.length; index += 1) {
        const result = event.results[index];
        const transcript = result?.[0]?.transcript?.trim() || "";
        if (!transcript) continue;
        if (result.isFinal) finalTranscript += transcript;
        else interimTranscript += transcript;
      }

      if (interimTranscript) callbacks.onInterim?.(interimTranscript);
      if (finalTranscript) callbacks.onResult?.(finalTranscript);
    };

    this.recognition.start();
  }

  stop() {
    if (!this.recognition) return;
    this.recognition.stop();
    this.recognition = null;
  }

  abort() {
    if (!this.recognition) return;
    this.recognition.abort();
    this.recognition = null;
  }
}

