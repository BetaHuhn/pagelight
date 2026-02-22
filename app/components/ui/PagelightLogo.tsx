type PagelightLogoProps = {
  size?: number;
  accent?: string;
};

export default function PagelightLogo({ size = 24, accent = "#c8f04a" }: PagelightLogoProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 100 100"
      width={size}
      height={size}
      style={{ flexShrink: 0 }}
    >
      <rect width="100" height="100" rx="22" fill="#111113" />
      <path
        d="M22 18 L62 18 L82 38 L82 82 Q82 86 78 86 L22 86 Q18 86 18 82 L18 22 Q18 18 22 18 Z"
        fill="#1e1e22"
        stroke="#2a2a2e"
        strokeWidth="1.5"
      />
      <path d="M62 18 L82 38 L62 38 Z" fill={accent} />
      <circle cx="72" cy="28" r="18" fill={accent} opacity="0.08" />
      <rect x="28" y="50" width="36" height="4" rx="2" fill="#3a3a42" />
      <rect x="28" y="60" width="36" height="4" rx="2" fill="#3a3a42" />
      <rect x="28" y="70" width="24" height="4" rx="2" fill="#3a3a42" />
    </svg>
  );
}
