import { useRef, useCallback } from "react";

type SoundType = "open" | "send" | "receive";

function playTone(
  ctx: AudioContext,
  frequency: number,
  duration: number,
  volume: number
) {
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.frequency.value = frequency;
  osc.type = "sine";
  gain.gain.setValueAtTime(volume * 0.15, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
  osc.start(ctx.currentTime);
  osc.stop(ctx.currentTime + duration);
}

export function useChatSounds() {
  const ctxRef = useRef<AudioContext | null>(null);

  const play = useCallback((type: SoundType) => {
    try {
      if (!ctxRef.current) {
        ctxRef.current = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
      }
      const ctx = ctxRef.current;
      if (ctx.state === "suspended") {
        ctx.resume();
      }
      switch (type) {
        case "open":
          playTone(ctx, 523, 0.08, 1);
          setTimeout(() => playTone(ctx, 659, 0.1, 0.8), 80);
          break;
        case "send":
          playTone(ctx, 440, 0.06, 0.7);
          break;
        case "receive":
          playTone(ctx, 587, 0.07, 0.6);
          setTimeout(() => playTone(ctx, 740, 0.08, 0.5), 60);
          break;
      }
    } catch {
      // Ignore audio errors (e.g. autoplay blocked)
    }
  }, []);

  return { playSound: play };
}
