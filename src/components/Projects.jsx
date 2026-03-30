import { useLayoutEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Github, ArrowUpRight } from "lucide-react";
import { projects } from "@/data/content";

gsap.registerPlugin(ScrollTrigger);

export default function Projects() {
  const sectionRef = useRef(null);
  const labelRef = useRef(null);
  const headingRef = useRef(null);
  const trackRef = useRef(null);
  const stageRef = useRef(null);
  const cardRefs = useRef([]);

  useLayoutEffect(() => {
    if (!sectionRef.current) return;

    const ctx = gsap.context(() => {
      // Header reveal
      gsap.set(labelRef.current, { opacity: 0, x: -16 });
      gsap.set(headingRef.current, { opacity: 0, y: 28 });

      gsap.to(labelRef.current, {
        opacity: 1, x: 0, duration: 0.6, ease: "power3.out",
        scrollTrigger: { trigger: sectionRef.current, start: "top 78%", once: true },
      });
      gsap.to(headingRef.current, {
        opacity: 1, y: 0, duration: 0.8, ease: "power3.out",
        scrollTrigger: { trigger: sectionRef.current, start: "top 78%", once: true, delay: 0.1 },
      });

      const mm = gsap.matchMedia();

      // --- Desktop: horizontal scroll carousel pinned ---
      mm.add("(min-width: 768px)", () => {
        const cards = gsap.utils.toArray(trackRef.current.querySelectorAll("[data-card]"));

        const getScrollDist = () =>
          Math.max(0, trackRef.current.scrollWidth - window.innerWidth);

        const tween = gsap.to(trackRef.current, {
          x: () => -getScrollDist(),
          ease: "none",
        });

        ScrollTrigger.create({
          id: "projects-pin",
          trigger: sectionRef.current,
          start: "top top",
          end: () => `+=${getScrollDist() + window.innerHeight * 0.6}`,
          pin: stageRef.current,
          animation: tween,
          scrub: 1.2,
          invalidateOnRefresh: true,
          anticipatePin: 1,
        });

        // Each card fades in as it enters viewport during horizontal scroll
        cards.forEach((card) => {
          gsap.fromTo(
            card,
            { opacity: 0.2, scale: 0.96 },
            {
              opacity: 1,
              scale: 1,
              ease: "none",
              scrollTrigger: {
                trigger: card,
                containerAnimation: tween,
                start: "left 90%",
                end: "left 50%",
                scrub: true,
              },
            }
          );
        });

        return () => {};
      });

      // --- Mobile: vertical reveal stagger ---
      mm.add("(max-width: 767px)", () => {
        const mCards = sectionRef.current.querySelectorAll("[data-mcard]");
        gsap.set(mCards, { opacity: 0, y: 40 });
        gsap.to(mCards, {
          opacity: 1,
          y: 0,
          stagger: 0.12,
          duration: 0.8,
          ease: "power3.out",
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top 70%",
            once: true,
          },
        });
        return () => {};
      });
    }, sectionRef.current);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      id="projects"
      className="relative section-transition border-t border-white/5"
    >
      {/* ── Desktop pinned horizontal ── */}
      <div
        ref={stageRef}
        className="relative hidden min-h-screen md:flex md:flex-col"
      >
        {/* Section header */}
        <div className="flex items-end justify-between px-8 pt-12 pb-8 md:px-14 md:pt-16 md:pb-10 lg:px-20 lg:pt-20 lg:pb-12">
          <div>
            <p ref={labelRef} className="section-label mb-4">
              Work
            </p>
            <h2
              ref={headingRef}
              className="font-display text-[clamp(2rem,4vw,4rem)] font-bold tracking-tight text-white"
            >
              Project Showcase
            </h2>
          </div>
          <p className="reveal reveal-left reveal-delay-3 max-w-xs text-right text-sm text-white/35 leading-relaxed hidden lg:block">
            Drag to explore — each project engineered for real-world impact.
          </p>
        </div>

        {/* Carousel track */}
        <div
          ref={trackRef}
          className="flex flex-1 items-end gap-6 px-8 pb-14 md:px-14 md:pb-16 lg:px-20 lg:pb-20 will-change-transform"
          style={{ width: "max-content" }}
        >
          {projects.map((project, i) => (
            <article
              key={project.title}
              data-card
              ref={(el) => (cardRefs.current[i] = el)}
              className="group flex w-[480px] shrink-0 flex-col overflow-hidden rounded-2xl border border-white/5 bg-white/[0.02]"
            >
              {/* Image area */}
              <div className="relative aspect-[16/10] overflow-hidden bg-white/[0.03]">
                <img
                  src={project.image}
                  alt={project.title}
                  className="h-full w-full object-cover opacity-70 transition-all duration-700 group-hover:opacity-90 group-hover:scale-[1.03]"
                  loading="lazy"
                  onError={(e) => {
                    e.currentTarget.src =
                      "https://images.unsplash.com/photo-1518773553398-650c184e0bb3?auto=format&fit=crop&w=1200&q=80";
                  }}
                />
                {/* Index badge */}
                <span className="absolute left-5 top-5 rounded-full border border-white/10 bg-black/50 px-3 py-1 text-xs font-medium text-white/50 backdrop-blur-sm">
                  {String(i + 1).padStart(2, "0")}
                </span>
              </div>

              {/* Card info */}
              <div className="flex flex-1 flex-col justify-between gap-5 p-6">
                <div>
                  <h3 className="font-display text-xl font-semibold text-white">
                    {project.title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-white/45">
                    {project.description}
                  </p>
                </div>
                <div className="flex items-center gap-4 border-t border-white/5 pt-5">
                  <a
                    href={project.code}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-2 text-xs font-medium text-white/50 transition-colors hover:text-white"
                    aria-label={`View source code for ${project.title}`}
                  >
                    <Github className="h-4 w-4" />
                    Source
                  </a>
                  <a
                    href={project.demo}
                    target="_blank"
                    rel="noreferrer"
                    className="ml-auto flex items-center gap-1.5 text-xs font-medium text-blue-400/80 transition-colors hover:text-blue-300"
                    aria-label={`View live demo for ${project.title}`}
                  >
                    Live Demo
                    <ArrowUpRight className="h-3.5 w-3.5" />
                  </a>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>

      {/* ── Mobile stacked ── */}
      <div className="px-6 py-24 md:hidden">
        <div className="mb-12">
          <p className="section-label mb-4">Work</p>
          <h2 className="font-display text-4xl font-bold tracking-tight text-white">
            Project Showcase
          </h2>
        </div>
        <div className="flex flex-col gap-6">
          {projects.map((project, i) => (
            <article
              key={project.title}
              data-mcard
              className="group overflow-hidden rounded-2xl border border-white/5 bg-white/[0.02]"
            >
              <div className="relative aspect-[16/10] overflow-hidden">
                <img
                  src={project.image}
                  alt={project.title}
                  className="h-full w-full object-cover opacity-70 transition-all duration-700 group-hover:opacity-90 group-hover:scale-[1.03]"
                  loading="lazy"
                  onError={(e) => {
                    e.currentTarget.src =
                      "https://images.unsplash.com/photo-1518773553398-650c184e0bb3?auto=format&fit=crop&w=1200&q=80";
                  }}
                />
                <span className="absolute left-4 top-4 rounded-full border border-white/10 bg-black/50 px-2.5 py-0.5 text-xs text-white/50 backdrop-blur-sm">
                  {String(i + 1).padStart(2, "0")}
                </span>
              </div>
              <div className="p-5">
                <h3 className="font-display text-lg font-semibold text-white">{project.title}</h3>
                <p className="mt-1.5 text-sm text-white/45 leading-relaxed">{project.description}</p>
                <div className="mt-5 flex items-center gap-4 border-t border-white/5 pt-4">
                  <a
                    href={project.code}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-2 text-xs font-medium text-white/50 hover:text-white transition-colors"
                  >
                    <Github className="h-4 w-4" /> Source
                  </a>
                  <a
                    href={project.demo}
                    target="_blank"
                    rel="noreferrer"
                    className="ml-auto flex items-center gap-1.5 text-xs font-medium text-blue-400/80 hover:text-blue-300 transition-colors"
                  >
                    Live Demo <ArrowUpRight className="h-3.5 w-3.5" />
                  </a>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
