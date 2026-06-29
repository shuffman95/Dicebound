// Deterministic, seedable RNG (mulberry32) so combat/dice are reproducible in tests.
export class RNG {
  private state: number;

  constructor(seed?: number) {
    this.state = (seed ?? (Date.now() ^ (Math.random() * 0x100000000))) >>> 0;
  }

  // float in [0, 1)
  next(): number {
    let t = (this.state += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  }

  // integer in [min, max] inclusive
  int(min: number, max: number): number {
    return min + Math.floor(this.next() * (max - min + 1));
  }

  pick<T>(arr: readonly T[]): T {
    return arr[this.int(0, arr.length - 1)];
  }

  chance(p: number): boolean {
    return this.next() < p;
  }
}

// A single shared RNG for live play; tests construct their own seeded instances.
export const rng = new RNG();
