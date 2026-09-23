import { useMemo, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Float, Environment, ContactShadows } from "@react-three/drei";
import * as THREE from "three";

/* Glowing railway track — two rails + sleepers, stretching to horizon */
function GlowingTrack() {
  const sleepers = useMemo(() => {
    const arr: { x: number; z: number }[] = [];
    for (let i = 0; i < 26; i++) {
      arr.push({ x: 0, z: -14 + i * 1.15 });
    }
    return arr;
  }, []);

  return (
    <group position={[0, -1.1, 0]}>
      {/* Rails */}
      {[-0.85, 0.85].map((x, i) => (
        <mesh key={i} position={[x, 0.08, 0]}>
          <boxGeometry args={[0.09, 0.16, 30]} />
          <meshStandardMaterial
            color="#8fa3c8"
            metalness={0.95}
            roughness={0.25}
            emissive="#2862d7"
            emissiveIntensity={0.35}
          />
        </mesh>
      ))}
      {/* Sleepers */}
      {sleepers.map((s, i) => (
        <mesh key={i} position={[s.x, 0, s.z]} rotation={[0, 0, 0]}>
          <boxGeometry args={[2.5, 0.07, 0.42]} />
          <meshStandardMaterial color="#151a26" metalness={0.6} roughness={0.55} />
        </mesh>
      ))}
      {/* Track glow line */}
      <mesh position={[0, 0.02, -2]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[2.6, 30]} />
        <meshBasicMaterial color="#2862d7" transparent opacity={0.08} />
      </mesh>
    </group>
  );
}

/* Levitating AI orb-train with pulsing energy */
function AITrain() {
  const bodyRef = useRef<THREE.Mesh>(null);
  const glowRef = useRef<THREE.PointLight>(null);
  const ringRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    if (bodyRef.current) {
      bodyRef.current.position.y = 0.9 + Math.sin(t * 1.2) * 0.18;
      bodyRef.current.rotation.y = t * 0.25;
    }
    if (ringRef.current) {
      ringRef.current.rotation.z = t * 0.8;
      ringRef.current.rotation.x = Math.PI / 2.4 + Math.sin(t * 0.5) * 0.15;
    }
    if (glowRef.current) {
      glowRef.current.intensity = 2.4 + Math.sin(t * 3) * 0.9;
    }
  });

  return (
    <group position={[0, 0, -3.5]}>
      {/* Core orb */}
      <mesh ref={bodyRef}>
        <icosahedronGeometry args={[0.72, 1]} />
        <meshStandardMaterial
          color="#0d172b"
          metalness={0.9}
          roughness={0.2}
          emissive="#305fbd"
          emissiveIntensity={0.55}
          flatShading
        />
      </mesh>
      {/* Wireframe shell */}
      <mesh ref={ringRef} scale={1.35}>
        <icosahedronGeometry args={[0.72, 0]} />
        <meshBasicMaterial color="#85a6e9" wireframe transparent opacity={0.35} />
      </mesh>
      {/* Inner light */}
      <pointLight ref={glowRef} color="#625fff" intensity={2.4} distance={7} />
      {/* Train nose light cone */}
      <mesh position={[0, -0.2, 1.4]} rotation={[Math.PI / 2, 0, 0]}>
        <coneGeometry args={[0.32, 2.2, 16, 1, true]} />
        <meshBasicMaterial color="#2862d7" transparent opacity={0.06} side={THREE.DoubleSide} />
      </mesh>
    </group>
  );
}

/* Signal posts with cycling lights */
function SignalLights() {
  const redRef = useRef<THREE.Mesh>(null);
  const greenRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    const cycle = (Math.sin(t * 0.9) + 1) / 2;
    if (redRef.current) {
      const mat = redRef.current.material as THREE.MeshStandardMaterial;
      mat.emissiveIntensity = 0.3 + cycle * 2.2;
    }
    if (greenRef.current) {
      const mat = greenRef.current.material as THREE.MeshStandardMaterial;
      mat.emissiveIntensity = 0.3 + (1 - cycle) * 2.2;
    }
  });

  const post = (x: number, z: number) => (
    <group position={[x, 0, z]}>
      <mesh position={[0, 0.75, 0]}>
        <cylinderGeometry args={[0.035, 0.05, 1.5, 8]} />
        <meshStandardMaterial color="#1a2233" metalness={0.8} roughness={0.4} />
      </mesh>
    </group>
  );

  return (
    <group>
      {/* Left signal */}
      {post(-2.6, -1.2)}
      <mesh ref={redRef} position={[-2.6, 1.32, -1.2]}>
        <sphereGeometry args={[0.085, 16, 16]} />
        <meshStandardMaterial color="#3d0a0a" emissive="#ef4444" emissiveIntensity={1.5} />
      </mesh>
      {/* Right signal */}
      {post(2.6, -1.2)}
      <mesh ref={greenRef} position={[2.6, 1.32, -1.2]}>
        <sphereGeometry args={[0.085, 16, 16]} />
        <meshStandardMaterial color="#0a2d12" emissive="#22c55e" emissiveIntensity={1.5} />
      </mesh>
    </group>
  );
}

/* Floating dark glass cubes — the unova aesthetic */
function FloatingCubes() {
  const cubes = useMemo(
    () => [
      { pos: [-3.4, 1.6, -2] as const, size: 0.55, speed: 1.1 },
      { pos: [3.5, 2.1, -4] as const, size: 0.7, speed: 0.8 },
      { pos: [-2.8, 2.6, -6] as const, size: 0.45, speed: 1.4 },
      { pos: [2.9, 1.2, -6.5] as const, size: 0.38, speed: 1.0 },
    ],
    [],
  );

  return (
    <>
      {cubes.map((c, i) => (
        <Float key={i} speed={c.speed} rotationIntensity={0.6} floatIntensity={1.4}>
          <mesh position={[c.pos[0], c.pos[1], c.pos[2]]}>
            <boxGeometry args={[c.size, c.size, c.size]} />
            <meshStandardMaterial
              color="#0e111b"
              metalness={0.9}
              roughness={0.15}
              emissive="#12244f"
              emissiveIntensity={0.4}
            />
          </mesh>
        </Float>
      ))}
    </>
  );
}

/* Data particles streaming along the track */
function DataStream() {
  const ref = useRef<THREE.Points>(null);
  const count = 160;

  const positions = useMemo(() => {
    const arr = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      arr[i * 3] = (Math.random() - 0.5) * 8;
      arr[i * 3 + 1] = Math.random() * 5 - 0.5;
      arr[i * 3 + 2] = -Math.random() * 22 + 4;
    }
    return arr;
  }, []);

  useFrame((state) => {
    if (!ref.current) return;
    const pos = ref.current.geometry.attributes.position as THREE.BufferAttribute;
    const t = state.clock.elapsedTime;
    for (let i = 0; i < count; i++) {
      const y = pos.getY(i) + 0.004 + (i % 5) * 0.0008;
      pos.setY(i, y > 4.5 ? -0.5 : y);
      // subtle x sway
      pos.setX(i, pos.getX(i) + Math.sin(t + i) * 0.0004);
    }
    pos.needsUpdate = true;
  });

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial size={0.035} color="#85a6e9" transparent opacity={0.55} sizeAttenuation />
    </points>
  );
}

export default function RailwayScene({ compact = false }: { compact?: boolean }) {
  return (
    <div className={compact ? "w-full h-full" : "absolute inset-0"} aria-hidden>
      <Canvas
        camera={{ position: [0, 1.6, 5.2], fov: 42 }}
        dpr={[1, 1.8]}
        gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
        style={{ background: "transparent" }}
      >
        <fog attach="fog" args={["#0b0c0e", 9, 24]} />
        <ambientLight intensity={0.25} />
        <directionalLight position={[4, 6, 3]} intensity={0.5} color="#aebadf" />
        <directionalLight position={[-5, 3, -4]} intensity={0.3} color="#625fff" />

        <GlowingTrack />
        <AITrain />
        <SignalLights />
        <FloatingCubes />
        <DataStream />

        <ContactShadows position={[0, -1.12, 0]} opacity={0.55} scale={14} blur={2.6} far={4} color="#000000" />
        <Environment preset="night" />
      </Canvas>
    </div>
  );
}
