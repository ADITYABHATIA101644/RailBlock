import { Suspense, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Float } from "./Float";
import { Activity, Boxes, Gauge, Layers, Radio, Timer, Waves, Zap } from "lucide-react";
import * as THREE from "three";

/**
 * ScrollDepthScenes — three additional viewport-gated 3D moments for the
 * lower half of the landing page. Everything here is additive; the existing
 * landing content stays untouched. Each scene only starts after its wrapper
 * enters the viewport, so the page still loads fast.
 */

function SceneFallback({ label }: { label: string }) {
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
      <div className="h-12 w-12 animate-pulse rounded-full border border-[#625fff]/50 bg-[#625fff]/10 shadow-[0_0_32px_rgba(98,95,255,0.35)]" />
      <span className="text-[10px] font-mono uppercase tracking-[0.24em] text-[#85a6e9]">{label}</span>
    </div>
  );
}

function LazyScene({ label, children }: { label: string; children: ReactNode }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const node = containerRef.current;
    if (!node || typeof IntersectionObserver === "undefined") {
      setInView(true);
      return;
    }
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1 },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={containerRef} className="absolute inset-0">
      {inView ? (
        <Suspense fallback={<SceneFallback label={label} />}>
          {children}
        </Suspense>
      ) : (
        <SceneFallback label={label} />
      )}
    </div>
  );
}

function SceneCanvas({ children, camera }: { children: ReactNode; camera: [number, number, number] }) {
  return (
    <Canvas
      camera={{ position: camera, fov: 40 }}
      dpr={[1, 1.6]}
      gl={{ alpha: true, antialias: true, powerPreference: "low-power" }}
      style={{ background: "transparent" }}
    >
      <ambientLight intensity={0.5} />
      {children}
    </Canvas>
  );
}

/* ── Scene 1: Track through maintenance block with travelling machine ── */

function BlockMachine() {
  const machine = useRef<THREE.Group>(null);
  const spark = useRef<THREE.Mesh>(null);
  const pillars = useMemo(
    () => [-1.7, 1.7].map((x) => x),
    [],
  );

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    if (machine.current) {
      // Travels back and forth along the block like a tamping machine
      machine.current.position.x = Math.sin(t * 0.35) * 2.2;
      machine.current.rotation.z = Math.sin(t * 6) * 0.01;
    }
    if (spark.current) {
      const pulse = 0.65 + Math.sin(t * 9) * 0.35;
      spark.current.scale.setScalar(pulse);
      (spark.current.material as THREE.MeshBasicMaterial).opacity = pulse * 0.85;
    }
  });

  return (
    <group position={[0, -0.6, 0]}>
      {/* Rails */}
      {[-0.85, 0.85].map((x, i) => (
        <mesh key={i} position={[x, 0, 0]}>
          <boxGeometry args={[0.07, 0.12, 9]} />
          <meshStandardMaterial color="#8fa3c8" metalness={0.95} roughness={0.25} emissive="#2862d7" emissiveIntensity={0.4} />
        </mesh>
      ))}
      {/* Sleepers */}
      {Array.from({ length: 13 }, (_, i) => (
        <mesh key={`s${i}`} position={[0, -0.08, -4 + i * 0.65]}>
          <boxGeometry args={[2.4, 0.07, 0.34]} />
          <meshStandardMaterial color="#151a26" roughness={0.6} />
        </mesh>
      ))}
      {/* Red block pillars */}
      {pillars.map((x, i) => (
        <mesh key={`p${i}`} position={[x, 0.35, 1.4]}>
          <cylinderGeometry args={[0.06, 0.08, 0.7, 8]} />
          <meshStandardMaterial color="#2a0808" emissive="#ef4444" emissiveIntensity={1.4} />
        </mesh>
      ))}
      {/* Tamping machine */}
      <group ref={machine}>
        <mesh position={[0, 0.42, 0]}>
          <boxGeometry args={[1.5, 0.6, 1.1]} />
          <meshStandardMaterial color="#f59e0b" metalness={0.6} roughness={0.4} emissive="#f59e0b" emissiveIntensity={0.25} />
        </mesh>
        <mesh position={[0, 0.95, -0.2]}>
          <boxGeometry args={[0.8, 0.5, 0.7]} />
          <meshStandardMaterial color="#0e172b" metalness={0.7} roughness={0.35} />
        </mesh>
        <mesh ref={spark} position={[0, 0.12, 0.7]}>
          <sphereGeometry args={[0.16, 12, 12]} />
          <meshBasicMaterial color="#fff7cc" transparent opacity={0.8} toneMapped={false} />
        </mesh>
        <pointLight position={[0, 0.4, 1]} color="#ffe9a8" intensity={1.1} distance={4} />
      </group>
    </group>
  );
}

/* ── Scene 2: Vertical data helix with orbiting packet rings ── */

function DataHelix() {
  const helix = useRef<THREE.Group>(null);
  const innerRing = useRef<THREE.Mesh>(null);
  const outerRing = useRef<THREE.Mesh>(null);

  const points = useMemo(() => {
    const pts: [number, number, number][] = [];
    for (let i = 0; i <= 60; i++) {
      const t = i / 60;
      const y = (t - 0.5) * 3.4;
      pts.push([Math.cos(t * Math.PI * 6) * 0.85, y, Math.sin(t * Math.PI * 6) * 0.85]);
    }
    return pts;
  }, []);

  const lineGeom = useMemo(() => {
    const geom = new THREE.BufferGeometry().setFromPoints(points.map((p) => new THREE.Vector3(...p)));
    return geom;
  }, [points]);

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    if (helix.current) {
      helix.current.rotation.y = t * 0.3;
    }
    if (innerRing.current) {
      innerRing.current.rotation.z = -t * 0.5;
      innerRing.current.position.y = Math.sin(t * 0.8) * 0.5;
    }
    if (outerRing.current) {
      outerRing.current.rotation.z = t * 0.35;
      outerRing.current.position.y = Math.cos(t * 0.7) * 0.6;
    }
  });

  return (
    <group>
      <group ref={helix}>
        <primitive object={lineGeom} attach="geometry" />
        <line>
          <primitive object={lineGeom} attach="geometry" />
          <lineBasicMaterial color="#625fff" transparent opacity={0.75} />
        </line>
        {points.filter((_, i) => i % 4 === 0).map((p, i) => (
          <mesh key={i} position={p}>
            <sphereGeometry args={[0.045, 10, 10]} />
            <meshBasicMaterial color={i % 3 === 0 ? "#ff7dda" : "#85a6e9"} toneMapped={false} />
          </mesh>
        ))}
      </group>
      <mesh ref={innerRing} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[1.05, 0.012, 6, 72]} />
        <meshBasicMaterial color="#85a6e9" transparent opacity={0.6} />
      </mesh>
      <mesh ref={outerRing} rotation={[Math.PI / 1.8, 0.3, 0]}>
        <torusGeometry args={[1.35, 0.01, 6, 72]} />
        <meshBasicMaterial color="#ff7dda" transparent opacity={0.4} />
      </mesh>
      <pointLight position={[0, 1.5, 2.5]} intensity={1} color="#625fff" distance={7} />
    </group>
  );
}

/* ── Scene 3: Floating glass control ring with orbiting gauge pods ── */

function ControlRing() {
  const ring = useRef<THREE.Group>(null);
  const pods = useMemo(
    () => [
      { angle: 0, color: "#2862d7", size: 0.16 },
      { angle: 1.3, color: "#f59e0b", size: 0.12 },
      { angle: 2.4, color: "#22c55e", size: 0.13 },
      { angle: 3.6, color: "#ff7dda", size: 0.11 },
      { angle: 4.8, color: "#85a6e9", size: 0.14 },
    ],
    [],
  );

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    if (ring.current) {
      ring.current.rotation.y = t * 0.22;
      ring.current.rotation.x = Math.sin(t * 0.3) * 0.2;
    }
  });

  return (
    <group ref={ring}>
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[1.5, 0.05, 12, 96]} />
        <meshStandardMaterial color="#12244f" metalness={0.9} roughness={0.25} emissive="#305fbd" emissiveIntensity={0.5} />
      </mesh>
      {pods.map((pod, i) => {
        const x = Math.cos(pod.angle) * 1.5;
        const z = Math.sin(pod.angle) * 1.5;
        return (
          <Float key={i} speed={1.6 + i * 0.1} floatIntensity={0.25}>
            <group position={[x, Math.sin(i * 1.7) * 0.22, z]}>
              <mesh>
                <boxGeometry args={[pod.size * 2, pod.size * 2, pod.size * 2]} />
                <meshStandardMaterial color={pod.color} emissive={pod.color} emissiveIntensity={0.8} metalness={0.5} roughness={0.3} />
              </mesh>
              <mesh scale={1.35}>
                <boxGeometry args={[pod.size * 2, pod.size * 2, pod.size * 2]} />
                <meshBasicMaterial color={pod.color} transparent opacity={0.14} />
              </mesh>
            </group>
          </Float>
        );
      })}
      <mesh>
        <icosahedronGeometry args={[0.5, 1]} />
        <meshStandardMaterial color="#0d172b" emissive="#2862d7" emissiveIntensity={0.7} metalness={0.9} roughness={0.2} flatShading />
      </mesh>
      <pointLight position={[2, 2, 2]} intensity={1.1} color="#85a6e9" distance={7} />
    </group>
  );
}

const sceneMeta = {
  machine: { icon: Zap, title: "Autonomous maintenance machine", tag: "BLOCK 142/6", desc: "A tamping unit works the track inside the granted block window while signals hold traffic — zero unscheduled detention." },
  helix: { icon: Waves, title: "Live network data helix", tag: "TELEMETRY", desc: "Every axle counter, sensor and asset report streams into one rotating model of the section." },
  control: { icon: Gauge, title: "Predictive control ring", tag: "AI CORE", desc: "Orbiting pods are live optimizers balancing traffic, asset health and crew readiness in real time." },
} as const;

type SceneId = keyof typeof sceneMeta;

function SceneCard({ id, children, camera, height, accent }: { id: SceneId; children: ReactNode; camera: [number, number, number]; height: number; accent: string }) {
  const meta = sceneMeta[id];
  const Icon = meta.icon;
  return (
    <article className="relative overflow-hidden rounded-3xl border border-[#172540] bg-[#0e111b]/85 shadow-2xl" style={{ minHeight: height }}>
      <div className="pointer-events-none absolute inset-0 opacity-60" style={{ background: `radial-gradient(60% 60% at 50% 0%, ${accent}22, transparent 70%)` }} />
      <div className="relative z-10 flex items-start justify-between p-5">
        <div>
          <div className="flex items-center gap-2 text-[10px] font-mono uppercase tracking-[0.22em]" style={{ color: accent }}>
            <Icon className="h-3.5 w-3.5" /> {meta.tag}
          </div>
          <h3 className="mt-2 max-w-xs text-xl font-semibold text-white">{meta.title}</h3>
          <p className="mt-2 max-w-sm text-xs leading-relaxed text-[#abaebb]">{meta.desc}</p>
        </div>
        <span className="flex items-center gap-1.5 rounded-full border border-emerald-400/25 bg-emerald-400/10 px-2.5 py-1 text-[9px] font-semibold text-emerald-300">
          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-400" /> 3D LIVE
        </span>
      </div>
      <LazyScene label={`loading ${meta.tag.toLowerCase()}`}>
        <SceneCanvas camera={camera}>
          {children}
        </SceneCanvas>
      </LazyScene>
      <div className="absolute bottom-4 left-5 right-5 z-10 flex items-center justify-between rounded-xl border border-[#172540] bg-[#0b0c0e]/75 px-3 py-2 backdrop-blur-md">
        <span className="flex items-center gap-2 text-[10px] uppercase tracking-widest text-[#3c3f44]">
          <Radio className="h-3 w-3" style={{ color: accent }} /> railblock twin
        </span>
        <span className="font-mono text-[10px] text-[#85a6e9]">60 FPS · WEBGL</span>
      </div>
    </article>
  );
}

export default function ScrollDepthScenes() {
  return (
    <section className="relative overflow-hidden bg-[#0b0c0e] px-6 py-24" aria-label="Immersive 3D operations showcase">
      <div className="pointer-events-none absolute inset-0" style={{ background: "radial-gradient(50% 40% at 20% 10%, rgba(98,95,255,0.12), transparent 70%), radial-gradient(45% 45% at 85% 80%, rgba(255,125,218,0.1), transparent 70%)" }} />
      <div className="relative z-10 mx-auto max-w-7xl">
        <div className="mb-12 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div className="max-w-2xl">
            <div className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.25em] text-[#85a6e9]">
              <Layers className="h-4 w-4" /> scroll deeper · three more worlds
            </div>
            <h2 className="text-3xl font-bold text-white md:text-4xl">Every layer of the railway, rendered live.</h2>
            <p className="mt-4 text-sm leading-relaxed text-[#abaebb] md:text-base">
              Continue scrolling: machines on the track, telemetry in motion and the AI core that keeps it all synchronized — each one a live 3D model, not a screenshot.
            </p>
          </div>
          <div className="flex items-center gap-2 rounded-full border border-[#24375a] bg-[#0e111b]/80 px-4 py-2 backdrop-blur-xl">
            <Activity className="h-3.5 w-3.5 text-[#85a6e9]" />
            <span className="font-mono text-[10px] tracking-[0.18em] text-[#abaebb]">SCROLL LINKED · GPU SAFE</span>
            <Timer className="h-3.5 w-3.5 text-[#ff7dda]" />
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          <SceneCard id="machine" camera={[0, 1.4, 5.4]} height={420} accent="#f59e0b">
            <BlockMachine />
          </SceneCard>
          <SceneCard id="helix" camera={[0, 0.3, 4.9]} height={420} accent="#625fff">
            <DataHelix />
          </SceneCard>
          <SceneCard id="control" camera={[0, 0.9, 4.6]} height={420} accent="#ff7dda">
            <ControlRing />
          </SceneCard>
        </div>

        <div className="mt-8 flex items-center justify-center gap-2 text-[10px] font-mono uppercase tracking-[0.25em] text-[#3c3f44]">
          <Boxes className="h-3.5 w-3.5" /> scenes mount only when visible — zero idle GPU cost
        </div>
      </div>
    </section>
  );
}
