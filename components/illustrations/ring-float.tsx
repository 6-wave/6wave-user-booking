/** A yellow inflatable pool ring seen from above. */
const TONES = {
  yellow: { stops: ["#ffe873", "#ffc31f", "#e58f0a"], rim: "#b96f00" },
  coral: { stops: ["#ff9b7e", "#ff5a3c", "#d33a1c"], rim: "#8f2210" },
} as const;

export function RingFloat({
  className,
  id = "ring",
  shadow = true,
  tone = "yellow",
}: {
  className?: string;
  id?: string;
  tone?: keyof typeof TONES;
  /** Drop shadow on the water. Turn off when it floats over a plain background. */
  shadow?: boolean;
}) {
  return (
    <svg
      viewBox="0 0 132 132"
      className={className}
      aria-hidden="true"
      focusable="false"
    >
      <defs>
        <radialGradient id={`${id}-g`} cx="0.35" cy="0.3" r="0.9">
          <stop offset="0" stopColor={TONES[tone].stops[0]} />
          <stop offset="0.55" stopColor={TONES[tone].stops[1]} />
          <stop offset="1" stopColor={TONES[tone].stops[2]} />
        </radialGradient>
      </defs>
      {/* Its shadow on the water */}
      {shadow ? (
        <ellipse cx="70" cy="76" rx="54" ry="52" fill="#04424f" opacity="0.28" />
      ) : null}
      <path
        fillRule="evenodd"
        fill={`url(#${id}-g)`}
        d="M12 64a52 52 0 1 0 104 0a52 52 0 1 0 -104 0Z M40 64a24 24 0 1 1 48 0a24 24 0 1 1 -48 0Z"
      />
      <circle cx="64" cy="64" r="24" fill="none" stroke={TONES[tone].rim} strokeWidth="2.5" opacity="0.45" />
      <path
        d="M24 44 A44 44 0 0 1 52 22"
        fill="none"
        stroke="#fff"
        strokeWidth="6"
        strokeLinecap="round"
        opacity="0.55"
      />
      <path
        d="M104 80 A44 44 0 0 1 84 104"
        fill="none"
        stroke="#fff"
        strokeWidth="4"
        strokeLinecap="round"
        opacity="0.3"
      />
    </svg>
  );
}
