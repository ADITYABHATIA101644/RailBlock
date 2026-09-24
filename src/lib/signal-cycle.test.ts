import { describe, expect, test } from "bun:test";
import {
  SIGNAL_CYCLE_SECONDS,
  RED_END,
  AMBER_END,
  aspectForTick,
  redCountdown,
  trainPhaseForSecond,
  trainXAtProgress,
  TRAIN_WAYPOINTS,
} from "./signal-cycle";

describe("aspectForTick — canonical 12s signal cycle", () => {
  test("constants define the red→amber→green windows", () => {
    expect(SIGNAL_CYCLE_SECONDS).toBe(12);
    expect(RED_END).toBe(4);
    expect(AMBER_END).toBe(8);
  });

  test("red for ticks 0–3", () => {
    for (let t = 0; t < 4; t++) expect(aspectForTick(t)).toBe("red");
  });

  test("amber for ticks 4–7", () => {
    for (let t = 4; t < 8; t++) expect(aspectForTick(t)).toBe("amber");
  });

  test("green for ticks 8–11", () => {
    for (let t = 8; t < 12; t++) expect(aspectForTick(t)).toBe("green");
  });

  test("wraps every 12s for non-negative ticks", () => {
    expect(aspectForTick(12)).toBe("red");
    expect(aspectForTick(13)).toBe("red");
    expect(aspectForTick(16)).toBe("amber");
    expect(aspectForTick(20)).toBe("green");
    expect(aspectForTick(0)).toBe(aspectForTick(12));
    expect(aspectForTick(5)).toBe(aspectForTick(29));
  });

  test("negative ticks wrap into range too", () => {
    expect(aspectForTick(-1)).toBe("green");
    expect(aspectForTick(-4)).toBe("green");
    expect(aspectForTick(-5)).toBe("amber");
    expect(aspectForTick(-9)).toBe("red");
  });
});

describe("redCountdown", () => {
  test("counts down within the red window", () => {
    expect(redCountdown(0)).toBe(4);
    expect(redCountdown(1)).toBe(3);
    expect(redCountdown(3)).toBe(1);
  });

  test("is null outside the red window", () => {
    for (let t = 4; t < 12; t++) expect(redCountdown(t)).toBeNull();
  });

  test("is periodic across cycles", () => {
    expect(redCountdown(12)).toBe(4);
    expect(redCountdown(25)).toBe(3);
  });
});

describe("trainPhaseForSecond — journey model used by the running train", () => {
  test("held (stopped) during the red window, seconds 0–3", () => {
    for (let s = 0; s < 4; s++) expect(trainPhaseForSecond(s)).toBe("held");
  });

  test("departing from second 4 (amber caution) through second 10", () => {
    for (let s = 4; s <= 10; s++) expect(trainPhaseForSecond(s)).toBe("departing");
  });

  test("approaching during green, seconds 11 (wrapping)", () => {
    expect(trainPhaseForSecond(11)).toBe("approaching");
  });

  test("phase is periodic across cycles", () => {
    expect(trainPhaseForSecond(12)).toBe("held");
    expect(trainPhaseForSecond(16)).toBe("departing");
    expect(trainPhaseForSecond(23)).toBe("approaching");
  });

  test("train is fully stopped whenever the signal is red", () => {
    for (let s = 0; s < 12; s++) {
      if (aspectForTick(s) === "red") {
        expect(trainPhaseForSecond(s)).toBe("held");
      }
    }
  });
});

describe("trainXAtProgress — relative waypoints match CSS journey", () => {
  test("hits each waypoint exactly", () => {
    for (const w of TRAIN_WAYPOINTS) {
      expect(trainXAtProgress(w.t)).toBeCloseTo(w.x, 5);
    }
  });

  test("holds at the signal (x = 0) through the red window", () => {
    expect(trainXAtProgress(0)).toBeCloseTo(0, 5);
    expect(trainXAtProgress(0.2)).toBeCloseTo(0, 5);
    expect(trainXAtProgress(1 / 3)).toBeCloseTo(0, 5);
  });

  test("clamps before the first and after the last waypoint", () => {
    expect(trainXAtProgress(-0.5)).toBeCloseTo(0, 5);
    expect(trainXAtProgress(1.5)).toBeCloseTo(0, 5);
  });

  test("depart leg moves forward, re-entry leg moves forward from negative", () => {
    const depart = trainXAtProgress(0.6);
    expect(depart).toBeGreaterThan(0);
    const reentry = trainXAtProgress(0.95);
    expect(reentry).toBeLessThan(0);
    expect(reentry).toBeGreaterThan(-1000);
  });

  test("re-approach is nearly at the stop as the cycle wraps", () => {
    const x = trainXAtProgress(0.999);
    expect(x).toBeLessThan(0);
    expect(x).toBeGreaterThan(-100);
    expect(trainXAtProgress(1)).toBeCloseTo(0, 5);
  });
});
