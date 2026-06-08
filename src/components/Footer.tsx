import { Logo } from "./Logo";
import { Instagram, MapPin, ArrowRight } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { categoriesQueryOptions } from "@/lib/products";
import { Link } from "@tanstack/react-router";

export function Footer() {
  const instagramUrl = "https://www.instagram.com/kickoff_gym?utm_source=ig_web_button_share_sheet&igsh=ZDNlZDc0MzIxNw==";
  const mapUrl = "https://maps.app.goo.gl/DKFgADbcadXoFQyE6";

  const { data: categories } = useQuery(categoriesQueryOptions());

  return (
    <footer className="bg-ink text-ink-foreground">
      {/* Newsletter */}
      <div className="border-b border-white/10">
        <div className="mx-auto max-w-7xl px-4 md:px-8 py-12 md:py-16 grid md:grid-cols-2 gap-8 items-center">
          <div>
            <h3 className="font-display text-3xl md:text-5xl uppercase leading-none">
              Join the <span className="text-primary">squad</span>
            </h3>
            <p className="mt-3 text-ink-foreground/70 max-w-md">
              Drops, deals, and training tips — straight to your inbox. No spam.
            </p>
          </div>
          <form
            onSubmit={(e) => e.preventDefault()}
            className="flex w-full max-w-lg md:ml-auto rounded-full bg-white/5 border border-white/15 p-1.5 focus-within:border-primary transition-base"
          >
            <input
              type="email"
              required
              placeholder="your@email.com"
              className="flex-1 bg-transparent px-4 py-2 text-sm placeholder:text-ink-foreground/40 outline-none"
            />
            <button
              type="submit"
              className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-xs font-bold tracking-[0.2em] uppercase text-primary-foreground hover:bg-primary-glow transition-base"
            >
              Sign Up <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </form>
        </div>
      </div>

      {/* Main */}
      <div className="mx-auto max-w-7xl px-4 md:px-8 py-14 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
        <div>
          <Logo />
          <p className="mt-4 text-sm text-ink-foreground/60 leading-relaxed">
            Kick Off Nutritions is your premier online health & fitness supplement store. Gym health supplements, protein powders, pre-workouts, creatine, vitamins, and wellness nutrition.
          </p>
          <div className="mt-5 space-y-2 text-xs text-ink-foreground/60">
            <p className="flex items-center gap-2">
              <span className="text-primary font-bold">ADDR:</span> Red Hills, Chennai, Tamil Nadu, India
            </p>
            <p className="flex items-center gap-2">
              <span className="text-primary font-bold">EMAIL:</span> <a href="mailto:Dysonbolt29@gmail.com" className="hover:text-primary transition-base">Dysonbolt29@gmail.com</a>
            </p>
            <p className="flex items-center gap-2">
              <span className="text-primary font-bold">PHONE:</span> <a href="tel:+919962201000" className="hover:text-primary transition-base">+91 9962201000</a>
            </p>
            <p className="flex items-center gap-2">
              <span className="text-primary font-bold">WEB:</span> <a href="https://kickoffnutrition.in" target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-base">kickoffnutrition.in</a>
            </p>
          </div>
        </div>

        <div>
          <h4 className="font-display text-sm uppercase tracking-[0.25em] text-primary mb-4">
            Shop
          </h4>
          <ul className="space-y-3">
            {categories && categories.length > 0 ? (
              categories.slice(0, 4).map((c) => (
                <li key={c.slug}>
                  <Link
                    to={`/category/${c.slug}`}
                    className="text-sm text-ink-foreground/70 hover:text-primary transition-base"
                  >
                    {c.name}
                  </Link>
                </li>
              ))
            ) : (
              <>
                <li>
                  <Link to="/category/whey" className="text-sm text-ink-foreground/70 hover:text-primary transition-base">Whey Protein</Link>
                </li>
                <li>
                  <Link to="/category/creatine" className="text-sm text-ink-foreground/70 hover:text-primary transition-base">Creatine</Link>
                </li>
              </>
            )}
            <li>
              <Link
                to="/#bestsellers"
                className="text-sm text-ink-foreground/70 hover:text-primary transition-base font-bold"
              >
                Bestsellers
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <h4 className="font-display text-sm uppercase tracking-[0.25em] text-primary mb-4">
            Information
          </h4>
          <ul className="space-y-3 text-sm">
            <li>
              <Link to="/about" className="text-ink-foreground/70 hover:text-primary transition-base">About Us</Link>
            </li>
            <li>
              <a href="/shipping.html" className="text-ink-foreground/70 hover:text-primary transition-base">Shipping Policy</a>
            </li>
            <li>
              <a href="/privacy.html" className="text-ink-foreground/70 hover:text-primary transition-base">Privacy Policy</a>
            </li>
            <li>
              <a href="/terms.html" className="text-ink-foreground/70 hover:text-primary transition-base">Terms & Conditions</a>
            </li>
            <li>
              <a href="/refund.html" className="text-ink-foreground/70 hover:text-primary transition-base">Refund & Cancellation Policy</a>
            </li>
            <li>
              <a href="/contact.html" className="text-ink-foreground/70 hover:text-primary transition-base">Contact Us</a>
            </li>
          </ul>
        </div>

        <div>
          <h4 className="font-display text-sm uppercase tracking-[0.25em] text-primary mb-4">
            Connect
          </h4>
          <p className="text-xs text-ink-foreground/60 mb-4">
            Monday–Saturday: 9:00 AM–6:00 PM (IST)
          </p>
          <div className="flex gap-2">
            <a
              href={instagramUrl}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Instagram"
              className="flex h-9 w-9 items-center justify-center rounded-full border border-white/15 hover:bg-primary hover:border-primary transition-base text-ink-foreground/80 hover:text-white"
            >
              <Instagram className="h-4 w-4" />
            </a>
            <a
              href={mapUrl}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Visit Our Store"
              className="flex h-9 w-9 items-center justify-center rounded-full border border-white/15 hover:bg-primary hover:border-primary transition-base text-ink-foreground/80 hover:text-white"
              title="Visit Our Store"
            >
              <MapPin className="h-4 w-4" />
            </a>
          </div>
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="mx-auto max-w-7xl px-4 md:px-8 py-5 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-ink-foreground/50">
          <p>© 2026 Kick Off Nutritions. All Rights Reserved.</p>
          <div className="flex gap-5 flex-wrap justify-center sm:justify-start">
            <a href="/privacy.html" className="hover:text-primary transition-base">Privacy Policy</a>
            <a href="/terms.html" className="hover:text-primary transition-base">Terms & Conditions</a>
            <a href="/refund.html" className="hover:text-primary transition-base">Refund Policy</a>
            <a href="/contact.html" className="hover:text-primary transition-base">Contact Us</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
