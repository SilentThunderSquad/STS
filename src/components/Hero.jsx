import { useLayoutEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import SplitType from "split-type";

gsap.registerPlugin(ScrollTrigger);

export default function Hero() {
  const sectionRef  = useRef(null);
  const eyebrowRef  = useRef(null);
  const headlineRef = useRef(null);
  const lineRef     = useRef(null);
  const subRef      = useRef(null);
  const ctaRef      = useRef(null);
  const hintRef     = useRef(null);

  // aurora orb refs
  const orb1 = useRef(null);
  const orb2 = useRef(null);
  const orb3 = useRef(null);
  const orb4 = useRef(null);

  useLayoutEffect(() => {
    if (!sectionRef.current) return;

    const ctx = gsap.context(() => {

      /* ─────────────────────────────────────────
         1. AURORA BACKGROUND — GSAP infinite drift
         ───────────────────────────────────────── */
      const drift = (el, x, y, dur) =>
        gsap.to(el, { x, y, duration: dur, ease: "sine.inOut", repeat: -1, yoyo: true });

      drift(orb1.current,  130,  -90, 14);
      drift(orb2.current, -110,   95, 18);
      drift(orb3.current,   70,  110, 11);
      drift(orb4.current, -140,  -55, 16);

      /* ─────────────────────────────────────────
         2. SPLIT HEADLINE into chars
            Wrap each char in an overflow:hidden clip
         ───────────────────────────────────────── */
      const headlineSplit = new SplitType(headlineRef.current, { types: "chars,words" });

      // Wrap every char in a clip container so chars slide up into view
      headlineSplit.chars.forEach((char) => {
        const wrap = document.createElement("span");
        wrap.style.display = "inline-block";
        wrap.style.overflow = "hidden";
        wrap.style.verticalAlign = "top";
        char.parentNode.insertBefore(wrap, char);
        wrap.appendChild(char);
        // Reset char position inside clip
        gsap.set(char, { yPercent: 110, display: "inline-block" });
      });

      /* ─────────────────────────────────────────
         3. SPLIT SUBTEXT into words (word-by-word reveal)
         ───────────────────────────────────────── */
      const subSplit = new SplitType(subRef.current, { types: "words" });
      subSplit.words.forEach((word) => {
        const wrap = document.createElement("span");
        wrap.style.display = "inline-block";
        wrap.style.overflow = "hidden";
        word.parentNode.insertBefore(wrap, word);
        wrap.appendChild(word);
        gsap.set(word, { yPercent: 110, display: "inline-block" });
      });

      /* ─────────────────────────────────────────
         4. CTA — simple staggered fade-up per button
         ───────────────────────────────────────── */
      const ctaBtns = Array.from(ctaRef.current.querySelectorAll("a"));
      gsap.set(ctaBtns, { opacity: 0, y: 36, scale: 0.75, transformOrigin: "center bottom" });

      /* ─────────────────────────────────────────
         5. Initial states (non-split elements)
         ───────────────────────────────────────── */
      gsap.set(eyebrowRef.current, { opacity: 0, y: 16 });
      gsap.set(lineRef.current, { scaleX: 0, transformOrigin: "center center" });
      gsap.set(hintRef.current, { opacity: 0 });
      // Hide CTA wrapper so borders/bg don't flash before chars animate
      gsap.set(hintRef.current, { opacity: 0 });

      /* ─────────────────────────────────────────
         6. ENTRANCE TIMELINE — strictly sequential
         ───────────────────────────────────────── */
      const enter = gsap.timeline({ delay: 0.2 });

      // Step A: eyebrow fades up
      enter.to(eyebrowRef.current, {
        opacity: 1, y: 0,
        duration: 0.65,
        ease: "power3.out",
      });

      // Step B: headline chars clip up, left→right stagger
      enter.to(
        headlineSplit.chars,
        {
          yPercent: 0,
          duration: 1.0,
          ease: "power4.out",
          stagger: { amount: 0.6, ease: "power1.inOut" },
        },
        "+=0.05"   // tiny gap after eyebrow
      );

      // Step C: hairline expands (starts while last chars still animating)
      enter.to(lineRef.current, {
        scaleX: 1,
        duration: 0.85,
        ease: "expo.inOut",
      }, "-=0.2");

      // Step D: subtext words clip up, slight delay after headline done
      enter.to(
        subSplit.words,
        {
          yPercent: 0,
          duration: 0.75,
          ease: "power3.out",
          stagger: { amount: 0.45, ease: "power1.out" },
        },
        "+=0.1"
      );

      // Step E: CTA buttons spring popup — scale + y with back.out overshoot
      enter.to(ctaBtns, {
        opacity: 1,
        y: 0,
        scale: 1,
        duration: 0.8,
        ease: "back.out(2.2)",
        stagger: 0.14,
      }, "+=0.1");

      // Step F: scroll hint fades in last
      enter.to(hintRef.current, {
        opacity: 1,
        duration: 0.8,
        ease: "power2.out",
      }, "-=0.1");

      /* ─────────────────────────────────────────
         7. SCROLL: headline drifts up and out
         ───────────────────────────────────────── */
      gsap.to(headlineRef.current, {
        y: -80,
        opacity: 0,
        ease: "none",
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "55% top",
          end: "bottom top",
          scrub: true,
        },
      });

      /* ─────────────────────────────────────────
         8. SCROLL: orb parallax
         ───────────────────────────────────────── */
      gsap.to([orb1.current, orb3.current], {
        y: "-=130",
        ease: "none",
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top top",
          end: "bottom top",
          scrub: 1.8,
        },
      });

      return () => {
        headlineSplit.revert();
        subSplit.revert();
      };
    }, sectionRef.current);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden px-6"
      aria-label="Hero"
    >

      {/* ── AURORA BACKGROUND ── */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>

        {/* Orb 1 — violet/indigo, top-left */}
        <div
          ref={orb1}
          className="absolute -left-[8%] top-[8%] h-[680px] w-[680px] rounded-full"
          style={{
            background: "radial-gradient(circle at 40% 40%, rgba(124,106,247,0.22), transparent 68%)",
            filter: "blur(44px)",
          }}
        />

        {/* Orb 2 — deep indigo, bottom-right */}
        <div
          ref={orb2}
          className="absolute -right-[6%] bottom-[2%] h-[720px] w-[720px] rounded-full"
          style={{
            background: "radial-gradient(circle at 58% 60%, rgba(79,62,216,0.22), transparent 65%)",
            filter: "blur(50px)",
          }}
        />

        {/* Orb 3 — cyan, center-right */}
        <div
          ref={orb3}
          className="absolute right-[20%] top-[28%] h-[380px] w-[380px] rounded-full"
          style={{
            background: "radial-gradient(circle at 50% 50%, rgba(34,211,238,0.14), transparent 70%)",
            filter: "blur(38px)",
          }}
        />

        {/* Orb 4 — rose-violet, top-right */}
        <div
          ref={orb4}
          className="absolute right-[-4%] top-[6%] h-[520px] w-[520px] rounded-full"
          style={{
            background: "radial-gradient(circle at 40% 30%, rgba(167,78,250,0.13), transparent 65%)",
            filter: "blur(48px)",
          }}
        />

        {/* Dot matrix */}
        <div
          className="absolute inset-0"
          style={{
            backgroundImage:
              "radial-gradient(circle, rgba(255,255,255,0.065) 1px, transparent 1px)",
            backgroundSize: "36px 36px",
          }}
        />

        {/* Edge vignette */}
        <div
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse 85% 85% at 50% 50%, transparent 45%, #080b18 100%)",
          }}
        />
      </div>

      {/* ── CONTENT ── */}
      <div className="relative z-10 flex flex-col items-center text-center w-full">

        {/* Eyebrow */}
        <p ref={eyebrowRef} className="section-label mb-8 tracking-[0.25em]">
          Engineering Collective · Est. 2024
        </p>

        {/* Headline — single line, giant */}
        <h1
          ref={headlineRef}
          className="font-display font-bold leading-[1.0] tracking-tight text-white whitespace-nowrap"
          style={{ fontSize: "clamp(2.8rem, 9.5vw, 10rem)" }}
        >
          Silent Thunder Squad
        </h1>

        {/* Hairline */}
        <div
          ref={lineRef}
          className="mt-10 mb-9 h-px w-20 bg-blue-400/50"
        />

        {/* Subtext — word split reveal */}
        <p
          ref={subRef}
          className="max-w-lg text-base leading-loose text-white/45 md:text-lg"
          style={{ wordSpacing: "0.05em" }}
        >
          CS students building production-grade systems that solve
          real-world problems — from idea to deployment.
        </p>

        {/* CTAs — spring popup entrance, smooth hover/press via CSS */}
        <div
          ref={ctaRef}
          className="mt-11 flex items-center justify-center gap-5 flex-wrap"
        >
          <a
            href="#projects"
            className="hero-btn hero-btn-primary"
            style={{ textDecoration: "none" }}
          >
            View Work <span className="text-blue-400" aria-hidden>↓</span>
          </a>
          <a
            href="#team"
            className="hero-btn hero-btn-ghost"
            style={{ textDecoration: "none" }}
          >
            Meet the team →
          </a>
        </div>
      </div>

      {/* Scroll hint */}
      <div
        ref={hintRef}
        className="absolute bottom-8 flex flex-col items-center gap-2"
      >
        <span className="section-label tracking-[0.2em]">Scroll</span>
        <div className="h-9 w-px bg-gradient-to-b from-white/25 to-transparent" />
      </div>
    </section>
  );
}
