// src/scheduler.js — moment scheduler. Pure logic, deterministic given an rng.
//
// createScheduler({
//   weights:     { lightning: 30, roar: 20, watching: 15, surge: 15, ink: 15, beat: 5 },
//   rng:         Math.random,
//   intervalMin: 65, intervalMax: 85,
//   onMoment:    (variantKey) => { ... },
// })
export function createScheduler(opts) {
  const weights = opts.weights;
  const rng = opts.rng || Math.random;
  const intervalMin = opts.intervalMin ?? 65;
  const intervalMax = opts.intervalMax ?? 85;
  const onMoment = opts.onMoment || (() => {});
  const keys = Object.keys(weights);

  let prevVariant = null;
  let elapsed = 0;
  let nextAt = computeInterval();

  function computeInterval() {
    return intervalMin + rng() * (intervalMax - intervalMin);
  }

  function pickVariant() {
    const eligible = prevVariant === null ? keys : keys.filter(k => k !== prevVariant);
    const subtotal = eligible.reduce((s, k) => s + weights[k], 0);
    let r = rng() * subtotal;
    let chosen = eligible[eligible.length - 1];
    for (const k of eligible) {
      r -= weights[k];
      if (r <= 0) { chosen = k; break; }
    }
    prevVariant = chosen;
    return chosen;
  }

  function tick(dt) {
    elapsed += dt;
    if (elapsed >= nextAt) {
      elapsed = 0;
      nextAt = computeInterval();
      onMoment(pickVariant());
    }
  }

  function trigger() {
    elapsed = 0;
    nextAt = computeInterval();
    const v = pickVariant();
    onMoment(v);
    return v;
  }

  function nextInterval() { return computeInterval(); }
  function timeUntilNext() { return Math.max(0, nextAt - elapsed); }

  return { tick, trigger, pickVariant, nextInterval, timeUntilNext };
}
