import { useRef, type ReactNode, type CSSProperties } from "react";

/**
 * 3D tilt-on-hover wrapper. Applies a perspective rotation following
 * the cursor — pure CSS transform, no dependencies. Pairs beautifully
 * with .glow-card / .shimmer-card utilities.
 */
export default function TiltCard({
  children,
  className = "",
  style,
  maxTilt = 8,
  glare = true,
}: {
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
  maxTilt?: number;
  glare?: boolean;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const glareRef = useRef<HTMLDivElement>(null);

  const handleMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const px = (e.clientX - rect.left) / rect.width - 0.5;
    const py = (e.clientY - rect.top) / rect.height - 0.5;
    el.style.transform = `perspective(900px) rotateY(${px * maxTilt}deg) rotateX(${-py * maxTilt}deg) translateY(-4px)`;
    if (glareRef.current) {
      glareRef.current.style.opacity = "0.55";
      glareRef.current.style.background = `radial-gradient(circle at ${((e.clientX - rect.left) / rect.width) * 100}% ${((e.clientY - rect.top) / rect.height) * 100}%, rgba(255,255,255,0.14), transparent 55%)`;
    }
  };

  const handleLeave = () => {
    const el = ref.current;
    if (el) el.style.transform = "";
    if (glareRef.current) glareRef.current.style.opacity = "0";
  };

  return (
    <div
      ref={ref}
      onMouseMove={handleMove}
      onMouseLeave={handleLeave}
      className={`tilt-card relative ${className}`}
      style={style}
    >
      {children}
      {glare && (
        <div
          ref={glareRef}
          className="absolute inset-0 rounded-[inherit] pointer-events-none transition-opacity duration-300"
          style={{ opacity: 0 }}
        />
      )}
    </div>
  );
}
