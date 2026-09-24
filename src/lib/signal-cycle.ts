/**
 * Shared signal-cycle logic used by the 3D RailwayScene HUD (ProblemHUD),
 * the 2D running train strip (RunningTrain), and any future consumers.
 *
 * Canonical IR signal cycle (12s, matching the 3D scene timing):
 *   red   0–4s   — train held at the maintenance block
 *   amber 4–8s   — block clearing, train proceeds with caution
 *   green 8–12s  — line clear; next train approaches
 */

export type SignalAspect = "red" | "amber" | "green";

export const SIGNAL_CYCLE_SECONDS = 12;
/** Seconds the signal shows red before switching to amber. */
export const RED_END = 4;
/** Seconds the signal shows amber before switching to green. */
export const AMBER_END = 8;

/** Map a tick (any integer, seconds) to the current signal aspect. */
export function aspectForTick(tick: number): SignalAspect {
  const s = ((tick % SIGNAL_CYCLE_SECONDS) + SIGNAL_CYCLE_SECONDS) % SIGNAL_CYCLE_SECONDS;
  if (s < RED_END) return "red";
  if (s < AMBER_END) return "amber";
  return "green";
}

/**
 * Seconds remaining until the current red window ends (i.e. until the block
 * clears). Returns null whenever the signal is not red.
 */
export function redCountdown(tick: number): number | null {
  const s = ((tick % SIGNAL_CYCLE_SECONDS) + SIGNAL_CYCLE_SECONDS) % SIGNAL_CYCLE_SECONDS;
  return s < RED_END ? RED_END - s : null;
}

export type TrainPhase = "held" | "departing" | "approaching";

/**
 * Physical train phase for a given cycle second (0–11), matching the CSS
 * journey keyframes on the running-train strip:
 *   0–4   stopped at the signal (red — held for the maintenance block)
 *   4–10  departed, accelerating out (amber caution → green line clear)
 *   10–12 re-entered from the left, approaching the signal (green)
 * The train arrives back at the stop exactly as the cycle wraps to red.
 */
export function trainPhaseForSecond(second: number): TrainPhase {
  const s = ((second % SIGNAL_CYCLE_SECONDS) + SIGNAL_CYCLE_SECONDS) % SIGNAL_CYCLE_SECONDS;
  if (s < RED_END) return "held";
  if (s <= 10) return "departing";
  return "approaching";
}

export interface TrainWaypoint {
  /** Progress fraction (0–1) through the 12s cycle at which the train reaches this x. */
  t: number;
  /**
   * Relative x position in px, where 0 = stopped at the signal, positive =
   * past the signal exiting right, negative = entering from the left.
   * The CSS keyframes map these onto the `--rb-stop` / `--rb-exit` /
   * `--rb-entry` viewport-adaptive custom properties.
   */
  x: number;
}

/** Relative travel waypoints mirroring the CSS `rb-journey` keyframes (12s cycle). */
export const TRAIN_WAYPOINTS: TrainWaypoint[] = [
  { t: 0, x: 0 }, // stopped at the signal as red lights
  { t: 1 / 3, x: 0 }, // held through the red window
  { t: 0.88, x: 3000 }, // exited right (mapped to --rb-exit)
  { t: 0.8802, x: -1000 }, // hidden teleport to the left entry (mapped to --rb-entry)
  { t: 1, x: 0 }, // approached during green, arrives at the stop
];

/** Linear interpolation between TRAIN_WAYPOINTS at a normalized cycle time. */
export function trainXAtProgress(t: number): number {
  const p = Math.min(Math.max(t, 0), 1);
  for (let i = 0; i < TRAIN_WAYPOINTS.length - 1; i++) {
    const a = TRAIN_WAYPOINTS[i];
    const b = TRAIN_WAYPOINTS[i + 1];
    if (p >= a.t && p <= b.t) {
      const span = b.t - a.t || 1;
      return a.x + (b.x - a.x) * ((p - a.t) / span);
    }
  }
  return p <= 0 ? TRAIN_WAYPOINTS[0].x : TRAIN_WAYPOINTS[TRAIN_WAYPOINTS.length - 1].x;
}
