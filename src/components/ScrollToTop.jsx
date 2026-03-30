import { useState, useEffect, useRef } from "react";
import gsap from "gsap";
import { ChevronUp } from "lucide-react";

export default function ScrollToTop() {
  const [visible, setVisible] = useState(false);
  const btnRef = useRef(null);

  useEffect(() => {
    const toggleVisible = () => {
      const scrolled = document.documentElement.scrollTop;
      if (scrolled > 400) {
        setVisible(true);
      } else if (scrolled <= 400) {
        setVisible(false);
      }
    };

    window.addEventListener("scroll", toggleVisible);
    return () => window.removeEventListener("scroll", toggleVisible);
  }, []);

  useEffect(() => {
    if (!btnRef.current) return;
    
    if (visible) {
      gsap.to(btnRef.current, {
        opacity: 1,
        y: 0,
        scale: 1,
        pointerEvents: "auto",
        duration: 0.4,
        ease: "back.out(1.7)",
      });
    } else {
      gsap.to(btnRef.current, {
        opacity: 0,
        y: 20,
        scale: 0.8,
        pointerEvents: "none",
        duration: 0.35,
        ease: "power2.in",
      });
    }
  }, [visible]);

  const scrollToTop = () => {
    // Lenis should handle this automatically if active
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  return (
    <button
      ref={btnRef}
      onClick={scrollToTop}
      className="scroll-to-top-btn"
      aria-label="Scroll to top"
      style={{
        opacity: 0,
        transform: "translateY(20px) scale(0.8)",
        pointerEvents: "none",
      }}
    >
      {/* Background glow circle */}
      <div className="btn-glow" />
      
      {/* Glass content */}
      <div className="btn-inner">
        <ChevronUp size={20} strokeWidth={2.5} className="btn-icon" />
      </div>
      
      {/* Percentage ring progress could go here, but let's keep it clean */}
    </button>
  );
}
