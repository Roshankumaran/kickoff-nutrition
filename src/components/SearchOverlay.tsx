import { useState, useEffect, useRef } from "react";
import { Search, X, Loader2 } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { fetchAllActiveProducts, inr, type Product } from "@/lib/products";

interface SearchOverlayProps {
  open: boolean;
  onClose: () => void;
}

export function SearchOverlay({ open, onClose }: SearchOverlayProps) {
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const { data: products = [], isLoading } = useQuery({
    queryKey: ["products", "all"],
    queryFn: fetchAllActiveProducts,
    enabled: open,
  });

  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
      setTimeout(() => inputRef.current?.focus(), 100);
    } else {
      document.body.style.overflow = "auto";
      setQuery("");
    }
  }, [open]);

  const results = query.trim()
    ? products.filter(
        (p) =>
          p.name.toLowerCase().includes(query.toLowerCase()) ||
          p.category.toLowerCase().includes(query.toLowerCase())
      )
    : [];

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100] flex flex-col bg-ink/95 backdrop-blur-md animate-fade-in px-4 md:px-8">
      {/* Header */}
      <div className="mx-auto flex w-full max-w-7xl items-center justify-between py-6 md:py-10">
        <div className="relative flex-1 max-w-2xl">
          <Search className="absolute left-0 top-1/2 -translate-y-1/2 h-6 w-6 text-primary" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search products or categories..."
            className="w-full bg-transparent pl-10 pr-4 py-2 text-2xl md:text-4xl font-display uppercase tracking-tight text-ink-foreground outline-none border-b-2 border-white/10 focus:border-primary transition-colors placeholder:text-white/20"
          />
        </div>
        <button
          onClick={onClose}
          className="ml-8 flex h-12 w-12 items-center justify-center rounded-full border border-white/10 text-white/60 hover:text-primary hover:border-primary transition-all"
        >
          <X className="h-6 w-6" />
        </button>
      </div>

      {/* Results */}
      <div className="flex-1 overflow-y-auto pb-20">
        <div className="mx-auto max-w-7xl">
          {isLoading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : query.trim() ? (
            results.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 animate-fade-up">
                {results.map((p) => (
                  <Link
                    key={p.id}
                    to="/product/$slug"
                    params={{ slug: p.slug }}
                    onClick={onClose}
                    className="flex items-center gap-4 p-4 rounded-2xl bg-white/5 border border-white/5 hover:border-primary/30 transition-all group"
                  >
                    <div className="h-20 w-20 shrink-0 overflow-hidden rounded-lg bg-black/20 border border-white/5">
                      <img src={p.image} alt={p.name} className="h-full w-full object-cover transition-transform group-hover:scale-110" />
                    </div>
                    <div>
                      <p className="text-[10px] font-bold tracking-[0.2em] uppercase text-primary/70 mb-1">{p.category}</p>
                      <h4 className="font-bold text-sm uppercase leading-tight line-clamp-1 group-hover:text-primary transition-colors">{p.name}</h4>
                      <p className="mt-1 font-bold text-sm">{inr.format(p.price)}</p>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="py-20 text-center animate-fade-in">
                <p className="text-xl text-white/40">No results found for &ldquo;{query}&rdquo;</p>
              </div>
            )
          ) : (
            <div className="py-12">
              <p className="text-xs font-bold tracking-[0.3em] uppercase text-white/30 mb-8 text-center">Recommended Search</p>
              <div className="flex flex-wrap justify-center gap-3">
                {["Whey Protein", "Creatine", "Pre-workout", "Bestsellers"].map((tag) => (
                  <button
                    key={tag}
                    onClick={() => setQuery(tag)}
                    className="px-6 py-3 rounded-full border border-white/10 text-sm font-bold tracking-widest uppercase hover:border-primary hover:text-primary transition-all"
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
