import { queryOptions } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";

export type Product = Database["public"]["Tables"]["products"]["Row"];

export const inr = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});

export async function fetchFeaturedProducts(): Promise<Product[]> {
  try {
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .eq("featured", true)
      .eq("is_active", true)
      .limit(8);

    if (error) {
      if (error.code === 'PGRST200') {
        console.warn("Featured column might not exist, falling back to latest products.");
      } else {
        console.error("Supabase fetch error for featured products:", error);
      }
      return fetchFallbackProducts();
    }

    if (!data || data.length === 0) {
      return fetchFallbackProducts();
    }

    console.log("BESTSELLERS:", data);
    return data.map(p => ({
      ...p,
      image: p.image || "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?q=80&w=2070&auto=format&fit=crop"
    }));
  } catch (err) {
    console.error("Error in fetchFeaturedProducts:", err);
    return fetchFallbackProducts();
  }
}

async function fetchFallbackProducts(): Promise<Product[]> {
  const { data, error } = await supabase
    .from("products")
    .select("*")
    .eq("is_active", true)
    .order("created_at", { ascending: false })
    .limit(8);

  if (error) {
    console.error("Supabase fallback fetch error:", error);
    throw error;
  }

  const products = data || [];
  console.log("BESTSELLERS (FALLBACK):", products);
  return products.map(p => ({
    ...p,
    image: p.image || "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?q=80&w=2070&auto=format&fit=crop"
  }));
}

export async function fetchAllActiveProducts(): Promise<Product[]> {
  const { data, error } = await supabase
    .from("products")
    .select("*")
    .eq("is_active", true);

  console.log("PRODUCTS:", data);

  if (error) {
    console.error("Supabase fetch error:", error);
    throw error;
  }

  const products = data || [];
  return products.map(p => ({
    ...p,
    image: p.image || "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?q=80&w=2070&auto=format&fit=crop"
  }));
}

export async function fetchProductBySlug(slug: string): Promise<Product | null> {
  const { data, error } = await supabase
    .from("products")
    .select("*")
    .eq("slug", slug)
    .maybeSingle();

  console.log("PRODUCTS:", data);

  if (error) {
    console.error("Supabase fetch error:", error);
    throw error;
  }

  if (!data) return null;
  
  return {
    ...data,
    image: data.image || "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?q=80&w=2070&auto=format&fit=crop"
  };
}

export const featuredProductsQueryOptions = () =>
  queryOptions({
    queryKey: ["products", "featured"],
    queryFn: fetchFeaturedProducts,
    staleTime: 60_000,
  });

export const allActiveProductsQueryOptions = () =>
  queryOptions({
    queryKey: ["products", "all"],
    queryFn: fetchAllActiveProducts,
    staleTime: 60_000,
  });

export const productBySlugQueryOptions = (slug: string) =>
  queryOptions({
    queryKey: ["products", "slug", slug],
    queryFn: () => fetchProductBySlug(slug),
    staleTime: 60_000,
  });

// Category Utilities
export function normalizeCategory(category: string): string {
  if (!category) return "";
  return category.trim().toLowerCase();
}

export function formatCategoryName(category: string): string {
  if (!category) return "";
  return category
    .split(/[-_ ]+/)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

export function getCategorySlug(category: string): string {
  if (!category) return "";
  return category.toLowerCase().replace(/[^a-z0-9]+/g, '-');
}

export interface CategoryInfo {
  name: string;
  slug: string;
  image: string | null;
}

export async function fetchCategories(): Promise<CategoryInfo[]> {
  const { data, error } = await supabase
    .from("products")
    .select("category, image")
    .eq("is_active", true);

  if (error) {
    console.error("Supabase fetch error for categories:", error);
    throw error;
  }

  if (!data) return [];

  // Deduplicate and aggregate
  const categoryMap = new Map<string, CategoryInfo>();

  for (const row of data) {
    const normalized = normalizeCategory(row.category);
    if (!normalized) continue;
    
    if (!categoryMap.has(normalized)) {
      categoryMap.set(normalized, {
        name: formatCategoryName(normalized),
        slug: getCategorySlug(normalized),
        image: row.image, // Use the first product's image as the category cover
      });
    }
  }

  // Sort alphabetically
  return Array.from(categoryMap.values()).sort((a, b) => a.name.localeCompare(b.name));
}

export const categoriesQueryOptions = () =>
  queryOptions({
    queryKey: ["categories"],
    queryFn: fetchCategories,
    staleTime: 60_000,
  });

export async function fetchProductsByCategory(slug: string): Promise<Product[]> {
  const { data: allProducts, error } = await supabase
    .from("products")
    .select("*")
    .eq("is_active", true);

  if (error) {
    console.error("Supabase fetch error:", error);
    throw error;
  }

  if (!allProducts) return [];

  // Filter in JS since slug is derived from category
  const filtered = allProducts.filter(p => getCategorySlug(normalizeCategory(p.category)) === slug);
  
  return filtered.map(p => ({
    ...p,
    image: p.image || "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?q=80&w=2070&auto=format&fit=crop"
  }));
}

export const productsByCategoryQueryOptions = (slug: string) =>
  queryOptions({
    queryKey: ["products", "category", slug],
    queryFn: () => fetchProductsByCategory(slug),
    staleTime: 60_000,
  });

// Reviews
export interface ProductReview {
  id: string;
  product_id: string;
  user_id: string;
  user_email: string;
  rating: number;
  review: string;
  created_at: string;
}

export async function fetchProductReviews(productId: string): Promise<ProductReview[]> {
  const { data, error } = await supabase
    .from("product_reviews")
    .select("*")
    .eq("product_id", productId)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Supabase fetch error for reviews:", error);
    return [];
  }

  return (data || []) as ProductReview[];
}

export const productReviewsQueryOptions = (productId: string) =>
  queryOptions({
    queryKey: ["product_reviews", productId],
    queryFn: () => fetchProductReviews(productId),
    staleTime: 60_000,
  });

export async function submitProductReview(
  productId: string,
  userId: string,
  userEmail: string,
  rating: number,
  reviewText: string
) {
  const { error } = await supabase.from("product_reviews").insert({
    product_id: productId,
    user_id: userId,
    user_email: userEmail,
    rating,
    review: reviewText,
  });

  if (error) {
    console.error("Failed to submit review:", error);
    throw error;
  }
}
