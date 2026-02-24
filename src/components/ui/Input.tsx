"use client";

import type { InputHTMLAttributes } from "react";
import { cn } from "@/lib/cn";

type InputProps = InputHTMLAttributes<HTMLInputElement>;

export function Input({ className, ...props }: InputProps) {
  return (
    <input
      {...props}
      className={cn(
        "w-full bg-gray-50 border border-transparent focus:border-black focus:bg-white rounded-2xl py-4 px-4 outline-none transition-all text-black placeholder:text-gray-400",
        className,
      )}
    />
  );
}

