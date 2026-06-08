import { createFileRoute } from '@tanstack/react-router';
import { useQuery } from '@tanstack/react-query';
import { productsByCategoryQueryOptions, categoriesQueryOptions } from '@/lib/products';
import { ProductCard } from '@/components/ProductCard';

export const Route = createFileRoute('/category/$slug')({
  component: CategoryPage,
});

function CategoryPage() {
  const { slug } = Route.useParams();
  
  const { data: categories } = useQuery(categoriesQueryOptions());
  const { data: products, isLoading, isError } = useQuery(productsByCategoryQueryOptions(slug));

  const currentCategory = categories?.find(c => c.slug === slug);
  const title = currentCategory ? currentCategory.name : slug.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());

  return (
    <div className="min-h-screen bg-background pt-32 pb-20">
      <div className="mx-auto max-w-7xl px-4 md:px-8">
        <div className="mb-12">
          <p className="text-xs font-bold tracking-[0.3em] uppercase text-primary mb-3">
            Category
          </p>
          <h1 className="font-display text-5xl md:text-7xl uppercase leading-none">
            {title}
          </h1>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
            {Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className="aspect-[3/4] rounded-2xl bg-card border border-border animate-pulse"
              />
            ))}
          </div>
        ) : isError ? (
          <div className="text-center py-20">
            <p className="text-destructive font-bold mb-2">Failed to load products.</p>
            <p className="text-muted-foreground text-sm">Please try refreshing the page.</p>
          </div>
        ) : !products || products.length === 0 ? (
          <div className="text-center py-20 bg-secondary/50 rounded-2xl border border-white/5">
            <h3 className="font-display text-2xl uppercase mb-2">No products found</h3>
            <p className="text-muted-foreground">We couldn't find any products in this category.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
            {products.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
