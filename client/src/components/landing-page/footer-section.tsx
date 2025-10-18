"use client";

import { ArrowRight, CopyrightIcon, Mail, Quote } from "lucide-react";
import { FormEvent, useState } from "react";

type LandingReview = {
  id: number;
  name: string;
  role: string;
  quote: string;
  highlight: string;
  rating: number;
};

const landingReviews: LandingReview[] = [
  {
    id: 1,
    name: "Emre Çakır",
    role: "Owner - Çakır Büfe",
    highlight: "32% faster table turnover",
    rating: 5,
    quote:
      "TableTrack made our service flow transparent. My father can follow order states on the same screen and guest satisfaction climbed visibly.",
  },
  {
    id: 2,
    name: "Kyle Crane",
    role: "Operations Manager - Rooftop 34",
    highlight: "ROI in 2 weeks",
    rating: 5,
    quote:
      "Having reservations through payments in one panel reduced operational load dramatically. Managing staff rotation is so much easier now.",
  },
  {
    id: 3,
    name: "Tiber Septim",
    role: "Head Chef - Nox Brasserie",
    highlight: "45% drop in complaints",
    rating: 4,
    quote:
      "Orders routed to the kitchen are perfectly synced. Tablet tracking is so clear that service mistakes almost disappeared.",
  },
  {
    id: 4,
    name: "Din Djarin",
    role: "Co-founder - Lokal Pizza",
    highlight: "Lightning-fast setup",
    rating: 5,
    quote:
      "With the cloud-native setup we went live the same day with no technical crew. Our team genuinely enjoys working in TableTrack.",
  },
];

type FormStatus = "idle" | "loading" | "success" | "error";

export default function FooterSection() {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<FormStatus>("idle");
  const [message, setMessage] = useState("");

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!fullName.trim() || !email.trim()) {
      setStatus("error");
      setMessage("Please fill in both name and email.");
      return;
    }

    setStatus("loading");
    setMessage("");

    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "");
      const endpoint = baseUrl ? `${baseUrl}/contact` : "/api/contact";
      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: fullName.trim(),
          email: email.trim(),
        }),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => null);
        throw new Error(
          data?.message ?? "We could not send your request. Please try again."
        );
      }

      setStatus("success");
      setMessage("Thanks! We will get back to you shortly.");
      setFullName("");
      setEmail("");
    } catch (error) {
      setStatus("error");
      setMessage(
        error instanceof Error
          ? error.message
          : "We could not send your request. Please try again."
      );
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-b from-zinc-950 via-black to-black text-white">
      <div className="relative flex-1 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(234,179,8,0.12),transparent_55%)]" />
        <div className="relative mx-auto flex h-full max-w-6xl flex-col justify-center gap-10 px-5 pb-16 pt-28 md:px-8 md:pb-20 md:pt-32 lg:px-10">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full border border-yellow-500/40 bg-yellow-500/10 px-4 py-1 text-xs font-semibold uppercase tracking-[0.3em] text-yellow-400">
              Trusted By
            </span>
            <h2 className="mt-6 text-3xl font-semibold sm:text-4xl md:text-5xl">
              Teams run clearer with TableTrack
            </h2>
            <p className="mt-4 max-w-2xl text-base text-zinc-200 sm:text-lg">
              Snapshots from operators who manage their entire flow from one
              screen. No floating quotes, just real results.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:gap-6">
            {landingReviews.map((review) => (
              <article
                key={review.id}
                className="relative flex min-h-[200px] flex-col justify-between overflow-hidden rounded-3xl border border-white/10 bg-white/5 p-6 shadow-[0_24px_48px_-32px_rgba(0,0,0,0.85)] backdrop-blur sm:p-7 lg:p-8"
              >
                <div className="pointer-events-none absolute -right-16 -top-16 h-36 w-36 rounded-full bg-yellow-500/15 blur-3xl" />
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h3 className="text-lg font-semibold sm:text-xl">
                      {review.name}
                    </h3>
                    <p className="mt-1 text-xs text-zinc-300 sm:text-sm">
                      {review.role}
                    </p>
                  </div>
                  <div className="flex flex-col items-end gap-2 text-yellow-400">
                    {renderStars(review.rating)}
                    <span className="text-[11px] font-medium uppercase tracking-wide text-yellow-200/80 sm:text-xs">
                      {review.highlight}
                    </span>
                  </div>
                </div>
                <p className="mt-5 flex items-start gap-3 text-sm leading-relaxed text-zinc-100 sm:text-base">
                  <Quote className="mt-0.5 h-4 w-4 flex-none text-yellow-500 sm:h-5 sm:w-5" />
                  {review.quote}
                </p>
              </article>
            ))}
          </div>
        </div>
      </div>

      <footer className="border-t border-white/10 bg-black/70">
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-10 px-5 py-10 md:flex-row md:items-start md:justify-between md:px-8 md:py-12 lg:px-10">
          <div className="max-w-lg space-y-5">
            <div className="flex items-center gap-3 text-yellow-400">
              <Mail className="h-5 w-5" />
              <span className="text-[11px] font-semibold uppercase tracking-[0.3em] text-yellow-200 sm:text-xs">
                Stay In The Loop
              </span>
            </div>
            <h3 className="text-2xl font-semibold sm:text-3xl">
              Grow your venue with TableTrack
            </h3>
            <p className="text-sm text-zinc-300 sm:text-base">
              Join the waitlist. Drop your details, we will schedule a live
              walkthrough and tailor the setup to your venue.
            </p>
            <div className="flex flex-wrap gap-x-4 gap-y-2 text-[11px] font-medium uppercase tracking-[0.2em] text-zinc-400 sm:gap-x-6 sm:text-xs">
              <span>Manisa - TR</span>
              <span>Hospitality SaaS</span>
              <span>24/7 Support</span>
            </div>
          </div>

          <form
            onSubmit={handleSubmit}
            className="w-full max-w-md space-y-4 rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur sm:p-6"
          >
            <div className="space-y-2">
              <label
                htmlFor="fullName"
                className="block text-[11px] font-semibold uppercase tracking-[0.3em] text-zinc-300 sm:text-xs"
              >
                Full Name
              </label>
              <input
                id="fullName"
                name="fullName"
                type="text"
                required
                value={fullName}
                onChange={(event) => setFullName(event.target.value)}
                placeholder="Enter your name and surname"
                className="h-11 w-full rounded-xl border border-white/10 bg-black/60 px-4 text-sm text-white outline-none transition focus:border-yellow-400 focus:ring-2 focus:ring-yellow-400/30"
              />
            </div>
            <div className="space-y-2">
              <label
                htmlFor="email"
                className="block text-[11px] font-semibold uppercase tracking-[0.3em] text-zinc-300 sm:text-xs"
              >
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="you@business.com"
                className="h-11 w-full rounded-xl border border-white/10 bg-black/60 px-4 text-sm text-white outline-none transition focus:border-yellow-400 focus:ring-2 focus:ring-yellow-400/30"
              />
            </div>
            <button
              type="submit"
              disabled={status === "loading"}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-yellow-500 px-4 py-2.5 text-sm font-semibold text-black transition hover:bg-yellow-400 disabled:cursor-not-allowed disabled:bg-yellow-500/60 sm:text-base"
            >
              {status === "loading" ? "Sending..." : "Request Info"}
              <ArrowRight className="h-4 w-4" />
            </button>
            {message ? (
              <p
                aria-live="polite"
                className={
                  status === "success"
                    ? "text-sm text-emerald-400"
                    : "text-sm text-rose-400"
                }
              >
                {message}
              </p>
            ) : null}
            <p className="text-[11px] leading-relaxed text-zinc-400 sm:text-xs">
              By submitting the form you agree to be contacted about TableTrack.
              Your details will be used solely for follow-ups.
            </p>
          </form>
        </div>
        <div className="border-t border-white/10 bg-black/80">
          <div className="mx-auto flex w-full max-w-6xl flex-col items-center justify-between gap-2 px-6 py-6 text-xs text-zinc-500 sm:flex-row md:px-8 lg:px-10">
            <span className="flex items-center">
              <CopyrightIcon height={14} width={14} /> 2025 Eyüp Karataş. All
              rights reserved.
            </span>
            <span className="text-zinc-500">
              contact@eyupkaratas.dev - +90 541 854 41 26
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
}

function renderStars(count: number) {
  return (
    <span className="flex items-center gap-1">
      {Array.from({ length: 5 }).map((_, index) => (
        <svg
          key={index}
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 20 20"
          fill={index < count ? "currentColor" : "none"}
          stroke="currentColor"
          strokeWidth="0.8"
          className="h-4 w-4"
        >
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.286 3.955a1 1 0 00.95.69h4.162c.969 0 1.371 1.24.588 1.81l-3.368 2.448a1 1 0 00-.364 1.118l1.287 3.955c.3.921-.755 1.688-1.54 1.118L10 15.347l-3.592 2.37c-.785.57-1.84-.197-1.54-1.118l1.287-3.955a1 1 0 00-.364-1.118L2.423 9.382c-.783-.57-.38-1.81.588-1.81h4.162a1 1 0 00.95-.69l1.286-3.955z" />
        </svg>
      ))}
    </span>
  );
}
