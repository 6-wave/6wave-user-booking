import { CLUB_FRAGMENT, CLUB_VERTEX } from "./shader";
import type { ClubOptions, ClubScene } from "./types";

const MAX_TAPS = 4;
const MIN_SCALE = 0.45;

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
 * The hero's club atmosphere. No 3D engine: one full-screen triangle and one
 * fragment shader. `lite` (phones) renders at a lower resolution, ~30 fps,
 * with fewer beams and embers; the resolution also adapts to frame time.
 */
export function createClubScene(
  canvas: HTMLCanvasElement,
  { lite, onContextLost }: ClubOptions,
): ClubScene {
  const gl = canvas.getContext("webgl", {
    antialias: false,
    alpha: false,
    depth: false,
    stencil: false,
    powerPreference: lite ? "low-power" : "default",
  });
  if (!gl) throw new Error("WebGL unavailable");
  const precision = gl.getShaderPrecisionFormat(gl.FRAGMENT_SHADER, gl.HIGH_FLOAT);
  if (!precision || precision.precision === 0) throw new Error("No highp floats");

  const vertex = compile(gl, gl.VERTEX_SHADER, CLUB_VERTEX);
  const fragment = compile(
    gl,
    gl.FRAGMENT_SHADER,
    (lite ? "#define LITE 1\n" : "") + CLUB_FRAGMENT,
  );
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
    pointer: gl.getUniformLocation(program, "uPointer"),
    taps: gl.getUniformLocation(program, "uTaps"),
  };

  const taps = new Float32Array(MAX_TAPS * 4);
  let tapIndex = 0;

  const dpr = window.devicePixelRatio || 1;
  // The scene is soft glow, so it never needs retina resolution.
  const maxScale = lite ? Math.min(dpr, 1) * 0.7 : Math.min(dpr, 1);
  let scale = maxScale;
  const minFrameMs = lite ? 28 : 0; // lite: ~30 fps
  let scroll = 0;
  let scrollSmooth = 0;
  let pointerX = 0;
  let pointerY = 0;
  let pointerSmoothX = 0;
  let pointerSmoothY = 0;
  let time = 0;
  let aspect = 1;

  function resize() {
    const w = Math.max(1, canvas.clientWidth);
    const h = Math.max(1, canvas.clientHeight);
    canvas.width = Math.max(1, Math.round(w * scale));
    canvas.height = Math.max(1, Math.round(h * scale));
    aspect = w / h;
    gl!.viewport(0, 0, canvas.width, canvas.height);
    gl!.uniform2f(u.res, canvas.width, canvas.height);
  }

  function draw(dt: number) {
    time += dt;
    scrollSmooth += (scroll - scrollSmooth) * 0.1;
    pointerSmoothX += (pointerX - pointerSmoothX) * 0.06;
    pointerSmoothY += (pointerY - pointerSmoothY) * 0.06;
    gl!.uniform1f(u.time, time);
    gl!.uniform1f(u.scroll, scrollSmooth);
    gl!.uniform2f(u.pointer, pointerSmoothX, pointerSmoothY);
    gl!.uniform4fv(u.taps, taps);
    gl!.drawArrays(gl!.TRIANGLES, 0, 3);
  }

  let raf = 0;
  let running = false;
  let lastFrame = 0;
  let ema = 1 / 60;
  let sinceCheck = 0;
  let cooldown = 0;

  function frame(now: number) {
    raf = requestAnimationFrame(frame);
    if (now - lastFrame < minFrameMs) return;
    const dt = Math.min((now - lastFrame) / 1000, 0.1);
    lastFrame = now;
    ema += (dt - ema) * 0.1;
    draw(dt);

    // Slow frames: shrink the render resolution (the scene is soft, so it
    // upscales cleanly); recover slowly if it speeds back up.
    if (++sinceCheck >= 40) {
      sinceCheck = 0;
      if (cooldown > 0) {
        cooldown--;
        return;
      }
      const slow = lite ? 0.045 : 0.025;
      const fast = lite ? 0.036 : 0.0185;
      if (ema > slow && scale > MIN_SCALE) {
        scale = Math.max(MIN_SCALE, scale - 0.1);
        cooldown = 2;
        resize();
      } else if (ema < fast && scale < maxScale) {
        scale = Math.min(maxScale, scale + 0.05);
        cooldown = 4;
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
    setPointer(x, y) {
      pointerX = x;
      pointerY = y;
    },
    pulse(clientX, clientY, strength = 0.8) {
      const rect = canvas.getBoundingClientRect();
      const x = ((clientX - rect.left) / rect.width) * 2 - 1;
      const y = -(((clientY - rect.top) / rect.height) * 2 - 1);
      taps.set([x * aspect, y, time, strength], tapIndex * 4);
      tapIndex = (tapIndex + 1) % MAX_TAPS;
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
