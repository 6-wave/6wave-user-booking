export const CLUB_VERTEX = /* glsl */ `
attribute vec2 aPos;
varying vec2 vUv;
void main() {
  vUv = aPos * 0.5 + 0.5;
  gl_Position = vec4(aPos, 0.0, 1.0);
}
`;

/**
 * A laser-lit club, drawn per pixel: sweeping beams through haze, a rotating
 * mirror-tile disco ball, rising embers on three depths, drifting light spots
 * and tap shockwaves. Colours stay in red / ember / warm white on purpose:
 * red and blue light overlapping would mix into purple.
 */
export const CLUB_FRAGMENT = /* glsl */ `
precision highp float;
#ifdef LITE
  #define BEAMS 4
  #define EMBER_LAYERS 2
  #define SPARKS 10
#else
  #define BEAMS 7
  #define EMBER_LAYERS 3
  #define SPARKS 22
#endif
#define PI 3.14159265

uniform vec2 uRes;
uniform float uTime;
uniform float uScroll;
uniform vec2 uPointer;
uniform vec4 uTaps[4]; // x, y (aspect-corrected), start time, strength
varying vec2 vUv;

float hash21(vec2 p) {
  p = fract(p * vec2(123.34, 456.21));
  p += dot(p, p + 45.32);
  return fract(p.x * p.y);
}

float vnoise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  f = f * f * (3.0 - 2.0 * f);
  return mix(
    mix(hash21(i), hash21(i + vec2(1.0, 0.0)), f.x),
    mix(hash21(i + vec2(0.0, 1.0)), hash21(i + vec2(1.0, 1.0)), f.x),
    f.y
  );
}

float haze(vec2 p, float t) {
  float n = vnoise(p * 2.2 + vec2(t * 0.04, t * 0.02));
#ifndef LITE
  n = n * 0.65 + vnoise(p * 4.6 - vec2(t * 0.03, 0.0)) * 0.35;
#endif
  return 0.55 + 0.9 * n;
}

vec3 beams(vec2 p, float t, float aspect) {
  vec3 acc = vec3(0.0);
  for (int i = 0; i < BEAMS; i++) {
    float fi = float(i);
    float h = hash21(vec2(fi, 3.7));
    float x0 = (fi / float(BEAMS - 1) * 2.0 - 1.0) * aspect * 0.95;
    vec2 o = vec2(x0, 1.2);
    float theta = sin(t * (0.25 + h * 0.35) + fi * 2.1) * (0.55 + 0.25 * h)
                - x0 * 0.25 + uPointer.x * 0.15;
    vec2 dir = vec2(sin(theta), -cos(theta));
    vec2 v = p - o;
    float along = dot(v, dir);
    float perp = v.x * dir.y - v.y * dir.x;
    float w = 0.014 + max(along, 0.0) * 0.085;
    float core = exp(-(perp * perp) / (w * w));
    float fade = smoothstep(0.0, 0.2, along) * exp(-max(along, 0.0) * 0.75);
    float k = mod(fi, 3.0);
    vec3 c = k < 1.0 ? vec3(1.0, 0.10, 0.08)
           : k < 2.0 ? vec3(1.0, 0.42, 0.10)
                     : vec3(1.0, 0.82, 0.62);
    acc += c * core * fade * (0.8 + 0.3 * h);
  }
  return acc;
}

vec3 discoBall(vec2 p, float t, float beat, float aspect) {
  vec2 c = vec2(aspect * 0.62, 0.52);
  float R = 0.13;
  vec2 d = p - c;
  float r = length(d);
  vec3 col = vec3(0.0);

  // Thread it hangs from
  col += vec3(0.5, 0.3, 0.25) * (1.0 - smoothstep(0.0, 0.004, abs(d.x))) * step(0.0, d.y) * 0.5;
  // Halo
  col += vec3(1.0, 0.25, 0.12) * (0.05 / (r * r + 0.03)) * 0.16 * beat;

  if (r < R) {
    vec2 q = d / R;
    vec3 n = vec3(q, sqrt(max(1.0 - dot(q, q), 0.0)));
    float a = t * 0.5;
    vec3 nr = vec3(n.x * cos(a) + n.z * sin(a), n.y, -n.x * sin(a) + n.z * cos(a));
    vec2 g = vec2(atan(nr.x, nr.z) * (10.0 / PI), asin(clamp(nr.y, -1.0, 1.0)) * (9.0 / PI) * 1.6);
    vec2 cell = floor(g);
    vec2 f = fract(g);
    float line = smoothstep(0.0, 0.1, min(min(f.x, 1.0 - f.x), min(f.y, 1.0 - f.y)));
    float hh = hash21(cell);
    float light = clamp(dot(n, normalize(vec3(-0.5, 0.6, 0.7))), 0.0, 1.0);
    vec3 tile = vec3(0.10, 0.075, 0.07) + mix(vec3(1.0, 0.30, 0.12), vec3(1.0, 0.88, 0.75), hh) * pow(hh, 3.0) * (0.35 + 0.65 * light);
    float sparkle = step(0.94, hash21(cell + floor(t * 3.0))) * 1.6;
    col = tile * line + vec3(1.0, 0.9, 0.8) * sparkle * line;
    col *= 0.55 + 0.45 * n.z;
  }
  return col;
}

float emberLayer(vec2 p, float scale, float speed, float seed, float t) {
  vec2 q = p * scale;
  q.y -= t * speed * scale;
  vec2 id = floor(q);
  vec2 f = fract(q) - 0.5;
  float h = hash21(id + seed);
  vec2 off = (vec2(hash21(id + 1.7 + seed), hash21(id + 3.1 + seed)) - 0.5) * 0.6;
  off.x += sin(t * 1.3 + h * 6.28) * 0.15;
  float size = mix(0.03, 0.09, h * h);
  float flicker = 0.6 + 0.4 * sin(t * (3.0 + h * 5.0) + h * 20.0);
  return step(0.55, h) * flicker * (1.0 - smoothstep(0.0, size, length(f - off)));
}

void main() {
  float aspect = uRes.x / uRes.y;
  vec2 p = (vUv - 0.5) * vec2(aspect, 1.0) * 2.0;
  float t = uTime;
  // ~128 bpm, kept gentle: a swell in brightness, never a strobe.
  float beat = 0.84 + 0.16 * pow(0.5 + 0.5 * sin(t * 13.4), 3.0);

  vec3 col = vec3(0.028, 0.016, 0.016);
  col += vec3(0.80, 0.14, 0.05) * (1.0 - smoothstep(-1.05, -0.05, p.y)) * 0.8;
  col += vec3(1.0, 0.38, 0.10) * exp(-abs(p.y + 0.62) * 5.0) * 0.28;
  col += vec3(0.16, 0.02, 0.02) * smoothstep(0.2, 1.1, p.y) * 0.5;

  // Beams: mid depth
  vec2 pB = p + vec2(uPointer.x * 0.03, -uScroll * 0.12);
  col += beams(pB, t, aspect) * haze(pB, t) * beat;

  // Light spots drifting around the room (disco-ball reflections)
  for (int i = 0; i < SPARKS; i++) {
    float fi = float(i);
    float h1 = hash21(vec2(fi, 1.3));
    float h2 = hash21(vec2(fi, 8.1));
    vec2 sp = vec2(sin(t * 0.13 * (1.0 + h1) + fi * 1.7) * aspect * 0.95,
                   cos(t * 0.11 * (1.0 + h2) + fi * 2.3) * 0.7 - 0.05);
    vec2 d = p - sp;
    float g = 0.0035 / (dot(d, d) + 0.0009) * (0.5 + 0.5 * sin(t * 2.0 + fi));
    vec3 c = h1 < 0.5 ? vec3(1.0, 0.18, 0.10) : vec3(1.0, 0.8, 0.6);
    col += c * g * 0.05;
  }

  // Disco ball: nearer than the beams
  col += discoBall(p + vec2(uPointer.x * 0.05, -uScroll * 0.24), t, beat, aspect);

  // Embers rising from the floor, three depths (two on phones)
  vec3 emberColor = vec3(1.0, 0.36, 0.06);
  float floorMask = 1.0 - smoothstep(-0.7, 1.0, p.y);
  for (int l = 0; l < EMBER_LAYERS; l++) {
    float fl = float(l);
    vec2 pe = p + vec2(uPointer.x * (0.04 + fl * 0.03), -uScroll * (0.3 + fl * 0.25));
    float e = emberLayer(pe, 6.0 + fl * 5.0, 0.10 + fl * 0.06, fl * 7.3, t);
    col += mix(emberColor, vec3(1.0, 0.75, 0.35), fl * 0.3) * e * floorMask * (0.9 + fl * 0.3);
  }

  // Taps: a bass-hit shockwave
  for (int i = 0; i < 4; i++) {
    vec4 T = uTaps[i];
    float age = t - T.z;
    if (T.w > 0.0 && age >= 0.0 && age < 2.5) {
      float dd = length(p - T.xy);
      float ring = exp(-abs(dd - age * 0.9) * 14.0) * exp(-age * 1.6);
      float core = exp(-dd * 7.0) * exp(-age * 6.0);
      col += vec3(1.0, 0.22, 0.10) * (ring * 1.4 + core * 1.2) * T.w;
    }
  }

  // Vignette, soft highlight roll-off, a little grain
  col *= 1.0 - 0.32 * dot(p * 0.55, p * 0.55);
  col = 1.0 - exp(-col * 1.35);
  col += (hash21(gl_FragCoord.xy + fract(t) * 100.0) - 0.5) * 0.02;
  gl_FragColor = vec4(col, 1.0);
}
`;
