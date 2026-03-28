import { useLayoutEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const services = [
  {
    num: "01",
    title: "Product Engineering",
    description:
      "From idea to deployment — we ship production-grade products grounded in actual user needs, with no shortcuts on quality.",
  },
  {
    num: "02",
    title: "Rapid Prototyping",
    description:
      "We iterate fast, challenge assumptions, and validate ideas through working prototypes before committing to full builds.",
  },
  {
    num: "03",
    title: "Systems Thinking",
    description:
      "Every decision balances reliability, scalability, and measurable outcomes — engineering under the constraint that things must work in the real world.",
  },
];

export default function WhatWeDo() {
  const sectionRef = useRef(null);
  const labelRef = useRef(null);
  const headingRef = useRef(null);
  const itemsRef = useRef([]);

  useLayoutEffect(() => {
    if (!sectionRef.current) return;

    const ctx = gsap.context(() => {
      gsap.set(labelRef.current, { opacity: 0, x: -16 });
      gsap.set(headingRef.current, { opacity: 0, y: 32 });
      gsap.set(itemsRef.current, { opacity: 0, y: 40 });

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top 72%",
          once: true,
          toggleActions: "play none none none",
        },
        defaults: { ease: "power3.out" },
      });

      tl.to(labelRef.current, { opacity: 1, x: 0, duration: 0.6 })
        .to(headingRef.current, { opacity: 1, y: 0, duration: 0.8 }, "-=0.3")
        .to(itemsRef.current, { opacity: 1, y: 0, stagger: 0.12, duration: 0.8 }, "-=0.4");

      // Per-item underline reveal on scroll
      itemsRef.current.forEach((item) => {
        const line = item?.querySelector("[data-line]");
        if (!line) return;
        gsap.set(line, { scaleX: 0, transformOrigin: "left center" });
        gsap.to(line, {
          scaleX: 1,
          duration: 0.7,
          ease: "power4.inOut",
          scrollTrigger: {
            trigger: item,
            start: "top 78%",
            once: true,
            toggleActions: "play none none none",
          },
        });
      });
    }, sectionRef.current);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      id="services"
      className="section-transition border-t border-white/5 px-6 py-28 md:px-20 md:py-40"
    >
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-20 grid md:grid-cols-2 md:items-end gap-6">
          <div>
            <p ref={labelRef} className="section-label mb-6">
              Capabilities
            </p>
            <h2
              ref={headingRef}
              className="font-display text-[clamp(2.4rem,5vw,4rem)] font-bold leading-[1.08] tracking-tight text-white"
            >
              What We Do
            </h2>
          </div>
          <p className="reveal reveal-left reveal-delay-3 text-white/40 text-base leading-relaxed max-w-sm md:ml-auto">
            Three core disciplines that define how<br className="hidden md:block" />
            we approach every project.
          </p>
        </div>

        {/* Service items */}
        <div className="divide-y divide-white/5">
          {services.map((s, i) => (
            <div
              key={s.num}
              ref={(el) => (itemsRef.current[i] = el)}
              className="group grid gap-4 py-10 md:grid-cols-[80px_1fr_1.5fr] md:gap-10 md:items-start"
            >
              <p className="section-label pt-1">{s.num}</p>

              <h3 className="font-display text-xl font-semibold text-white group-hover:text-blue-300 transition-colors duration-300">
                {s.title}
                <div
                  data-line
                  className="mt-3 h-px w-12 bg-blue-400/50"
                />
              </h3>

              <p className="text-white/45 leading-relaxed text-base">
                {s.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
