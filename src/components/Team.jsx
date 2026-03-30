import { useLayoutEffect, useRef, useState, useCallback } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { team } from "@/data/content";

gsap.registerPlugin(ScrollTrigger);

/* ─── Layout constants ─── */
const N = team.length;
const TWO_PI = Math.PI * 2;
const SEG = TWO_PI / N;

/* Half Circle Orbit Dimensions */
const R = 750;                // Radius for the half-circle

/* Photo & depth settings */
const PHOTO = 180;            // base photo element px
const HERO_S = 1.9;           // scale at front (active)
const MIN_S = 0.3;            // scale at back
const MIN_O = 0.15;           // opacity at back
const MAX_BLUR = 12;          // px blur at back

export default function Team() {
  const sectionRef = useRef(null);
  const memberEls = useRef([]);
  const infoParts = useRef({});
  const counterRef = useRef(null);
  const activeRef = useRef(0);
  const [activeIdx, setActiveIdx] = useState(0);

  /* ── Position every member on the 3D Half-Circle path ── */
  const layout = useCallback((progress) => {
    const rot = progress * (N - 1) * SEG;
    let bestI = 0, bestD = Infinity;

    // Responsive radius
    let currentR = 750;
    let isMobile = false;
    if (typeof window !== "undefined") {
      if (window.innerWidth <= 850) { currentR = 450; isMobile = true; }
      else if (window.innerWidth <= 1100) currentR = 550;
      else if (window.innerWidth <= 1400) currentR = 650;
    }

    memberEls.current.forEach((el, i) => {
      if (!el) return;
      const raw = i * SEG - rot;
      const a = Math.atan2(Math.sin(raw), Math.cos(raw)); // -PI to PI
      const depth = (1 + Math.cos(a)) / 2; // 1 at front (a=0), 0 at back (a=PI)

      // The center of the circle is 0,0 which is on the right edge.
      // x should protrude to the left (negative x)
      const x = -Math.cos(a) * currentR;
      
      // Flow from bottom (-y when a<0, or wait, sin is negative when a<0, so -sin is positive -> bottom)
      const y = Math.sin(a) * currentR * -1;
      
      // Keep them somewhat upright or add a little tilt
      const rotX = a * 20;
      const rotZ = isMobile ? 90 : 0; // Counter-rotate for the -90deg stage on mobile

      const s = MIN_S + (HERO_S - MIN_S) * depth;
      const o = MIN_O + (1 - MIN_O) * depth;
      const b = MAX_BLUR * (1 - depth);
      const z = Math.round(depth * 100);
      const hero = depth > 0.95;

      gsap.set(el, {
        xPercent: -50, 
        yPercent: -50, 
        x, 
        y, 
        scale: s,
        opacity: hero ? 1 : o, 
        zIndex: z,
        transformPerspective: 1200, 
        rotationX: rotX,
        rotationZ: rotZ,
        filter: `blur(${b.toFixed(1)}px)`,
        boxShadow: hero
          ? "0 0 50px rgba(91,156,246,0.22),0 0 100px rgba(91,156,246,0.08),0 14px 44px rgba(0,0,0,0.5)"
          : `0 0 ${(10*depth)|0}px rgba(91,156,246,${(0.05*depth).toFixed(2)}),0 ${(4*depth)|0}px ${(14*depth)|0}px rgba(0,0,0,0.3)`,
        borderColor: hero
          ? "rgba(255,255,255,0.25)"
          : `rgba(255,255,255,${(0.02+0.04*depth).toFixed(2)})`,
      });

      if (Math.abs(a) < bestD) { bestD = Math.abs(a); bestI = i; }
    });

    if (bestI !== activeRef.current) {
      activeRef.current = bestI;
      setActiveIdx(bestI);
    }
  }, []);

  /* ── ScrollTrigger: pin + scrub ── */
  useLayoutEffect(() => {
    if (!sectionRef.current) return;
    layout(0);

    const ctx = gsap.context(() => {
      ScrollTrigger.create({
        trigger: sectionRef.current,
        start: "top top",
        end: () => `+=${(N - 1) * window.innerHeight}`,
        pin: true,
        scrub: 0.5,
        onUpdate: (self) => layout(self.progress),
      });

    }, sectionRef.current);

    return () => ctx.revert();
  }, [layout]);

  /* ── Staggered info entrance on active change ── */
  useLayoutEffect(() => {
    const p = infoParts.current;
    if (!p.badge) return;
    const els = [p.badge, p.name, p.role, p.line, p.bio, p.link];
    const tl = gsap.timeline({ defaults: { ease: "power3.out" } });
    els.forEach((el, i) => {
      if (!el) return;
      tl.fromTo(el,
        { opacity: 0, y: 18 - i * 1 },
        { opacity: 1, y: 0, duration: 0.38 },
        i * 0.06
      );
    });
    if (counterRef.current) {
      tl.fromTo(counterRef.current,
        { opacity: 0, y: 10 },
        { opacity: 1, y: 0, duration: 0.3 },
        0.05
      );
    }
  }, [activeIdx]);

  const m = team[activeIdx];

  return (
    <section ref={sectionRef} id="team" className="team-pin-section">
      {/* Ambient glow */}
      <div className="team-ambient" />

      <div className="team-pin-layout">
        {/* ──── LEFT: Info panel ──── */}
        <div className="team-pin-info relative z-20">
          {/* Counter */}
          <div ref={counterRef} className="team-counter">
            <span className="team-counter-num">
              {String(activeIdx + 1).padStart(2, "0")}
            </span>
            <span className="team-counter-sep">/</span>
            <span className="team-counter-total">
              {String(N).padStart(2, "0")}
            </span>
          </div>

          <p className="section-label mb-6">The Squad</p>

          <div className="team-info-card">
            <span ref={(el) => (infoParts.current.badge = el)} className="team-role-badge">
              {m.isLead && <span>⚡</span>}
              {m.isLead ? "Team Lead" : m.role}
            </span>

            <h3 ref={(el) => (infoParts.current.name = el)}
              className="font-display text-3xl font-bold text-white md:text-4xl tracking-tight mb-1.5">
              {m.name}
            </h3>

            <p ref={(el) => (infoParts.current.role = el)}
              className="text-xs uppercase tracking-[0.2em] text-white/25 mb-6 font-medium">
              {m.role}
            </p>

            <div ref={(el) => (infoParts.current.line = el)} className="team-accent-line" />

            {/* Separated Description Block */}
            <div 
              ref={(el) => (infoParts.current.bio = el)}
              className="relative p-0 mb-8"
            >
              <div className="absolute top-0 left-0 w-8 h-px bg-blue-400/50"></div>
              <p className="text-[14.5px] leading-[1.8] text-white/80 font-normal tracking-wide pt-4">
                {m.bio}
              </p>
            </div>

            <a ref={(el) => (infoParts.current.link = el)}
              href={m.portfolio} target="_blank" rel="noopener noreferrer"
              className="hero-btn hero-btn-primary text-xs">
              View Portfolio ↗
            </a>
          </div>

          {/* Scroll progress dots */}
          <div className="team-dots mt-8">
            {team.map((t, i) => (
              <div key={t.name}
                className={`team-dot${i === activeIdx ? " team-dot--active" : ""}`} />
            ))}
          </div>

          <p className="team-scroll-hint">
            <span className="team-scroll-hint-icon">↓</span> Scroll to explore orbits
          </p>
        </div>

        {/* ──── RIGHT: Solar System Stage ──── */}
        <div className="team-solar-stage">
          {/* Half-circle table outline */}
          <div className="team-half-circle" />
          
          {/* Glowing Solar Core */}
          <div className="team-solar-core" />

          {/* All members on the orbital path */}
          {team.map((t, i) => (
            <div
              key={t.name}
              ref={(el) => (memberEls.current[i] = el)}
              className="team-photo-wrap"
              style={{ width: PHOTO, height: PHOTO, left: "0", top: "0" }}
            >
              <img src={t.image} alt={t.name}
                className="h-full w-full object-cover" draggable={false} />
              <div 
                className="team-photo-label"
                style={{ opacity: activeIdx === i ? 1 : 0 }}
              >
                {t.name}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
