// Procedural audio engine — all music and SFX are synthesized at runtime with
// the Web Audio API, so there are no asset files to ship or license. Designed to
// respect iOS Safari's autoplay policy (the context stays suspended until the
// first user gesture calls unlock()).

export interface AudioSettings {
  master: number; // 0..1
  music: number; // 0..1
  sfx: number; // 0..1
  muted: boolean;
}

const SETTINGS_KEY = "dicebound.audio.v1";

type TrackName = "title" | "town" | "explore" | "battle" | "boss" | "victory";

interface TrackDef {
  bpm: number;
  root: number; // midi root
  scale: number[]; // semitone offsets
  progression: number[]; // chord roots as scale-degree indices
  beatsPerChord: number;
  lead: (number | null)[]; // scale-degree per beat, null = rest
  leadWave: OscillatorType;
  bassWave: OscillatorType;
  padWave: OscillatorType;
  swing?: boolean;
}

const MINOR = [0, 2, 3, 5, 7, 8, 10];
const MAJOR = [0, 2, 4, 5, 7, 9, 11];
const DORIAN = [0, 2, 3, 5, 7, 9, 10];

const TRACKS: Record<TrackName, TrackDef> = {
  title: {
    bpm: 66, root: 50, scale: MINOR, progression: [0, 5, 3, 4], beatsPerChord: 4,
    lead: [0, null, 4, null, 2, null, 7, null], leadWave: "triangle", bassWave: "sine", padWave: "sine",
  },
  town: {
    bpm: 100, root: 57, scale: MAJOR, progression: [0, 3, 4, 0], beatsPerChord: 4,
    lead: [0, 2, 4, 2, 4, 5, 4, 2], leadWave: "triangle", bassWave: "sine", padWave: "triangle",
  },
  explore: {
    bpm: 84, root: 50, scale: DORIAN, progression: [0, 6, 3, 5], beatsPerChord: 4,
    lead: [0, null, 3, null, 5, null, 4, 3], leadWave: "sine", bassWave: "sine", padWave: "sine",
  },
  battle: {
    bpm: 138, root: 45, scale: MINOR, progression: [0, 0, 5, 4], beatsPerChord: 2,
    lead: [0, 2, 3, 2, 4, 3, 2, 0], leadWave: "sawtooth", bassWave: "square", padWave: "triangle", swing: false,
  },
  boss: {
    bpm: 150, root: 41, scale: MINOR, progression: [0, 1, 5, 4], beatsPerChord: 2,
    lead: [0, 3, 2, 4, 5, 4, 6, 4], leadWave: "sawtooth", bassWave: "sawtooth", padWave: "square",
  },
  victory: {
    bpm: 120, root: 57, scale: MAJOR, progression: [0, 4, 5, 0], beatsPerChord: 2,
    lead: [0, 2, 4, 7, 4, 7, 7, null], leadWave: "triangle", bassWave: "sine", padWave: "triangle",
  },
};

function midiToFreq(m: number): number { return 440 * Math.pow(2, (m - 69) / 12); }
function scaleNote(t: TrackDef, degree: number, octave = 0): number {
  const len = t.scale.length;
  const idx = ((degree % len) + len) % len;
  const oct = Math.floor(degree / len) + octave;
  return t.root + t.scale[idx] + 12 * oct;
}

export class AudioEngine {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private musicGain: GainNode | null = null;
  private sfxGain: GainNode | null = null;
  private noiseBuffer: AudioBuffer | null = null;

  private current: TrackName | null = null;
  private schedTimer: number | null = null;
  private nextNoteTime = 0;
  private beat = 0;
  private unlocked = false;

  settings: AudioSettings = { master: 0.7, music: 0.55, sfx: 0.8, muted: false };

  constructor() {
    try {
      const raw = localStorage.getItem(SETTINGS_KEY);
      if (raw) this.settings = { ...this.settings, ...JSON.parse(raw) };
    } catch { /* defaults */ }
  }

  private persist() { try { localStorage.setItem(SETTINGS_KEY, JSON.stringify(this.settings)); } catch { /* ignore */ } }

  // Call from the first user gesture to satisfy iOS autoplay rules.
  unlock(): void {
    if (this.unlocked) { if (this.ctx?.state === "suspended") void this.ctx.resume(); return; }
    try {
      const Ctor = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new Ctor();
      this.masterGain = this.ctx.createGain();
      this.musicGain = this.ctx.createGain();
      this.sfxGain = this.ctx.createGain();
      this.musicGain.connect(this.masterGain);
      this.sfxGain.connect(this.masterGain);
      this.masterGain.connect(this.ctx.destination);
      this.applyVolumes();
      // white-noise buffer reused for percussive SFX
      const len = this.ctx.sampleRate * 0.5;
      const buf = this.ctx.createBuffer(1, len, this.ctx.sampleRate);
      const data = buf.getChannelData(0);
      for (let i = 0; i < len; i++) data[i] = Math.random() * 2 - 1;
      this.noiseBuffer = buf;
      this.unlocked = true;
      void this.ctx.resume();
      if (this.current) this.startScheduler();
    } catch { this.ctx = null; }
  }

  private applyVolumes() {
    if (!this.ctx || !this.masterGain || !this.musicGain || !this.sfxGain) return;
    const m = this.settings.muted ? 0 : this.settings.master;
    this.masterGain.gain.value = m;
    this.musicGain.gain.value = this.settings.music;
    this.sfxGain.gain.value = this.settings.sfx;
  }

  setSetting<K extends keyof AudioSettings>(key: K, value: AudioSettings[K]) {
    this.settings[key] = value;
    this.applyVolumes();
    this.persist();
  }
  toggleMute(): boolean { this.settings.muted = !this.settings.muted; this.applyVolumes(); this.persist(); return this.settings.muted; }

  // ---- music ----
  playMusic(track: TrackName): void {
    if (this.current === track) return;
    this.current = track;
    this.beat = 0;
    if (!this.ctx || !this.unlocked) return; // will start on unlock()
    if (this.ctx.state === "suspended") void this.ctx.resume();
    this.nextNoteTime = this.ctx.currentTime + 0.05;
    this.startScheduler();
  }
  stopMusic(): void { this.current = null; if (this.schedTimer !== null) { clearInterval(this.schedTimer); this.schedTimer = null; } }

  private startScheduler() {
    if (this.schedTimer !== null) clearInterval(this.schedTimer);
    this.nextNoteTime = this.ctx!.currentTime + 0.05;
    this.schedTimer = window.setInterval(() => this.scheduler(), 25);
  }

  private scheduler() {
    if (!this.ctx || !this.current) return;
    const t = TRACKS[this.current];
    const secPerBeat = 60 / t.bpm;
    while (this.nextNoteTime < this.ctx.currentTime + 0.2) {
      this.scheduleBeat(t, this.beat, this.nextNoteTime, secPerBeat);
      this.nextNoteTime += secPerBeat;
      this.beat++;
    }
  }

  private scheduleBeat(t: TrackDef, beat: number, time: number, secPerBeat: number) {
    const totalBeats = t.progression.length * t.beatsPerChord;
    const localBeat = beat % totalBeats;
    const chordIdx = Math.floor(localBeat / t.beatsPerChord) % t.progression.length;
    const chordDegree = t.progression[chordIdx];
    const onChordStart = localBeat % t.beatsPerChord === 0;

    // bass on each beat (root, low octave)
    this.tone(midiToFreq(scaleNote(t, chordDegree, -2)), time, secPerBeat * 0.9, t.bassWave, 0.16, this.musicGain!);

    // pad/chord swell at the start of each chord
    if (onChordStart) {
      const triad = [0, 2, 4];
      for (const o of triad) {
        this.tone(midiToFreq(scaleNote(t, chordDegree + o, -1)), time, secPerBeat * t.beatsPerChord * 0.95, t.padWave, 0.05, this.musicGain!, 0.05);
      }
    }

    // lead melody
    const leadDeg = t.lead[beat % t.lead.length];
    if (leadDeg !== null) {
      this.tone(midiToFreq(scaleNote(t, chordDegree + leadDeg, 1)), time, secPerBeat * 0.55, t.leadWave, 0.09, this.musicGain!, 0.01);
    }
  }

  private tone(freq: number, time: number, dur: number, wave: OscillatorType, gain: number, dest: GainNode, attack = 0.01) {
    if (!this.ctx) return;
    const osc = this.ctx.createOscillator();
    const g = this.ctx.createGain();
    osc.type = wave;
    osc.frequency.value = freq;
    g.gain.setValueAtTime(0, time);
    g.gain.linearRampToValueAtTime(gain, time + attack);
    g.gain.exponentialRampToValueAtTime(0.0008, time + dur);
    osc.connect(g); g.connect(dest);
    osc.start(time);
    osc.stop(time + dur + 0.02);
  }

  private noise(time: number, dur: number, gain: number, freq: number, q: number) {
    if (!this.ctx || !this.noiseBuffer || !this.sfxGain) return;
    const src = this.ctx.createBufferSource();
    src.buffer = this.noiseBuffer;
    const bp = this.ctx.createBiquadFilter();
    bp.type = "bandpass"; bp.frequency.value = freq; bp.Q.value = q;
    const g = this.ctx.createGain();
    g.gain.setValueAtTime(gain, time);
    g.gain.exponentialRampToValueAtTime(0.0008, time + dur);
    src.connect(bp); bp.connect(g); g.connect(this.sfxGain);
    src.start(time); src.stop(time + dur + 0.02);
  }

  // ---- SFX ----
  sfx(name: SfxName): void {
    if (!this.ctx || !this.unlocked || this.settings.muted) return;
    const now = this.ctx.currentTime;
    const blip = (f: number, dur: number, wave: OscillatorType, g = 0.25) => this.tone(f, now, dur, wave, g, this.sfxGain!);
    switch (name) {
      case "click": blip(520, 0.05, "square", 0.12); break;
      case "ability": blip(380, 0.08, "square", 0.16); blip(560, 0.08, "triangle", 0.1); break;
      case "hit": this.noise(now, 0.16, 0.5, 900, 1.2); this.tone(120, now, 0.12, "square", 0.25, this.sfxGain!); break;
      case "crit": this.noise(now, 0.22, 0.6, 1500, 1.5); this.tone(160, now, 0.18, "sawtooth", 0.3, this.sfxGain!); blip(880, 0.12, "square", 0.18); break;
      case "miss": this.noise(now, 0.12, 0.25, 2600, 0.8); break;
      case "heal": [660, 880, 1100].forEach((f, i) => this.tone(f, now + i * 0.06, 0.25, "sine", 0.16, this.sfxGain!)); break;
      case "dice": for (let i = 0; i < 5; i++) this.noise(now + i * 0.05, 0.04, 0.3, 1800 - i * 120, 2); break;
      case "levelup": [523, 659, 784, 1047].forEach((f, i) => this.tone(f, now + i * 0.09, 0.3, "triangle", 0.2, this.sfxGain!)); break;
      case "victory": [523, 659, 784, 1047, 1319].forEach((f, i) => this.tone(f, now + i * 0.12, 0.4, "triangle", 0.22, this.sfxGain!)); break;
      case "defeat": [330, 277, 220, 165].forEach((f, i) => this.tone(f, now + i * 0.16, 0.5, "sawtooth", 0.2, this.sfxGain!)); break;
      case "buy": blip(700, 0.06, "square", 0.18); this.tone(1050, now + 0.06, 0.12, "triangle", 0.14, this.sfxGain!); break;
      case "error": blip(200, 0.18, "sawtooth", 0.2); break;
    }
  }
}

export type SfxName = "click" | "ability" | "hit" | "crit" | "miss" | "heal" | "dice" | "levelup" | "victory" | "defeat" | "buy" | "error";

export const audio = new AudioEngine();
