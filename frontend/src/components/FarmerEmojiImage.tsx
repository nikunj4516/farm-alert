import farmerEmoji from "@/assets/farmer-1.png";
import { cn } from "@/lib/utils";

interface FarmerEmojiImageProps {
  className?: string;
}

const FarmerEmojiImage = ({ className }: FarmerEmojiImageProps) => (
  <img
    src={farmerEmoji}
    alt="Indian farmer"
    className={cn("h-16 w-16 rounded-full object-contain", className)}
  />
);

export default FarmerEmojiImage;
