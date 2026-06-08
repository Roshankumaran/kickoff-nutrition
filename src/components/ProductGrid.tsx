
import { ProductCard } from "./ProductCard";
import { featuredProductsQueryOptions, categoriesQueryOptions, normalizeCategory, getCategorySlug } from "@/lib/products";

function GridSkeleton() {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
      {Array.from({ length: 4 }).map((_, i) => (
        <div
          key={i}
          className="aspect-[3/4] rounded-2xl bg-card border border-border animate-pulse"
        />
      ))}
    </div>
  );
}

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";

export function ProductGrid() {
  const queryClient = useQueryClient();
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  
  const { data: products, isLoading: productsLoading, isError } = useQuery(featuredProductsQueryOptions());
  const { data: categories } = useQuery(categoriesQueryOptions());

  useEffect(() => {
    const channel = supabase
      .channel('products-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'products' }, () => {
        queryClient.invalidateQueries({ queryKey: ['products'] });
        queryClient.invalidateQueries({ queryKey: ['categories'] });
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);

  const filteredProducts = useMemo(() => {
    if (!products) return [];
    if (!selectedCategory) return products;
    return products.filter((p) => getCategorySlug(normalizeCategory(p.category)) === selectedCategory);
  }, [products, selectedCategory]);

  useEffect(() => {
    console.log("Filtering by:", selectedCategory || "All Products");
  }, [selectedCategory]);

  return (
    <section id="bestsellers" className="bg-secondary py-20 md:py-28">
      <div className="mx-auto max-w-7xl px-4 md:px-8">
        <div className="flex flex-col md:flex-row items-start md:items-end justify-between gap-6 mb-10 md:mb-14">
          <div>
            <p className="text-xs font-bold tracking-[0.3em] uppercase text-primary mb-3">
              Bestsellers
            </p>
            <h2 className="font-display text-4xl md:text-6xl uppercase leading-none">
              Fan <span className="text-primary">favourites</span>
            </h2>
          </div>
          
          {/* Category Filters */}
          {categories && categories.length > 0 && (
            <div className="flex flex-wrap items-center gap-2 md:gap-3">
              <button
                onClick={() => setSelectedCategory(null)}
                className={`px-4 py-2 rounded-full text-xs font-bold tracking-widest uppercase transition-colors ${
                  selectedCategory === null
                    ? "bg-primary text-primary-foreground"
                    : "bg-white/5 text-muted-foreground hover:text-foreground hover:bg-white/10"
                }`}
              >
                All Products
              </button>
              {categories.map((cat) => (
                <button
                  key={cat.slug}
                  onClick={() => setSelectedCategory(cat.slug)}
                  className={`px-4 py-2 rounded-full text-xs font-bold tracking-widest uppercase transition-colors ${
                    selectedCategory === cat.slug
                      ? "bg-primary text-primary-foreground"
                      : "bg-white/5 text-muted-foreground hover:text-foreground hover:bg-white/10"
                  }`}
                >
                  {cat.name}
                </button>
              ))}
            </div>
          )}
        </div>

        {productsLoading ? (
          <GridSkeleton />
        ) : isError ? (
          <div className="text-center py-12">
            <p className="text-destructive font-bold mb-2">Failed to load products.</p>
            <p className="text-muted-foreground text-sm">Please try refreshing the page.</p>
          </div>
        ) : filteredProducts.length === 0 ? (
          <p className="text-center text-muted-foreground py-12">
            No products found for this category.
          </p>
        ) : (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
            {filteredProducts.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
