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
    <main className="bg-[#06070d] text-[#e8eaf2]">
      <Hero />
      <About />
      <WhatWeDo />
      <Projects />
      <Team />

      {/* Footer with scroll reveal */}
      <footer className="relative border-t border-white/5 px-6 py-12 md:px-20">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-6 flex-wrap">
          <p className="reveal reveal-up reveal-delay-1 font-display text-sm font-semibold tracking-wide text-white/60">
            Silent Thunder Squad
          </p>
          <nav className="flex gap-6 text-xs text-white/30">
            {["About", "Work", "Services", "Team"].map((link, i) => (
              <a
                key={link}
                href={`#${link.toLowerCase()}`}
                className={`reveal reveal-up reveal-delay-${i + 2} hover:text-white/60 transition-colors duration-200`}
              >
                {link}
              </a>
            ))}
          </nav>
          <p className="reveal reveal-up reveal-delay-6 text-xs text-white/20">© 2026 — All rights reserved</p>
        </div>
      </footer>
    </main>
    </>
  );
}
