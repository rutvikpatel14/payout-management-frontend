"use client";

import type { ReactNode } from "react";
import { useEffect, useMemo, useRef, useState } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/cn";

export type DropdownOption = { value: string; label: string };

type DropdownSelectProps = {
  value: string;
  onChange: (next: string) => void;
  options: DropdownOption[];
  icon: ReactNode;
  placeholder: string;
  menuActiveClassName?: string;
};

export function DropdownSelect({
  value,
  onChange,
  options,
  icon,
  placeholder,
  menuActiveClassName = "bg-black text-white",
}: DropdownSelectProps) {
  const rootRef = useRef<HTMLDivElement | null>(null);
  const [open, setOpen] = useState(false);

  const selectedLabel = useMemo(() => {
    const found = options.find((o) => o.value === value);
    return found?.label ?? placeholder;
  }, [options, placeholder, value]);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent | TouchEvent) => {
      const el = rootRef.current;
      if (!el) return;
      if (e.target instanceof Node && el.contains(e.target)) return;
      setOpen(false);
    };
    window.addEventListener("mousedown", onDown);
    window.addEventListener("touchstart", onDown);
    return () => {
      window.removeEventListener("mousedown", onDown);
      window.removeEventListener("touchstart", onDown);
    };
  }, [open]);

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="w-full bg-gray-50 border border-transparent focus:border-black focus:bg-white rounded-2xl py-3 pl-12 pr-10 outline-none transition-all text-sm text-left text-gray-900"
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
          {icon}
        </span>
        <span className={cn(!value && "text-gray-400")}>{selectedLabel}</span>
        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">
          <ChevronDown
            className={cn(
              "w-5 h-5 transition-transform",
              open && "rotate-180",
            )}
          />
        </span>
      </button>

      {open && (
        <div
          role="listbox"
          className="absolute z-50 mt-2 w-full overflow-hidden rounded-2xl border border-black/5 bg-white shadow-xl"
        >
          {options.map((opt) => {
            const active = opt.value === value;
            return (
              <button
                key={opt.value || "__empty"}
                type="button"
                role="option"
                aria-selected={active}
                onClick={() => {
                  onChange(opt.value);
                  setOpen(false);
                }}
                className={cn(
                  "w-full px-4 py-3 text-left text-sm font-semibold transition-colors",
                  active ? menuActiveClassName : "text-gray-700 hover:bg-gray-50",
                )}
              >
                {opt.label}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

