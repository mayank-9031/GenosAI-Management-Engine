// Deterministic seeded PRNG (mulberry32) so the initial dataset is identical on
// server and client — avoids hydration mismatches. The realtime engine uses the
// browser clock only after mount.
export function makeRng(seed: number) {
  let a = seed >>> 0;
  return function rng() {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export type Rng = () => number;

export const pick = <T>(rng: Rng, arr: readonly T[]): T =>
  arr[Math.floor(rng() * arr.length)];

export const int = (rng: Rng, min: number, max: number): number =>
  Math.floor(rng() * (max - min + 1)) + min;

export const float = (rng: Rng, min: number, max: number, d = 1): number => {
  const v = rng() * (max - min) + min;
  const f = 10 ** d;
  return Math.round(v * f) / f;
};

export const bool = (rng: Rng, p = 0.5): boolean => rng() < p;

export function sample<T>(rng: Rng, arr: readonly T[], n: number): T[] {
  const copy = [...arr];
  const out: T[] = [];
  for (let i = 0; i < n && copy.length; i++) {
    out.push(copy.splice(Math.floor(rng() * copy.length), 1)[0]);
  }
  return out;
}
