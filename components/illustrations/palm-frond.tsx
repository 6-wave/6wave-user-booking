// A palm frond built from a curved spine with leaflets fanning off both sides.
// Generated once at module load, so it's just static paths at runtime.
const P0 = [0, 0];
const P1 = [170, -120];
const P2 = [340, 40];
const COUNT = 22;

const quad = (t: number) => [
  (1 - t) ** 2 * P0[0] + 2 * (1 - t) * t * P1[0] + t ** 2 * P2[0],
  (1 - t) ** 2 * P0[1] + 2 * (1 - t) * t * P1[1] + t ** 2 * P2[1],
];
const tangent = (t: number) => [
  2 * (1 - t) * (P1[0] - P0[0]) + 2 * t * (P2[0] - P1[0]),
  2 * (1 - t) * (P1[1] - P0[1]) + 2 * t * (P2[1] - P1[1]),
];

const leafPath = (len: number, w: number) =>
  `M0 0 C${(len * 0.3).toFixed(1)} ${-w} ${(len * 0.75).toFixed(1)} ${(-w * 0.8).toFixed(1)} ${len.toFixed(1)} 0 C${(len * 0.75).toFixed(1)} ${(w * 0.5).toFixed(1)} ${(len * 0.3).toFixed(1)} ${(w * 0.7).toFixed(1)} 0 0 Z`;

const LEAFLETS = Array.from({ length: COUNT }, (_, i) => {
  const t = 0.06 + (i / (COUNT - 1)) * 0.9;
  const [x, y] = quad(t);
  const [dx, dy] = tangent(t);
  const angle = (Math.atan2(dy, dx) * 180) / Math.PI;
  const len = 150 * (1 - t * 0.62);
  const w = 17 * (1 - t * 0.35);
  return [-1, 1].map((side) => ({
    key: `${i}${side}`,
    side,
    d: leafPath(len, w),
    transform: `translate(${x.toFixed(1)} ${y.toFixed(1)}) rotate(${(angle + side * (62 - t * 18)).toFixed(1)})`,
  }));
}).flat();

const TIP = (() => {
  const [x, y] = quad(1);
  const [dx, dy] = tangent(1);
  return {
    d: leafPath(60, 12),
    transform: `translate(${x.toFixed(1)} ${y.toFixed(1)}) rotate(${((Math.atan2(dy, dx) * 180) / Math.PI).toFixed(1)})`,
  };
})();

export function PalmFrond({
  id,
  className,
  flip = false,
}: {
  /** Keeps the gradient ids unique when several fronds share a page. */
  id: string;
  className?: string;
  flip?: boolean;
}) {
  return (
    <svg
      viewBox="-10 -190 420 320"
      className={className}
      style={flip ? { transform: "scaleX(-1)" } : undefined}
      aria-hidden="true"
      focusable="false"
    >
      <defs>
        <linearGradient id={`${id}-a`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#0b4a30" />
          <stop offset="0.6" stopColor="#1b8a52" />
          <stop offset="1" stopColor="#4cbf72" />
        </linearGradient>
        <linearGradient id={`${id}-b`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#0e5a3a" />
          <stop offset="0.6" stopColor="#25a05f" />
          <stop offset="1" stopColor="#7bd68a" />
        </linearGradient>
      </defs>
      <path
        d={`M${P0[0]} ${P0[1]} Q${P1[0]} ${P1[1]} ${P2[0]} ${P2[1]}`}
        fill="none"
        stroke="#0b4a30"
        strokeWidth="6"
        strokeLinecap="round"
      />
      {LEAFLETS.map((leaf) => (
        <path
          key={leaf.key}
          d={leaf.d}
          transform={leaf.transform}
          fill={`url(#${id}-${leaf.side === 1 ? "a" : "b"})`}
        />
      ))}
      <path d={TIP.d} transform={TIP.transform} fill={`url(#${id}-b)`} />
    </svg>
  );
}
