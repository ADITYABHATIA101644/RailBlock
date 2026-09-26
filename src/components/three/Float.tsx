import { useRef, type ReactNode } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

/**
 * Minimal local replacement for drei's <Float>.
 * Gently bobs and rotates its children every frame — same props as the drei
 * version we used (speed, rotationIntensity, floatIntensity), so call sites
 * only change their import.
 */
export function Float({
  children,
  speed = 1,
  rotationIntensity = 1,
  floatIntensity = 1,
}: {
  children: ReactNode;
  speed?: number;
  rotationIntensity?: number;
  floatIntensity?: number;
}) {
  const ref = useRef<THREE.Group>(null);
  const offset = useRef(Math.random() * 100);

  useFrame((state) => {
    const g = ref.current;
    if (!g) return;
    const t = state.clock.elapsedTime * speed + offset.current;
    g.position.y = Math.sin(t) * 0.1 * floatIntensity;
    g.rotation.x = Math.sin(t * 0.6) * 0.15 * rotationIntensity;
    g.rotation.y = Math.cos(t * 0.4) * 0.15 * rotationIntensity;
    g.rotation.z = Math.sin(t * 0.5) * 0.05 * rotationIntensity;
  });

  return <group ref={ref}>{children}</group>;
}

export default Float;
