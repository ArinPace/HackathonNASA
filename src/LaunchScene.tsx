import { useEffect, useRef } from "react";
import * as THREE from "three";
import type { LaunchState } from "./sim/launch";
export function LaunchScene({
  state,
  heavy,
  reduced,
}: {
  state: LaunchState;
  heavy: boolean;
  reduced: boolean;
}) {
  const host = useRef<HTMLDivElement>(null),
    live = useRef({ state, heavy, reduced });
  live.current = { state, heavy, reduced };
  useEffect(() => {
    const el = host.current!;
    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
    } catch {
      el.innerHTML =
        '<div class="fallback">3D unavailable. Launch controls and telemetry still work.</div>';
      return;
    }
    renderer.setPixelRatio(Math.min(devicePixelRatio, 1.6));
    el.appendChild(renderer.domElement);
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(43, 1, 0.1, 1500);
    const geometry: THREE.BufferGeometry[] = [],
      materials: THREE.Material[] = [];
    const rocket = new THREE.Group(),
      booster = new THREE.Group(),
      upper = new THREE.Group();
    rocket.add(booster, upper);
    scene.add(rocket);
    function material(color: number, metal = 0.3) {
      const m = new THREE.MeshStandardMaterial({
        color,
        roughness: 0.45,
        metalness: metal,
      });
      materials.push(m);
      return m;
    }
    const white = material(0xede9de),
      dark = material(0x23343b),
      orange = material(0xff963e),
      steel = material(0x6c818b, 0.8);
    function mesh(
      g: THREE.BufferGeometry,
      m: THREE.Material,
      parent: THREE.Object3D,
      x: number,
      y: number,
      z = 0,
    ) {
      geometry.push(g);
      const o = new THREE.Mesh(g, m);
      o.position.set(x, y, z);
      parent.add(o);
      return o;
    }
    const cyl = (
      r: number,
      h: number,
      m: THREE.Material,
      p: THREE.Object3D,
      y: number,
      x = 0,
    ) => mesh(new THREE.CylinderGeometry(r, r, h, 32), m, p, x, y);
    cyl(0.66, 5, white, booster, -0.8);
    cyl(0.68, 0.5, dark, booster, -2.75);
    cyl(0.69, 0.17, dark, booster, 0.6);
    cyl(0.68, 0.17, orange, booster, -0.1);
    cyl(0.7, 0.45, dark, upper, 1.65);
    cyl(0.66, 2.1, white, upper, 2.9);
    mesh(new THREE.ConeGeometry(0.66, 2, 32), white, upper, 0, 4.95);
    cyl(0.68, 0.08, orange, upper, 3.5);
    for (let i = 0; i < 4; i++) {
      const fin = mesh(
        new THREE.BoxGeometry(0.12, 1.5, 0.8),
        dark,
        booster,
        Math.cos((i * Math.PI) / 2) * 0.75,
        -2.4,
        Math.sin((i * Math.PI) / 2) * 0.75,
      );
      fin.rotation.y = (-i * Math.PI) / 2;
      fin.rotation.z = 0.1;
    }
    const sideBoosters = new THREE.Group();
    booster.add(sideBoosters);
    for (const side of [-1, 1]) {
      cyl(0.36, 4.4, white, sideBoosters, -1, side * 1.1);
      mesh(
        new THREE.ConeGeometry(0.36, 0.8, 20),
        white,
        sideBoosters,
        side * 1.1,
        1.6,
      );
      cyl(0.38, 0.35, orange, sideBoosters, -2.9, side * 1.1);
    }
    const exhaust = new THREE.Group();
    rocket.add(exhaust);
    const flameM = new THREE.MeshBasicMaterial({
      color: 0xff7a23,
      transparent: true,
      opacity: 0.8,
      depthWrite: false,
    });
    const coreM = new THREE.MeshBasicMaterial({
      color: 0xfff2ac,
      transparent: true,
      opacity: 0.95,
      depthWrite: false,
    });
    materials.push(flameM, coreM);
    const flame = mesh(
      new THREE.ConeGeometry(0.8, 6, 24),
      flameM,
      exhaust,
      0,
      -3,
    );
    mesh(new THREE.ConeGeometry(0.32, 4.5, 20), coreM, exhaust, 0, -2.25);
    const engineLight = new THREE.PointLight(0xffa142, 25, 18);
    engineLight.position.y = -3;
    exhaust.add(engineLight);
    const ground = new THREE.Group();
    scene.add(ground);
    const groundM = material(0x214838, 0);
    const land = mesh(
      new THREE.CylinderGeometry(100, 100, 1, 64),
      groundM,
      ground,
      0,
      -4.5,
    );
    const pad = cyl(5, 0.3, material(0x46545a), ground, -3.8);
    pad.position.x = -0.3;
    const tower = mesh(
      new THREE.BoxGeometry(0.6, 10, 0.6),
      steel,
      ground,
      -3,
      1,
    );
    for (let j = 0; j < 8; j++)
      mesh(new THREE.BoxGeometry(2, 0.09, 0.1), steel, ground, -3, j - 3);
    mesh(new THREE.BoxGeometry(2.8, 0.3, 0.3), steel, ground, -1.7, 3.4);
    const earth = mesh(
      new THREE.SphereGeometry(44, 64, 40),
      material(0x206b9a, 0),
      scene,
      0,
      -58,
      -25,
    );
    const continentsM = material(0x4d8166, 0);
    for (let i = 0; i < 12; i++) {
      const a = i * 2.399;
      const patch = mesh(
        new THREE.SphereGeometry(5 + (i % 4), 12, 8),
        continentsM,
        earth,
        Math.cos(a) * 29,
        Math.sin(a) * 24,
        27,
      );
      patch.scale.z = 0.15;
    }
    const atmosphereM = new THREE.MeshBasicMaterial({
      color: 0x5aaeff,
      transparent: true,
      opacity: 0.08,
      side: THREE.BackSide,
    });
    materials.push(atmosphereM);
    mesh(new THREE.SphereGeometry(45, 48, 32), atmosphereM, earth, 0, 0);
    const cloudGroup = new THREE.Group();
    scene.add(cloudGroup);
    const cloudM = new THREE.MeshStandardMaterial({
      color: 0xf0f5f5,
      transparent: true,
      opacity: 0.5,
      roughness: 1,
    });
    materials.push(cloudM);
    for (let i = 0; i < 18; i++) {
      const cloud = mesh(
        new THREE.IcosahedronGeometry(2.2, 1),
        cloudM,
        cloudGroup,
        Math.sin(i * 4) * 20,
        -8 + i * 4,
        -10 - Math.cos(i) * 8,
      );
      cloud.scale.set(2.5, 0.5, 1);
    }
    const starG = new THREE.BufferGeometry(),
      coords: number[] = [];
    for (let i = 0; i < 600; i++) {
      coords.push(
        Math.sin(i * 127.1) * 250,
        Math.cos(i * 311.7) * 180,
        Math.sin(i * 73.1) * 150 - 200,
      );
    }
    starG.setAttribute("position", new THREE.Float32BufferAttribute(coords, 3));
    geometry.push(starG);
    const starM = new THREE.PointsMaterial({
      color: 0xe2eeff,
      size: 0.22,
      transparent: true,
    });
    materials.push(starM);
    const stars = new THREE.Points(starG, starM);
    scene.add(stars);
    const smokeG = new THREE.BufferGeometry();
    const smokePositions = new Float32Array(150 * 3);
    smokeG.setAttribute(
      "position",
      new THREE.BufferAttribute(smokePositions, 3),
    );
    geometry.push(smokeG);
    const smokeCanvas = document.createElement("canvas");
    smokeCanvas.width = smokeCanvas.height = 32;
    const smokeCtx = smokeCanvas.getContext("2d")!;
    const gradient = smokeCtx.createRadialGradient(16, 16, 0, 16, 16, 16);
    gradient.addColorStop(0, "rgba(255,255,255,.8)");
    gradient.addColorStop(1, "rgba(255,255,255,0)");
    smokeCtx.fillStyle = gradient;
    smokeCtx.fillRect(0, 0, 32, 32);
    const smokeTexture = new THREE.CanvasTexture(smokeCanvas);
    const smokeM = new THREE.PointsMaterial({
      map: smokeTexture,
      color: 0xc5d3d4,
      size: 1.1,
      transparent: true,
      opacity: 0.5,
      depthWrite: false,
    });
    materials.push(smokeM);
    const smoke = new THREE.Points(smokeG, smokeM);
    scene.add(smoke);
    scene.add(new THREE.AmbientLight(0xa9c7e2, 2));
    const sunlight = new THREE.DirectionalLight(0xfff4d8, 4);
    sunlight.position.set(-12, 18, 10);
    scene.add(sunlight);
    const fill = new THREE.DirectionalLight(0x82baff, 2);
    fill.position.set(5, 0, -4);
    scene.add(fill);
    const sky = new THREE.Color(0x76a6c8),
      space = new THREE.Color(0x030812);
    let raf = 0,
      clock = 0;
    const resize = () => {
      renderer.setSize(el.clientWidth, el.clientHeight);
      camera.aspect = el.clientWidth / el.clientHeight;
      camera.updateProjectionMatrix();
    };
    const ro = new ResizeObserver(resize);
    ro.observe(el);
    function frame() {
      raf = requestAnimationFrame(frame);
      const { state: s, heavy: h, reduced: r } = live.current;
      clock += 0.016;
      const elevation = Math.min(1, s.altitude / 75000);
      scene.background = sky.clone().lerp(space, elevation);
      starM.opacity = elevation;
      sideBoosters.visible = h;
      rocket.rotation.z = (-s.pitch * Math.PI) / 180;
      const firing = s.status === "flying" && s.fuel[s.stage - 1] > 0;
      exhaust.visible = firing;
      exhaust.position.y = s.stage === 1 ? -3.35 : 1.25;
      exhaust.scale.setScalar(
        (0.65 + s.throttle * 0.45) * (r ? 1 : 1 + Math.sin(clock * 70) * 0.08),
      );
      flame.scale.x = 1 + Math.sin(clock * 44) * 0.08;
      booster.visible = s.stage === 1 || s.stagedAt !== null;
      if (s.stagedAt !== null) {
        const elapsed = Math.max(0, s.time - s.stagedAt);
        booster.position.set(Math.min(12, elapsed * 0.3), -elapsed * 0.7, 0);
        booster.rotation.z = Math.min(1.5, elapsed * 0.04);
      }
      ground.position.y = -Math.min(180, s.altitude / 220);
      ground.visible = s.altitude < 35000;
      earth.visible = s.altitude > 10000;
      cloudGroup.position.y = -s.altitude / 700;
      cloudGroup.visible = s.altitude < 60000;
      const jitter = firing && !r ? Math.sin(clock * 85) * 0.045 : 0;
      camera.position.set(12 + jitter, 5 + elevation * 4, 23 + elevation * 9);
      camera.lookAt(0, 1.4 + elevation * 1.5, 0);
      smoke.visible =
        s.status === "countdown" || (firing && s.altitude < 10000);
      for (let i = 0; i < 150; i++) {
        const age = (clock * 0.45 + i / 150) % 1;
        smokePositions[i * 3] = Math.sin(i * 9.2) * age * 12;
        smokePositions[i * 3 + 1] =
          -3.7 + age * 3 - Math.min(15, s.altitude / 220);
        smokePositions[i * 3 + 2] = Math.cos(i * 3.7) * age * 9;
      }
      smokeG.attributes.position.needsUpdate = true;
      renderer.render(scene, camera);
    }
    frame();
    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      geometry.forEach((g) => g.dispose());
      materials.forEach((m) => m.dispose());
      smokeTexture.dispose();
      renderer.dispose();
      el.replaceChildren();
    };
  }, []);
  return (
    <div
      className="launch-canvas"
      ref={host}
      aria-label="Animated Earth rocket launch, with engines, booster separation and atmospheric ascent"
    />
  );
}
