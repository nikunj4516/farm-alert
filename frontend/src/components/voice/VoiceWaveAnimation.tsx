import { cn } from "@/lib/utils";

interface VoiceWaveAnimationProps {
  active?: boolean;
  className?: string;
}

const VoiceWaveAnimation = ({ active, className }: VoiceWaveAnimationProps) => (
  <div className={cn("flex h-5 items-center justify-center gap-1", className)} aria-hidden="true">
    {[0, 1, 2, 3].map((bar) => (
      <span
        key={bar}
        className={cn(
          "h-2 w-1 rounded-full bg-current opacity-70 transition-all",
          active && "animate-pulse",
          active && bar % 2 === 0 ? "h-5" : active ? "h-3" : "h-2"
        )}
        style={{ animationDelay: `${bar * 90}ms` }}
      />
    ))}
  </div>
);

export default VoiceWaveAnimation;

