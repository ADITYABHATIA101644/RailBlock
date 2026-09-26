import { useMemo, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Float } from "./Float";
import * as THREE from "three";

/* The REAL railway problem, told in 3D:
   - A running train travels the line, stops at a red signal before
     the maintenance block, waits, then is released.
   - Multi-aspect signal cycles red -> amber -> green.
   - Maintenance block zone: pulsing red danger pillars + amber barrier.
   - A freight train sits permanently DETAINED behind the block with a
     pulsing red beacon: the daily problem RailBlock AI solves.       */

const TRACK_LENGTH = 30;

function Track() {
  const sleepers = useMemo(
    () => Array.from({ length: 26 }, (_, i) => -TRACK_LENGTH / 2 + 1 + i * 1.15),
    [],
  );
  return (
    <group position={[0, -1.1, 0]}>
      {[-0.85, 0.85].map((x, i) => (
        <mesh key={i} position={[x, 0.08, 0]}>
          <boxGeometry args={[0.09, 0.16, TRACK_LENGTH]} />
          <meshStandardMaterial
            color="#8fa3c8"
            metalness={0.95}
            roughness={0.25}
            emissive="#2862d7"
            emissiveIntensity={0.3}
          />
        </mesh>
      ))}
      {sleepers.map((z, i) => (
        <mesh key={i} position={[0, 0, z]}>
          <boxGeometry args={[2.5, 0.07, 0.42]} />
          <meshStandardMaterial color="#151a26" metalness={0.6} roughness={0.55} />
        </mesh>
      ))}
    </group>
  );
}

function Train({
  color,
  speed,
  loopFrom,
  loopTo,
  stopAtZ,
  startDetained,
}: {
  color: string;
  speed: number;
  loopFrom: number;
  loopTo: number;
  stopAtZ?: number;
  startDetained?: boolean;
}) {
  const group = useRef<THREE.Group>(null);
  const engineMat = useRef<THREE.MeshStandardMaterial>(null);
  const beacon = useRef<THREE.Mesh>(null);
  const state = useRef({ z: loopFrom, detained: !!startDetained, resumeTimer: 0 });

  useFrame((st, delta) => {
    const g = group.current;
    if (!g) return;
    const s = state.current;

    if (!s.detained) {
      s.z -= speed * delta;
      if (stopAtZ !== undefined && s.z <= stopAtZ) {
        s.z = stopAtZ;
        s.detained = true;
        s.resumeTimer = 5 + Math.random() * 4;
      }
      if (s.z < loopTo) s.z = loopFrom;
    } else {
      s.resumeTimer -= delta;
      if (s.resumeTimer <= 0) s.detained = false;
    }
    g.position.z = s.z;

    if (engineMat.current) {
      const target = s.detained ? 0.55 : 0.12;
      engineMat.current.emissiveIntensity +=
        (target - engineMat.current.emissiveIntensity) * 0.1;
      engineMat.current.emissive.set(s.detained ? "#ef4444" : "#0b0c0e");
    }
    if (beacon.current) {
      beacon.current.visible = s.detained;
      const m = beacon.current.material as THREE.MeshBasicMaterial;
      m.opacity = 0.5 + Math.sin(st.clock.elapsedTime * 6) * 0.5;
    }
  });

  return (
    <group ref={group} position={[0, 0, loopFrom]}>
      <mesh position={[0, -0.72, 0.9]}>
        <boxGeometry args={[1.14, 0.62, 1.5]} />
        <meshStandardMaterial
          ref={engineMat}
          color={color}
          metalness={0.75}
          roughness={0.3}
          emissive="#0b0c0e"
          emissiveIntensity={0.12}
        />
      </mesh>
      <mesh position={[0, -0.72, 1.78]} rotation={[-0.5, 0, 0]}>
        <boxGeometry args={[1.15, 0.5, 0.42]} />
        <meshStandardMaterial color={color} metalness={0.75} roughness={0.3} />
      </mesh>
      <mesh position={[0, -0.68, 2.0]}>
        <sphereGeometry args={[0.07, 10, 10]} />
        <meshBasicMaterial color="#fff7cc" />
      </mesh>
      <pointLight position={[0, -0.6, 2.3]} color="#ffe9a8" intensity={1.4} distance={5} />
      {[0, 1, 2].map((i) => (
        <mesh key={i} position={[0, -0.74, -0.35 - i * 1.62]}>
          <boxGeometry args={[1.05, 0.56, 1.42]} />
          <meshStandardMaterial
            color="#121826"
            metalness={0.7}
            roughness={0.4}
            emissive="#12244f"
            emissiveIntensity={0.28}
          />
        </mesh>
      ))}
      <mesh ref={beacon} position={[0, -0.15, 0.9]} visible={!!startDetained}>
        <sphereGeometry args={[0.1, 10, 10]} />
        <meshBasicMaterial color="#ef4444" transparent opacity={0.8} toneMapped={false} />
      </mesh>
    </group>
  );
}

function Signal({ position }: { position: [number, number, number] }) {
  const red = useRef<THREE.MeshStandardMaterial>(null);
  const amber = useRef<THREE.MeshStandardMaterial>(null);
  const green = useRef<THREE.MeshStandardMaterial>(null);
  const lampLight = useRef<THREE.PointLight>(null);
  const phase = useRef(0);
  const timer = useRef(0);

  useFrame((_, delta) => {
    timer.current += delta;
    if (timer.current > 4) {
      timer.current = 0;
      phase.current = (phase.current + 1) % 3;
    }
    const p = phase.current;
    if (red.current) red.current.emissiveIntensity = p === 0 ? 3 : 0.12;
    if (amber.current) amber.current.emissiveIntensity = p === 1 ? 3 : 0.12;
    if (green.current) green.current.emissiveIntensity = p === 2 ? 3 : 0.12;
    if (lampLight.current) {
      lampLight.current.color.set(
        p === 0 ? "#ef4444" : p === 1 ? "#f59e0b" : "#22c55e",
      );
    }
  });

  const lamps = [
    { ref: red, color: "#ef4444", y: 2.08 },
    { ref: amber, color: "#f59e0b", y: 1.78 },
    { ref: green, color: "#22c55e", y: 1.48 },
  ];

  return (
    <group position={position}>
      <mesh position={[0, 0.85, 0]}>
        <cylinderGeometry args={[0.04, 0.055, 1.7, 8]} />
        <meshStandardMaterial color="#1a2233" metalness={0.85} roughness={0.35} />
      </mesh>
      <mesh position={[0, 1.78, 0]}>
        <boxGeometry args={[0.34, 0.98, 0.22]} />
        <meshStandardMaterial color="#0d1420" metalness={0.7} roughness={0.4} />
      </mesh>
      {lamps.map((lamp, i) => (
        <mesh key={i} position={[0, lamp.y, 0.13]}>
          <circleGeometry args={[0.085, 20]} />
          <meshStandardMaterial
            ref={lamp.ref}
            color="#050505"
            emissive={lamp.color}
            emissiveIntensity={0.12}
            toneMapped={false}
          />
        </mesh>
      ))}
      <pointLight
        ref={lampLight}
        position={[0, 1.78, 0.6]}
        color="#ef4444"
        intensity={0.9}
        distance={4}
      />
    </group>
  );
}

function BlockZone({ z = 6.5 }: { z?: number }) {
  const pillars = useRef<THREE.Group>(null);
  const barrier = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    pillars.current?.children.forEach((c, i) => {
      const mat = (c as THREE.Mesh).material as THREE.MeshStandardMaterial;
      mat.emissiveIntensity = 1.2 + Math.sin(t * 3 + i) * 0.8;
    });
    if (barrier.current) {
      barrier.current.position.y = -0.62 + Math.sin(t * 1.4) * 0.04;
    }
  });

  return (
    <group>
      <group ref={pillars}>
        {[-1.6, 1.6].map((x, i) => (
          <mesh key={i} position={[x, -0.75, z]}>
            <cylinderGeometry args={[0.07, 0.09, 0.85, 8]} />
            <meshStandardMaterial
              color="#2a0808"
              emissive="#ef4444"
              emissiveIntensity={1.4}
              metalness={0.5}
              roughness={0.5}
            />
          </mesh>
        ))}
      </group>
      <mesh ref={barrier} position={[0, -0.62, z]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.045, 0.045, 2.6, 10]} />
        <meshStandardMaterial
          color="#f59e0b"
          emissive="#f59e0b"
          emissiveIntensity={0.35}
          metalness={0.4}
          roughness={0.5}
        />
      </mesh>
      <mesh position={[0, -1.06, z]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[3.2, 2.4]} />
        <meshBasicMaterial color="#f59e0b" transparent opacity={0.09} />
      </mesh>
    </group>
  );
}

function DataStream() {
  const ref = useRef<THREE.Points>(null);
  const count = 140;
  const positions = useMemo(() => {
    const arr = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      arr[i * 3] = (Math.random() - 0.5) * 9;
      arr[i * 3 + 1] = Math.random() * 5 - 0.4;
      arr[i * 3 + 2] = -Math.random() * 24 + 4;
    }
    return arr;
  }, []);

  useFrame((state) => {
    if (!ref.current) return;
    const pos = ref.current.geometry.attributes.position as THREE.BufferAttribute;
    const t = state.clock.elapsedTime;
    for (let i = 0; i < count; i++) {
      const y = pos.getY(i) + 0.004 + (i % 5) * 0.0008;
      pos.setY(i, y > 4.5 ? -0.4 : y);
      pos.setX(i, pos.getX(i) + Math.sin(t + i) * 0.0004);
    }
    pos.needsUpdate = true;
  });

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial size={0.03} color="#85a6e9" transparent opacity={0.5} sizeAttenuation />
    </points>
  );
}

export default function RailwayScene() {
  return (
    <div className="absolute inset-0" aria-hidden>
      <Canvas
        camera={{ position: [3.2, 2.4, 6.5], fov: 42 }}
        dpr={[1, 1.8]}
        gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
        style={{ background: "transparent" }}
      >
        <fog attach="fog" args={["#0b0c0e", 10, 26]} />
        <ambientLight intensity={0.3} />
        <directionalLight position={[5, 7, 4]} intensity={0.55} color="#aebadf" />
        <directionalLight position={[-6, 3, -5]} intensity={0.35} color="#625fff" />

        <Track />

        {/* Passenger train — runs, stops at the signal before the block, then released */}
        <Train color="#1d4ed8" speed={2.6} loopFrom={13} loopTo={-14} stopAtZ={9.5} />

        {/* Freight train — permanently detained behind the block: the daily problem */}
        <Train
          color="#7f1d1d"
          speed={2.2}
          loopFrom={13}
          loopTo={-14}
          stopAtZ={12.2}
          startDetained
        />

        <Signal position={[-1.9, -1.1, 9.5]} />
        <Signal position={[1.9, -1.1, 9.5]} />
        <BlockZone z={6.5} />
        <DataStream />

        <mesh position={[0, -1.12, 0]} rotation={[-Math.PI / 2, 0, 0]} renderOrder={-1}>
          <circleGeometry args={[8, 32]} />
          <meshBasicMaterial
            transparent
            opacity={0.5}
            color="#000000"
            depthWrite={false}
          />
        </mesh>
        <hemisphereLight args={["#2862d7", "#0b0c0e", 0.5]} />

        <Float speed={1.2} rotationIntensity={0.4} floatIntensity={1}>
          <mesh position={[0, 2.6, -4]}>
            <icosahedronGeometry args={[0.55, 1]} />
            <meshStandardMaterial
              color="#0d172b"
              metalness={0.9}
              roughness={0.2}
              emissive="#305fbd"
              emissiveIntensity={0.6}
              flatShading
            />
          </mesh>
        </Float>
      </Canvas>
    </div>
  );
}
