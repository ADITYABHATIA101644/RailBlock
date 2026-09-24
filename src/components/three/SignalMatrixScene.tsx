import { useMemo, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Environment, Float } from "@react-three/drei";
import * as THREE from "three";

/* SignalMatrixScene — the "Problem" section in 3D.
   A rising column of signal masts, each cycling red → amber → green on a
   staggered phase, over a faint digital grid. Reads as a wall of red — the
   visual definition of a congested, manually-planned network.            */

const GRID = 4; // masts per row/column → 16 signal masts

function SignalMast({
  index,
  total,
}: {
  index: number;
  total: number;
}) {
  const red = useRef<THREE.MeshStandardMaterial>(null);
  const amber = useRef<THREE.MeshStandardMaterial>(null);
  const green = useRef<THREE.MeshStandardMaterial>(null);
  const phase = useRef((index * 0.83) % 3); // staggered start phase
  const timer = useRef(0);

  useFrame((_, delta) => {
    timer.current += delta;
    if (timer.current > 3) {
      timer.current = 0;
      phase.current = (phase.current + 1) % 3;
    }
    const p = Math.floor(phase.current);
    if (red.current) red.current.emissiveIntensity = p === 0 ? 3.2 : 0.08;
    if (amber.current) amber.current.emissiveIntensity = p === 1 ? 3.2 : 0.08;
    if (green.current) green.current.emissiveIntensity = p === 2 ? 3.2 : 0.08;
  });

  // Arrange masts in a receding grid, rising rows toward the back
  const col = index % GRID;
  const row = Math.floor(index / GRID);
  const x = (col - (GRID - 1) / 2) * 1.9;
  const z = -row * 1.7;
  const mastH = 1.1 + row * 0.16;

  const lamps = [
    { ref: red, color: "#ef4444", y: mastH + 0.52 },
    { ref: amber, color: "#f59e0b", y: mastH + 0.28 },
    { ref: green, color: "#22c55e", y: mastH + 0.04 },
  ];

  return (
    <group position={[x, 0, z]}>
      <mesh position={[0, mastH / 2, 0]}>
        <cylinderGeometry args={[0.035, 0.05, mastH, 8]} />
        <meshStandardMaterial color="#141b2b" metalness={0.9} roughness={0.3} />
      </mesh>
      <mesh position={[0, mastH + 0.28, 0]}>
        <boxGeometry args={[0.26, 0.78, 0.18]} />
        <meshStandardMaterial color="#0c1220" metalness={0.75} roughness={0.4} />
      </mesh>
      {lamps.map((lamp, i) => (
        <mesh key={i} position={[0, lamp.y, 0.11]}>
          <circleGeometry args={[0.062, 20]} />
          <meshStandardMaterial
            ref={lamp.ref}
            color="#050505"
            emissive={lamp.color}
            emissiveIntensity={0.08}
            toneMapped={false}
          />
        </mesh>
      ))}
    </group>
  );
}

function GridFloor() {
  const grid = useRef<THREE.GridHelper>(null);
  useFrame((state) => {
    if (grid.current) {
      // Slow scroll toward the camera — a conveyor of dark track
      const t = state.clock.elapsedTime;
      grid.current.position.z = (t * 0.6) % 1.7;
    }
  });
  return (
    <gridHelper
      ref={grid}
      args={[24, 40, "#24375a", "#172540"]}
      position={[0, -0.02, 0]}
    />
  );
}

/** Column of red lamps stacked above the scene — "the wall of red". */
function CongestionMeter() {
  const group = useRef<THREE.Group>(null);
  useFrame((state) => {
    if (group.current) {
      group.current.position.y = 3.4 + Math.sin(state.clock.elapsedTime * 0.8) * 0.08;
    }
  });
  const bars = useMemo(() => [0.9, 0.65, 0.45, 0.3], []);
  return (
    <Float speed={1.2} rotationIntensity={0.25} floatIntensity={0.4}>
      <group ref={group} position={[3.6, 3.4, -1.5]}>
        {bars.map((h, i) => (
          <mesh key={i} position={[0, -i * 0.42, 0]}>
            <boxGeometry args={[0.16, h, 0.16]} />
            <meshBasicMaterial
              color={i === 0 ? "#ef4444" : i === 1 ? "#f59e0b" : "#3c3f44"}
              transparent
              opacity={0.85}
              toneMapped={false}
            />
          </mesh>
        ))}
        <pointLight color="#ef4444" intensity={0.8} distance={5} />
      </group>
    </Float>
  );
}

export default function SignalMatrixScene() {
  return (
    <div className="absolute inset-0" aria-hidden>
      <Canvas
        camera={{ position: [0, 1.6, 6.2], fov: 42 }}
        dpr={[1, 1.8]}
        gl={{ antialias: true, alpha: true }}
        style={{ background: "transparent" }}
      >
        <ambientLight intensity={0.35} />
        <pointLight position={[0, 6, 6]} intensity={0.9} color="#625fff" />
        <pointLight position={[-5, 2, 3]} intensity={0.5} color="#ff7dda" />
        <GridFloor />
        {Array.from({ length: GRID * GRID }, (_, i) => (
          <SignalMast key={i} index={i} total={GRID * GRID} />
        ))}
        <CongestionMeter />
        <Environment preset="night" />
      </Canvas>
    </div>
  );
}
