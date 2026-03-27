import { useEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Lenis from "lenis";
import Hero from "@/components/Hero";
import About from "@/components/About";
import WhatWeDo from "@/components/WhatWeDo";
import Projects from "@/components/Projects";
import Team from "@/components/Team";

gsap.registerPlugin(ScrollTrigger);

export default function App() {
  useEffect(() => {
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

  return (
    <main className="bg-background text-foreground">
      <Hero />
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
