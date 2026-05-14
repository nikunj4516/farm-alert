import { cn } from "@/lib/utils";
import farmerAvatar from "@/assets/farmer-1.png";

interface FarmerEmojiImageProps {
  className?: string;
}

const FarmerEmojiImage = ({ className }: FarmerEmojiImageProps) => (
  <div className={cn("bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center rounded-full border-2 border-primary/20 shadow-[0_4px_12px_rgba(22,163,74,0.15)] backdrop-blur-sm overflow-hidden", className)}>
    <img 
      src={farmerAvatar} 
      alt="farmer" 
      className="w-[90%] h-[90%] drop-shadow-md object-cover rounded-full" 
    />
  </div>
);

export default FarmerEmojiImage;
