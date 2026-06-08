import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About Us — KICKOFF Fitness Hub" },
      {
        name: "description",
        content: "Learn more about KICKOFF Fitness Hub — our mission, vision, and commitment to quality.",
      },
    ],
  }),
  component: AboutPage,
});

function AboutPage() {
  return (
    <main className="flex-1 bg-background text-foreground flex items-center justify-center py-32 px-4 md:px-8">
      <div className="max-w-3xl w-full text-center space-y-12 animate-fade-in">
        <div className="space-y-4">
          <p className="text-xs font-bold tracking-[0.4em] uppercase text-primary">
            Our Story
          </p>
          <h1 className="font-display text-5xl md:text-7xl uppercase leading-tight">
            About <span className="text-primary italic">Us</span>
          </h1>
        </div>

        <div className="space-y-8 text-lg md:text-xl text-muted-foreground leading-relaxed font-light">
          <p>
            Located in the heart of Redhills, we are committed to delivering reliable, high-quality services with a focus on customer satisfaction and innovation. Our mission is to provide solutions that are not only efficient but also tailored to meet the evolving needs of our community.
          </p>
          
          <p>
            With a strong foundation built on trust, consistency, and excellence, we strive to create meaningful experiences for every customer who chooses us. Whether you're looking for quality products or dependable service, we ensure a seamless and professional experience from start to finish.
          </p>
        </div>

        <div className="pt-8 flex justify-center">
          <div className="h-px w-24 bg-primary/30" />
        </div>
      </div>
    </main>
  );
}
