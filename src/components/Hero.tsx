import heroImg from "@/assets/hero-gym.jpg";
import { ArrowRight } from "lucide-react";

export function Hero() {
  return (
    <section className="relative isolate overflow-hidden bg-ink text-ink-foreground min-h-[88vh] flex items-end">
      {/* Background image with slow zoom */}
      <div className="absolute inset-0 -z-10">
        <img
          src={heroImg}
          alt="Athlete deadlifting in a dark gym"
          width={1920}
          height={1080}
          className="h-full w-full object-cover animate-zoom-slow"
        />
        <div className="absolute inset-0 bg-hero-overlay" />
        <div className="absolute inset-0 bg-gradient-to-r from-ink/80 via-ink/20 to-transparent" />
      </div>

      <div className="mx-auto w-full max-w-7xl px-4 md:px-8 pb-16 md:pb-28">
        <div className="max-w-3xl">
          <div
            className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3 py-1 text-[11px] font-bold tracking-[0.25em] uppercase backdrop-blur-sm animate-fade-in"
            style={{ animationDelay: "0.1s" }}
          >
            <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
            New Season Drop
          </div>

          <h1
            className="mt-5 font-display text-5xl sm:text-7xl md:text-8xl leading-[0.9] uppercase animate-fade-up"
            style={{ animationDelay: "0.15s" }}
          >
            Kickoff <br className="hidden sm:block" />
            Your <span className="text-primary">Strength</span>
          </h1>

          <p
            className="mt-6 max-w-xl text-base md:text-lg text-ink-foreground/80 animate-fade-up"
            style={{ animationDelay: "0.35s" }}
          >
            Premium, lab-tested supplements engineered for athletes who don&apos;t
            settle. Built in India. Trusted by lifters everywhere.
          </p>

          <div
            className="mt-9 flex flex-wrap items-center gap-4 animate-fade-up"
            style={{ animationDelay: "0.5s" }}
          >
            <a
              href="#bestsellers"
              className="group inline-flex items-center gap-3 rounded-full bg-primary px-7 py-4 text-sm font-bold tracking-[0.2em] uppercase text-primary-foreground shadow-glow hover:bg-primary-glow hover:scale-[1.03] transition-base"
            >
              Shop Now
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </a>
            <a
              href="#categories"
              className="inline-flex items-center gap-2 rounded-full border border-white/25 px-7 py-4 text-sm font-bold tracking-[0.2em] uppercase hover:bg-white/10 transition-base"
            >
              Explore Range
            </a>
          </div>

        </div>
      </div>
    </section>
  );
}
