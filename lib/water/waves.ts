/**
 * The wave field, defined once and used twice: turned into GLSL for the water
 * surface, and evaluated in JS so floating objects ride the same waves.
 */
export const WAVES = [
  { dx: 1.0, dz: 0.6, k: 0.9, speed: 1.1, amp: 0.18 },
  { dx: -0.7, dz: 1.0, k: 1.6, speed: 1.5, amp: 0.1 },
  { dx: 0.3, dz: -1.0, k: 2.7, speed: 2.0, amp: 0.05 },
  { dx: -1.0, dz: -0.3, k: 4.3, speed: 2.6, amp: 0.025 },
].map((w) => {
  const len = Math.hypot(w.dx, w.dz);
  return { ...w, dx: w.dx / len, dz: w.dz / len };
});

/** Tap / hover ripples: expanding rings that fade out. */
export const RIPPLE = {
  count: 8,
  frontSpeed: 2.2,
  waveNumber: 6.0,
  ringDecay: 2.2,
  ageDecay: 0.9,
  maxAge: 4.5,
} as const;

export interface Ripple {
  x: number;
  z: number;
  start: number;
  amp: number;
}

export function baseHeight(x: number, z: number, t: number): number {
  let h = 0;
  for (const w of WAVES) h += w.amp * Math.sin((x * w.dx + z * w.dz) * w.k + t * w.speed);
  return h;
}

export function rippleHeight(x: number, z: number, t: number, ripples: Ripple[]): number {
  let h = 0;
  for (const r of ripples) {
    const age = t - r.start;
    if (r.amp <= 0 || age < 0 || age > RIPPLE.maxAge) continue;
    const d = Math.hypot(x - r.x, z - r.z);
    const front = age * RIPPLE.frontSpeed;
    const env =
      Math.exp(-Math.abs(d - front) * RIPPLE.ringDecay) *
      Math.exp(-age * RIPPLE.ageDecay);
    h += r.amp * env * Math.sin((d - front) * RIPPLE.waveNumber);
  }
  return h;
}

export function height(x: number, z: number, t: number, ripples: Ripple[]): number {
  return baseHeight(x, z, t) + rippleHeight(x, z, t, ripples);
}

const f = (n: number) => n.toFixed(4);

/** GLSL twin of baseHeight/rippleHeight above. */
export const WAVE_GLSL = `
uniform vec4 uRipples[${RIPPLE.count}];

float baseHeight(vec2 p, float t) {
  float h = 0.0;
${WAVES.map(
  (w) =>
    `  h += ${f(w.amp)} * sin(dot(p, vec2(${f(w.dx)}, ${f(w.dz)})) * ${f(w.k)} + t * ${f(w.speed)});`,
).join("\n")}
  return h;
}

float rippleHeight(vec2 p, float t) {
  float h = 0.0;
  for (int i = 0; i < ${RIPPLE.count}; i++) {
    vec4 r = uRipples[i];
    float age = t - r.z;
    if (r.w <= 0.0 || age < 0.0 || age > ${f(RIPPLE.maxAge)}) continue;
    float d = length(p - r.xy);
    float front = age * ${f(RIPPLE.frontSpeed)};
    float env = exp(-abs(d - front) * ${f(RIPPLE.ringDecay)}) * exp(-age * ${f(RIPPLE.ageDecay)});
    h += r.w * env * sin((d - front) * ${f(RIPPLE.waveNumber)});
  }
  return h;
}

float waterHeight(vec2 p, float t) {
  return baseHeight(p, t) + rippleHeight(p, t);
}
`;
