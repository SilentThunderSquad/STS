import { useLayoutEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import SplitType from "split-type";

gsap.registerPlugin(ScrollTrigger);

export default function Hero() {
  const sectionRef = useRef(null);
  const contentRef = useRef(null);
  const thunderRef = useRef(null);
  const glowRef = useRef(null);
  const flashRef = useRef(null);

  useLayoutEffect(() => {
    if (!sectionRef.current) return;

    const ctx = gsap.context(() => {
      const textTargets = sectionRef.current.querySelectorAll("[data-split]");
      const splitInstances = Array.from(textTargets).map(
        (el) => new SplitType(el, { types: "chars" })
      );
      const chars = splitInstances.flatMap((item) => item.chars);

      gsap.set(chars, { yPercent: 120, opacity: 0, willChange: "transform, opacity" });
      gsap.set(thunderRef.current, { scale: 0.8, transformOrigin: "50% 50%", willChange: "transform" });
      gsap.set(glowRef.current, { opacity: 0.2, willChange: "opacity, filter" });
      gsap.set(flashRef.current, { autoAlpha: 0 });

      const tl = gsap.timeline({
        defaults: { ease: "none" },
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top top",
          end: "+=260%",
          pin: true,
          scrub: true
        }
      });

      tl.to(chars, { yPercent: 0, opacity: 1, stagger: 0.012, duration: 0.25 }, 0.05)
        // Keep hero content bounded in viewport; parallax the bolt instead of shifting whole layout.
        .to(thunderRef.current, { yPercent: -6, duration: 0.45 }, 0.15)
        .to(thunderRef.current, { scale: 1.05, duration: 0.28 }, 0.2)
        .to(glowRef.current, { opacity: 0.5, filter: "drop-shadow(0 0 20px rgba(128,226,255,0.55))" }, 0.2)
        .to(thunderRef.current, { scale: 1.55, rotation: -4, duration: 0.2 }, 0.44)
        .to(flashRef.current, { autoAlpha: 0.75, duration: 0.03 }, 0.44)
        .to(flashRef.current, { autoAlpha: 0, duration: 0.1 }, 0.47)
        .to(contentRef.current, { x: -12, y: -6, duration: 0.04 }, 0.44)
        .to(contentRef.current, { x: 10, y: 4, duration: 0.04 }, 0.48)
        .to(contentRef.current, { x: 0, y: 0, duration: 0.06 }, 0.52)
        .to(thunderRef.current, { scale: 1.8, rotation: 0, duration: 0.35 }, 0.62)
        .to(thunderRef.current, { yPercent: 0, duration: 0.28 }, 0.72)
        .to(glowRef.current, { opacity: 0.16, duration: 0.28 }, 0.72)
        .to(chars, { opacity: 0.2, stagger: 0.005, duration: 0.25 }, 0.8);

      return () => {
        splitInstances.forEach((split) => split.revert());
      };
    }, sectionRef.current);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      className="relative min-h-screen overflow-hidden bg-[radial-gradient(circle_at_20%_0%,rgba(77,144,255,0.16),transparent_30%),radial-gradient(circle_at_80%_100%,rgba(90,180,255,0.14),transparent_40%),#050507]"
    >
      <div
        ref={flashRef}
        className="pointer-events-none absolute inset-0 z-30 bg-gradient-to-br from-sky-200/60 via-white/20 to-transparent mix-blend-screen"
      />
      <div className="absolute inset-0 z-0 opacity-40">
        <div className="absolute left-[-15%] top-[-10%] h-80 w-80 rounded-full bg-sky-400/20 blur-3xl" />
        <div className="absolute bottom-[-15%] right-[-10%] h-96 w-96 rounded-full bg-blue-500/20 blur-3xl" />
      </div>

      <div ref={contentRef} className="relative z-20 flex min-h-screen flex-col justify-between px-6 py-10 md:px-14 md:py-16">
        <div className="flex items-start justify-between pt-2 md:pt-4">
          <h1
            data-split
            className="font-display text-[clamp(2.25rem,5.8vw,4.9rem)] font-semibold uppercase tracking-[0.16em] text-white/95"
          >
            Silent
          </h1>
          <div className="h-9 w-20" aria-hidden />
        </div>

        <div className="relative mt-8 md:mt-2">
          <h2
            data-split
            className="font-display text-[19vw] font-black uppercase leading-none tracking-tight text-white md:text-[14vw]"
          >
            Thunder
          </h2>
          <svg
            ref={thunderRef}
            viewBox="0 0 220 220"
            className="pointer-events-none absolute -right-8 -top-20 h-40 w-40 md:-right-2 md:-top-24 md:h-64 md:w-64"
            aria-hidden
          >
            <defs>
              <linearGradient id="boltGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#d0f5ff" />
                <stop offset="100%" stopColor="#7cd8ff" />
              </linearGradient>
            </defs>
            <path
              ref={glowRef}
              d="M132 8L76 96h34l-24 116 64-100h-36l18-104z"
              fill="url(#boltGradient)"
              stroke="#dff8ff"
              strokeWidth="4"
              strokeLinejoin="round"
            />
          </svg>
        </div>

        <div className="flex items-end justify-between pb-2 md:pb-4">
          <p className="max-w-md text-sm text-white/65 md:text-base">
            Cinematic engineering collective crafting bold digital systems that solve real-world challenges.
          </p>
          <h3
            data-split
            className="font-display text-[clamp(3rem,8.4vw,7.5rem)] font-extrabold uppercase tracking-[0.12em] text-white/95"
          >
            Squad
          </h3>
        </div>
      </div>
    </section>
  );
}
