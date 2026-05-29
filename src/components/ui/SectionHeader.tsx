// src/components/ui/SectionHeader.tsx
import { ReactNode } from "react";

interface SectionHeaderProps {
  title: string;
  action?: ReactNode;
}

export function SectionHeader({ title, action }: SectionHeaderProps) {
  return (
    <div className="flex items-center justify-between mb-3">
      <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">{title}</h2>
      {action}
    </div>
  );
}