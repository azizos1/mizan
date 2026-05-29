// src/components/ui/Card.tsx
import { ReactNode } from "react";

interface CardProps {
  children: ReactNode;
  className?: string;
  glow?: boolean;
  hover?: boolean;
}

export function Card({ children, className = "", glow = false, hover = false }: CardProps) {
  return (
    <div
      className={`
        relative overflow-hidden rounded-2xl bg-white/[0.03] border border-white/[0.06]
        ${glow ? "before:absolute before:inset-0 before:rounded-2xl before:border before:border-white/5 before:pointer-events-none" : ""}
        ${hover ? "hover:bg-white/[0.05] hover:-translate-y-0.5 transition-all duration-300" : ""}
        ${className}
      `}
    >
      {children}
    </div>
  );
}