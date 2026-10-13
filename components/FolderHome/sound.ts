import { useHomeSettingsStore } from "@/stores";

// 효과음은 파일 없이 Web Audio로 그때그때 합성한다.
// 설정에서 켜 둔 경우에만 소리를 내고, 첫 소리는 사용자 동작(클릭·키 입력) 안에서 난다.

type AudioWindow = Window & { webkitAudioContext?: typeof AudioContext };

let context: AudioContext | null = null;
let noise: AudioBuffer | null = null;
let lastTick = 0;

function audio() {
  if (typeof window === "undefined") return null;
  if (!useHomeSettingsStore.getState().sound) return null;
  const AudioCtor =
    window.AudioContext ?? (window as AudioWindow).webkitAudioContext;
  if (!AudioCtor) return null;
  context ??= new AudioCtor();
  if (context.state === "suspended") void context.resume();
  return context;
}

function whiteNoise(ctx: AudioContext) {
  if (noise) return noise;
  noise = ctx.createBuffer(1, ctx.sampleRate, ctx.sampleRate);
  const data = noise.getChannelData(0);
  for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
  return noise;
}

function envelope(
  ctx: AudioContext,
  at: number,
  peak: number,
  attack: number,
  decay: number
) {
  const gain = ctx.createGain();
  gain.gain.setValueAtTime(0.0001, at);
  gain.gain.exponentialRampToValueAtTime(peak, at + attack);
  gain.gain.exponentialRampToValueAtTime(0.0001, at + attack + decay);
  gain.connect(ctx.destination);
  return gain;
}

// 대역을 거른 잡음 한 번 (from → to 로 주파수가 미끄러진다)
function sweep(
  ctx: AudioContext,
  {
    at = ctx.currentTime,
    from,
    to,
    duration,
    peak,
    q = 1,
  }: {
    at?: number;
    from: number;
    to: number;
    duration: number;
    peak: number;
    q?: number;
  }
) {
  const source = ctx.createBufferSource();
  source.buffer = whiteNoise(ctx);
  const filter = ctx.createBiquadFilter();
  filter.type = "bandpass";
  filter.Q.value = q;
  filter.frequency.setValueAtTime(from, at);
  filter.frequency.exponentialRampToValueAtTime(to, at + duration);
  source
    .connect(filter)
    .connect(envelope(ctx, at, peak, Math.min(0.04, duration / 4), duration));
  source.start(at);
  source.stop(at + duration + 0.05);
}

function tone(
  ctx: AudioContext,
  {
    at = ctx.currentTime,
    frequency,
    duration,
    peak,
    type = "sine",
  }: {
    at?: number;
    frequency: number;
    duration: number;
    peak: number;
    type?: OscillatorType;
  }
) {
  const oscillator = ctx.createOscillator();
  oscillator.type = type;
  oscillator.frequency.setValueAtTime(frequency, at);
  oscillator.connect(envelope(ctx, at, peak, 0.005, duration));
  oscillator.start(at);
  oscillator.stop(at + duration + 0.05);
}

/** 다이얼이 카드 한 칸을 넘어갈 때 나는 딸깍 소리 */
export function playTick() {
  const ctx = audio();
  if (!ctx) return;
  // 빠르게 돌릴 때 소리가 뭉치지 않게 간격을 둔다
  if (ctx.currentTime - lastTick < 0.035) return;
  lastTick = ctx.currentTime;
  sweep(ctx, { from: 3400, to: 2600, duration: 0.03, peak: 0.25, q: 3 });
}

/** 폴더를 열 때(true)와 닫을 때(false) 종이가 스치는 소리 */
export function playFolder(open: boolean) {
  const ctx = audio();
  if (!ctx) return;
  if (open) {
    sweep(ctx, { from: 500, to: 2400, duration: 0.45, peak: 0.16, q: 0.8 });
    tone(ctx, { frequency: 150, duration: 0.18, peak: 0.12 });
  } else {
    sweep(ctx, { from: 2200, to: 450, duration: 0.45, peak: 0.14, q: 0.8 });
  }
}

/** 닫히면서 카드가 폴더에 들어앉는 순간의 낮은 소리 */
export function playShut() {
  const ctx = audio();
  if (!ctx) return;
  tone(ctx, { frequency: 110, duration: 0.16, peak: 0.2 });
}

/** 카드를 뒤집을 때 */
export function playFlip() {
  const ctx = audio();
  if (!ctx) return;
  sweep(ctx, { from: 1400, to: 4200, duration: 0.14, peak: 0.14, q: 1.4 });
}

/** 스위치를 켜고 끌 때 */
export function playToggle(on: boolean) {
  const ctx = audio();
  if (!ctx) return;
  tone(ctx, {
    frequency: on ? 1320 : 880,
    duration: 0.05,
    peak: 0.12,
    type: "triangle",
  });
}

/** 카드 뽑기가 끝났을 때 맑게 울리는 소리 */
export function playChime() {
  const ctx = audio();
  if (!ctx) return;
  const now = ctx.currentTime;
  tone(ctx, { frequency: 880, duration: 0.9, peak: 0.1 });
  tone(ctx, { at: now + 0.06, frequency: 1318.5, duration: 0.8, peak: 0.07 });
}
