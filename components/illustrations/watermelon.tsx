/** A watermelon wedge: coral flesh, seeds, green rind. */
export function Watermelon({ className }: { className?: string }) {
  const seeds = [
    [30, 16, -20],
    [50, 24, 0],
    [70, 16, 20],
    [40, 34, -10],
    [60, 34, 10],
  ];
  return (
    <svg
      viewBox="0 0 100 56"
      className={className}
      aria-hidden="true"
      focusable="false"
    >
      <path d="M2 4 A48 48 0 0 0 98 4 Z" fill="#1f8a4c" />
      <path d="M6 4 A44 44 0 0 0 94 4 Z" fill="#c9f27a" />
      <path d="M9 4 A41 41 0 0 0 91 4 Z" fill="#ff5a3c" />
      {seeds.map(([x, y, r]) => (
        <ellipse
          key={`${x}-${y}`}
          cx={x + 0}
          cy={y}
          rx="2.2"
          ry="3.6"
          fill="#3a1a12"
          transform={`rotate(${r} ${x} ${y})`}
        />
      ))}
      <path d="M14 8 H86" stroke="#fff" strokeWidth="2" opacity="0.25" strokeLinecap="round" />
    </svg>
  );
}
