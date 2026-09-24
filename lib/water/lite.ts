import { LITE_FRAGMENT, LITE_VERTEX } from "./shaders";
import type { WaterOptions, WaterScene } from "./types";
import { RIPPLE, type Ripple } from "./waves";

const TAN_HALF_FOV = 0.34433; // matches the 3D scene's 38° lens
const MIN_FRAME_MS = 28; // ~30fps: plenty for water, easy on batteries
const MIN_SCALE = 0.45;

type Vec3 = [number, number, number];
const sub = (a: Vec3, b: Vec3): Vec3 => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
const cross = (a: Vec3, b: Vec3): Vec3 => [
  a[1] * b[2] - a[2] * b[1],
  a[2] * b[0] - a[0] * b[2],
  a[0] * b[1] - a[1] * b[0],
];
const norm = (a: Vec3): Vec3 => {
  const l = Math.hypot(a[0], a[1], a[2]) || 1;
  return [a[0] / l, a[1] / l, a[2] / l];
};

function compile(gl: WebGLRenderingContext, type: number, source: string) {
  const shader = gl.createShader(type);
  if (!shader) throw new Error("Could not create shader");
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    const log = gl.getShaderInfoLog(shader);
    gl.deleteShader(shader);
    throw new Error(log ?? "Shader failed to compile");
  }
  return shader;
}

/**
 * The phone-sized water: no 3D engine, no mesh, no lights. One full-screen
 * triangle and a fragment shader that ray-casts each pixel onto the wave
 * field. Runs at a reduced resolution, at most ~30fps.
 */
export function createLiteWater(
  canvas: HTMLCanvasElement,
  { onContextLost }: WaterOptions = {},
): WaterScene {
  const gl = canvas.getContext("webgl", {
    antialias: false,
    alpha: false,
    depth: false,
    stencil: false,
    powerPreference: "low-power",
  });
  if (!gl) throw new Error("WebGL unavailable");
  const precision = gl.getShaderPrecisionFormat(gl.FRAGMENT_SHADER, gl.HIGH_FLOAT);
  if (!precision || precision.precision === 0) throw new Error("No highp floats");

  const vertex = compile(gl, gl.VERTEX_SHADER, LITE_VERTEX);
  const fragment = compile(gl, gl.FRAGMENT_SHADER, LITE_FRAGMENT);
  const program = gl.createProgram();
  if (!program) throw new Error("Could not create program");
  gl.attachShader(program, vertex);
  gl.attachShader(program, fragment);
  gl.linkProgram(program);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS))
    throw new Error(gl.getProgramInfoLog(program) ?? "Program failed to link");
  gl.useProgram(program);

  // One triangle that covers the whole screen.
  const buffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
  const aPos = gl.getAttribLocation(program, "aPos");
  gl.enableVertexAttribArray(aPos);
  gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0);

  const u = {
    res: gl.getUniformLocation(program, "uRes"),
    time: gl.getUniformLocation(program, "uTime"),
    scroll: gl.getUniformLocation(program, "uScroll"),
    fit: gl.getUniformLocation(program, "uFit"),
    active: gl.getUniformLocation(program, "uActive"),
    sun: gl.getUniformLocation(program, "uSunDir"),
    ripples: gl.getUniformLocation(program, "uRipples"),
  };
  const sun = norm([0.55, 0.7, 0.35]);
  gl.uniform3f(u.sun, sun[0], sun[1], sun[2]);

  const ripples: Ripple[] = Array.from({ length: RIPPLE.count }, () => ({
    x: 0,
    z: 0,
    start: -100,
    amp: 0,
  }));
  const rippleData = new Float32Array(RIPPLE.count * 4);
  let rippleIndex = 0;

  let scale = Math.min(window.devicePixelRatio || 1, 1) * 0.8;
  const maxScale = scale;
  let scroll = 0;
  let scrollSmooth = 0;
  let time = 0;
  let fit = 1;
  let aspect = 1;

  function resize() {
    const w = Math.max(1, canvas.clientWidth);
    const h = Math.max(1, canvas.clientHeight);
    canvas.width = Math.max(1, Math.round(w * scale));
    canvas.height = Math.max(1, Math.round(h * scale));
    aspect = w / h;
    fit = Math.max(1, 1.15 / aspect); // pull back on tall screens, like the 3D scene
    gl!.viewport(0, 0, canvas.width, canvas.height);
    gl!.uniform2f(u.res, canvas.width, canvas.height);
    gl!.uniform1f(u.fit, fit);
  }

  function cameraFrame() {
    const s = scrollSmooth;
    const cam: Vec3 = [0, (10.5 - s * 1.5) * fit, (6.2 - s * 4.5) * fit];
    const fwd = norm(sub([0, 0, -s * 2], cam));
    const right = norm(cross(fwd, [0, 1, 0]));
    const up = cross(right, fwd);
    return { cam, fwd, right, up };
  }

  function draw(dt: number) {
    time += dt;
    scrollSmooth += (scroll - scrollSmooth) * 0.1;
    let active = 0;
    for (let i = 0; i < ripples.length; i++) {
      const r = ripples[i];
      rippleData[i * 4] = r.x;
      rippleData[i * 4 + 1] = r.z;
      rippleData[i * 4 + 2] = r.start;
      rippleData[i * 4 + 3] = r.amp;
      if (r.amp > 0 && time - r.start < RIPPLE.maxAge) active = 1;
    }
    gl!.uniform1f(u.time, time);
    gl!.uniform1f(u.scroll, scrollSmooth);
    gl!.uniform1f(u.active, active);
    gl!.uniform4fv(u.ripples, rippleData);
    gl!.drawArrays(gl!.TRIANGLES, 0, 3);
  }

  let raf = 0;
  let running = false;
  let lastFrame = 0;
  let ema = MIN_FRAME_MS / 1000;
  let sinceCheck = 0;

  function frame(now: number) {
    raf = requestAnimationFrame(frame);
    if (now - lastFrame < MIN_FRAME_MS) return;
    const dt = Math.min((now - lastFrame) / 1000, 0.1);
    lastFrame = now;
    ema += (dt - ema) * 0.1;
    draw(dt);

    // Slow frames: shrink the render resolution (the water is soft, so it
    // upscales cleanly). Recover slowly if it speeds back up.
    if (++sinceCheck >= 30) {
      sinceCheck = 0;
      if (ema > 0.045 && scale > MIN_SCALE) {
        scale = Math.max(MIN_SCALE, scale - 0.1);
        resize();
      } else if (ema < 0.036 && scale < maxScale) {
        scale = Math.min(maxScale, scale + 0.05);
        resize();
      }
    }
  }

  const onLost = (event: Event) => {
    event.preventDefault();
    stop();
    onContextLost?.();
  };
  canvas.addEventListener("webglcontextlost", onLost);

  function start() {
    if (running) return;
    running = true;
    lastFrame = performance.now();
    raf = requestAnimationFrame(frame);
  }
  function stop() {
    running = false;
    cancelAnimationFrame(raf);
  }

  resize();

  return {
    setScroll(progress) {
      scroll = Math.min(1, Math.max(0, progress));
    },
    setPointer() {
      // Phones have no hover: nothing to sway.
    },
    ripple(clientX, clientY, strength = 0.22) {
      const rect = canvas.getBoundingClientRect();
      const ndcX = ((clientX - rect.left) / rect.width) * 2 - 1;
      const ndcY = -(((clientY - rect.top) / rect.height) * 2 - 1);
      const { cam, fwd, right, up } = cameraFrame();
      const ray = norm([
        fwd[0] + right[0] * ndcX * TAN_HALF_FOV * aspect + up[0] * ndcY * TAN_HALF_FOV,
        fwd[1] + right[1] * ndcX * TAN_HALF_FOV * aspect + up[1] * ndcY * TAN_HALF_FOV,
        fwd[2] + right[2] * ndcX * TAN_HALF_FOV * aspect + up[2] * ndcY * TAN_HALF_FOV,
      ]);
      if (ray[1] >= 0) return;
      const t = -cam[1] / ray[1];
      ripples[rippleIndex] = {
        x: cam[0] + ray[0] * t,
        z: cam[2] + ray[2] * t,
        start: time,
        amp: strength,
      };
      rippleIndex = (rippleIndex + 1) % RIPPLE.count;
    },
    resize,
    start,
    stop,
    renderOnce() {
      draw(2);
    },
    dispose() {
      stop();
      canvas.removeEventListener("webglcontextlost", onLost);
      gl.deleteBuffer(buffer);
      gl.deleteProgram(program);
      gl.deleteShader(vertex);
      gl.deleteShader(fragment);
      gl.getExtension("WEBGL_lose_context")?.loseContext();
    },
  };
}
