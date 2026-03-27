import { useLayoutEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Github, ArrowUpRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { projects } from "@/data/content";

gsap.registerPlugin(ScrollTrigger);

export default function Projects() {
  const sectionRef = useRef(null);
  const trackRef = useRef(null);
  const stageRef = useRef(null);

  useLayoutEffect(() => {
    if (!sectionRef.current || !trackRef.current) return;

    const mm = gsap.matchMedia();

    mm.add("(min-width: 768px)", () => {
      const cards = gsap.utils.toArray(trackRef.current.querySelectorAll("[data-project]"));
      gsap.set(cards, { opacity: 0.35, scale: 0.92, willChange: "transform, opacity" });

      const getDistance = () => Math.max(0, trackRef.current.scrollWidth - window.innerWidth);

      const tween = gsap.to(trackRef.current, {
        x: () => -getDistance(),
        ease: "none"
      });

      const pinTrigger = ScrollTrigger.create({
        trigger: sectionRef.current,
        start: "top top",
        end: () => `+=${getDistance() + window.innerHeight * 0.8}`,
        pin: stageRef.current,
        animation: tween,
        scrub: true,
        invalidateOnRefresh: true,
        anticipatePin: 1
      });

      const cardTriggers = cards.map((card) =>
        ScrollTrigger.create({
          trigger: card,
          start: "left 82%",
          end: "left 38%",
          scrub: true,
          containerAnimation: tween,
          onUpdate: (self) => {
            gsap.set(card, {
              opacity: gsap.utils.interpolate(0.35, 1, self.progress),
              scale: gsap.utils.interpolate(0.92, 1, self.progress),
              overwrite: "auto"
            });
          }
        })
      );

      return () => {
        cardTriggers.forEach((trigger) => trigger.kill());
        pinTrigger.kill();
        tween.kill();
      };
    });

    return () => mm.revert();
  }, []);

  return (
    <section ref={sectionRef} className="relative overflow-hidden bg-background py-20">
      <div ref={stageRef} className="relative z-20 hidden min-h-screen bg-background md:block">
        <div className="mb-10 px-14 pt-16">
          <h2 className="font-display text-6xl font-black tracking-tight">Project Showcase</h2>
          <p className="mt-3 max-w-xl text-white/70">A scroll narrative of products engineered for practical impact.</p>
        </div>
        <div ref={trackRef} className="flex gap-8 px-14 will-change-transform">
          {projects.map((project) => (
            <Card
              key={project.title}
              data-project
              className="w-[min(78vw,680px)] shrink-0 overflow-hidden border-white/15 bg-black/70"
            >
              <div className="aspect-[16/9] overflow-hidden">
                <img
                  src={project.image}
                  alt={project.title}
                  className="h-full w-full object-cover"
                  onError={(event) => {
                    event.currentTarget.src =
                      "https://images.unsplash.com/photo-1518773553398-650c184e0bb3?auto=format&fit=crop&w=1200&q=80";
                  }}
                />
              </div>
              <div className="space-y-4 p-6">
                <h3 className="font-display text-3xl font-bold">{project.title}</h3>
                <p className="max-w-xl text-white/70">{project.description}</p>
                <div className="flex flex-wrap gap-3">
                  <Button asChild size="sm">
                    <a href={project.code} target="_blank" rel="noreferrer">
                      <Github className="h-4 w-4" />
                      View Code
                    </a>
                  </Button>
                  <Button variant="outline" asChild size="sm">
                    <a href={project.demo} target="_blank" rel="noreferrer">
                      <ArrowUpRight className="h-4 w-4" />
                      Live Demo
                    </a>
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>

      <div className="grid gap-6 px-6 md:hidden">
        <div className="mb-2">
          <h2 className="font-display text-4xl font-black tracking-tight">Project Showcase</h2>
          <p className="mt-3 max-w-xl text-white/70">A scroll narrative of products engineered for practical impact.</p>
        </div>
        {projects.map((project) => (
          <Card key={project.title} className="overflow-hidden border-white/15 bg-black/70">
            <div className="aspect-[16/10] overflow-hidden">
              <img
                src={project.image}
                alt={project.title}
                className="h-full w-full object-cover"
                onError={(event) => {
                  event.currentTarget.src =
                    "https://images.unsplash.com/photo-1518773553398-650c184e0bb3?auto=format&fit=crop&w=1200&q=80";
                }}
              />
            </div>
            <div className="space-y-4 p-5">
              <h3 className="font-display text-2xl font-bold">{project.title}</h3>
              <p className="text-white/70">{project.description}</p>
              <div className="flex flex-wrap gap-3">
                <Button asChild size="sm">
                  <a href={project.code} target="_blank" rel="noreferrer">
                    <Github className="h-4 w-4" />
                    View Code
                  </a>
                </Button>
                <Button variant="outline" asChild size="sm">
                  <a href={project.demo} target="_blank" rel="noreferrer">
                    <ArrowUpRight className="h-4 w-4" />
                    Live Demo
                  </a>
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </section>
  );
}
