import { Canvas, useFrame } from "@react-three/fiber";
import { Float } from "@react-three/drei";
import { Suspense, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { Activity, Box, ChevronRight, CircleDot, Network, Orbit, Radio, ScanLine, Sparkles } from "lucide-react";
import * as THREE from "three";
import { useInView } from "react-intersection-observer";

/**
 * ImmersiveNetworkLab is intentionally mounted after the existing landing-page
 * content. Each canvas waits for its card to enter the viewport so the landing
 * page still paints quickly on slower devices.
 */
function SceneFallback({ label }: { label: string }) {
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-[#0b0c0e]/60">
      <div className="h-12 w-12 animate-pulse rounded-full border border-[#625fff]/50 bg-[#625fff]/10 shadow-[0_0_32px_rgba(98,95,255,0.35)]" />
      <span className="text-[10px] font-mono uppercase tracking-[0.24em] text-[#85a6e9]">{label}</span>
    </div>
  );
}

function LazyScene({ label, children }: { label: string; children: ReactNode }) {
  const { ref, inView } = useInView({ threshold: 0.12, triggerOnce: true });
  return (
    <div ref={ref} className="absolute inset-0">
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

function NetworkField() {
  const group = useRef<THREE.Group>(null);
  const ring = useRef<THREE.Mesh>(null);
  const nodes = useMemo(() => {
    return Array.from({ length: 18 }, (_, i) => {
      const angle = (i / 18) * Math.PI * 2;
      const radius = 1.8 + ((i * 7) % 4) * 0.16;
      return {
        position: [Math.cos(angle) * radius, Math.sin(angle * 1.7) * 0.55, Math.sin(angle) * radius] as [number, number, number],
        scale: 0.06 + (i % 3) * 0.025,
        color: i % 4 === 0 ? "#ff7dda" : i % 3 === 0 ? "#85a6e9" : "#2862d7",
      };
    });
  }, []);

  useFrame((state) => {
    const time = state.clock.elapsedTime;
    if (group.current) {
      group.current.rotation.y = time * 0.14;
      group.current.rotation.x = Math.sin(time * 0.35) * 0.08;
    }
    if (ring.current) {
      ring.current.rotation.z = time * 0.18;
    }
  });

  return (
    <group ref={group}>
      <mesh ref={ring} rotation={[Math.PI / 2.8, 0.2, 0]}>
        <torusGeometry args={[2.05, 0.018, 8, 96]} />
        <meshBasicMaterial color="#625fff" transparent opacity={0.48} />
      </mesh>
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[1.58, 0.01, 6, 64]} />
        <meshBasicMaterial color="#24375a" transparent opacity={0.75} />
      </mesh>
      <mesh>
        <icosahedronGeometry args={[0.52, 1]} />
        <meshStandardMaterial color="#0d172b" emissive="#305fbd" emissiveIntensity={0.8} metalness={0.9} roughness={0.2} />
      </mesh>
      {nodes.map((node, index) => (
        <Float key={index} speed={1.2 + index * 0.03} floatIntensity={0.3} rotationIntensity={0.2}>
          <mesh position={node.position} scale={node.scale / 0.06}>
            <sphereGeometry args={[node.scale * 42, 10, 10]} />
            <meshBasicMaterial color={node.color} toneMapped={false} />
          </mesh>
        </Float>
      ))}
      <pointLight position={[2, 2, 3]} intensity={1.5} color="#625fff" distance={8} />
      <pointLight position={[-3, -1, 2]} intensity={0.8} color="#ff7dda" distance={7} />
    </group>
  );
}

function BlockWindow() {
  const blocks = useRef<THREE.Group>(null);
  const barrier = useRef<THREE.Mesh>(null);
  const bars = useMemo(
    () => [
      { x: -0.9, z: -0.2, h: 0.9, color: "#ef4444" },
      { x: 0, z: 0.2, h: 1.4, color: "#f59e0b" },
      { x: 0.9, z: -0.15, h: 0.65, color: "#2862d7" },
    ],
    [],
  );

  useFrame((state) => {
    const time = state.clock.elapsedTime;
    if (blocks.current) {
      blocks.current.rotation.y = Math.sin(time * 0.4) * 0.12;
      blocks.current.position.y = Math.sin(time * 0.9) * 0.04;
    }
    if (barrier.current) {
      barrier.current.position.y = 0.35 + Math.sin(time * 2) * 0.08;
      barrier.current.rotation.y = time * 0.8;
    }
  });

  return (
    <group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.9, 0]}>
        <planeGeometry args={[4.4, 3.2]} />
        <meshBasicMaterial color="#0d172b" transparent opacity={0.9} />
      </mesh>
      <gridHelper args={[4, 12, "#24375a", "#172540"]} position={[0, -0.88, 0]} />
      <group ref={blocks}>
        {bars.map((bar, i) => (
          <Float key={i} speed={1.1 + i * 0.1} floatIntensity={0.35} rotationIntensity={0.1}>
            <mesh position={[bar.x, -0.4 + bar.h / 2, bar.z]}>
              <boxGeometry args={[0.52, bar.h, 0.52]} />
              <meshStandardMaterial color={bar.color} emissive={bar.color} emissiveIntensity={0.55} metalness={0.45} roughness={0.35} />
            </mesh>
          </Float>
        ))}
      </group>
      <mesh ref={barrier} position={[0, 0.35, 0]}>
        <torusGeometry args={[1.6, 0.025, 8, 64]} />
        <meshBasicMaterial color="#85a6e9" transparent opacity={0.5} />
      </mesh>
      <pointLight position={[0, 2, 2]} intensity={1.2} color="#85a6e9" distance={6} />
    </group>
  );
}

function AssetOrbit() {
  const group = useRef<THREE.Group>(null);
  const satellites = useMemo(
    () => [
      { angle: 0, color: "#ef4444", size: 0.17 },
      { angle: 1.4, color: "#f59e0b", size: 0.12 },
      { angle: 2.5, color: "#85a6e9", size: 0.14 },
      { angle: 4.1, color: "#ff7dda", size: 0.1 },
    ],
    [],
  );

  useFrame((state) => {
    if (group.current) {
      group.current.rotation.y = state.clock.elapsedTime * 0.24;
      group.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.3) * 0.16;
    }
  });

  return (
    <group ref={group}>
      <mesh>
        <icosahedronGeometry args={[0.7, 2]} />
        <meshStandardMaterial color="#12244f" emissive="#2862d7" emissiveIntensity={0.65} metalness={0.9} roughness={0.18} wireframe />
      </mesh>
      <mesh>
        <sphereGeometry args={[0.32, 18, 18]} />
        <meshBasicMaterial color="#85a6e9" transparent opacity={0.75} />
      </mesh>
      <mesh rotation={[Math.PI / 2.4, 0.2, 0]}>
        <torusGeometry args={[1.35, 0.015, 6, 72]} />
        <meshBasicMaterial color="#625fff" transparent opacity={0.65} />
      </mesh>
      {satellites.map((satellite, i) => {
        const x = Math.cos(satellite.angle) * 1.45;
        const z = Math.sin(satellite.angle) * 1.45;
        return (
          <Float key={i} speed={1.8 + i * 0.1} floatIntensity={0.2}>
            <mesh position={[x, Math.sin(i * 2) * 0.3, z]}>
              <octahedronGeometry args={[satellite.size, 0]} />
              <meshStandardMaterial color={satellite.color} emissive={satellite.color} emissiveIntensity={0.7} />
            </mesh>
          </Float>
        );
      })}
      <pointLight position={[0, 2, 3]} intensity={1.5} color="#625fff" distance={8} />
    </group>
  );
}

function SceneCanvas({ children, camera }: { children: ReactNode; camera: [number, number, number] }) {
  return (
    <Canvas
      camera={{ position: camera, fov: 38 }}
      dpr={[1, 1.5]}
      gl={{ alpha: true, antialias: true, powerPreference: "low-power" }}
      style={{ background: "transparent" }}
    >
      <ambientLight intensity={0.45} />
      {children}
    </Canvas>
  );
}

const focusModes = [
  { id: "network", label: "Network", icon: Network },
  { id: "windows", label: "Windows", icon: ScanLine },
  { id: "assets", label: "Assets", icon: Orbit },
] as const;

type FocusMode = (typeof focusModes)[number]["id"];

export default function ImmersiveNetworkLab() {
  const [focus, setFocus] = useState<FocusMode>("network");
  const [pulse, setPulse] = useState(87);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setPulse((value) => (value >= 96 ? 82 : value + 1));
    }, 2600);
    return () => window.clearInterval(timer);
  }, []);

  return (
    <section className="relative overflow-hidden border-y border-[#172540] bg-[#0b0c0e] px-6 py-24" aria-label="Immersive Rail Network Digital Twin">
      <div className="pointer-events-none absolute inset-0 opacity-70" style={{ background: "radial-gradient(55% 55% at 50% 0%, rgba(48,95,189,0.18), transparent 70%), radial-gradient(40% 50% at 90% 90%, rgba(255,125,218,0.12), transparent 70%)" }} />
      <div className="relative z-10 mx-auto max-w-7xl">
        <div className="mb-12 flex flex-col justify-between gap-8 lg:flex-row lg:items-end">
          <div className="max-w-2xl">
            <div className="mb-4 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.25em] text-[#85a6e9]">
              <Sparkles className="h-4 w-4" />
              Digital twin / scroll to inspect
            </div>
            <h2 className="text-3xl font-bold text-white md:text-5xl">
              See the network as a living system.
            </h2>
            <p className="mt-5 text-base leading-relaxed text-[#abaebb] md:text-lg">
              A second layer of spatial intelligence: inspect live connectivity, model the next block window, and orbit the assets that keep India&apos;s trains moving.
            </p>
          </div>
          <div className="flex w-fit items-center gap-2 rounded-full border border-[#24375a] bg-[#0e111b]/80 p-1.5 backdrop-blur-xl">
            {focusModes.map((mode) => {
              const Icon = mode.icon;
              return (
                <button
                  key={mode.id}
                  type="button"
                  onClick={() => setFocus(mode.id)}
                  className={`flex items-center gap-2 rounded-full px-4 py-2 text-xs font-semibold transition-all ${focus === mode.id ? "bg-white text-[#050606]" : "text-[#abaebb] hover:bg-white/10 hover:text-white"}`}
                >
                  <Icon className="h-3.5 w-3.5" />
                  {mode.label}
                </button>
              );
            })}
          </div>
        </div>

        <div className="grid gap-5 lg:grid-cols-12">
          <article className={`group relative min-h-[420px] overflow-hidden rounded-3xl border bg-[#0e111b]/80 p-5 shadow-2xl transition-all duration-500 lg:col-span-7 ${focus === "network" ? "border-[#625fff]/70 shadow-[0_0_50px_rgba(98,95,255,0.12)]" : "border-[#172540]"}`}>
            <div className="relative z-10 flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2 text-[10px] font-mono uppercase tracking-[0.2em] text-[#85a6e9]"><Radio className="h-3.5 w-3.5" /> live topology</div>
                <h3 className="mt-2 text-xl font-semibold text-white">Network pulse</h3>
              </div>
              <div className="flex items-center gap-2 rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-1.5 text-[10px] font-semibold text-emerald-300">
                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-400" /> connected
              </div>
            </div>
            <LazyScene label="loading network pulse">
              <SceneCanvas camera={[0, 0.5, 5.2]}><NetworkField /></SceneCanvas>
            </LazyScene>
            <div className="absolute bottom-5 left-5 right-5 z-10 grid grid-cols-3 gap-2">
              {[{ label: "nodes", value: "1,842" }, { label: "health", value: "94.2%" }, { label: "latency", value: "38ms" }].map((item) => (
                <div key={item.label} className="rounded-xl border border-[#172540] bg-[#0b0c0e]/75 px-3 py-2.5 backdrop-blur-md">
                  <div className="font-mono text-sm font-bold text-white">{item.value}</div>
                  <div className="mt-1 text-[9px] uppercase tracking-widest text-[#3c3f44]">{item.label}</div>
                </div>
              ))}
            </div>
          </article>

          <article className={`relative min-h-[420px] overflow-hidden rounded-3xl border bg-[#0e111b]/80 p-5 shadow-2xl transition-all duration-500 lg:col-span-5 ${focus === "windows" ? "border-[#f59e0b]/70 shadow-[0_0_50px_rgba(245,158,11,0.1)]" : "border-[#172540]"}`}>
            <div className="relative z-10 flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2 text-[10px] font-mono uppercase tracking-[0.2em] text-[#f59e0b]"><Box className="h-3.5 w-3.5" /> optimizer sandbox</div>
                <h3 className="mt-2 text-xl font-semibold text-white">Block window model</h3>
              </div>
              <span className="font-mono text-xs text-[#abaebb]">LIVE / 04:32:18</span>
            </div>
            <LazyScene label="loading block window">
              <SceneCanvas camera={[0, 1.1, 4.8]}><BlockWindow /></SceneCanvas>
            </LazyScene>
            <div className="absolute bottom-5 left-5 right-5 z-10 flex items-center justify-between rounded-xl border border-[#172540] bg-[#0b0c0e]/75 px-3 py-2.5 backdrop-blur-md">
              <div className="flex items-center gap-2 text-xs text-[#abaebb]"><CircleDot className="h-3.5 w-3.5 text-[#ef4444]" /> candidate windows</div>
              <span className="font-mono text-sm font-bold text-white">03 / 07</span>
            </div>
          </article>

          <article className={`relative min-h-[390px] overflow-hidden rounded-3xl border bg-[#0e111b]/80 p-5 shadow-2xl transition-all duration-500 lg:col-span-5 ${focus === "assets" ? "border-[#ff7dda]/70 shadow-[0_0_50px_rgba(255,125,218,0.1)]" : "border-[#172540]"}`}>
            <div className="relative z-10">
              <div className="flex items-center gap-2 text-[10px] font-mono uppercase tracking-[0.2em] text-[#ff7dda]"><Orbit className="h-3.5 w-3.5" /> asset observatory</div>
              <h3 className="mt-2 text-xl font-semibold text-white">Critical asset orbit</h3>
            </div>
            <LazyScene label="loading asset observatory">
              <SceneCanvas camera={[0, 0.2, 4.8]}><AssetOrbit /></SceneCanvas>
            </LazyScene>
            <div className="absolute bottom-5 left-5 right-5 z-10 flex items-center gap-3 rounded-xl border border-[#172540] bg-[#0b0c0e]/75 px-3 py-2.5 backdrop-blur-md">
              <Activity className="h-4 w-4 text-[#85a6e9]" />
              <span className="text-xs text-[#abaebb]">Predictive health score</span>
              <span className="ml-auto font-mono text-sm font-bold text-[#85a6e9]">{pulse}.6%</span>
            </div>
          </article>

          <div className="relative overflow-hidden rounded-3xl border border-[#172540] bg-[linear-gradient(135deg,rgba(18,36,79,0.8),rgba(14,17,27,0.9))] p-6 lg:col-span-7 lg:p-8">
            <div className="absolute right-0 top-0 h-full w-1/2 opacity-60" style={{ background: "radial-gradient(circle at 70% 50%, rgba(98,95,255,0.22), transparent 65%)" }} />
            <div className="relative z-10 flex h-full flex-col justify-between gap-10">
              <div>
                <div className="flex items-center gap-2 text-[10px] font-mono uppercase tracking-[0.2em] text-[#85a6e9]"><Network className="h-3.5 w-3.5" /> decision loop</div>
                <h3 className="mt-3 max-w-lg text-2xl font-semibold text-white md:text-3xl">From scattered signals to one shared operating picture.</h3>
                <p className="mt-3 max-w-xl text-sm leading-relaxed text-[#abaebb]">The digital twin keeps traffic, assets, and approvals in the same spatial context — so every team can act on the same version of the truth.</p>
              </div>
              <div className="flex flex-wrap items-center gap-3 text-xs font-semibold text-[#c7c9d1]">
                <span className="flex items-center gap-2 rounded-full border border-[#24375a] bg-[#0b0c0e]/60 px-3 py-2"><span className="h-1.5 w-1.5 rounded-full bg-[#ef4444]" /> detect conflict</span>
                <ChevronRight className="h-3.5 w-3.5 text-[#3c3f44]" />
                <span className="flex items-center gap-2 rounded-full border border-[#24375a] bg-[#0b0c0e]/60 px-3 py-2"><span className="h-1.5 w-1.5 rounded-full bg-[#f59e0b]" /> optimize window</span>
                <ChevronRight className="h-3.5 w-3.5 text-[#3c3f44]" />
                <span className="flex items-center gap-2 rounded-full border border-[#24375a] bg-[#0b0c0e]/60 px-3 py-2"><span className="h-1.5 w-1.5 rounded-full bg-[#22c55e]" /> release safely</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
