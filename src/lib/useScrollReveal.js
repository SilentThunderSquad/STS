import { useEffect } from "react";

/**
 * Initialises an IntersectionObserver that adds `.is-visible` to every
 * element with the `.reveal` class once it enters the viewport.
 *
 * Call this hook ONCE in the root component (App).
 *
 * Options:
 *   threshold – percentage of the element visible before triggering (0 – 1)
 *   rootMargin – CSS margin string to grow/shrink the trigger area
 */
export default function useScrollReveal({
  threshold = 0.15,
  rootMargin = "0px 0px -60px 0px",
} = {}) {
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            // Once revealed, stop observing for performance
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold, rootMargin }
    );

    // Observe all .reveal elements currently in the DOM
    const targets = document.querySelectorAll(".reveal");
    targets.forEach((el) => observer.observe(el));

    // MutationObserver to catch dynamically added .reveal elements
    const mutationObs = new MutationObserver((mutations) => {
      mutations.forEach((m) => {
        m.addedNodes.forEach((node) => {
          if (node.nodeType !== 1) return;
          if (node.classList?.contains("reveal")) {
            observer.observe(node);
          }
          // Also check children of added nodes
          node.querySelectorAll?.(".reveal").forEach((child) => {
            observer.observe(child);
          });
        });
      });
    });

    mutationObs.observe(document.body, { childList: true, subtree: true });

    return () => {
      observer.disconnect();
      mutationObs.disconnect();
    };
  }, [threshold, rootMargin]);
}
