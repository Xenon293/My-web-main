import { Canvas, useFrame } from "@react-three/fiber";
import { useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";

function readThemeColors() {
  const styles = getComputedStyle(document.documentElement);
  return {
    accent: styles.getPropertyValue("--accent").trim() || "#c87958",
    ink: styles.getPropertyValue("--ink").trim() || "#171815",
    paper: styles.getPropertyValue("--paper").trim() || "#f4f1ea",
  };
}

function useThemeColors() {
  const [colors, setColors] = useState(readThemeColors);
  useEffect(() => {
    const observer = new MutationObserver(() => setColors(readThemeColors()));
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
    return () => observer.disconnect();
  }, []);
  return colors;
}

function seededRandom(seed) {
  let value = seed;
  return () => {
    value = Math.imul(value ^ (value >>> 15), value | 1);
    value ^= value + Math.imul(value ^ (value >>> 7), value | 61);
    return ((value ^ (value >>> 14)) >>> 0) / 4294967296;
  };
}

function createStarField(count, seed, depth) {
  const random = seededRandom(seed);
  const positions = new Float32Array(count * 3);
  for (let index = 0; index < count; index += 1) {
    const offset = index * 3;
    positions[offset] = -1.4 + random() * 8.6;
    positions[offset + 1] = -3.2 + random() * 6.4;
    positions[offset + 2] = depth - random() * 1.8;
  }
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  return geometry;
}

function PixelStars({ count, seed, depth, color, opacity, size }) {
  const geometry = useMemo(() => createStarField(count, seed, depth), [count, seed, depth]);
  useEffect(() => () => geometry.dispose(), [geometry]);
  return (
    <points geometry={geometry}>
      <pointsMaterial color={color} opacity={opacity} transparent depthWrite={false} size={size} sizeAttenuation toneMapped={false} />
    </points>
  );
}

function PixelPlanet({ colors }) {
  return (
    <group position={[2.15, .42, -.15]} rotation={[.12, -.18, -.08]}>
      <mesh>
        <sphereGeometry args={[.63, 12, 8]} />
        <meshStandardMaterial color={colors.accent} roughness={.9} flatShading />
      </mesh>
      <mesh position={[-.2, .15, .57]} scale={[.18, .1, .06]}>
        <boxGeometry />
        <meshBasicMaterial color={colors.paper} transparent opacity={.42} />
      </mesh>
      <mesh rotation={[Math.PI / 2.25, .08, 0]}>
        <torusGeometry args={[.9, .035, 4, 32]} />
        <meshBasicMaterial color={colors.ink} transparent opacity={.38} />
      </mesh>
      <mesh position={[1.35, .72, -.7]}>
        <sphereGeometry args={[.14, 6, 4]} />
        <meshBasicMaterial color={colors.ink} transparent opacity={.58} />
      </mesh>
    </group>
  );
}

function GalaxyScene() {
  const farStars = useRef(null);
  const nearStars = useRef(null);
  const celestial = useRef(null);
  const shootingStar = useRef(null);
  const shootingMaterial = useRef(null);
  const pointer = useRef({ x: 0, y: 0 });
  const colors = useThemeColors();

  useEffect(() => {
    const updatePointer = (event) => {
      pointer.current.x = THREE.MathUtils.clamp(event.clientX / window.innerWidth * 2 - 1, -1, 1);
      pointer.current.y = THREE.MathUtils.clamp(event.clientY / window.innerHeight * 2 - 1, -1, 1);
    };
    const resetPointer = () => { pointer.current = { x: 0, y: 0 }; };
    window.addEventListener("pointermove", updatePointer, { passive: true });
    document.documentElement.addEventListener("pointerleave", resetPointer);
    window.addEventListener("blur", resetPointer);
    return () => {
      window.removeEventListener("pointermove", updatePointer);
      document.documentElement.removeEventListener("pointerleave", resetPointer);
      window.removeEventListener("blur", resetPointer);
    };
  }, []);

  useFrame((state, delta) => {
    if (!farStars.current || !nearStars.current || !celestial.current) return;
    farStars.current.position.x = THREE.MathUtils.damp(farStars.current.position.x, pointer.current.x * .06, 2.2, delta);
    farStars.current.position.y = THREE.MathUtils.damp(farStars.current.position.y, -pointer.current.y * .035, 2.2, delta);
    nearStars.current.position.x = THREE.MathUtils.damp(nearStars.current.position.x, pointer.current.x * .16, 2.8, delta);
    nearStars.current.position.y = THREE.MathUtils.damp(nearStars.current.position.y, -pointer.current.y * .1, 2.8, delta);
    celestial.current.position.x = THREE.MathUtils.damp(celestial.current.position.x, pointer.current.x * .24, 3, delta);
    celestial.current.position.y = THREE.MathUtils.damp(celestial.current.position.y, -pointer.current.y * .14, 3, delta);
    celestial.current.rotation.y += delta * .035;

    if (shootingStar.current && shootingMaterial.current) {
      const cycle = state.clock.elapsedTime % 13;
      const active = cycle > 9.8 && cycle < 10.9;
      const progress = THREE.MathUtils.clamp((cycle - 9.8) / 1.1, 0, 1);
      shootingStar.current.visible = active;
      shootingStar.current.position.set(3.8 - progress * 3.2, 2.35 - progress * 1.35, .2);
      shootingMaterial.current.opacity = active ? Math.sin(progress * Math.PI) * .5 : 0;
    }
  });

  return (
    <group position={[1.5, 0, 0]}>
      <group ref={farStars}>
        <PixelStars count={72} seed={7283} depth={-2.8} color={colors.ink} opacity={.32} size={.042} />
      </group>
      <group ref={nearStars}>
        <PixelStars count={42} seed={1947} depth={-.8} color={colors.accent} opacity={.58} size={.062} />
        <PixelStars count={24} seed={5119} depth={.1} color={colors.ink} opacity={.64} size={.078} />
      </group>
      <ambientLight intensity={1.45} />
      <directionalLight position={[3, 4, 5]} color={colors.paper} intensity={1.2} />
      <group ref={celestial}><PixelPlanet colors={colors} /></group>
      <group ref={shootingStar} visible={false} rotation={[0, 0, -.38]}>
        <mesh scale={[.7, .025, .025]}>
          <boxGeometry />
          <meshBasicMaterial ref={shootingMaterial} color={colors.accent} transparent opacity={0} depthWrite={false} />
        </mesh>
        <mesh position={[.38, 0, 0]} scale={.07}>
          <boxGeometry />
          <meshBasicMaterial color={colors.paper} />
        </mesh>
      </group>
    </group>
  );
}

export default function HeroScene() {
  return (
    <Canvas
      camera={{ position: [0, .25, 7], fov: 42 }}
      dpr={[1, 1.5]}
      gl={{ alpha: true, antialias: false, powerPreference: "low-power" }}
      style={{ background: "transparent" }}
    >
      <GalaxyScene />
    </Canvas>
  );
}
