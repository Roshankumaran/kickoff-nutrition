import { createFileRoute, Link, notFound, useRouter } from "@tanstack/react-router";
import { useSuspenseQuery, useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ChevronRight, Plus, ShieldCheck, Star, Truck, Award, User as UserIcon } from "lucide-react";
import { inr, productBySlugQueryOptions, productReviewsQueryOptions, submitProductReview } from "@/lib/products";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";
import { useState } from "react";

export const Route = createFileRoute("/product/$slug")({
  loader: async ({ params, context: { queryClient } }) => {
    const product = await queryClient.ensureQueryData(productBySlugQueryOptions(params.slug));
    if (!product) throw notFound();
    return product;
  },
  head: ({ loaderData }) => {
    if (!loaderData) return { meta: [{ title: "Product — KICKOFF" }] };
    const title = `${loaderData.name} — KICKOFF`;
    const description =
      loaderData.description?.slice(0, 155) ??
      `Shop ${loaderData.name} on KICKOFF. Premium, lab-tested supplement for serious athletes.`;
    return {
      meta: [
        { title },
        { name: "description", content: description },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
        { property: "og:image", content: loaderData.image },
        { name: "twitter:image", content: loaderData.image },
      ],
    };
  },
  component: ProductPage,
  errorComponent: ProductErrorComponent,
  notFoundComponent: ProductNotFound,
});

function ProductErrorComponent({ error }: { error: Error }) {
  const router = useRouter();
  return (
    <div className="min-h-screen bg-background text-foreground flex items-center justify-center px-4">
      <div className="max-w-md text-center">
        <h1 className="font-display text-3xl uppercase">Something went wrong</h1>
        <p className="mt-2 text-sm text-muted-foreground">{error.message}</p>
        <div className="mt-6 flex justify-center gap-3">
          <button
            onClick={() => router.invalidate()}
            className="rounded-full bg-primary text-primary-foreground px-5 py-2 text-xs font-bold tracking-[0.2em] uppercase"
          >
            Retry
          </button>
          <Link
            to="/"
            className="rounded-full border border-border px-5 py-2 text-xs font-bold tracking-[0.2em] uppercase"
          >
            Home
          </Link>
        </div>
      </div>
    </div>
  );
}

function ProductNotFound() {
  return (
    <div className="min-h-screen bg-background text-foreground flex items-center justify-center px-4">
      <div className="max-w-md text-center">
        <p className="text-xs font-bold tracking-[0.3em] uppercase text-primary mb-3">404</p>
        <h1 className="font-display text-4xl uppercase">Product not found</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          This product is unavailable or no longer in our catalogue.
        </p>
        <Link
          to="/"
          className="mt-6 inline-block rounded-full bg-primary text-primary-foreground px-6 py-3 text-xs font-bold tracking-[0.2em] uppercase"
        >
          Shop bestsellers
        </Link>
      </div>
    </div>
  );
}

function ProductPage() {
  const { slug } = Route.useParams();
  const { data: product } = useSuspenseQuery(productBySlugQueryOptions(slug));
  const { addToCart } = useCart();
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const [rating, setRating] = useState(5);
  const [reviewText, setReviewText] = useState("");

  const { data: reviews = [] } = useQuery(productReviewsQueryOptions(product?.id || ""));

  const submitReviewMutation = useMutation({
    mutationFn: () => submitProductReview(
      product.id,
      user!.id,
      user!.email || "",
      rating,
      reviewText
    ),
    onSuccess: () => {
      toast.success("Review submitted successfully");
      setReviewText("");
      queryClient.invalidateQueries({ queryKey: ["product_reviews", product.id] });
    },
    onError: (err: any) => {
      toast.error(err.message || "Failed to submit review");
    }
  });

  if (!product) return <ProductNotFound />;

  const discount = product.mrp
    ? Math.round(((product.mrp - product.price) / product.mrp) * 100)
    : 0;
  const inStock = product.stock > 0;

  const totalReviews = reviews.length;
  const averageRating = totalReviews > 0
    ? reviews.reduce((acc, r) => acc + r.rating, 0) / totalReviews
    : Number(product.rating) || 5;

  const hasUserReviewed = user ? reviews.some(r => r.user_id === user.id) : false;

  return (
    <main className="mx-auto max-w-7xl px-4 md:px-8 pt-28 md:pt-32 pb-20">
      {/* Breadcrumbs */}
      <nav className="flex items-center gap-2 text-xs text-muted-foreground mb-8" aria-label="Breadcrumb">
        <Link to="/" className="hover:text-foreground transition-base">Home</Link>
        <ChevronRight className="h-3 w-3" />
        <span className="uppercase tracking-[0.2em]">{product.category}</span>
        <ChevronRight className="h-3 w-3" />
        <span className="text-foreground line-clamp-1">{product.name}</span>
      </nav>

      <div className="grid lg:grid-cols-2 gap-10 lg:gap-16">
        {/* Image */}
        <div className="relative aspect-square overflow-hidden rounded-2xl bg-secondary border border-border">
          <img
            src={product.image}
            alt={product.name}
            width={1200}
            height={1200}
            className="h-full w-full object-cover"
          />
          {product.badge && (
            <span className="absolute left-4 top-4 rounded-full bg-ink text-ink-foreground px-3 py-1.5 text-[10px] font-bold tracking-[0.2em] uppercase">
              {product.badge}
            </span>
          )}
          {discount > 0 && (
            <span className="absolute right-4 top-4 rounded-full bg-primary text-primary-foreground px-3 py-1.5 text-[10px] font-bold tracking-[0.2em] uppercase">
              -{discount}% OFF
            </span>
          )}
        </div>

        {/* Details */}
        <div className="flex flex-col">
          <p className="text-xs font-bold tracking-[0.3em] uppercase text-primary mb-3">
            {product.category}
          </p>
          <h1 className="font-display text-4xl md:text-5xl uppercase leading-none">
            {product.name}
          </h1>

          <div className="mt-4 flex items-center gap-3 text-sm">
            <div className="flex items-center gap-1">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star
                  key={i}
                  className={`h-4 w-4 ${
                    i < Math.round(averageRating)
                      ? "fill-primary text-primary"
                      : "text-muted-foreground/40"
                  }`}
                />
              ))}
            </div>
            <span className="font-semibold">{averageRating.toFixed(1)}</span>
            <span className="text-muted-foreground">({totalReviews} reviews)</span>
          </div>

          <div className="mt-6 flex items-baseline gap-3">
            <span className="font-display text-4xl">{inr.format(product.price)}</span>
            {product.mrp && product.mrp > product.price && (
              <>
                <span className="text-lg text-muted-foreground line-through">
                  {inr.format(product.mrp)}
                </span>
                <span className="text-sm font-bold text-primary">Save {discount}%</span>
              </>
            )}
          </div>
          <p className="text-xs text-muted-foreground mt-1">Inclusive of all taxes</p>

          {product.description && (
            <p className="mt-6 text-base leading-relaxed text-muted-foreground">
              {product.description}
            </p>
          )}

          {/* Stock */}
          <div className="mt-6 flex items-center gap-2 text-sm">
            <span
              className={`h-2 w-2 rounded-full ${inStock ? "bg-emerald-500" : "bg-destructive"}`}
            />
            <span className="font-semibold">
              {inStock ? `In stock — ${product.stock} available` : "Out of stock"}
            </span>
          </div>

          {/* CTA */}
          <div className="mt-8 flex flex-col sm:flex-row gap-3">
            <button
              disabled={!inStock}
              onClick={() => {
                addToCart(product, 1);
                toast.success(`${product.name} added to cart`);
              }}
              className="flex-1 inline-flex items-center justify-center gap-2 rounded-full bg-primary text-primary-foreground py-4 text-xs font-bold tracking-[0.2em] uppercase shadow-glow hover:bg-primary-glow transition-base disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Plus className="h-4 w-4" /> Add to Cart
            </button>
            <Link
              to="/checkout"
              onClick={() => {
                addToCart(product, 1);
              }}
              disabled={!inStock}
              className="flex-1 inline-flex items-center justify-center rounded-full bg-ink text-ink-foreground py-4 text-xs font-bold tracking-[0.2em] uppercase hover:opacity-90 transition-base disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Buy Now
            </Link>
          </div>

          {/* Trust badges */}
          <div className="mt-8 grid grid-cols-3 gap-3 pt-6 border-t border-border">
            <div className="flex flex-col items-center text-center gap-2">
              <ShieldCheck className="h-6 w-6 text-primary" />
              <span className="text-[10px] font-bold tracking-[0.2em] uppercase">100% Authentic</span>
            </div>
            <div className="flex flex-col items-center text-center gap-2">
              <Truck className="h-6 w-6 text-primary" />
              <span className="text-[10px] font-bold tracking-[0.2em] uppercase">Free over ₹999</span>
            </div>
            <div className="flex flex-col items-center text-center gap-2">
              <Award className="h-6 w-6 text-primary" />
              <span className="text-[10px] font-bold tracking-[0.2em] uppercase">Lab Tested</span>
            </div>
          </div>
        </div>
      </div>

      {/* Reviews Section */}
      <div className="mt-24 pt-16 border-t border-white/10">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div>
            <h2 className="font-display text-3xl md:text-5xl uppercase">Customer Reviews</h2>
            <div className="mt-3 flex items-center gap-3">
              <div className="flex items-center">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    className={`h-5 w-5 ${
                      i < Math.round(averageRating)
                        ? "fill-primary text-primary"
                        : "text-muted-foreground/40"
                    }`}
                  />
                ))}
              </div>
              <span className="font-bold text-lg">{averageRating.toFixed(1)} out of 5</span>
              <span className="text-muted-foreground">Based on {totalReviews} reviews</span>
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-12 gap-12">
          {/* Write a Review */}
          <div className="md:col-span-4">
            <div className="bg-secondary/50 border border-white/5 p-6 rounded-2xl sticky top-24">
              <h3 className="font-display text-xl uppercase mb-4">Write a Review</h3>
              
              {!user ? (
                <div className="text-sm text-muted-foreground">
                  <p className="mb-4">You must be logged in to write a review.</p>
                  <button onClick={() => window.dispatchEvent(new Event('open-auth'))} className="w-full rounded-full bg-white/10 text-white py-3 text-xs font-bold tracking-[0.2em] uppercase hover:bg-white/20 transition-colors">
                    Sign In
                  </button>
                </div>
              ) : hasUserReviewed ? (
                <div className="text-sm text-muted-foreground">
                  <p>You have already submitted a review for this product. Thank you!</p>
                </div>
              ) : (
                <form 
                  onSubmit={(e) => {
                    e.preventDefault();
                    if (rating === 0) return toast.error("Please select a rating");
                    if (!reviewText.trim()) return toast.error("Please write a review");
                    submitReviewMutation.mutate();
                  }}
                  className="space-y-4"
                >
                  <div>
                    <label className="text-xs font-bold tracking-[0.2em] uppercase text-muted-foreground mb-2 block">Rating</label>
                    <div className="flex gap-2">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setRating(star)}
                          className="focus:outline-none transition-transform hover:scale-110"
                        >
                          <Star className={`h-6 w-6 ${rating >= star ? 'fill-primary text-primary' : 'text-muted-foreground/40 hover:text-primary/50'}`} />
                        </button>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <label htmlFor="review" className="text-xs font-bold tracking-[0.2em] uppercase text-muted-foreground mb-2 block">Your Review</label>
                    <textarea
                      id="review"
                      value={reviewText}
                      onChange={(e) => setReviewText(e.target.value)}
                      placeholder="What did you think about this product?"
                      className="w-full bg-background border border-white/10 rounded-lg p-3 text-sm min-h-[120px] focus:outline-none focus:border-primary/50 transition-colors resize-none"
                    />
                  </div>
                  
                  <button
                    type="submit"
                    disabled={submitReviewMutation.isPending}
                    className="w-full rounded-full bg-primary text-primary-foreground py-3 text-xs font-bold tracking-[0.2em] uppercase hover:bg-primary-glow transition-all shadow-glow disabled:opacity-50"
                  >
                    {submitReviewMutation.isPending ? "Submitting..." : "Submit Review"}
                  </button>
                </form>
              )}
            </div>
          </div>

          {/* Review List */}
          <div className="md:col-span-8 space-y-6">
            {reviews.length === 0 ? (
              <div className="text-center py-16 bg-secondary/30 rounded-2xl border border-white/5">
                <p className="text-muted-foreground">No reviews yet. Be the first to review this product!</p>
              </div>
            ) : (
              reviews.map((r) => (
                <div key={r.id} className="bg-secondary/30 border border-white/5 p-6 rounded-2xl">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-muted-foreground">
                        <UserIcon className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="font-bold text-sm">
                          {r.user_email.split('@')[0]}
                        </p>
                        <div className="flex items-center gap-1 mt-1">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <Star
                              key={i}
                              className={`h-3 w-3 ${
                                i < r.rating
                                  ? "fill-primary text-primary"
                                  : "text-muted-foreground/40"
                              }`}
                            />
                          ))}
                        </div>
                      </div>
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {new Date(r.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-sm text-foreground/90 leading-relaxed whitespace-pre-wrap">
                    {r.review}
                  </p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
