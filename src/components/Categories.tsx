import { ArrowUpRight } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { categoriesQueryOptions } from "@/lib/products";
import { Link } from "@tanstack/react-router";

export function Categories() {
  const { data: categories, isLoading } = useQuery(categoriesQueryOptions());

  if (isLoading) {
    return (
      <section id="categories" className="bg-background py-20 md:py-28">
        <div className="mx-auto max-w-7xl px-4 md:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-5">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="aspect-[3/4] rounded-2xl bg-ink animate-pulse" />
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (!categories || categories.length === 0) {
    return null; // Don't show the section if no categories exist
  }

  return (
    <section id="categories" className="bg-background py-20 md:py-28">
      <div className="mx-auto max-w-7xl px-4 md:px-8">
        <div className="flex items-end justify-between gap-6 mb-10 md:mb-14">
          <div>
            <p className="text-xs font-bold tracking-[0.3em] uppercase text-primary mb-3">
              Shop By Goal
            </p>
            <h2 className="font-display text-4xl md:text-6xl uppercase leading-none">
              Find your <span className="text-primary">edge</span>
            </h2>
          </div>
          <a
            href="#bestsellers"
            className="hidden md:inline-flex items-center gap-2 text-sm font-bold tracking-[0.2em] uppercase hover:text-primary transition-base"
          >
            View All <ArrowUpRight className="h-4 w-4" />
          </a>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-5">
          {categories.map((c) => (
            <Link
              key={c.slug}
              to={`/category/${c.slug}`}
              className="group relative overflow-hidden rounded-2xl bg-ink aspect-[3/4] block shadow-card hover:shadow-card-hover transition-base"
            >
              <img
                src={c.image || "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?q=80&w=2070&auto=format&fit=crop"}
                alt={c.name}
                loading="lazy"
                width={800}
                height={1024}
                className="absolute inset-0 h-full w-full object-cover opacity-90 transition-transform duration-700 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/30 to-transparent" />
              <div className="absolute inset-x-0 bottom-0 p-5 md:p-6 text-ink-foreground">
                <p className="text-[10px] md:text-xs font-bold tracking-[0.25em] uppercase text-primary mb-1">
                  Collection
                </p>
                <div className="flex items-end justify-between gap-3">
                  <h3 className="font-display text-2xl md:text-3xl uppercase leading-none">
                    {c.name}
                  </h3>
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground transition-transform group-hover:rotate-45">
                    <ArrowUpRight className="h-4 w-4" />
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
