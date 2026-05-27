import { useEffect, useRef } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import type { WeatherReport } from "@/services/weatherService";
import { getVoiceResponse, speakText } from "@/services/textToSpeechService";

interface EmergencyVoiceAlertProps {
  weather?: WeatherReport | null;
  enabled?: boolean;
}

const EmergencyVoiceAlert = ({ weather, enabled = true }: EmergencyVoiceAlertProps) => {
  const { language } = useLanguage();
  const lastAlertKey = useRef<string | null>(null);

  useEffect(() => {
    if (!enabled || !weather?.dangerAssessment || weather.dangerAssessment.status !== "RED") return;

    const alertKey = `${weather.fetched_at || weather.location || "weather"}-${weather.dangerAssessment.dangerScore}`;
    if (lastAlertKey.current === alertKey) return;

    lastAlertKey.current = alertKey;
    playEmergencyTone();
    void speakText(getVoiceResponse("emergency", language), language);
  }, [enabled, language, weather]);

  return null;
};

export default EmergencyVoiceAlert;

const playEmergencyTone = () => {
  if (typeof window === "undefined") return;

  const AudioContextConstructor = window.AudioContext || (window as typeof window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!AudioContextConstructor) return;

  const context = new AudioContextConstructor();
  const oscillator = context.createOscillator();
  const gain = context.createGain();

  oscillator.type = "sine";
  oscillator.frequency.setValueAtTime(720, context.currentTime);
  oscillator.frequency.setValueAtTime(540, context.currentTime + 0.16);
  gain.gain.setValueAtTime(0.0001, context.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.08, context.currentTime + 0.03);
  gain.gain.exponentialRampToValueAtTime(0.0001, context.currentTime + 0.45);

  oscillator.connect(gain);
  gain.connect(context.destination);
  oscillator.start();
  oscillator.stop(context.currentTime + 0.48);
  oscillator.onended = () => void context.close();
};

