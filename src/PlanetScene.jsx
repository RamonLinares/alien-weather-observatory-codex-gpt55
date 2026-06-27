import React, { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { createRng, sampleFocus } from "./planetCatalog.js";

function hexToColor(hex) {
  return new THREE.Color(hex);
}

function mixColor(a, b, amount) {
  return hexToColor(a).lerp(hexToColor(b), amount);
}

function ridgeNoise(vector, seed, scale) {
  const x = vector.x * scale;
  const y = vector.y * scale;
  const z = vector.z * scale;
  const a = Math.sin(x * 2.17 + seed * 0.00013) * Math.cos(y * 2.73 - seed * 0.00009);
  const b = Math.sin((x + z) * 4.91 + seed * 0.00021) * 0.5;
  const c = Math.cos((y - z) * 7.33 + seed * 0.00017) * 0.25;
  const raw = (a + b + c + 1.75) / 3.5;

  return 1 - Math.abs(0.5 - raw) * 2;
}

function createPlanetMesh(planet) {
  const geometry = new THREE.IcosahedronGeometry(1.55, 5);
  const positions = geometry.attributes.position;
  const colors = [];
  const palette = planet.climate.palette;
  const temp = new THREE.Vector3();

  for (let index = 0; index < positions.count; index += 1) {
    temp.fromBufferAttribute(positions, index).normalize();
    const elevation = ridgeNoise(temp, planet.seed, planet.terrainScale);
    const fine = ridgeNoise(temp, planet.seed + 433, planet.terrainScale * 2.8) * 0.35;
    const lift = (elevation * 0.78 + fine) * planet.terrainLift;
    const radius = 1.48 + lift;
    temp.multiplyScalar(radius);
    positions.setXYZ(index, temp.x, temp.y, temp.z);

    let color;
    if (elevation < 0.34) {
      color = mixColor(palette.low, palette.mid, elevation / 0.34);
    } else if (elevation < 0.66) {
      color = mixColor(palette.mid, palette.high, (elevation - 0.34) / 0.32);
    } else {
      color = mixColor(palette.high, palette.peak, (elevation - 0.66) / 0.34);
    }

    color.offsetHSL(0, 0, (fine - 0.18) * 0.14);
    colors.push(color.r, color.g, color.b);
  }

  geometry.setAttribute("color", new THREE.Float32BufferAttribute(colors, 3));
  geometry.computeVertexNormals();

  const material = new THREE.MeshStandardMaterial({
    vertexColors: true,
    roughness: 0.82,
    metalness: 0.03,
    emissive: hexToColor(palette.low).multiplyScalar(0.025),
  });

  return new THREE.Mesh(geometry, material);
}

function createCloudBands(planet) {
  const group = new THREE.Group();
  const rng = createRng(planet.seed + 41);
  const material = new THREE.MeshBasicMaterial({
    color: planet.climate.palette.cloud,
    transparent: true,
    opacity: 0.28,
    depthWrite: false,
  });

  for (let index = 0; index < 5; index += 1) {
    const band = new THREE.Mesh(new THREE.TorusGeometry(1.62 + rng() * 0.05, 0.012, 6, 96), material.clone());
    band.material.opacity = 0.13 + rng() * 0.18;
    band.scale.set(1, 0.82 + rng() * 0.18, 1);
    band.rotation.set(planet.cloudTilt + rng() * 0.45, rng() * Math.PI, rng() * Math.PI);
    group.add(band);
  }

  return group;
}

function createWeatherField(planet) {
  const rng = createRng(planet.seed + 309);
  const geometry = new THREE.BufferGeometry();
  const count = 150;
  const positions = new Float32Array(count * 3);
  const speeds = new Float32Array(count);

  for (let index = 0; index < count; index += 1) {
    const radius = 1.86 + rng() * 0.5;
    const theta = rng() * Math.PI * 2;
    const phi = Math.acos(2 * rng() - 1);
    positions[index * 3] = radius * Math.sin(phi) * Math.cos(theta);
    positions[index * 3 + 1] = radius * Math.cos(phi);
    positions[index * 3 + 2] = radius * Math.sin(phi) * Math.sin(theta);
    speeds[index] = 0.25 + rng() * 0.75;
  }

  geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute("speed", new THREE.BufferAttribute(speeds, 1));

  const material = new THREE.PointsMaterial({
    color: planet.climate.palette.weather,
    size: 0.034,
    transparent: true,
    opacity: 0.58,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  });

  const points = new THREE.Points(geometry, material);
  points.userData.originalPositions = positions.slice();
  points.userData.speeds = speeds;
  return points;
}

function createStars(planet) {
  const rng = createRng(planet.seed + 89);
  const geometry = new THREE.BufferGeometry();
  const count = 90;
  const positions = new Float32Array(count * 3);

  for (let index = 0; index < count; index += 1) {
    positions[index * 3] = (rng() - 0.5) * 9;
    positions[index * 3 + 1] = (rng() - 0.1) * 5.5;
    positions[index * 3 + 2] = -3.8 - rng() * 3.5;
  }

  geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));

  return new THREE.Points(
    geometry,
    new THREE.PointsMaterial({
      color: planet.climate.palette.peak,
      size: 0.018,
      transparent: true,
      opacity: 0.6,
      depthWrite: false,
    }),
  );
}

function disposeObject(object) {
  object.traverse((child) => {
    if (child.geometry) {
      child.geometry.dispose();
    }

    if (child.material) {
      if (Array.isArray(child.material)) {
        child.material.forEach((material) => material.dispose());
      } else {
        child.material.dispose();
      }
    }
  });
}

function makeProbe(planet) {
  const group = new THREE.Group();
  const body = new THREE.Mesh(
    new THREE.SphereGeometry(0.055, 16, 16),
    new THREE.MeshStandardMaterial({
      color: planet.climate.palette.accent,
      emissive: planet.climate.palette.weather,
      emissiveIntensity: 0.28,
      roughness: 0.38,
    }),
  );
  const trail = new THREE.Mesh(
    new THREE.CylinderGeometry(0.01, 0.026, 0.44, 10),
    new THREE.MeshBasicMaterial({
      color: planet.climate.palette.weather,
      transparent: true,
      opacity: 0.42,
      depthWrite: false,
    }),
  );
  trail.rotation.x = Math.PI / 2;
  trail.position.z = 0.24;
  group.add(trail, body);
  return group;
}

export default function PlanetScene({
  planet,
  launchId,
  recenterId,
  onProbeComplete,
  onInspect,
}) {
  const hostRef = useRef(null);
  const canvasRef = useRef(null);
  const runtimeRef = useRef(null);
  const callbacksRef = useRef({ onProbeComplete, onInspect });
  const planetRef = useRef(planet);
  const dragRef = useRef({
    active: false,
    lastX: 0,
    lastY: 0,
    velocityX: 0,
    velocityY: 0,
    targetX: 0,
    targetY: 0,
  });
  const planetSeed = planet.seed;

  const sceneStyle = useMemo(
    () => ({
      "--scene-sky-top": planet.climate.palette.skyTop,
      "--scene-sky-mid": planet.climate.palette.skyMid,
      "--scene-sky-bottom": planet.climate.palette.skyBottom,
    }),
    [planet],
  );

  useEffect(() => {
    callbacksRef.current = { onProbeComplete, onInspect };
  }, [onProbeComplete, onInspect]);

  useEffect(() => {
    planetRef.current = planet;
  }, [planet]);

  useEffect(() => {
    const host = hostRef.current;
    const canvas = canvasRef.current;

    if (!host || !canvas) {
      return undefined;
    }

    const renderer = new THREE.WebGLRenderer({
      canvas,
      alpha: true,
      antialias: true,
      powerPreference: "high-performance",
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.7));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.shadowMap.enabled = false;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(36, 1, 0.1, 100);
    camera.position.set(0, 0.12, 6.1);

    const root = new THREE.Group();
    scene.add(root);
    scene.add(createStars(planet));

    const hemi = new THREE.HemisphereLight(planet.climate.palette.cloud, planet.climate.palette.low, 2.1);
    scene.add(hemi);

    const key = new THREE.DirectionalLight(planet.climate.palette.peak, 3.1);
    key.position.set(3.2, 2.5, 4.5);
    scene.add(key);

    const rim = new THREE.DirectionalLight(planet.climate.palette.atmosphere, 1.4);
    rim.position.set(-3.5, 1.2, -2);
    scene.add(rim);

    const resize = () => {
      const bounds = host.getBoundingClientRect();
      const width = Math.max(1, Math.floor(bounds.width));
      const height = Math.max(1, Math.floor(bounds.height));
      renderer.setSize(width, height, false);
      camera.aspect = width / height;
      camera.position.z = width < 520 ? 6.45 : 5.65;
      camera.updateProjectionMatrix();
    };

    const observer = new ResizeObserver(resize);
    observer.observe(host);
    resize();

    const runtime = {
      renderer,
      scene,
      camera,
      root,
      planetGroup: null,
      clouds: null,
      weather: null,
      probe: null,
      probeStart: 0,
      probeStartPosition: new THREE.Vector3(),
      probeControlPosition: new THREE.Vector3(),
      probeEndPosition: new THREE.Vector3(),
      frame: 0,
      lastInspect: 0,
      disposed: false,
      observer,
      resize,
    };
    runtimeRef.current = runtime;

    const pointerDown = (event) => {
      canvas.setPointerCapture(event.pointerId);
      dragRef.current.active = true;
      dragRef.current.lastX = event.clientX;
      dragRef.current.lastY = event.clientY;
      dragRef.current.velocityX = 0;
      dragRef.current.velocityY = 0;
    };

    const pointerMove = (event) => {
      if (!dragRef.current.active) {
        return;
      }

      const deltaX = event.clientX - dragRef.current.lastX;
      const deltaY = event.clientY - dragRef.current.lastY;
      dragRef.current.lastX = event.clientX;
      dragRef.current.lastY = event.clientY;
      dragRef.current.velocityX = deltaX * 0.006;
      dragRef.current.velocityY = deltaY * 0.0045;
      dragRef.current.targetY += deltaX * 0.006;
      dragRef.current.targetX += deltaY * 0.0045;
      dragRef.current.targetX = THREE.MathUtils.clamp(dragRef.current.targetX, -0.9, 0.9);
    };

    const pointerUp = (event) => {
      dragRef.current.active = false;
      if (canvas.hasPointerCapture(event.pointerId)) {
        canvas.releasePointerCapture(event.pointerId);
      }
    };

    canvas.addEventListener("pointerdown", pointerDown);
    canvas.addEventListener("pointermove", pointerMove);
    canvas.addEventListener("pointerup", pointerUp);
    canvas.addEventListener("pointercancel", pointerUp);

    const animate = (time) => {
      if (runtime.disposed) {
        return;
      }

      runtime.frame += 1;
      const drag = dragRef.current;
      const activePlanet = planetRef.current;

      if (!drag.active) {
        drag.targetY += activePlanet.spinRate;
        drag.targetY += drag.velocityX;
        drag.targetX += drag.velocityY;
        drag.velocityX *= 0.94;
        drag.velocityY *= 0.92;
        drag.targetX *= 0.985;
      }

      if (runtime.planetGroup) {
        runtime.planetGroup.rotation.y += (drag.targetY - runtime.planetGroup.rotation.y) * 0.08;
        runtime.planetGroup.rotation.x += (drag.targetX - runtime.planetGroup.rotation.x) * 0.08;
      }

      if (runtime.clouds) {
        runtime.clouds.rotation.y -= activePlanet.spinRate * 1.9;
        runtime.clouds.rotation.z = Math.sin(time * 0.00018 + activePlanet.particlePhase) * 0.08;
      }

      if (runtime.weather) {
        runtime.weather.rotation.y += activePlanet.spinRate * 3.3;
        runtime.weather.rotation.x = Math.sin(time * 0.00025 + activePlanet.particlePhase) * 0.11;
      }

      if (runtime.probe) {
        const elapsed = Math.min(1, (time - runtime.probeStart) / 1600);
        const eased = 1 - Math.pow(1 - elapsed, 3);
        const a = runtime.probeStartPosition.clone().lerp(runtime.probeControlPosition, eased);
        const b = runtime.probeControlPosition.clone().lerp(runtime.probeEndPosition, eased);
        runtime.probe.position.copy(a.lerp(b, eased));
        runtime.probe.rotation.y += 0.16;
        runtime.probe.rotation.x += 0.06;

        if (elapsed >= 1) {
          disposeObject(runtime.probe);
          scene.remove(runtime.probe);
          runtime.probe = null;
          callbacksRef.current.onProbeComplete?.();
        }
      }

      if (time - runtime.lastInspect > 480 && runtime.planetGroup) {
        runtime.lastInspect = time;
        const lat = THREE.MathUtils.radToDeg(Math.sin(runtime.planetGroup.rotation.x) * 0.9);
        const lon = THREE.MathUtils.radToDeg(runtime.planetGroup.rotation.y % (Math.PI * 2));
        callbacksRef.current.onInspect?.(sampleFocus(activePlanet, lat, lon));
      }

      renderer.render(scene, camera);
      requestAnimationFrame(animate);
    };

    requestAnimationFrame(animate);

    return () => {
      runtime.disposed = true;
      observer.disconnect();
      canvas.removeEventListener("pointerdown", pointerDown);
      canvas.removeEventListener("pointermove", pointerMove);
      canvas.removeEventListener("pointerup", pointerUp);
      canvas.removeEventListener("pointercancel", pointerUp);
      disposeObject(scene);
      renderer.dispose();
      runtimeRef.current = null;
    };
  }, []);

  useEffect(() => {
    const runtime = runtimeRef.current;

    if (!runtime) {
      return;
    }

    if (runtime.planetGroup) {
      runtime.root.remove(runtime.planetGroup);
      disposeObject(runtime.planetGroup);
    }

    const planetGroup = new THREE.Group();
    planetGroup.add(createPlanetMesh(planet));

    const atmosphere = new THREE.Mesh(
      new THREE.SphereGeometry(1.66, 48, 48),
      new THREE.MeshBasicMaterial({
        color: planet.climate.palette.atmosphere,
        transparent: true,
        opacity: 0.17,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
      }),
    );
    planetGroup.add(atmosphere);

    const clouds = createCloudBands(planet);
    const weather = createWeatherField(planet);
    planetGroup.add(clouds, weather);
    runtime.root.add(planetGroup);
    runtime.planetGroup = planetGroup;
    runtime.clouds = clouds;
    runtime.weather = weather;
    dragRef.current.targetX = 0.12;
    dragRef.current.targetY = 0.48;

    callbacksRef.current.onInspect?.(sampleFocus(planet, 10.2, 32.4));
  }, [planetSeed, planet]);

  useEffect(() => {
    if (!launchId) {
      return;
    }

    const runtime = runtimeRef.current;
    if (!runtime || runtime.probe) {
      return;
    }

    const rng = createRng(planet.seed + launchId * 227);
    const probe = makeProbe(planet);
    runtime.probeStart = performance.now();
    runtime.probeStartPosition.set(-2.35, -1.55, 1.1);
    runtime.probeControlPosition.set(-0.55 + rng() * 1.1, 1.25 + rng() * 0.7, 0.85);
    const theta = rng() * Math.PI * 2;
    const y = -0.6 + rng() * 1.2;
    const radius = Math.sqrt(Math.max(0.08, 1 - y * y));
    runtime.probeEndPosition.set(
      Math.cos(theta) * radius * 1.7,
      y * 1.7,
      Math.sin(theta) * radius * 1.7,
    );
    probe.position.copy(runtime.probeStartPosition);
    runtime.scene.add(probe);
    runtime.probe = probe;
  }, [launchId, planet]);

  useEffect(() => {
    if (!recenterId) {
      return;
    }

    dragRef.current.targetX = 0.12;
    dragRef.current.targetY = 0.48;
    dragRef.current.velocityX = 0;
    dragRef.current.velocityY = 0;
  }, [recenterId]);

  return (
    <div ref={hostRef} className="scene-host" style={sceneStyle}>
      <canvas ref={canvasRef} className="planet-canvas" aria-label={`3D planet ${planet.name}`} />
    </div>
  );
}
