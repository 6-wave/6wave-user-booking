import { WAVE_GLSL } from "./waves";

/**
 * Shared look of the water, used by both renderers so the lite phone version
 * matches the desktop scene. Expects CAUSTIC_ITER to be #defined.
 */
export const SHADE_GLSL = /* glsl */ `
// Tileable water caustics (after Dave Hoskins): the bright web of light on a pool floor.
float caustic(vec2 uv, float t) {
  vec2 p = mod(uv * 6.28318, 6.28318) - 250.0;
  vec2 i = p;
  float c = 1.0;
  float inten = 0.005;
  for (int n = 0; n < CAUSTIC_ITER; n++) {
    float tt = t * (1.0 - (3.5 / float(n + 1)));
    i = p + vec2(cos(tt - i.x) + sin(tt + i.y), sin(tt - i.y) + cos(tt + i.x));
    c += 1.0 / length(vec2(p.x / (sin(i.x + tt) / inten), p.y / (cos(i.y + tt) / inten)));
  }
  c /= float(CAUSTIC_ITER);
  c = 1.17 - pow(c, 1.4);
  return pow(abs(c), 8.0);
}

vec3 shadeWater(vec3 V, vec3 Nmesh, vec2 w, float h, float dist, float t, vec3 sunDir) {
  // Fine ripples on top of the surface normal so the glints sparkle.
  vec3 N = normalize(Nmesh + vec3(
    sin(w.x * 5.0 + t * 1.7) * 0.05 + sin(w.y * 7.3 - t * 2.1) * 0.035,
    0.0,
    cos(w.y * 5.6 + t * 1.4) * 0.05 + cos(w.x * 8.1 + t * 1.9) * 0.035
  ));

  float ndv = max(dot(N, V), 0.0);
  float fres = pow(1.0 - ndv, 3.0);

  vec3 deep    = vec3(0.020, 0.290, 0.360);
  vec3 shallow = vec3(0.100, 0.640, 0.650);
  vec3 lightW  = vec3(0.560, 0.930, 0.880);

  float bed = 0.5 + 0.5 * sin(w.x * 0.35 + w.y * 0.22 + t * 0.2);
  vec3 col = mix(deep, shallow, clamp(0.55 + h * 1.4 + bed * 0.14, 0.0, 1.0));

  col += lightW * caustic(w * 0.1, t * 0.55) * 0.55;

  // Sky reflection at glancing angles.
  col = mix(col, vec3(0.78, 0.95, 0.93), fres * 0.5);

  // Sun glints.
  vec3 R = reflect(-sunDir, N);
  float rv = max(dot(R, V), 0.0);
  col += vec3(1.0, 0.96, 0.78) * pow(rv, 140.0) * 1.6;
  col += vec3(1.0, 0.90, 0.60) * pow(rv, 18.0) * 0.12;

  // Foam on high crests and ripple fronts.
  col = mix(col, vec3(0.95, 1.0, 0.98), smoothstep(0.2, 0.34, h) * 0.35);

  // Fade into the deep teal with distance.
  return mix(col, deep * 0.9, smoothstep(22.0, 46.0, dist) * 0.6);
}
`;

/** Full tier (three.js): displaced mesh. */
export const WATER_VERTEX = /* glsl */ `
uniform float uTime;
varying vec3 vWorld;
varying vec3 vNormal;
varying float vHeight;

${WAVE_GLSL}

void main() {
  vec3 pos = position;
  float h = waterHeight(pos.xz, uTime);
  float e = 0.08;
  float hx = waterHeight(pos.xz + vec2(e, 0.0), uTime);
  float hz = waterHeight(pos.xz + vec2(0.0, e), uTime);
  vNormal = normalize(vec3(h - hx, e, h - hz));
  pos.y += h;
  vHeight = h;
  vWorld = (modelMatrix * vec4(pos, 1.0)).xyz;
  gl_Position = projectionMatrix * viewMatrix * vec4(vWorld, 1.0);
}
`;

export const WATER_FRAGMENT = /* glsl */ `
#define CAUSTIC_ITER 4
uniform float uTime;
uniform vec3 uSunDir;
varying vec3 vWorld;
varying vec3 vNormal;
varying float vHeight;

${SHADE_GLSL}

void main() {
  vec3 V = normalize(cameraPosition - vWorld);
  float dist = length(vWorld - cameraPosition);
  gl_FragColor = vec4(shadeWater(V, vNormal, vWorld.xz, vHeight, dist, uTime, uSunDir), 1.0);
}
`;

/** Lite tier (raw WebGL): one full-screen triangle, no mesh, no engine. */
export const LITE_VERTEX = /* glsl */ `
attribute vec2 aPos;
varying vec2 vUv;
void main() {
  vUv = aPos * 0.5 + 0.5;
  gl_Position = vec4(aPos, 0.0, 1.0);
}
`;

/**
 * Each pixel casts a ray from the same camera the 3D scene uses onto the water
 * plane, then shades that point. Ripples are only evaluated while active.
 */
export const LITE_FRAGMENT = /* glsl */ `
precision highp float;
#define CAUSTIC_ITER 3
uniform vec2 uRes;
uniform float uTime;
uniform float uScroll;
uniform float uFit;
uniform float uActive;
uniform vec3 uSunDir;
varying vec2 vUv;

${WAVE_GLSL}
${SHADE_GLSL}

void main() {
  float aspect = uRes.x / uRes.y;
  vec3 cam = vec3(0.0, (10.5 - uScroll * 1.5) * uFit, (6.2 - uScroll * 4.5) * uFit);
  vec3 target = vec3(0.0, 0.0, -uScroll * 2.0);
  vec3 fwd = normalize(target - cam);
  vec3 right = normalize(cross(fwd, vec3(0.0, 1.0, 0.0)));
  vec3 up = cross(right, fwd);
  float th = 0.34433; // tan(19 degrees): the same 38 degree field of view
  vec2 ndc = vUv * 2.0 - 1.0;
  vec3 ray = normalize(fwd + right * ndc.x * th * aspect + up * ndc.y * th);
  float t = -cam.y / ray.y;
  vec2 w = (cam + ray * t).xz;

  float e = 0.08;
  float h = baseHeight(w, uTime);
  float hx = baseHeight(w + vec2(e, 0.0), uTime);
  float hz = baseHeight(w + vec2(0.0, e), uTime);
  if (uActive > 0.5) {
    h += rippleHeight(w, uTime);
    hx += rippleHeight(w + vec2(e, 0.0), uTime);
    hz += rippleHeight(w + vec2(0.0, e), uTime);
  }
  vec3 N = normalize(vec3(h - hx, e, h - hz));
  vec3 V = normalize(cam - vec3(w.x, h, w.y));
  gl_FragColor = vec4(shadeWater(V, N, w, h, t, uTime, uSunDir), 1.0);
}
`;
