"use client";
import { useEffect } from "react";
import FooterSection from "./footer-section";
import HeroSection from "./hero-section";
import SecondSection from "./second-section";
import ThirdSection from "./third-section";

export default function ScrollSections() {
  useEffect(() => {
    window.history.scrollRestoration = "manual"; // tarayıcının otomatik scroll koruması
    window.scrollTo({ top: 0, behavior: "instant" });
    const sections = Array.from(
      document.querySelectorAll<HTMLElement>("main > section[id]")
    );
    if (sections.length === 0) {
      return;
    }

    let index = 0;
    let isScrolling = false;
    let scrollTimeout: number | undefined;

    const handleScroll = (event: WheelEvent) => {
      if (isScrolling) return;

      const direction = Math.sign(event.deltaY);
      if (direction === 0) return;

      if (index === sections.length - 1) return;

      const currentSection = sections[index];
      const sectionTop = currentSection.offsetTop;
      const sectionBottom = sectionTop + currentSection.offsetHeight;
      const scrollY = window.scrollY;
      const viewportBottom = scrollY + window.innerHeight;
      const tolerance = 4;

      if (direction > 0 && viewportBottom < sectionBottom - tolerance) {
        return;
      }

      if (direction < 0 && scrollY > sectionTop + tolerance) {
        return;
      }

      event.preventDefault();

      const nextIndex = Math.min(
        sections.length - 1,
        Math.max(0, index + direction)
      );
      if (nextIndex === index) return;

      index = nextIndex;
      isScrolling = true;
      sections[index].scrollIntoView({ behavior: "smooth", block: "start" });

      window.clearTimeout(scrollTimeout);
      scrollTimeout = window.setTimeout(() => {
        isScrolling = false;
      }, 900);
    };

    window.addEventListener("wheel", handleScroll, { passive: false });
    return () => {
      window.removeEventListener("wheel", handleScroll);
      window.clearTimeout(scrollTimeout);
    };
  }, []);

  return (
    <main>
      <section id="hero" className="">
        <HeroSection />
      </section>
      <section id="second" className="">
        <SecondSection />
      </section>
      <section id="about" className="">
        <ThirdSection />
      </section>
      <section id="footer" className="min-h-screen">
        <FooterSection />
      </section>
    </main>
  );
}
