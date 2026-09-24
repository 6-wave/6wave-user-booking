import {
  CanvasTexture,
  Color,
  DirectionalLight,
  DoubleSide,
  Group,
  HemisphereLight,
  Mesh,
  MeshBasicMaterial,
  MeshStandardMaterial,
  PerspectiveCamera,
  Plane,
  PlaneGeometry,
  Quaternion,
  Raycaster,
  RingGeometry,
  Scene,
  ShaderMaterial,
  SphereGeometry,
  SRGBColorSpace,
  TorusGeometry,
  Vector2,
  Vector3,
  Vector4,
  WebGLRenderer,
  type BufferGeometry,
  type Material,
  type Texture,
} from "three";
import { WATER_FRAGMENT, WATER_VERTEX } from "./shaders";
import type { WaterOptions, WaterScene } from "./types";
import { RIPPLE, height, type Ripple } from "./waves";

interface Floater {
  group: Group;
  baseX: number;
  baseZ: number;
  drift: number;
  phase: number;
  spin: number;
  lift: number;
}

const DEEP = 0x044553;
const UP = new Vector3(0, 1, 0);

function radialFoamTexture(): CanvasTexture {
  const c = document.createElement("canvas");
  c.width = c.height = 128;
  const g = c.getContext("2d");
  if (g) {
    const grad = g.createRadialGradient(64, 64, 0, 64, 64, 64);
    grad.addColorStop(0.6, "#000");
    grad.addColorStop(0.7, "#fff");
    grad.addColorStop(1, "#000");
    g.fillStyle = grad;
    g.fillRect(0, 0, 128, 128);
  }
  return new CanvasTexture(c);
}

function beachBallTexture(): CanvasTexture {
  const c = document.createElement("canvas");
  c.width = 256;
  c.height = 128;
  const g = c.getContext("2d");
  if (g) {
    const colors = ["#ff5a3c", "#ffffff", "#ffd23a", "#ffffff", "#19b3b8", "#ffffff"];
    const w = c.width / colors.length;
    colors.forEach((color, i) => {
      g.fillStyle = color;
      g.fillRect(i * w, 0, w + 1, c.height);
    });
  }
  const t = new CanvasTexture(c);
  t.colorSpace = SRGBColorSpace;
  return t;
}

export function createWaterScene(
  canvas: HTMLCanvasElement,
  { onContextLost }: WaterOptions = {},
): WaterScene {
  const renderer = new WebGLRenderer({ canvas, antialias: true, alpha: false });
  renderer.setClearColor(new Color(DEEP));

  const small =
    window.matchMedia("(pointer: coarse)").matches || window.innerWidth < 768;
  const maxPixelRatio = Math.min(window.devicePixelRatio || 1, small ? 1.75 : 2);
  let pixelRatio = Math.min(maxPixelRatio, 1.5);

  const scene = new Scene();
  const camera = new PerspectiveCamera(38, 1, 0.1, 200);

  // ---- Water
  const ripples: Ripple[] = Array.from({ length: RIPPLE.count }, () => ({
    x: 0,
    z: 0,
    start: -100,
    amp: 0,
  }));
  const rippleUniform = ripples.map(() => new Vector4());
  let rippleIndex = 0;

  const sunDir = new Vector3(0.55, 0.7, 0.35).normalize();
  const waterMaterial = new ShaderMaterial({
    vertexShader: WATER_VERTEX,
    fragmentShader: WATER_FRAGMENT,
    uniforms: {
      uTime: { value: 0 },
      uSunDir: { value: sunDir },
      uRipples: { value: rippleUniform },
    },
  });
  const segments = small ? 140 : 180;
  const waterGeometry = new PlaneGeometry(64, 64, segments, segments);
  waterGeometry.rotateX(-Math.PI / 2);
  const water = new Mesh(waterGeometry, waterMaterial);
  water.frustumCulled = false;
  scene.add(water);

  // ---- Light
  const sun = new DirectionalLight(0xfff1cf, 2.4);
  sun.position.copy(sunDir).multiplyScalar(10);
  scene.add(sun, new HemisphereLight(0xe6fbf6, 0x1a8a92, 1.6));

  // ---- Things that float
  const disposables: { dispose(): void }[] = [
    waterGeometry,
    waterMaterial,
  ];
  const track = <T extends BufferGeometry | Material | Texture>(item: T): T => {
    disposables.push(item);
    return item;
  };

  const foamTexture = track(radialFoamTexture());
  const foamMaterial = track(
    new MeshBasicMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0.32,
      alphaMap: foamTexture,
      depthWrite: false,
      side: DoubleSide,
    }),
  );

  const floaters: Floater[] = [];

  function addFloater(
    body: Mesh,
    foamOuter: number,
    opts: Omit<Floater, "group">,
  ) {
    const group = new Group();
    group.add(body);
    const foam = new Mesh(
      track(new RingGeometry(foamOuter * 0.72, foamOuter * 1.06, 64)),
      foamMaterial,
    );
    foam.rotation.x = -Math.PI / 2;
    foam.position.y = 0.02;
    group.add(foam);
    scene.add(group);
    floaters.push({ group, ...opts });
  }

  // The hero: a big yellow inflatable ring.
  const ringMaterial = track(
    new MeshStandardMaterial({
      color: 0xffdc3a,
      roughness: 0.28,
      emissive: 0xa06a00,
      emissiveIntensity: 0.55,
    }),
  );
  const ring = new Mesh(track(new TorusGeometry(1.3, 0.52, 28, 64)), ringMaterial);
  ring.rotation.x = Math.PI / 2;
  addFloater(ring, 1.85, {
    baseX: 0,
    baseZ: 0,
    drift: 0.28,
    phase: 0,
    spin: 0.12,
    lift: 0.08,
  });

  // A smaller coral ring.
  const coralMaterial = track(
    new MeshStandardMaterial({
      color: 0xff5a3c,
      roughness: 0.35,
      emissive: 0x5a1400,
      emissiveIntensity: 0.25,
    }),
  );
  const coral = new Mesh(track(new TorusGeometry(0.78, 0.32, 24, 48)), coralMaterial);
  coral.rotation.x = Math.PI / 2;
  addFloater(coral, 1.1, {
    baseX: -3.4,
    baseZ: 2.3,
    drift: 0.22,
    phase: 2.1,
    spin: -0.18,
    lift: 0.04,
  });

  // A beach ball.
  const ballTexture = track(beachBallTexture());
  const ballMaterial = track(
    new MeshStandardMaterial({ map: ballTexture, roughness: 0.45 }),
  );
  const ball = new Mesh(track(new SphereGeometry(0.62, 32, 20)), ballMaterial);
  ball.position.y = 0.36;
  addFloater(ball, 0.85, {
    baseX: 3.1,
    baseZ: 1.5,
    drift: 0.3,
    phase: 4.0,
    spin: 0.55,
    lift: 0.05,
  });

  // ---- Framing + parallax
  let width = 1;
  let heightPx = 1;
  let scroll = 0;
  let scrollSmooth = 0;
  const pointer = new Vector2();
  const pointerSmooth = new Vector2();

  function layout() {
    width = Math.max(1, canvas.clientWidth);
    heightPx = Math.max(1, canvas.clientHeight);
    renderer.setPixelRatio(pixelRatio);
    renderer.setSize(width, heightPx, false);
    camera.aspect = width / heightPx;

    // Where on screen the ring should sit: lower-middle on phones, right on desktop.
    const wide = width >= 768;
    // Keep the companions clear of the text: right and below the ring on desktop.
    const [coralFloater, ballFloater] = [floaters[1], floaters[2]];
    if (coralFloater && ballFloater) {
      coralFloater.baseX = wide ? -1.3 : -3.4;
      coralFloater.baseZ = wide ? 3.8 : 2.3;
      ballFloater.baseX = wide ? 2.6 : 3.1;
      ballFloater.baseZ = wide ? 2.4 : 1.5;
    }
    const ringX = wide ? 0.72 : 0.5;
    const ringY = wide ? 0.56 : 0.8;
    camera.setViewOffset(
      width,
      heightPx,
      -(ringX - 0.5) * width,
      -(ringY - 0.5) * heightPx,
      width,
      heightPx,
    );
    camera.updateProjectionMatrix();
  }

  function updateCamera() {
    // On tall, narrow screens pull back so the ring and its friends fit.
    const fit = Math.max(1, 1.15 / camera.aspect);
    const s = scrollSmooth;
    camera.position.set(
      pointerSmooth.x * 0.9 * fit,
      (10.5 - s * 1.5) * fit,
      (6.2 - s * 4.5) * fit,
    );
    camera.lookAt(pointerSmooth.x * 0.3, 0, -s * 2 - pointerSmooth.y * 0.4);
  }

  // ---- Frame
  const tilt = new Quaternion();
  const yaw = new Quaternion();
  const normal = new Vector3();

  function updateFloaters(time: number) {
    for (const f of floaters) {
      const x = f.baseX + Math.sin(time * 0.25 + f.phase) * f.drift;
      const z = f.baseZ + Math.cos(time * 0.21 + f.phase) * f.drift;
      const y0 = height(x, z, time, ripples);
      const e = 0.25;
      const hx = height(x + e, z, time, ripples);
      const hz = height(x, z + e, time, ripples);
      normal.set(y0 - hx, e, y0 - hz).normalize();
      tilt.setFromUnitVectors(UP, normal);
      yaw.setFromAxisAngle(UP, time * f.spin + f.phase);
      tilt.multiply(yaw);
      f.group.quaternion.slerp(tilt, 0.18);
      f.group.position.set(x, y0 + f.lift, z);
    }
  }

  let time = 0;
  let raf = 0;
  let running = false;
  let last = 0;
  let frameEma = 1 / 60;
  let framesSinceCheck = 0;
  let cooldown = 0;

  function draw(dt: number) {
    time += dt;
    scrollSmooth += (scroll - scrollSmooth) * 0.1;
    pointerSmooth.lerp(pointer, 0.06);
    waterMaterial.uniforms.uTime.value = time;
    ripples.forEach((r, i) => rippleUniform[i].set(r.x, r.z, r.start, r.amp));
    updateFloaters(time);
    updateCamera();
    renderer.render(scene, camera);
  }

  function adaptQuality() {
    // Keep phones smooth: lower the resolution first if frames run long.
    if (++framesSinceCheck < 45) return;
    framesSinceCheck = 0;
    if (cooldown > 0) {
      cooldown--;
      return;
    }
    if (frameEma > 1 / 40 && pixelRatio > 0.75) {
      pixelRatio -= 0.25;
      cooldown = 2;
      layout();
    } else if (frameEma < 1 / 58 && pixelRatio < maxPixelRatio) {
      pixelRatio = Math.min(maxPixelRatio, pixelRatio + 0.25);
      cooldown = 4;
      layout();
    }
  }

  function frame(now: number) {
    raf = requestAnimationFrame(frame);
    const dt = Math.min((now - last) / 1000, 0.05);
    last = now;
    frameEma += (dt - frameEma) * 0.1;
    draw(dt);
    adaptQuality();
  }

  const raycaster = new Raycaster();
  const plane = new Plane(new Vector3(0, 1, 0), 0);
  const hit = new Vector3();
  const ndc = new Vector2();

  const onLost = (event: Event) => {
    event.preventDefault();
    stop();
    onContextLost?.();
  };
  canvas.addEventListener("webglcontextlost", onLost);

  function start() {
    if (running) return;
    running = true;
    last = performance.now();
    raf = requestAnimationFrame(frame);
  }
  function stop() {
    running = false;
    cancelAnimationFrame(raf);
  }

  layout();
  updateCamera();

  return {
    setScroll(progress) {
      scroll = Math.min(1, Math.max(0, progress));
    },
    setPointer(x, y) {
      pointer.set(x, y);
    },
    ripple(clientX, clientY, strength = 0.22) {
      const rect = canvas.getBoundingClientRect();
      ndc.set(
        ((clientX - rect.left) / rect.width) * 2 - 1,
        -(((clientY - rect.top) / rect.height) * 2 - 1),
      );
      raycaster.setFromCamera(ndc, camera);
      if (!raycaster.ray.intersectPlane(plane, hit)) return;
      ripples[rippleIndex] = { x: hit.x, z: hit.z, start: time, amp: strength };
      rippleIndex = (rippleIndex + 1) % RIPPLE.count;
    },
    resize: layout,
    start,
    stop,
    renderOnce() {
      draw(2);
    },
    dispose() {
      stop();
      canvas.removeEventListener("webglcontextlost", onLost);
      disposables.forEach((d) => d.dispose());
      renderer.dispose();
      renderer.forceContextLoss();
    },
  };
}
