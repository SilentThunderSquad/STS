import { useEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Lenis from "lenis";
import Hero from "@/components/Hero";
import About from "@/components/About";
import WhatWeDo from "@/components/WhatWeDo";
import Projects from "@/components/Projects";
import Team from "@/components/Team";
import ScrollPlane from "@/components/ScrollPlane";
import useScrollReveal from "@/lib/useScrollReveal";

gsap.registerPlugin(ScrollTrigger);

export default function App() {
  /* ─── Scroll Reveal (IntersectionObserver powered) ─── */
  useScrollReveal({ threshold: 0.12, rootMargin: "0px 0px -80px 0px" });

  useEffect(() => {
    const debugScroll =
      import.meta.env.DEV &&
      typeof window !== "undefined" &&
      new URLSearchParams(window.location.search).get("debugScroll") === "1";

    if (debugScroll) {
      ScrollTrigger.defaults({ markers: true });
    }

    /* ─── Lenis: buttery smooth scrolling ─── */
    const lenis = new Lenis({
      duration: 1.4,
      smoothWheel: true,
      wheelMultiplier: 0.85,
      syncTouch: true,
      touchMultiplier: 1.1,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    });

    lenis.on("scroll", ScrollTrigger.update);

    const update = (time) => {
      lenis.raf(time * 1000);
    };

    gsap.ticker.add(update);
    gsap.ticker.lagSmoothing(0);

    /* ─── Parallax: subtle depth on sections ─── */
    const parallaxElements = document.querySelectorAll(".parallax-slow");
    parallaxElements.forEach((el) => {
      gsap.to(el, {
        y: -50,
        ease: "none",
        scrollTrigger: {
          trigger: el,
          start: "top bottom",
          end: "bottom top",
          scrub: 1.5,
        },
      });
    });

    const parallaxFast = document.querySelectorAll(".parallax-fast");
    parallaxFast.forEach((el) => {
      gsap.to(el, {
        y: -100,
        ease: "none",
        scrollTrigger: {
          trigger: el,
          start: "top bottom",
          end: "bottom top",
          scrub: 1,
        },
      });
    });

    /* ─── Refresh logic ─── */
    const refresh = () => ScrollTrigger.refresh();
    const debugLog = () => {
      if (!debugScroll) return;
      const summary = ScrollTrigger.getAll().map((st, index) => ({
        idx: index,
        id: st.vars?.id ?? "n/a",
        start: Math.round(st.start),
        end: Math.round(st.end),
        trigger: st.trigger?.className ?? st.trigger?.tagName ?? "unknown",
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
    <>
      <ScrollPlane />

      {/* ── GLOBAL PAGE BACKGROUND ── */}
      <div className="page-bg" aria-hidden>
        {/* Base deep field */}
        <div className="page-bg__base" />
        {/* Large violet orb — upper left */}
        <div className="page-bg__orb page-bg__orb--violet" />
        {/* Cyan orb — lower right */}
        <div className="page-bg__orb page-bg__orb--cyan" />
        {/* Mid purple bloom — center */}
        <div className="page-bg__orb page-bg__orb--purple" />
        {/* Noise grain overlay */}
        <div className="page-bg__noise" />
        {/* Horizontal rule lines (subtle grid) */}
        <div className="page-bg__grid" />
      </div>

      <main className="page-main">
        <Hero />
        <About />
        <WhatWeDo />
        <Projects />
        <Team />

        {/* Footer Tagline */}
        <footer className="relative px-6 py-10 md:py-24">
          <div className="mx-auto max-w-7xl flex items-center justify-center">
            <div className="reveal reveal-up text-center">
              <p className="font-display text-2xl md:text-3xl font-bold tracking-tight text-white/85">
                Made for and by{" "}
                <span className="bg-gradient-to-r from-violet-400 via-indigo-300 to-cyan-400 bg-clip-text text-transparent">
                  Silent Thunder Squad
                </span>
              </p>
              <div className="mt-4 w-24 h-px mx-auto bg-gradient-to-r from-transparent via-violet-400/50 to-transparent"></div>
            </div>
          </div>
        </footer>
      </main>
    </>
  );
}
