import { Link } from "@tanstack/react-router";
import { Plus, Star } from "lucide-react";
import { inr, type Product } from "@/lib/products";
import { useCart } from "@/context/CartContext";
import { toast } from "sonner";

export type { Product };

export function ProductCard({ product }: { product: Product }) {
  const { addToCart } = useCart();
  const discount = product.mrp
    ? Math.round(((product.mrp - product.price) / product.mrp) * 100)
    : 0;

  return (
    <article className="group relative flex flex-col overflow-hidden rounded-2xl bg-card shadow-card hover:shadow-card-hover transition-base border border-border">
      <Link
        to="/product/$slug"
        params={{ slug: product.slug }}
        className="relative aspect-square overflow-hidden bg-secondary block"
        aria-label={product.name}
      >
        <img
          src={product.image}
          alt={product.name}
          loading="lazy"
          width={800}
          height={800}
          className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
        />
        {product.badge && (
          <span className="absolute left-3 top-3 rounded-full bg-ink text-ink-foreground px-3 py-1 text-[10px] font-bold tracking-[0.2em] uppercase">
            {product.badge}
          </span>
        )}
        {discount > 0 && (
          <span className="absolute right-3 top-3 rounded-full bg-primary text-primary-foreground px-3 py-1 text-[10px] font-bold tracking-[0.2em] uppercase">
            -{discount}%
          </span>
        )}
        {/* Quick add slide-up */}
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            addToCart(product, 1);
            toast.success(`${product.name} added to cart`);
          }}
          className="absolute inset-x-3 bottom-3 translate-y-[120%] group-hover:translate-y-0 opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center justify-center gap-2 rounded-full bg-primary text-primary-foreground py-3 text-xs font-bold tracking-[0.2em] uppercase shadow-glow hover:bg-primary-glow"
        >
          <Plus className="h-4 w-4" /> Add to Cart
        </button>
      </Link>

      <Link
        to="/product/$slug"
        params={{ slug: product.slug }}
        className="flex flex-1 flex-col gap-2 p-4"
      >
        <p className="text-[10px] font-bold tracking-[0.25em] uppercase text-muted-foreground">
          {product.category}
        </p>
        <h3 className="font-display text-lg uppercase leading-tight line-clamp-2">
          {product.name}
        </h3>
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <Star className="h-3.5 w-3.5 fill-primary text-primary" />
          <span className="font-semibold text-foreground">{Number(product.rating).toFixed(1)}</span>
          <span>({product.reviews})</span>
        </div>
        <div className="mt-1 flex items-baseline gap-2">
          <span className="font-display text-xl text-foreground">{inr.format(product.price)}</span>
          {product.mrp && (
            <span className="text-sm text-muted-foreground line-through">
              {inr.format(product.mrp)}
            </span>
          )}
        </div>
      </Link>
    </article>
  );
}
