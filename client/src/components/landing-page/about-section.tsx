"use client";

import { motion } from "framer-motion";

const workflowSteps = [
  {
    title: "Configure the Basics",
    description:
      "Admins set up tables, menu items, and staff roles through the management panels so service starts with clean data.",
  },
  {
    title: "Monitor the Floor",
    description:
      "Teams keep the table board open to watch availability and open tabs update automatically across the room.",
  },
  {
    title: "Run Orders Live",
    description:
      "Orders are created, items added, and statuses toggled from placed to served or cancelled as service unfolds.",
  },
  {
    title: "Review & Improve",
    description:
      "Dashboards surface revenue, ticket volume, and workload trends so managers can wrap the shift with clear insights.",
  },
];

export default function AboutSection() {
  const handleScrollDown = () => {
    const nextSection = document.querySelector("section:nth-of-type(4)");
    if (nextSection) {
      nextSection.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <section
      id="about"
      className="relative min-h-screen flex items-center justify-center overflow-hidden text-white"
    >
      <div className="absolute inset-0 bg-black" />
      <div className="pointer-events-none absolute -top-48 left-1/2 h-[520px] w-[520px] -translate-x-1/2 rounded-full bg-yellow-500/12 blur-[160px]" />
      <div className="pointer-events-none absolute bottom-0 right-0 h-[420px] w-[420px] translate-x-1/4 bg-[radial-gradient(circle_at_bottom_right,_rgba(234,179,8,0.16),transparent_70%)]" />
      <div className="absolute inset-0 bg-[linear-gradient(125deg,rgba(255,255,255,0.03)_0%,transparent_40%,transparent_60%,rgba(255,255,255,0.03)_100%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.04),transparent_60%)]" />

      <div className="relative z-10 w-full max-w-5xl mx-auto px-5 sm:px-6 pt-24 pb-16 sm:py-24 space-y-10 sm:space-y-12 text-center md:text-left">
        <div className="max-w-3xl mx-auto md:mx-0">
          <motion.h2
            className="text-3xl sm:text-4xl lg:text-5xl font-extrabold mb-6 tracking-tight"
            initial={{ opacity: 0, y: -30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.6 }}
            transition={{ duration: 0.7 }}
          >
            The TableTrack service flow
          </motion.h2>
          <motion.p
            className="text-base sm:text-lg text-gray-200"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.6 }}
            transition={{ delay: 0.15, duration: 0.7 }}
          >
            TableTrack keeps operations synced from setup to shift review so
            front-of-house teams and managers act on the same live data.
          </motion.p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
          {workflowSteps.map((step, index) => (
            <motion.div
              key={step.title}
              className="group relative overflow-hidden rounded-3xl border border-white/10 bg-white/5 p-5 sm:p-6 text-left shadow-[0_24px_48px_-32px_rgba(250,204,21,0.4)] transition"
              initial={{ opacity: 0, y: 25 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.4 }}
              transition={{ delay: 0.2 + index * 0.1, duration: 0.6 }}
            >
              <div className="pointer-events-none absolute -top-16 -right-16 h-36 w-36 rounded-full bg-yellow-500/10 blur-3xl transition-all group-hover:bg-yellow-400/20" />
              <span className="inline-flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-full bg-yellow-500/90 text-black font-semibold mb-3 sm:mb-4 text-sm sm:text-base shadow-[0_15px_35px_-20px_rgba(250,204,21,0.8)]">
                {index + 1}
              </span>
              <h3 className="text-lg sm:text-xl font-semibold mb-2 text-yellow-400">
                {step.title}
              </h3>
              <p className="text-sm sm:text-base text-zinc-200 leading-relaxed">
                {step.description}
              </p>
            </motion.div>
          ))}
        </div>

        <motion.div
          className="flex justify-center md:justify-start"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.4 }}
          transition={{ delay: 0.6, duration: 0.6 }}
        >
          <button
            type="button"
            onClick={handleScrollDown}
            className="inline-flex items-center gap-2 rounded-xl cursor-pointer bg-yellow-500/90 px-7 py-3 text-sm font-semibold uppercase tracking-[0.2em] text-black shadow-[0_20px_40px_-24px_rgba(250,204,21,0.75)] transition hover:bg-yellow-400 focus:outline-none focus-visible:ring-2 focus-visible:ring-yellow-300 focus-visible:ring-offset-2 focus-visible:ring-offset-black sm:text-base"
          >
            Hear From Our Users
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
              className="h-4 w-4"
            >
              <path d="M10.293 15.707a1 1 0 010-1.414L13.586 11H4a1 1 0 110-2h9.586l-3.293-3.293a1 1 0 111.414-1.414l5 5a1 1 0 010 1.414l-5 5a1 1 0 01-1.414 0z" />
            </svg>
          </button>
        </motion.div>
      </div>
    </section>
  );
}
