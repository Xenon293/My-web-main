import { Canvas, useFrame } from "@react-three/fiber";
import { useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";

function readThemeColors() {
  const styles = getComputedStyle(document.documentElement);
  return {
    accent: styles.getPropertyValue("--accent").trim() || "#c87958",
    ink: styles.getPropertyValue("--ink").trim() || "#171815",
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

function TerrainScene() {
  const terrain = useRef(null);
  const orb = useRef(null);
  const pointer = useRef({ x: 0, y: 0 });
  const colors = useThemeColors();
  const geometry = useMemo(() => {
    const plane = new THREE.PlaneGeometry(12, 8, 28, 18);
    const positions = plane.attributes.position;
    for (let index = 0; index < positions.count; index += 1) {
      const x = positions.getX(index);
      const y = positions.getY(index);
      const height = Math.sin(x * 1.15) * .18 + Math.cos(y * 1.45) * .14 + Math.sin((x + y) * .7) * .12;
      positions.setZ(index, height);
    }
    positions.needsUpdate = true;
    plane.computeVertexNormals();
    return plane;
  }, []);

  useEffect(() => () => geometry.dispose(), [geometry]);
  useEffect(() => {
    const updatePointer = (event) => {
      pointer.current.x = THREE.MathUtils.clamp(event.clientX / window.innerWidth * 2 - 1, -1, 1);
      pointer.current.y = THREE.MathUtils.clamp(event.clientY / window.innerHeight * 2 - 1, -1, 1);
    };
    const resetPointer = () => {
      pointer.current.x = 0;
      pointer.current.y = 0;
    };
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
    if (!terrain.current || !orb.current) return;
    const elapsed = state.clock.elapsedTime;

    terrain.current.rotation.y = THREE.MathUtils.damp(terrain.current.rotation.y, pointer.current.x * .07, 2.8, delta);
    terrain.current.rotation.x = THREE.MathUtils.damp(terrain.current.rotation.x, pointer.current.y * .035, 2.8, delta);
    terrain.current.position.y = THREE.MathUtils.damp(
      terrain.current.position.y,
      -.55 + Math.sin(elapsed * .28) * .018,
      2.4,
      delta,
    );

    orb.current.position.x = THREE.MathUtils.damp(orb.current.position.x, 1.4 + pointer.current.x * .22, 3.2, delta);
    orb.current.position.y = THREE.MathUtils.damp(
      orb.current.position.y,
      .8 - pointer.current.y * .14 + Math.sin(elapsed * .38) * .045,
      3.2,
      delta,
    );
    orb.current.rotation.y += delta * .045;
  });

  return (
    <group position={[2.2, 0, 0]}>
      <group ref={terrain} position={[0, -.55, 0]}>
        <mesh geometry={geometry} rotation={[-Math.PI / 2.8, 0, -.2]} position={[0, -1.15, -1.2]}>
          <meshBasicMaterial color={colors.ink} wireframe transparent opacity={.14} />
        </mesh>
      </group>
      <ambientLight intensity={1.15} />
      <pointLight position={[2.7, 2.8, 3.6]} color={colors.accent} intensity={5.5} distance={7} />
      <group ref={orb} position={[1.4, .8, .4]}>
        <mesh position={[0, 0, -.18]} scale={1.36}>
          <sphereGeometry args={[.72, 32, 24]} />
          <meshBasicMaterial color={colors.accent} transparent opacity={.055} depthWrite={false} />
        </mesh>
        <mesh>
          <sphereGeometry args={[.72, 40, 28]} />
          <meshPhysicalMaterial
            color={colors.accent}
            roughness={.2}
            metalness={0}
            transparent
            opacity={.72}
            transmission={.18}
            thickness={.35}
            clearcoat={.8}
            clearcoatRoughness={.18}
            emissive={colors.accent}
            emissiveIntensity={.025}
          />
        </mesh>
        <mesh position={[-.2, .22, .58]} scale={.13}>
          <sphereGeometry args={[.72, 20, 14]} />
          <meshBasicMaterial color="#ffffff" transparent opacity={.3} depthWrite={false} />
        </mesh>
      </group>
    </group>
  );
}

export default function HeroScene() {
  return (
    <Canvas
      camera={{ position: [0, 1.1, 6.8], fov: 42 }}
      dpr={[1, 1.5]}
      gl={{ alpha: true, antialias: false, powerPreference: "low-power" }}
      style={{ background: "transparent" }}
    >
      <TerrainScene />
    </Canvas>
  );
}
