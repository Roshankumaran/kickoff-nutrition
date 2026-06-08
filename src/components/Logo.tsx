import { useState } from "react";
// import logoImg from "@/assets/logo.png";
const logoUrl = "/logo.png";

interface LogoProps {
  className?: string;
  variant?: "light" | "dark";
}

export function Logo({ className, variant }: LogoProps) {
  const [error, setError] = useState(false);

  if (error) {
    return (
      <span className="font-display text-2xl tracking-tighter text-primary">
        KICK<span className="text-white">OFF</span>
      </span>
    );
  }

  return (
    <img
      src={logoUrl}
      alt="KICKOFF"
      onError={() => setError(true)}
      className={`max-h-11 md:max-h-14 w-auto object-contain shrink-0 ${className || ""}`}
    />
  );
}
