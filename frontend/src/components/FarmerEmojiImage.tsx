import { User } from "lucide-react";
import { cn } from "@/lib/utils";

interface FarmerEmojiImageProps {
  className?: string;
}

const FarmerEmojiImage = ({ className }: FarmerEmojiImageProps) => (
  <div className={cn("bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center rounded-full border-2 border-primary/20 shadow-[0_4px_12px_rgba(22,163,74,0.15)] backdrop-blur-sm", className)}>
    <User className="w-1/2 h-1/2 text-primary drop-shadow-sm" />
  </div>
);

export default FarmerEmojiImage;
