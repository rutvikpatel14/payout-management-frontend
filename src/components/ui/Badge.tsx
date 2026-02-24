"use client";

import type { HTMLAttributes } from "react";
import { cn } from "@/lib/cn";

const badgeVariants = {
  gray: "bg-gray-800 text-white",
  blue: "bg-blue-600 text-white",
  emerald: "bg-emerald-600 text-white",
  red: "bg-red-600 text-white",
} as const;

export type BadgeVariant = keyof typeof badgeVariants;

type BadgeProps = HTMLAttributes<HTMLSpanElement> & {
  variant?: BadgeVariant;
};

export function Badge({ variant = "gray", className, ...props }: BadgeProps) {
  return (
    <span
      {...props}
      className={cn(
        "inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider",
        badgeVariants[variant],
        className,
      )}
    />
  );
}

