const COLORS = ["#ff5a3c", "#ffffff", "#ffd23a", "#ffffff", "#19b3b8", "#ffffff"];
const R = 40;
const C = 60;

const wedge = (i: number) => {
  const a0 = ((i * 60 - 90) * Math.PI) / 180;
  const a1 = (((i + 1) * 60 - 90) * Math.PI) / 180;
  const p = (a: number) => `${(C + R * Math.cos(a)).toFixed(2)} ${(C + R * Math.sin(a)).toFixed(2)}`;
  return `M${C} ${C} L${p(a0)} A${R} ${R} 0 0 1 ${p(a1)} Z`;
};

/** A beach ball seen from above: the panels turn slowly, the highlight stays put. */
export function BeachBall({
  className,
  shadow = true,
}: {
  className?: string;
  shadow?: boolean;
}) {
  return (
    <svg
      viewBox="0 0 120 120"
      className={className}
      aria-hidden="true"
      focusable="false"
    >
      {shadow ? (
        <ellipse cx="66" cy="68" rx="42" ry="40" fill="#04424f" opacity="0.28" />
      ) : null}
      <g className="svg-center animate-spin-med">
        {COLORS.map((color, i) => (
          <path key={i} d={wedge(i)} fill={color} />
        ))}
        <circle cx={C} cy={C} r="5" fill="#fff" />
      </g>
      <circle cx={C} cy={C} r={R} fill="none" stroke="#04424f" strokeOpacity="0.18" strokeWidth="2" />
      <ellipse cx="48" cy="44" rx="13" ry="8" fill="#fff" opacity="0.4" transform="rotate(-30 48 44)" />
    </svg>
  );
}
