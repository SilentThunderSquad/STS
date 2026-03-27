import { useCallback, useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Lenis from "lenis";
import { Howl, Howler } from "howler";
import Hero from "@/components/Hero";
import About from "@/components/About";
import WhatWeDo from "@/components/WhatWeDo";
import Projects from "@/components/Projects";
import Team from "@/components/Team";
import thunderSoundFile from "../thundersound.mp3";

gsap.registerPlugin(ScrollTrigger);

function createThunderWavUrl() {
  const sampleRate = 22050;
  const duration = 1.25;
  const totalSamples = Math.floor(sampleRate * duration);
  const pcm = new Int16Array(totalSamples);

  for (let i = 0; i < totalSamples; i += 1) {
    const t = i / sampleRate;
    const decay = Math.exp(-2.2 * t);
    const noise = (Math.random() * 2 - 1) * 0.55 * decay;
    const rumble = Math.sin(2 * Math.PI * 48 * t) * 0.38 * Math.exp(-1.4 * t);
    const crack = t < 0.08 ? (Math.random() * 2 - 1) * Math.exp(-35 * t) * 0.92 : 0;
    const sample = Math.max(-1, Math.min(1, noise + rumble + crack));
    pcm[i] = sample * 32767;
  }

  const dataSize = pcm.length * 2;
  const buffer = new ArrayBuffer(44 + dataSize);
  const view = new DataView(buffer);

  const writeString = (offset, str) => {
    for (let i = 0; i < str.length; i += 1) {
      view.setUint8(offset + i, str.charCodeAt(i));
    }
  };

  writeString(0, "RIFF");
  view.setUint32(4, 36 + dataSize, true);
  writeString(8, "WAVE");
  writeString(12, "fmt ");
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true);
  view.setUint16(22, 1, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * 2, true);
  view.setUint16(32, 2, true);
  view.setUint16(34, 16, true);
  writeString(36, "data");
  view.setUint32(40, dataSize, true);

  let offset = 44;
  for (let i = 0; i < pcm.length; i += 1) {
    view.setInt16(offset, pcm[i], true);
    offset += 2;
  }

  return URL.createObjectURL(new Blob([buffer], { type: "audio/wav" }));
}

export default function App() {
  const [soundEnabled, setSoundEnabled] = useState(false);
  const lastStrikeRef = useRef(0);
  const thunderSoundRef = useRef(null);
  const fallbackThunderUrlRef = useRef("");

  const buildFallbackThunder = useCallback(() => {
    if (!fallbackThunderUrlRef.current) {
      fallbackThunderUrlRef.current = createThunderWavUrl();
    }
    return new Howl({
      src: [fallbackThunderUrlRef.current],
      format: ["wav"],
      html5: false,
      pool: 2,
      volume: 0.2,
      preload: true,
    });
  }, []);

  const ensureThunderSound = useCallback(() => {
    if (thunderSoundRef.current) return thunderSoundRef.current;

    const primary = new Howl({
      src: [thunderSoundFile],
      format: ["mp3"],
      html5: false,
      pool: 2,
      volume: 0.2,
      preload: true,
      onloaderror: () => {
        primary.unload();
        thunderSoundRef.current = buildFallbackThunder();
      }
    });

    thunderSoundRef.current = primary;
    return thunderSoundRef.current;
  }, [buildFallbackThunder]);

  const playThunder = useCallback(() => {
    if (!soundEnabled) return;
    const now = performance.now();
    if (now - lastStrikeRef.current < 900) return;
    lastStrikeRef.current = now;
    const sound = ensureThunderSound();
    sound.stop();
    sound.play();
  }, [ensureThunderSound, soundEnabled]);

  const handleToggleSound = useCallback(() => {
    const next = !soundEnabled;
    setSoundEnabled(next);
    if (!next) return;

    // This runs directly from button click (user gesture), so it can unlock WebAudio.
    ensureThunderSound();
    if (Howler.ctx?.state === "suspended") {
      Howler.ctx.resume().catch(() => {});
    }
    Howler.mute(false);
  }, [ensureThunderSound, soundEnabled]);

  useEffect(() => {
    // Lenis is the only scroll engine; GSAP uses Lenis RAF for all ScrollTrigger updates.
    const debugScroll =
      import.meta.env.DEV &&
      typeof window !== "undefined" &&
      new URLSearchParams(window.location.search).get("debugScroll") === "1";

    if (debugScroll) {
      ScrollTrigger.defaults({ markers: true });
    }

    const lenis = new Lenis({
      duration: 1.15,
      smoothWheel: true,
      syncTouch: true,
      touchMultiplier: 1.1
    });

    lenis.on("scroll", ScrollTrigger.update);

    const update = (time) => {
      lenis.raf(time * 1000);
    };

    gsap.ticker.add(update);
    gsap.ticker.lagSmoothing(0);
    const refresh = () => ScrollTrigger.refresh();
    const debugLog = () => {
      if (!debugScroll) return;
      const summary = ScrollTrigger.getAll().map((st, index) => ({
        idx: index,
        id: st.vars?.id ?? "n/a",
        start: Math.round(st.start),
        end: Math.round(st.end),
        trigger: st.trigger?.className ?? st.trigger?.tagName ?? "unknown"
      }));
      // eslint-disable-next-line no-console
      console.table(summary);
    };

    const refreshTimeout = setTimeout(refresh, 200);
    const loadTimeout = setTimeout(refresh, 900);

    window.addEventListener("load", refresh);
    window.addEventListener("resize", refresh);
    document.fonts?.ready?.then(refresh).catch(() => {});

    const images = Array.from(document.querySelectorAll("img"));
    const pending = images.filter((img) => !img.complete);
    pending.forEach((img) => img.addEventListener("load", refresh, { once: true }));
    pending.forEach((img) => img.addEventListener("error", refresh, { once: true }));
    ScrollTrigger.addEventListener("refresh", debugLog);

    return () => {
      clearTimeout(refreshTimeout);
      clearTimeout(loadTimeout);
      window.removeEventListener("load", refresh);
      window.removeEventListener("resize", refresh);
      pending.forEach((img) => img.removeEventListener("load", refresh));
      pending.forEach((img) => img.removeEventListener("error", refresh));
      ScrollTrigger.removeEventListener("refresh", debugLog);
      if (debugScroll) {
        ScrollTrigger.defaults({ markers: false });
      }
      gsap.ticker.remove(update);
      lenis.off("scroll", ScrollTrigger.update);
      lenis.destroy();
    };
  }, []);

  useEffect(() => {
    return () => {
      thunderSoundRef.current?.unload();
      if (fallbackThunderUrlRef.current) {
        URL.revokeObjectURL(fallbackThunderUrlRef.current);
      }
    };
  }, []);

  return (
    <main className="bg-background text-foreground">
      <Hero onStrike={playThunder} soundEnabled={soundEnabled} toggleSound={handleToggleSound} />
      <About />
      <WhatWeDo />
      <Projects />
      <Team />
      <footer className="px-6 pb-10 pt-20 text-center text-sm text-white/40 md:px-14">
        Silent Thunder Squad © 2026
      </footer>
    </main>
  );
}
