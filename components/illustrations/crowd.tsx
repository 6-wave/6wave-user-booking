// A crowd in silhouette, like the flyer: two rows of heads and shoulders, some
// with arms in the air. Generated once from a fixed seed, so it's just static
// paths at runtime and identical on server and client.
const W = 1200;
const H = 240;

function mulberry32(seed: number) {
  let a = seed;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

interface Person {
  key: string;
  body: string;
  head: { cx: number; cy: number; r: number };
  arm?: { d: string; width: number; hand: { cx: number; cy: number; r: number } };
}

function row(seed: number, step: number, headR: number, headY: number, armChance: number): Person[] {
  const rand = mulberry32(seed);
  const people: Person[] = [];
  for (let x = -30, i = 0; x < W + 40; x += step * (0.8 + rand() * 0.5), i++) {
    const r = headR * (0.85 + rand() * 0.3);
    const cy = headY + rand() * 16;
    const body = `M${(x - r * 2).toFixed(1)} ${H} L${(x - r * 2).toFixed(1)} ${(cy + r * 2.4).toFixed(1)} Q${(x - r * 1.9).toFixed(1)} ${(cy + r * 1.15).toFixed(1)} ${x.toFixed(1)} ${(cy + r * 1.2).toFixed(1)} Q${(x + r * 1.9).toFixed(1)} ${(cy + r * 1.15).toFixed(1)} ${(x + r * 2).toFixed(1)} ${(cy + r * 2.4).toFixed(1)} L${(x + r * 2).toFixed(1)} ${H} Z`;
    const person: Person = { key: `${seed}-${i}`, body, head: { cx: x, cy, r } };
    if (rand() < armChance) {
      const side = rand() < 0.5 ? -1 : 1;
      const sx = x + side * r * 1.6;
      const sy = cy + r * 1.9;
      const ex = x + side * r * (2.3 + rand() * 1.2);
      const ey = cy - r * (1.4 + rand() * 1.6);
      person.arm = {
        d: `M${sx.toFixed(1)} ${sy.toFixed(1)} Q${(sx + side * r * 1.1).toFixed(1)} ${((sy + ey) / 2).toFixed(1)} ${ex.toFixed(1)} ${ey.toFixed(1)}`,
        width: r * 0.85,
        hand: { cx: ex, cy: ey - r * 0.35, r: r * 0.55 },
      };
    }
    people.push(person);
  }
  return people;
}

const BACK = row(11, 44, 11, 112, 0.22);
const FRONT = row(23, 68, 17, 150, 0.3);

function People({ people, className }: { people: Person[]; className: string }) {
  return (
    <g className={className}>
      {people.map((p) => (
        <g key={p.key}>
          {p.arm ? (
            <>
              <path d={p.arm.d} fill="none" stroke="currentColor" strokeWidth={p.arm.width} strokeLinecap="round" />
              <circle {...p.arm.hand} />
            </>
          ) : null}
          <circle {...p.head} />
          <path d={p.body} />
        </g>
      ))}
    </g>
  );
}

/**
 * Silhouette crowd. The front row is the page background colour, so the hero
 * melts into the page below it; the back row is a touch lighter for depth.
 */
export function Crowd({ className }: { className?: string }) {
  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      preserveAspectRatio="xMidYMax slice"
      className={className}
      aria-hidden="true"
      focusable="false"
    >
      <People people={BACK} className="fill-[oklch(0.17_0.025_27)] text-[oklch(0.17_0.025_27)]" />
      <People people={FRONT} className="fill-background text-background" />
    </svg>
  );
}
