import { useLayoutEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import SplitType from "split-type";

gsap.registerPlugin(ScrollTrigger);

const stats = [
  { value: "4+", label: "Production Projects" },
  { value: "6", label: "Team Members" },
  { value: "2024", label: "Founded" },
];

export default function About() {
  const sectionRef = useRef(null);
  const labelRef = useRef(null);
  const headingRef = useRef(null);
  const bodyRef = useRef(null);
  const statsRef = useRef(null);
  const lineRef = useRef(null);
  const imageColRef = useRef(null);

  useLayoutEffect(() => {
    if (!sectionRef.current) return;

    const ctx = gsap.context(() => {
      const headingSplit = new SplitType(headingRef.current, { types: "lines,words" });

      headingSplit.lines.forEach((line) => {
        const wrap = document.createElement("div");
        wrap.style.overflow = "hidden";
        line.parentNode.insertBefore(wrap, line);
        wrap.appendChild(line);
      });

      const paragraphs = bodyRef.current.querySelectorAll("p");
      const statItems = statsRef.current.querySelectorAll("[data-stat]");

      // Set hidden states
      gsap.set(labelRef.current, { opacity: 0, x: -16 });
      gsap.set(headingSplit.lines, { yPercent: 110 });
      gsap.set(paragraphs, { opacity: 0, y: 28 });
      gsap.set(lineRef.current, { scaleX: 0, transformOrigin: "left center" });
      gsap.set(statItems, { opacity: 0, y: 24 });
      gsap.set(imageColRef.current, { opacity: 0, x: 40 });

      // Scroll-linked reveal
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top 72%",
          end: "top 20%",
          scrub: false,
          once: true,
          toggleActions: "play none none none",
        },
        defaults: { ease: "power3.out" },
      });

      tl.to(labelRef.current, { opacity: 1, x: 0, duration: 0.6 })
        .to(headingSplit.lines, { yPercent: 0, stagger: 0.07, duration: 0.9, ease: "power4.out" }, "-=0.4")
        .to(lineRef.current, { scaleX: 1, duration: 0.7, ease: "power4.inOut" }, "-=0.5")
        .to(paragraphs, { opacity: 1, y: 0, stagger: 0.1, duration: 0.7 }, "-=0.5")
        .to(statItems, { opacity: 1, y: 0, stagger: 0.08, duration: 0.6 }, "-=0.4")
        .to(imageColRef.current, { opacity: 1, x: 0, duration: 0.9 }, "-=0.8");

      return () => headingSplit.revert();
    }, sectionRef.current);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      id="about"
      className="relative section-transition border-t border-white/5 px-6 py-28 md:px-20 md:py-40"
    >
      <div className="mx-auto grid max-w-7xl gap-20 md:grid-cols-2 md:gap-16">
        {/* Left column */}
        <div>
          <p ref={labelRef} className="section-label mb-6">
            About
          </p>
          <h2
            ref={headingRef}
            className="font-display text-[clamp(2.4rem,5vw,4rem)] font-bold leading-[1.08] tracking-tight text-white"
          >
            Who We Are
          </h2>

          <div ref={lineRef} className="mt-8 mb-8 h-px w-16 bg-blue-400/60" />

          <div ref={bodyRef} className="space-y-6 text-base leading-[1.85] text-white/65 md:text-[17px] font-light tracking-wide">
            <p className="transition-all duration-500 hover:text-white/80 [text-shadow:0_1px_3px_rgba(0,0,0,0.2)]">
              We are Computer Science students obsessed with building elegant systems under real constraints — from raw idea to live deployment.
            </p>
            <p className="transition-all duration-500 hover:text-white/80 [text-shadow:0_1px_3px_rgba(0,0,0,0.2)]">
              As a collective of six, we turn experimentation into production-grade experiences, balancing technical rigor with genuine design craft.
            </p>
            <p className="transition-all duration-500 hover:text-white/80 [text-shadow:0_1px_3px_rgba(0,0,0,0.2)]">
              Every decision we make is anchored in practical impact: solving authentic problems through thoughtful engineering.
            </p>
          </div>

          {/* Stats */}
          <div ref={statsRef} className="mt-14 grid grid-cols-3 gap-6 border-t border-white/5 pt-10">
            {stats.map((s) => (
              <div key={s.label} data-stat>
                <p className="font-display text-3xl font-bold text-white">{s.value}</p>
                <p className="mt-1 text-xs text-white/35 leading-snug">{s.label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Right visual column */}
        <div
          ref={imageColRef}
          className="relative hidden md:flex flex-col gap-4"
        >
          <div className="flex-1 rounded-2xl border border-white/5 backdrop-blur-sm bg-gradient-to-br from-white/[0.01] to-transparent hover:border-white/10 transition-all duration-500 overflow-hidden group">
            <div className="flex h-full flex-col justify-between p-8">
              <p className="section-label">Mission Statement</p>
              <blockquote className="font-display text-2xl font-semibold leading-[1.4] text-white/80 tracking-wide group-hover:text-white/90 transition-colors duration-500 [text-shadow:0_2px_4px_rgba(0,0,0,0.3)]">
                "Build systems that matter — practical, principled, and built to last."
              </blockquote>
              <div className="divider" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {["AI Systems", "Full Stack", "Cloud & DevOps", "Product Design"].map((tag, i) => (
              <div
                key={tag}
                className={`reveal reveal-scale reveal-delay-${i + 3} rounded-xl border border-white/5 backdrop-blur-sm bg-gradient-to-br from-white/[0.01] to-transparent hover:border-white/10 hover:bg-gradient-to-br hover:from-blue-500/5 hover:to-purple-500/5 transition-all duration-500 p-5 group`}
              >
                <p className="text-sm font-medium text-white/60 group-hover:text-white/80 transition-colors duration-300">{tag}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
