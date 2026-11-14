import { useEffect, useRef } from "react";
import * as THREE from "three";
import type { Design, State } from "./sim/mission";
import { env } from "./sim/mission";
export function Scene({
  design,
  state,
  flight = false,
  reduced = false,
}: {
  design: Design;
  state: State;
  flight?: boolean;
  reduced?: boolean;
}) {
  const host = useRef<HTMLDivElement>(null),
    live = useRef({ design, state, flight, reduced });
  live.current = { design, state, flight, reduced };
  useEffect(() => {
    const el = host.current!;
    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    } catch {
      el.innerHTML =
        '<div class="fallback">3D unavailable. All mission controls remain usable.</div>';
      return;
    }
    renderer.setPixelRatio(Math.min(devicePixelRatio, 1.7));
    el.appendChild(renderer.domElement);
    const scene = new THREE.Scene(),
      camera = new THREE.PerspectiveCamera(38, 1, 0.1, 200);
    camera.position.set(7, 4, 9);
    camera.lookAt(0, 0, 0);
    const ambient = new THREE.AmbientLight(0x9dbbd0, 2);
    scene.add(ambient);
    const sun = new THREE.DirectionalLight(0xfff1cf, 4);
    sun.position.set(5, 4, 6);
    scene.add(sun);
    const blue = new THREE.DirectionalLight(0x50a3ff, 3);
    blue.position.set(-5, -2, -5);
    scene.add(blue);
    const craft = new THREE.Group();
    scene.add(craft);
    const mats: THREE.Material[] = [];
    const geometries: THREE.BufferGeometry[] = [];
    function box(
      w: number,
      h: number,
      d: number,
      color: number,
      x = 0,
      y = 0,
      z = 0,
      metal = 0.6,
    ) {
      const g = new THREE.BoxGeometry(w, h, d);
      geometries.push(g);
      const m = new THREE.MeshStandardMaterial({
        color,
        metalness: metal,
        roughness: 0.4,
      });
      mats.push(m);
      const mesh = new THREE.Mesh(g, m);
      mesh.position.set(x, y, z);
      craft.add(mesh);
      return mesh;
    }
    box(1.35, 1.1, 1.2, 0xc2b7a0);
    box(1.38, 0.06, 1.23, 0xe4e8df, 0, 0.55);
    box(1.38, 0.06, 1.23, 0x8d9b9d, 0, -0.55);
    box(0.75, 0.5, 0.65, 0xc49c47, 0, -0.82);
    box(0.42, 0.4, 0.48, 0x293644, 0, 0, 0.8);
    const lensG = new THREE.CylinderGeometry(0.16, 0.19, 0.18, 24);
    geometries.push(lensG);
    const lensM = new THREE.MeshStandardMaterial({
      color: 0x69cec2,
      metalness: 0.9,
      roughness: 0.13,
    });
    mats.push(lensM);
    const lens = new THREE.Mesh(lensG, lensM);
    lens.rotation.x = Math.PI / 2;
    lens.position.set(0, 0, 1.08);
    craft.add(lens);
    const batteryBox = box(0.55, 0.25, 0.65, 0x3f5143, 0.48, -0.55, 0.1);
    const recorderBox = box(0.35, 0.2, 0.55, 0x83959b, -0.48, -0.5, 0.1);
    const panels: THREE.Mesh[] = [];
    const grids: THREE.Mesh[][] = [];
    for (const side of [-1, 1]) {
      box(1, 0.07, 0.1, 0x8d969b, side * 1.05);
      for (let j = 0; j < 3; j++) {
        panels.push(box(0.85, 0.055, 1.75, 0x13365c, side * (1.7 + j * 0.88)));
        const grid: THREE.Mesh[] = [];
        for (let k = 0; k < 5; k++)
          grid.push(
            box(
              0.008,
              0.06,
              1.75,
              0x6595b3,
              side * (1.32 + j * 0.88 + k * 0.17),
            ),
          );
        grids.push(grid);
      }
      box(0.07, 0.5, 0.07, 0xd9d8c9, side * 0.5, 0.8);
    }
    const dishG = new THREE.SphereGeometry(
      0.6,
      24,
      12,
      0,
      Math.PI * 2,
      0,
      Math.PI * 0.4,
    );
    geometries.push(dishG);
    const dishM = new THREE.MeshStandardMaterial({
      color: 0xf0e9d1,
      side: THREE.DoubleSide,
      metalness: 0.65,
      roughness: 0.35,
    });
    mats.push(dishM);
    const dish = new THREE.Mesh(dishG, dishM);
    dish.position.set(0, 0.95, 0);
    dish.rotation.z = -0.3;
    craft.add(dish);
    box(0.04, 0.7, 0.04, 0xc8b991, 0.16, 1.1);
    const moonG = new THREE.SphereGeometry(3.7, 64, 48);
    geometries.push(moonG);
    const moonM = new THREE.MeshStandardMaterial({
      color: 0x92938c,
      roughness: 1,
    });
    mats.push(moonM);
    const moon = new THREE.Mesh(moonG, moonM);
    moon.position.set(-2, -3, -7);
    scene.add(moon);
    let texture: THREE.Texture | undefined;
    new THREE.TextureLoader().load(
      "/assets/moon.jpg",
      (t) => {
        texture = t;
        t.colorSpace = THREE.SRGBColorSpace;
        moonM.map = t;
        moonM.needsUpdate = true;
      },
      undefined,
      () => {},
    );
    const ringG = new THREE.BufferGeometry().setFromPoints(
      Array.from(
        { length: 181 },
        (_, i) =>
          new THREE.Vector3(
            Math.cos((i / 180) * Math.PI * 2) * 5.1,
            Math.sin((i / 180) * Math.PI * 2) * 5.1,
            0,
          ),
      ),
    );
    geometries.push(ringG);
    const ringM = new THREE.LineBasicMaterial({
      color: 0x73958c,
      transparent: true,
      opacity: 0.4,
    });
    mats.push(ringM);
    const ring = new THREE.Line(ringG, ringM);
    ring.position.copy(moon.position);
    ring.rotation.y = 0.55;
    scene.add(ring);
    const starsG = new THREE.BufferGeometry();
    const coords = [];
    let seed = 19;
    for (let i = 0; i < 650; i++) {
      seed = (seed * 16807) % 2147483647;
      const x = seed / 2147483647;
      seed = (seed * 16807) % 2147483647;
      const y = seed / 2147483647;
      seed = (seed * 16807) % 2147483647;
      coords.push(
        (x - 0.5) * 100,
        (y - 0.5) * 100,
        -10 - (seed / 2147483647) * 60,
      );
    }
    starsG.setAttribute(
      "position",
      new THREE.Float32BufferAttribute(coords, 3),
    );
    geometries.push(starsG);
    const starsM = new THREE.PointsMaterial({ size: 0.035, color: 0xbcd0d7 });
    mats.push(starsM);
    scene.add(new THREE.Points(starsG, starsM));
    const beamG = new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(1, 0.5, 0),
      new THREE.Vector3(-3, -2, -6),
    ]);
    const beamM = new THREE.LineDashedMaterial({
      color: 0xc4f38c,
      dashSize: 0.16,
      gapSize: 0.12,
      transparent: true,
      opacity: 0.7,
    });
    const beam = new THREE.Line(beamG, beamM);
    beam.computeLineDistances();
    scene.add(beam);
    geometries.push(beamG);
    mats.push(beamM);
    let raf = 0,
      drag = false,
      lastX = 0,
      rot = 0.1;
    const down = (e: PointerEvent) => {
      drag = true;
      lastX = e.clientX;
      el.setPointerCapture(e.pointerId);
    };
    const move = (e: PointerEvent) => {
      if (drag) {
        rot += (e.clientX - lastX) * 0.008;
        lastX = e.clientX;
      }
    };
    const up = () => (drag = false);
    el.addEventListener("pointerdown", down);
    el.addEventListener("pointermove", move);
    el.addEventListener("pointerup", up);
    el.addEventListener("pointercancel", up);
    const resize = () => {
      const w = el.clientWidth,
        h = el.clientHeight;
      renderer.setSize(w, h);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
    };
    const ro = new ResizeObserver(resize);
    ro.observe(el);
    let t = 0;
    function frame() {
      raf = requestAnimationFrame(frame);
      const l = live.current;
      t += 0.005;
      moon.visible = l.flight;
      ring.visible = l.flight;
      const target = l.flight
        ? l.state.mode === "observe"
          ? 0.6
          : l.state.mode === "downlink"
            ? -1
            : 0.1
        : rot;
      craft.rotation.y = THREE.MathUtils.lerp(craft.rotation.y, target, 0.035);
      craft.rotation.z = l.reduced ? -0.12 : -0.12 + Math.sin(t) * 0.025;
      craft.rotation.x = 0.2;
      craft.position.set(l.flight ? 1 : 0, l.flight ? 0.5 : 0, 0);
      craft.scale.setScalar(l.flight ? 0.68 : 1);
      lens.scale.setScalar(l.design.camera === "detail" ? 1.3 : 1);
      batteryBox.scale.y = l.design.battery === "large" ? 1.6 : 1;
      recorderBox.scale.x = l.design.storage === "large" ? 1.7 : 1;
      dish.scale.setScalar(l.design.radio === "strong" ? 1 : 0.45);
      panels.forEach((p, i) => {
        p.visible = l.design.solar === "large" || i % 3 < 2;
        grids[i].forEach((g) => (g.visible = p.visible));
      });
      if (l.flight) {
        const e = env(l.design, l.state.t);
        beam.visible =
          l.state.slew <= 0 &&
          ((l.state.mode === "observe" && e.target) ||
            (l.state.mode === "downlink" && e.contact));
        beamM.color.set(l.state.mode === "observe" ? 0x66d9ef : 0xc4f38c);
        beamM.opacity = 0.45 + Math.sin(t * 15) * 0.25;
        lensM.emissive.set(
          l.state.mode === "observe" && e.target ? 0x166a70 : 0x000000,
        );
        craft.position.y = 0.5 + (l.reduced ? 0 : Math.sin(e.angle) * 0.15);
        moon.rotation.y = e.angle * 0.04;
        sun.intensity = e.eclipse ? 0.5 : 4;
      } else {
        sun.intensity = 4;
        beam.visible = false;
        lensM.emissive.set(0x000000);
      }
      renderer.render(scene, camera);
    }
    frame();
    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      el.removeEventListener("pointerdown", down);
      el.removeEventListener("pointermove", move);
      el.removeEventListener("pointerup", up);
      el.removeEventListener("pointercancel", up);
      geometries.forEach((g) => g.dispose());
      mats.forEach((m) => m.dispose());
      texture?.dispose();
      renderer.dispose();
      el.replaceChildren();
    };
  }, []);
  return (
    <div
      className="scene"
      ref={host}
      aria-label="Interactive 3D spacecraft. Drag to rotate in the hangar."
    />
  );
}
