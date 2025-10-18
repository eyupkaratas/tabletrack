"use client";

import { motion } from "framer-motion";

export default function HeroSection() {
  const handleScrollDown = () => {
    const nextSection = document.querySelector("section:nth-of-type(2)");
    if (nextSection) {
      nextSection.scrollIntoView({ behavior: "smooth" });
    }
  };
  return (
    <section
      className="relative h-screen flex flex-col items-center justify-center text-center text-white"
      style={{
        backgroundImage: "url('/hero1.jpg')",
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      {/* Overlay */}
      <div className="absolute inset-0 bg-black/60" />

      <div className="relative z-10 max-w-2xl px-4">
        <motion.h1
          className="text-7xl font-extrabold mb-6 tracking-tight"
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          TableTrack
        </motion.h1>

        {/* animasyon*/}
        <div className="flex flex-col items-center space-y-2 text-4xl font-semibold mb-10">
          {["Smart", "Simple", "Seamless"].map((word, i) => (
            <motion.span
              key={word}
              initial={{ opacity: 0, y: -30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 + i * 0.4, duration: 0.6 }}
              className="text-primary drop-shadow-lg"
            >
              {word}
            </motion.span>
          ))}
        </div>

        <motion.p
          className="text-lg mb-8 text-gray-200"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2, duration: 0.8 }}
        >
          The next-gen platform that transforms how cafés & restaurants manage
          tables, orders, and staff — all in one place.
        </motion.p>

        <motion.a
          onClick={handleScrollDown}
          className="px-8 py-3  text-yellow-500 bg-black/50 rounded-lg font-semibold hover:bg-black/90 transition animate-neon-pulse cursor-pointer"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 2.5, duration: 0.8 }}
        >
          Explore the Platform
        </motion.a>
      </div>
    </section>
  );
}
