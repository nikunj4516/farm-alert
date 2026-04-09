import { Sprout, Droplets, Bug, Wheat } from "lucide-react";

interface FarmTip {
  icon: React.ReactNode;
  title: string;
  description: string;
}

const tips: FarmTip[] = [
  {
    icon: <Droplets className="w-8 h-8 text-primary-foreground" />,
    title: "💧 પાણી આપો",
    description: "સવારે 6 વાગ્યે પાણી આપો, બપોરે નહીં",
  },
  {
    icon: <Bug className="w-8 h-8 text-primary-foreground" />,
    title: "🐛 જીવાત ચેક",
    description: "પાંદડા નીચે જુઓ, સફેદ ડાઘ હોય તો દવા છાંટો",
  },
  {
    icon: <Wheat className="w-8 h-8 text-primary-foreground" />,
    title: "🌾 લણણી",
    description: "ઘઉં પીળા થાય ત્યારે 2 દિવસમાં કાપો",
  },
  {
    icon: <Sprout className="w-8 h-8 text-primary-foreground" />,
    title: "🌱 ખાતર",
    description: "વાવણી પહેલાં છાણિયું ખાતર નાખો",
  },
];

const FarmingTips = () => {
  return (
    <div className="space-y-3">
      <h2 className="text-farmer-lg font-bold text-foreground">
        🌿 ખેતી ટિપ્સ
      </h2>
      <div className="grid grid-cols-2 gap-3">
        {tips.map((tip, index) => (
          <button
            key={index}
            className="flex flex-col items-start bg-primary text-primary-foreground rounded-lg p-4 min-h-[120px] active:scale-95 transition-transform touch-manipulation"
          >
            <div className="mb-2">{tip.icon}</div>
            <span className="text-farmer-sm font-bold text-left">{tip.title}</span>
            <span className="text-sm text-primary-foreground/80 text-left mt-1">
              {tip.description}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default FarmingTips;
