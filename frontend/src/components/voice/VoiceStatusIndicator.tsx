import type { Language } from "@/contexts/LanguageContext";
import type { VoiceRecognitionState } from "@/services/voiceRecognitionService";
import { getVoiceText } from "@/services/textToSpeechService";
import VoiceLanguageBadge from "./VoiceLanguageBadge";

interface VoiceStatusIndicatorProps {
  language: Language;
  state: VoiceRecognitionState;
  transcript?: string;
}

const VoiceStatusIndicator = ({ language, state, transcript }: VoiceStatusIndicatorProps) => (
  <div className="absolute right-0 top-11 z-50 w-[210px] rounded-xl border border-border bg-card/95 p-2.5 text-left shadow-elevated backdrop-blur">
    <div className="mb-1.5 flex items-center justify-between gap-2">
      <p className="text-xs font-black text-foreground">{getVoiceText(`status.${state}`, language)}</p>
      <VoiceLanguageBadge language={language} />
    </div>
    {transcript && <p className="line-clamp-2 text-[11px] font-semibold leading-snug text-muted-foreground">{transcript}</p>}
  </div>
);

export default VoiceStatusIndicator;
