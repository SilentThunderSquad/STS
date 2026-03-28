import { useEffect, useRef } from "react";

const CONFIG = {
  particleCount: 200,
  maxSpeed: 0.25,
  particleRadius: 1.8,
  connectionDistance: 140,
  mouseRadius: 200,
  particleColor: "rgba(91,156,246,",  // append opacity + )
  lineColor: "rgba(91,156,246,",
  bgAlpha: 0,
};

export default function ParticleNetwork() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");

    let w = 0;
    let h = 0;
    let mouse = { x: -9999, y: -9999 };
    let animId;

    // Particles
    const particles = [];

    const resize = () => {
      w = canvas.width  = window.innerWidth;
      h = canvas.height = window.innerHeight;
    };

    const createParticles = () => {
      particles.length = 0;
      for (let i = 0; i < CONFIG.particleCount; i++) {
        particles.push({
          x: Math.random() * w,
          y: Math.random() * h,
          vx: (Math.random() - 0.5) * CONFIG.maxSpeed * 2,
          vy: (Math.random() - 0.5) * CONFIG.maxSpeed * 2,
          r: CONFIG.particleRadius * (0.5 + Math.random() * 0.8),
          baseAlpha: 0.15 + Math.random() * 0.35,
        });
      }
    };

    const onResize = () => {
      resize();
      createParticles();
    };

    const onMouseMove = (e) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
    };

    const onMouseLeave = () => {
      mouse.x = -9999;
      mouse.y = -9999;
    };

    const draw = () => {
      ctx.clearRect(0, 0, w, h);

      // Update + draw particles
      for (const p of particles) {
        p.x += p.vx;
        p.y += p.vy;

        // Wrap around edges
        if (p.x < -10) p.x = w + 10;
        if (p.x > w + 10) p.x = -10;
        if (p.y < -10) p.y = h + 10;
        if (p.y > h + 10) p.y = -10;

        // Distance to mouse
        const dx = p.x - mouse.x;
        const dy = p.y - mouse.y;
        const distMouse = Math.sqrt(dx * dx + dy * dy);

        // Glow near mouse
        const proximity = Math.max(0, 1 - distMouse / CONFIG.mouseRadius);
        const alpha = p.baseAlpha + proximity * 0.55;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r + proximity * 1.5, 0, Math.PI * 2);
        ctx.fillStyle = `${CONFIG.particleColor}${alpha.toFixed(2)})`;
        ctx.fill();

        // Subtle glow ring on close particles
        if (proximity > 0.3) {
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.r + proximity * 6, 0, Math.PI * 2);
          ctx.fillStyle = `${CONFIG.particleColor}${(proximity * 0.08).toFixed(3)})`;
          ctx.fill();
        }
      }

      // Draw connections
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const a = particles[i];
          const b = particles[j];
          const dx = a.x - b.x;
          const dy = a.y - b.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist > CONFIG.connectionDistance) continue;

          // Only draw if at least one particle is near mouse
          const dxAm = a.x - mouse.x;
          const dyAm = a.y - mouse.y;
          const dxBm = b.x - mouse.x;
          const dyBm = b.y - mouse.y;
          const distAm = Math.sqrt(dxAm * dxAm + dyAm * dyAm);
          const distBm = Math.sqrt(dxBm * dxBm + dyBm * dyBm);
          const closestToMouse = Math.min(distAm, distBm);

          if (closestToMouse > CONFIG.mouseRadius) continue;

          const mouseProx = 1 - closestToMouse / CONFIG.mouseRadius;
          const distFade = 1 - dist / CONFIG.connectionDistance;
          const lineAlpha = mouseProx * distFade * 0.45;

          ctx.beginPath();
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(b.x, b.y);
          ctx.strokeStyle = `${CONFIG.lineColor}${lineAlpha.toFixed(3)})`;
          ctx.lineWidth = 0.6 + mouseProx * 0.6;
          ctx.stroke();
        }
      }

      animId = requestAnimationFrame(draw);
    };

    resize();
    createParticles();
    draw();

    window.addEventListener("resize", onResize);
    window.addEventListener("mousemove", onMouseMove);
    document.addEventListener("mouseleave", onMouseLeave);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", onResize);
      window.removeEventListener("mousemove", onMouseMove);
      document.removeEventListener("mouseleave", onMouseLeave);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden
      style={{
        position: "fixed",
        inset: 0,
        width: "100%",
        height: "100%",
        pointerEvents: "none",
        zIndex: 1,
      }}
    />
  );
}
