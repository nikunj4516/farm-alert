import { cn } from "@/lib/utils";

interface IndianFarmerMarkProps {
  className?: string;
}

const IndianFarmerMark = ({ className }: IndianFarmerMarkProps) => (
  <svg
    viewBox="0 0 180 180"
    role="img"
    aria-label="Indian farmer"
    className={cn("h-16 w-16 drop-shadow-sm", className)}
  >
    <defs>
      <clipPath id="farmerBadgeClip">
        <circle cx="90" cy="90" r="78" />
      </clipPath>
      <linearGradient id="badgeSky" x1="40" y1="12" x2="138" y2="150">
        <stop offset="0" stopColor="#b9f3ff" />
        <stop offset="0.45" stopColor="#e8f7bd" />
        <stop offset="1" stopColor="#78c86a" />
      </linearGradient>
      <linearGradient id="badgeTurban" x1="48" y1="18" x2="120" y2="75">
        <stop offset="0" stopColor="#ff7b72" />
        <stop offset="0.55" stopColor="#d83c35" />
        <stop offset="1" stopColor="#8f1e1d" />
      </linearGradient>
      <linearGradient id="badgeSkin" x1="62" y1="58" x2="112" y2="122">
        <stop offset="0" stopColor="#ffd0a1" />
        <stop offset="1" stopColor="#ca7743" />
      </linearGradient>
      <linearGradient id="badgeKurta" x1="50" y1="112" x2="128" y2="176">
        <stop offset="0" stopColor="#ffffff" />
        <stop offset="1" stopColor="#e8f0ee" />
      </linearGradient>
    </defs>

    <circle cx="90" cy="90" r="83" fill="#91e2d1" />
    <circle cx="90" cy="90" r="78" fill="url(#badgeSky)" />

    <g clipPath="url(#farmerBadgeClip)">
      <circle cx="44" cy="80" r="18" fill="#ffd75c" opacity="0.9" />
      <path d="M0 104c28-18 54-18 82 0 30-18 64-17 98 2v76H0z" fill="#73bf56" />
      <path d="M0 122c44-20 84-20 126 0" fill="none" stroke="#368943" strokeWidth="5" />
      <path d="M12 142c34-25 64-28 92-4" fill="none" stroke="#4aa64f" strokeWidth="5" />
      <path d="M70 176c8-34 17-55 26-67" fill="none" stroke="#2e7d3b" strokeWidth="4" />
      <path d="M98 176c-4-29-2-52 8-70" fill="none" stroke="#2e7d3b" strokeWidth="4" />
      <path d="M127 176c-12-28-18-51-16-69" fill="none" stroke="#2e7d3b" strokeWidth="4" />

      <path d="M123 84h31v25h-31z" fill="#eec28b" stroke="#7b5531" strokeWidth="3" />
      <path d="M118 84l21-17 21 17z" fill="#b67a36" stroke="#7b5531" strokeWidth="3" />
      <path d="M134 96h8v13h-8z" fill="#7b5531" />
      <path d="M146 63c8-10 19-10 27 0" fill="none" stroke="#3e8d4d" strokeWidth="4" strokeLinecap="round" />
      <path d="M159 63c0-10 4-17 12-22" fill="none" stroke="#3e8d4d" strokeWidth="4" strokeLinecap="round" />

      <path
        d="M48 166c5-32 21-51 42-51s37 19 42 51"
        fill="url(#badgeKurta)"
        stroke="#325066"
        strokeWidth="4"
      />
      <path d="M80 117v49M99 117v49" stroke="#9fb1b9" strokeWidth="3" />
      <path d="M82 132h15M83 145h13" stroke="#9fb1b9" strokeWidth="3" strokeLinecap="round" />

      <path
        d="M60 64c1-22 13-35 31-35s30 14 31 36l-3 25c-3 19-14 31-29 31S64 109 61 90z"
        fill="url(#badgeSkin)"
        stroke="#5d2e22"
        strokeWidth="4"
      />
      <path d="M63 77c-7-2-11 2-10 9 1 8 6 12 12 12M119 77c7-2 11 2 10 9-1 8-6 12-12 12" fill="#dc8a58" stroke="#5d2e22" strokeWidth="3" />

      <path
        d="M50 58c7-28 31-43 62-31 14 5 23 15 26 29-18 0-31 5-46 5-18 0-29 5-42-3z"
        fill="url(#badgeTurban)"
        stroke="#661a18"
        strokeWidth="4"
        strokeLinejoin="round"
      />
      <path d="M61 32c17-15 43-17 64 0-15 2-29 7-43 7-8 0-15-3-21-7z" fill="#ff8f83" stroke="#661a18" strokeWidth="4" />
      <path d="M58 56c19-13 40-20 66-23M72 62c16-9 35-15 55-18M70 36c10 6 18 13 24 24" fill="none" stroke="#ffc0b8" strokeWidth="3" strokeLinecap="round" opacity="0.75" />
      <path d="M78 34l2 2M93 31l2 2M108 34l2 2M88 47l2 2M105 45l2 2" stroke="#ffc0b8" strokeWidth="3" strokeLinecap="round" />

      <path d="M70 78c5-4 11-4 16 0M96 78c5-4 11-4 16 0" fill="none" stroke="#3b2018" strokeWidth="4" strokeLinecap="round" />
      <circle cx="79" cy="86" r="3.4" fill="#24120d" />
      <circle cx="104" cy="86" r="3.4" fill="#24120d" />
      <path d="M88 91c-2 5-3 8 0 10 2 2 5 1 7-1" fill="none" stroke="#8c4b31" strokeWidth="3" strokeLinecap="round" />
      <path d="M70 104c7-8 16-8 22-1 7-7 17-7 24 1" fill="none" stroke="#2b1710" strokeWidth="7" strokeLinecap="round" />
      <path d="M78 113c8 7 21 7 29 0" fill="none" stroke="#ffffff" strokeWidth="5" strokeLinecap="round" />

      <path d="M44 99l34-18" stroke="#7d4c25" strokeWidth="7" strokeLinecap="round" />
      <path d="M39 89l31-15 8 10-28 20z" fill="#6d8792" stroke="#37454c" strokeWidth="3" strokeLinejoin="round" />
      <path d="M70 82l7-4" stroke="#e7eef2" strokeWidth="4" strokeLinecap="round" />
      <circle cx="58" cy="131" r="11" fill="#d9834d" stroke="#5d2e22" strokeWidth="4" />

      <g stroke="#246e2c" strokeLinecap="round" strokeLinejoin="round">
        <path d="M118 154c-11-25-8-45 6-61" strokeWidth="5" />
        <path d="M125 154c-6-27 0-47 17-62" strokeWidth="5" />
        <path d="M132 154c0-25 8-43 27-54" strokeWidth="5" />
        <path d="M126 105c9-1 16 1 21 7M122 117c10-1 17 2 22 9M119 129c10 0 17 4 21 12M142 104c9 1 15 5 19 13M137 118c10 2 16 7 19 15" strokeWidth="3" />
      </g>
      <circle cx="119" cy="139" r="11" fill="#d9834d" stroke="#5d2e22" strokeWidth="4" />
    </g>

    <circle cx="90" cy="90" r="78" fill="none" stroke="#287d67" strokeWidth="6" />
  </svg>
);

export default IndianFarmerMark;
