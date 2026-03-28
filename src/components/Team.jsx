import { useLayoutEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { team } from "@/data/content";

gsap.registerPlugin(ScrollTrigger);

/* Organic scattered positions — px offsets from cluster center
   Varied base sizes for visual interest */
const BUBBLE_MAP = [
  { x:   0, y:   0,   baseSize: 105 },  // 0 — leader
  { x: -200, y: -110, baseSize: 72  },   // 1
  { x:  215, y:  -90, baseSize: 58  },   // 2
  { x: -190, y:  100, baseSize: 66  },   // 3
  { x:  200, y:  115, baseSize: 54  },   // 4
  { x:   5, y:  200,  baseSize: 62  },   // 5
];

const SELECTED_SIZE = 250;

export default function Team() {
  const sectionRef = useRef(null);
  const infoRef    = useRef(null);
  const bubbleRefs = useRef([]);
  const pulseRef   = useRef(null);
  const [active, setActive] = useState(0);

  const switchTo = (idx) => {
    if (idx === active) return;
    const tl = gsap.timeline({ onComplete: () => setActive(idx) });

    // Shrink current big bubble
    const curEl = bubbleRefs.current[active];
    if (curEl) {
      tl.to(curEl, { width: BUBBLE_MAP[active].baseSize, height: BUBBLE_MAP[active].baseSize, duration: 0.3, ease: "power3.in" });
    }
    // Fade info + pulse
    tl.to(infoRef.current, { opacity: 0, x: -16, duration: 0.22, ease: "power2.in" }, "<");
    tl.to(pulseRef.current, { scale: 0.6, opacity: 0, duration: 0.25 }, "<");

    // Grow new bubble
    const newEl = bubbleRefs.current[idx];
    if (newEl) {
      tl.to(newEl, { width: SELECTED_SIZE, height: SELECTED_SIZE, duration: 0.5, ease: "back.out(1.6)" }, "-=0.08");
    }
  };

  /* Info slide-in on change */
  useLayoutEffect(() => {
    if (!infoRef.current || !pulseRef.current) return;
    gsap.fromTo(infoRef.current, { opacity: 0, x: -24 }, { opacity: 1, x: 0, duration: 0.5, ease: "power3.out", delay: 0.12 });
    gsap.fromTo(pulseRef.current, { scale: 0.6, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.6, ease: "power3.out", delay: 0.1 });
  }, [active]);

  /* Initial sizes + entrance + floating */
  useLayoutEffect(() => {
    if (!sectionRef.current) return;

    bubbleRefs.current.forEach((el, i) => {
      if (!el) return;
      gsap.set(el, { width: i === 0 ? SELECTED_SIZE : BUBBLE_MAP[i].baseSize, height: i === 0 ? SELECTED_SIZE : BUBBLE_MAP[i].baseSize });
    });

    const ctx = gsap.context(() => {
      gsap.from(".team-entrance", {
        y: 50, opacity: 0, duration: 1, ease: "power3.out", stagger: 0.12,
        scrollTrigger: { trigger: sectionRef.current, start: "top 75%", once: true },
      });

      // Gentle float
      bubbleRefs.current.forEach((el, i) => {
        if (!el) return;
        gsap.to(el, {
          y: `+=${5 + i * 3}`, x: `+=${i % 2 === 0 ? 2 : -2}`,
          duration: 3 + i * 0.5, ease: "sine.inOut", repeat: -1, yoyo: true, delay: i * 0.2,
        });
      });

      // Pulse ring breathing
      if (pulseRef.current) {
        gsap.to(pulseRef.current, {
          scale: 1.05, duration: 2.8, ease: "sine.inOut", repeat: -1, yoyo: true,
        });
      }
    }, sectionRef.current);

    return () => ctx.revert();
  }, []);

  const member = team[active];

  return (
    <section
      ref={sectionRef}
      id="team"
      className="relative section-transition py-32 md:py-44 px-6 overflow-hidden"
    >
      {/* Ambient glow behind section */}
      <div
        className="absolute pointer-events-none"
        style={{
          width: 700, height: 700,
          top: "50%", left: "50%",
          transform: "translate(-50%, -50%)",
          background: "radial-gradient(circle, rgba(91,156,246,0.04) 0%, transparent 70%)",
          filter: "blur(40px)",
        }}
      />

      {/* Section header — centered */}
      <div className="team-entrance text-center mb-20 md:mb-28">
        <p className="section-label mb-4">The Squad</p>
        <h2 className="font-display text-4xl font-bold text-white md:text-6xl tracking-tight">
          Meet the Team
        </h2>
        <p className="reveal reveal-blur reveal-delay-3 mt-4 text-sm text-white/25 max-w-md mx-auto">
          Six engineers building production-grade systems — click any member to learn more.
        </p>
      </div>

      {/* Centered two-column: info + bubbles */}
      <div className="team-entrance mx-auto flex flex-col items-center gap-14 lg:flex-row lg:items-center lg:justify-center lg:gap-24" style={{ maxWidth: 1100 }}>

        {/* ── LEFT: Info panel ── */}
        <div ref={infoRef} className="w-full max-w-sm lg:max-w-md order-2 lg:order-1">
          {/* Glassmorphic card */}
          <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] backdrop-blur-sm p-8 md:p-10">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-blue-400/15 bg-blue-400/[0.06] px-4 py-1.5 text-[11px] font-semibold uppercase tracking-[0.15em] text-blue-300/80 mb-6">
              {member.isLead && <span>⚡</span>}
              {member.isLead ? "Team Lead" : member.role}
            </span>

            <h3 className="font-display text-2xl font-bold text-white md:text-3xl mb-1.5 tracking-tight">
              {member.name}
            </h3>

            <p className="text-xs uppercase tracking-[0.2em] text-white/25 mb-6 font-medium">
              {member.role}
            </p>

            {/* Thin accent line */}
            <div className="w-10 h-px bg-gradient-to-r from-blue-400/40 to-transparent mb-6" />

            <p className="text-[15px] leading-[1.7] text-white/40 mb-8">
              {member.bio}
            </p>

            <a
              href={member.portfolio}
              target="_blank"
              rel="noopener noreferrer"
              className="hero-btn hero-btn-primary text-xs"
            >
              View Portfolio ↗
            </a>
          </div>
        </div>

        {/* ── RIGHT: Bubble cluster ── */}
        <div className="relative flex-shrink-0 order-1 lg:order-2" style={{ width: 520, height: 500 }}>

          {/* Decorative orbit rings */}
          {[420, 310].map((size, ri) => (
            <div
              key={ri}
              className={`absolute rounded-full pointer-events-none ${ri === 1 ? "border-dashed" : ""}`}
              style={{
                width: size, height: size,
                top: "50%", left: "50%",
                transform: "translate(-50%, -50%)",
                border: `1px ${ri === 1 ? "dashed" : "solid"} rgba(255,255,255,${ri === 0 ? 0.03 : 0.02})`,
              }}
            />
          ))}

          {/* Animated pulse ring */}
          <div
            ref={pulseRef}
            className="absolute rounded-full pointer-events-none"
            style={{
              width: 290, height: 290,
              top: "50%", left: "50%",
              transform: "translate(-50%, -50%)",
              border: "1px solid rgba(91,156,246,0.12)",
              boxShadow: "0 0 60px rgba(91,156,246,0.05), inset 0 0 50px rgba(91,156,246,0.03)",
            }}
          />

          {/* Connecting lines from active to others */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none" aria-hidden>
            <defs>
              <linearGradient id="lineGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="rgba(91,156,246,0.12)" />
                <stop offset="100%" stopColor="rgba(91,156,246,0.02)" />
              </linearGradient>
            </defs>
            {team.map((_, i) => {
              if (i === active) return null;
              return (
                <line
                  key={i}
                  x1={260 + BUBBLE_MAP[active].x}
                  y1={250 + BUBBLE_MAP[active].y}
                  x2={260 + BUBBLE_MAP[i].x}
                  y2={250 + BUBBLE_MAP[i].y}
                  stroke="url(#lineGrad)"
                  strokeWidth="1"
                  strokeDasharray="5 4"
                />
              );
            })}
          </svg>

          {/* ALL 6 BUBBLES */}
          {team.map((m, i) => {
            const pos = BUBBLE_MAP[i];
            const isActive = i === active;

            return (
              <button
                key={m.name}
                ref={(el) => (bubbleRefs.current[i] = el)}
                onClick={() => switchTo(i)}
                className={`
                  group absolute rounded-full overflow-hidden transition-shadow duration-400
                  focus:outline-none focus:ring-2 focus:ring-blue-400/30
                  ${isActive
                    ? "border-2 border-white/12 z-10 cursor-default"
                    : "border border-white/8 hover:border-blue-400/30 z-[5] cursor-pointer"
                  }
                `}
                style={{
                  left: `calc(50% + ${pos.x}px)`,
                  top: `calc(50% + ${pos.y}px)`,
                  transform: "translate(-50%, -50%)",
                  boxShadow: isActive
                    ? "0 0 35px rgba(91,156,246,0.2), 0 0 80px rgba(91,156,246,0.08), 0 8px 32px rgba(0,0,0,0.4)"
                    : "0 0 15px rgba(91,156,246,0.05), 0 4px 16px rgba(0,0,0,0.3)",
                }}
                aria-label={isActive ? `${m.name} (selected)` : `View ${m.name}`}
              >
                <img
                  src={m.image}
                  alt={m.name}
                  className={`h-full w-full object-cover transition-transform duration-500 ${!isActive ? "group-hover:scale-110" : ""}`}
                />

                {/* Active overlay */}
                {isActive && (
                  <div className="absolute inset-0" style={{ background: "linear-gradient(to top, rgba(6,7,13,0.6) 0%, transparent 50%)" }}>
                    <p className="absolute bottom-4 left-0 right-0 text-center text-white text-sm font-semibold drop-shadow-lg tracking-wide">
                      {m.name}
                    </p>
                  </div>
                )}

                {/* Hover glow ring on small bubbles */}
                {!isActive && (
                  <>
                    <div className="absolute inset-0 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                      style={{ boxShadow: "inset 0 0 20px rgba(91,156,246,0.15)" }}
                    />
                    <span className="absolute -bottom-8 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full bg-black/80 backdrop-blur-sm px-3 py-1 text-[10px] font-medium text-white/70 opacity-0 transition-all duration-300 group-hover:opacity-100 group-hover:-bottom-9 pointer-events-none">
                      {m.name}
                    </span>
                  </>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
}
