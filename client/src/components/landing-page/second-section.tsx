"use client";

import { motion } from "framer-motion";

const features = [
  {
    title: "Real-Time Table Board",
    description:
      "Monitor availability and active tabs in one live view, with every table state synced across the service dashboard.",
  },
  {
    title: "Order Lifecycle Control",
    description:
      "Create tickets, tweak quantities, and mark items as placed, served, or cancelled so the entire team sees the latest snapshot.",
  },
  {
    title: "Shift Insights & Admin",
    description:
      "Configure products, tables, and staff roles while dashboards surface the revenue and workload trends that matter.",
  },
];

export default function SecondSection() {
  const handleScrollDown = () => {
    const nextSection = document.querySelector("section:nth-of-type(3)");
    if (nextSection) {
      nextSection.scrollIntoView({ behavior: "smooth" });
    }
  };
  return (
    <section
      id="second"
      className="relative min-h-screen flex items-center justify-center overflow-hidden text-white"
    >
      <div className="absolute inset-0 bg-[url('/hero1.jpg')] bg-cover bg-center" />
      <div className="absolute inset-0 bg-black/75 backdrop-blur-sm" />

      <div className="relative z-10 max-w-6xl mx-auto px-5 sm:px-6 pt-24 pb-16 sm:py-24 space-y-10 sm:space-y-14 text-center md:text-left">
        <div className="max-w-2xl mx-auto md:mx-0">
          <motion.h2
            className="text-3xl sm:text-4xl lg:text-5xl font-extrabold mb-6 tracking-tight"
            initial={{ opacity: 0, y: -40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.6 }}
            transition={{ duration: 0.8 }}
          >
            Control every table and ticket in one place
          </motion.h2>
          <motion.p
            className="text-base sm:text-lg text-gray-200"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.6 }}
            transition={{ delay: 0.2, duration: 0.8 }}
          >
            TableTrack unifies the table board, order management, and admin
            tools into a single workspace. Monitor availability, launch orders,
            and follow item progress without juggling spreadsheets or radios.
          </motion.p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              className="group relative overflow-hidden rounded-3xl border border-white/10 bg-white/5 p-5 sm:p-6 text-left shadow-[0_24px_48px_-32px_rgba(250,204,21,0.4)] transition"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.4 }}
              transition={{ delay: 0.2 + index * 0.2, duration: 0.6 }}
            >
              <div className="pointer-events-none absolute -top-16 -right-16 h-36 w-36 rounded-full bg-yellow-500/10 blur-3xl transition-all group-hover:bg-yellow-400/20" />
              <div className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-full bg-yellow-500/90 font-semibold text-black shadow-[0_15px_35px_-20px_rgba(250,204,21,0.8)] sm:h-11 sm:w-11">
                {index + 1}
              </div>
              <h3 className="text-xl font-semibold mb-3 text-yellow-400">
                {feature.title}
              </h3>
              <p className="text-sm sm:text-base text-gray-200 leading-relaxed">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </div>

        <motion.div
          className="flex justify-center md:justify-start"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.5 }}
          transition={{ delay: 0.8, duration: 0.6 }}
        >
          <a
            className="px-8 py-3  text-yellow-500 bg-black/50 rounded-lg font-semibold hover:bg-black/90 transition animate-neon-pulse cursor-pointer"
            onClick={handleScrollDown}
          >
            Discover the workflow
          </a>
        </motion.div>
      </div>
    </section>
  );
}
