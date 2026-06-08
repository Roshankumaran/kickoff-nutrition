import { createFileRoute } from "@tanstack/react-router";
import { Hero } from "@/components/Hero";
import { Categories } from "@/components/Categories";
import { ProductGrid } from "@/components/ProductGrid";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "KICKOFF — Premium Gym Supplements | Whey, Creatine, Pre-Workout" },
      {
        name: "description",
        content:
          "Shop KICKOFF — premium, lab-tested gym supplements built for Indian athletes. Whey protein, creatine, mass gainer & pre-workout. Free shipping above ₹999.",
      },
      { property: "og:title", content: "KICKOFF — Kickoff Your Strength" },
      {
        property: "og:description",
        content:
          "Premium gym supplements engineered for athletes who refuse to settle. Free shipping above ₹999.",
      },
    ],
  }),
  component: Home,
});

function Home() {
  return (
    <main>
      <Hero />
      <Categories />
      <ProductGrid />
    </main>
  );
}
