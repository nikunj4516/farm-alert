import userPhoto from "@/assets/farmer.jpeg";
import { cn } from "@/lib/utils";

interface FarmerEmojiImageProps {
  className?: string;
}

const FarmerEmojiImage = ({ className }: FarmerEmojiImageProps) => (
  <img
    src={userPhoto}
    alt="User Profile"
    className={cn("h-16 w-16 rounded-full object-cover border-2 border-primary/20 shadow-sm", className)}
  />
);

export default FarmerEmojiImage;
