import { useEffect } from "react";

export const useParallaxHoverEffect = () => {
  useEffect(() => {
    const visualContainer = document.querySelector(".hero__visual-content");
    if (
      visualContainer &&
      window.matchMedia("(prefers-reduced-motion: no-preference)").matches
    ) {
      const handleMouseMove = (e: MouseEvent) => {
        const { clientX, clientY } = e;
        const heroRect = visualContainer.getBoundingClientRect();
        const x =
          (clientX - heroRect.left - heroRect.width / 2) / (heroRect.width / 2);
        const y =
          (clientY - heroRect.top - heroRect.height / 2) /
          (heroRect.height / 2);

        const elements = document.querySelectorAll(".visual-element");
        elements.forEach((el) => {
          const depth = parseFloat(el.getAttribute("data-depth") || "0");
          const moveX = -x * (depth * 25);
          const moveY = -y * (depth * 25);
          const htmlElement = el as HTMLElement;
          if (htmlElement.classList.contains("image-bubble")) {
            htmlElement.style.transform = `translate(-50%, -50%) translate(${moveX}px, ${moveY}px)`;
          } else {
            htmlElement.style.transform = `translate(${moveX}px, ${moveY}px)`;
          }
        });
      };
      visualContainer.addEventListener(
        "mousemove",
        handleMouseMove as EventListener
      );

      return () => {
        visualContainer.removeEventListener(
          "mousemove",
          handleMouseMove as EventListener
        );
      };
    }
  }, []);
};
