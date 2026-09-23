import { useMemo, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Float, Environment } from "@react-three/drei";
import * as THREE from "three";

/* Wireframe globe representing the Indian railway network */
function NetworkGlobe() {
  const globeRef = useRef<THREE.Mesh>(null);
  const haloRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    if (globeRef.current) {
      globeRef.current.rotation.y = t * 0.18;
    }
    if (haloRef.current) {
      haloRef.current.rotation.y = -t * 0.1;
      haloRef.current.rotation.x = Math.sin(t * 0.3) * 0.2;
    }
  });

  const nodes = useMemo(() => {
    // Pseudo-random station nodes on the sphere surface
    const pts: THREE.Vector3[] = [];
    const golden = Math.PI * (3 - Math.sqrt(5));
    for (let i = 0; i < 40; i++) {
      const y = 1 - (i / 39) * 2;
      const r = Math.sqrt(1 - y * y);
      const theta = golden * i;
      pts.push(new THREE.Vector3(Math.cos(theta) * r, y, Math.sin(theta) * r).multiplyScalar(1.62));
    }
    return pts;
  }, []);

  return (
    <group rotation={[0.35, 0, -0.15]}>
      {/* Core sphere */}
      <mesh ref={globeRef}>
        <sphereGeometry args={[1.55, 48, 48]} />
        <meshStandardMaterial
          color="#0d1424"
          metalness={0.85}
          roughness={0.35}
          emissive="#12244f"
          emissiveIntensity={0.5}
        />
      </mesh>
      {/* Wire halo */}
      <mesh ref={haloRef} scale={1.06}>
        <sphereGeometry args={[1.55, 18, 18]} />
        <meshBasicMaterial color="#305fbd" wireframe transparent opacity={0.18} />
      </mesh>
      {/* Station nodes */}
      {nodes.map((p, i) => (
        <mesh key={i} position={p}>
          <sphereGeometry args={[0.032, 8, 8]} />
          <meshBasicMaterial color={i % 4 === 0 ? "#85a6e9" : "#2862d7"} />
        </mesh>
      ))}
      {/* Orbiting ring */}
      <mesh rotation={[Math.PI / 2.3, 0.4, 0]}>
        <torusGeometry args={[2.15, 0.012, 8, 96]} />
        <meshBasicMaterial color="#625fff" transparent opacity={0.5} />
      </mesh>
      <mesh rotation={[Math.PI / 1.8, -0.5, 0.3]}>
        <torusGeometry args={[2.45, 0.008, 8, 96]} />
        <meshBasicMaterial color="#ff7dda" transparent opacity={0.3} />
      </mesh>
    </group>
  );
}

export default function GlobeScene() {
  return (
    <div className="absolute inset-0" aria-hidden>
      <Canvas
        camera={{ position: [0, 0.4, 5.6], fov: 40 }}
        dpr={[1, 1.8]}
        gl={{ antialias: true, alpha: true }}
        style={{ background: "transparent" }}
      >
        <ambientLight intensity={0.4} />
        <pointLight position={[4, 3, 4]} intensity={1.2} color="#625fff" />
        <pointLight position={[-4, -2, 2]} intensity={0.6} color="#ff7dda" />
        <Float speed={1.4} rotationIntensity={0.3} floatIntensity={0.9}>
          <NetworkGlobe />
        </Float>
        <Environment preset="night" />
      </Canvas>
    </div>
  );
}
