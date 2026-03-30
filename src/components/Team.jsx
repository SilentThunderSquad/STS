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
  const headingRef = useRef(null);
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

    const tl = gsap.timeline();

    // Badge: fade + slide up with a slight scale
    if (p.badge) tl.fromTo(p.badge,
      { opacity: 0, y: 14, scale: 0.92 },
      { opacity: 1, y: 0, scale: 1, duration: 0.42, ease: "back.out(1.6)" },
      0
    );

    // Name: slide up with a soft blue glow burst
    if (p.name) tl.fromTo(p.name,
      { opacity: 0, y: 22, filter: "blur(4px)" },
      { opacity: 1, y: 0, filter: "blur(0px)", duration: 0.52, ease: "power4.out" },
      0.07
    );

    // Role subtitle: fade from left
    if (p.role) tl.fromTo(p.role,
      { opacity: 0, x: -10 },
      { opacity: 1, x: 0, duration: 0.36, ease: "power2.out" },
      0.16
    );

    // Accent line: scale from left
    if (p.line) tl.fromTo(p.line,
      { opacity: 0, scaleX: 0, transformOrigin: "left center" },
      { opacity: 1, scaleX: 1, duration: 0.5, ease: "power3.out" },
      0.22
    );

    // Bio block: rise up with slight x-drift and fade
    if (p.bio) tl.fromTo(p.bio,
      { opacity: 0, y: 20, x: -8 },
      { opacity: 1, y: 0, x: 0, duration: 0.55, ease: "power3.out" },
      0.3
    );

    // Skills tags: fade up
    if (p.skills) tl.fromTo(p.skills,
      { opacity: 0, y: 12 },
      { opacity: 1, y: 0, duration: 0.4, ease: "power2.out" },
      0.42
    );

    // CTA buttons: pop in
    if (p.link) tl.fromTo(p.link,
      { opacity: 0, y: 10, scale: 0.94 },
      { opacity: 1, y: 0, scale: 1, duration: 0.4, ease: "back.out(1.4)" },
      0.54
    );

    if (counterRef.current) {
      tl.fromTo(counterRef.current,
        { opacity: 0, y: 10 },
        { opacity: 1, y: 0, duration: 0.35, ease: "power2.out" },
        0.04
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

          {/* Section eyebrow label */}
          <p className="section-label mb-4">The Squad</p>

          {/* Section heading — matches site-wide style */}
          <h2
            ref={headingRef}
            className="font-display font-bold leading-[1.08] tracking-tight text-white mb-6"
            style={{ fontSize: 'clamp(2.4rem, 5vw, 4rem)', letterSpacing: '-0.02em' }}
          >
            Meet the{" "}
            <span
              style={{
                background: 'linear-gradient(135deg, #fff 30%, rgba(91,156,246,0.85) 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
            >
              Team
            </span>
          </h2>

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

          <div className="team-info-card">
            <span ref={(el) => (infoParts.current.badge = el)} className="team-role-badge">
              {m.isLead && <span>⚡</span>}
              {m.isLead ? "Team Lead" : m.role}
            </span>

            <h3 ref={(el) => (infoParts.current.name = el)}
              className="font-display text-4xl font-extrabold text-white md:text-5xl tracking-tight mb-1.5"
              style={{ letterSpacing: '-0.025em', textShadow: '0 2px 30px rgba(91,156,246,0.15)' }}>
              {m.name}
            </h3>

            <p ref={(el) => (infoParts.current.role = el)}
              className="text-xs uppercase tracking-[0.2em] text-white/25 mb-5 font-medium">
              {m.role}
            </p>

            <div ref={(el) => (infoParts.current.line = el)} className="team-accent-line" />

            {/* Description Block */}
            <div
              ref={(el) => (infoParts.current.bio = el)}
              className="relative mb-5"
            >
              {/* Glowing left border accent */}
              <div className="absolute left-0 top-0 bottom-0 w-px"
                style={{
                  background: 'linear-gradient(to bottom, transparent, rgba(91,156,246,0.7), transparent)',
                  boxShadow: '0 0 12px 1px rgba(91,156,246,0.35)'
                }}
              />
              <div className="pl-5 pt-1">
                <span
                  style={{
                    display: 'block',
                    fontFamily: '"Plus Jakarta Sans", sans-serif',
                    fontSize: '3.5rem',
                    lineHeight: '0.6',
                    color: 'rgba(91,156,246,0.18)',
                    marginBottom: '0.5rem',
                    userSelect: 'none',
                  }}
                >
                  &#8220;
                </span>
                <p
                  style={{
                    fontFamily: '"Inter", sans-serif',
                    fontSize: '17px',
                    lineHeight: '1.85',
                    color: 'rgba(255,255,255,0.72)',
                    fontWeight: 300,
                    letterSpacing: '0.01em',
                    textShadow: '0 1px 16px rgba(0,0,0,0.4)',
                  }}
                  className="transition-colors duration-500 hover:text-white/90"
                >
                  {m.bio}
                </p>
              </div>
            </div>

            {/* Skills tags */}
            <div
              ref={(el) => (infoParts.current.skills = el)}
              className="team-skills-row"
            >
              {(m.skills || []).map((skill) => (
                <span key={skill} className="team-skill-tag">{skill}</span>
              ))}
            </div>

            {/* Divider */}
            <div className="team-card-divider" />

            {/* Action buttons */}
            <div
              ref={(el) => (infoParts.current.link = el)}
              className="team-action-row"
            >
              {/* GitHub */}
              <a href={m.github} target="_blank" rel="noopener noreferrer"
                className="team-btn team-btn-ghost" title="GitHub">
                <svg width="17" height="17" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z"/>
                </svg>
                GitHub
              </a>

              {/* LinkedIn */}
              <a href={m.linkedin} target="_blank" rel="noopener noreferrer"
                className="team-btn team-btn-linkedin" title="LinkedIn">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                </svg>
                LinkedIn
              </a>

              {/* Portfolio */}
              <a href={m.portfolio} target="_blank" rel="noopener noreferrer"
                className="team-btn team-btn-primary" title="Portfolio">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>
                  <polyline points="15 3 21 3 21 9"/>
                  <line x1="10" y1="14" x2="21" y2="3"/>
                </svg>
                Portfolio
              </a>
            </div>
          </div>

          {/* Scroll progress dots */}
          <div className="team-dots mt-6">
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
