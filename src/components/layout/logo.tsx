import Link from "next/link";

import { cn } from "@/lib/utils";
import { siteConfig } from "@/lib/site";

export function Logo({ className }: { className?: string }) {
  return (
    <Link
      href="/"
      aria-label={`${siteConfig.name} — inicio`}
      className={cn(
        "group inline-flex items-center gap-2.5 transition-opacity duration-150 hover:opacity-90",
        className,
      )}
    >
      <span
        aria-hidden
        className="bg-primary group-hover:bg-primary-dark grid size-9 place-items-center rounded-[0.6rem] transition-colors duration-150"
      >
        <svg
          viewBox="0 0 24 24"
          fill="none"
          className="size-5 text-white"
          strokeWidth={2}
          stroke="currentColor"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M6 3.5h8.5L19 8v12.5H6z" />
          <path d="M14 3.5V8h5" />
          <path d="M9 12.5h6M9 16h4" />
        </svg>
      </span>
      <span className="font-display text-ink text-lg leading-none font-extrabold tracking-tight">
        Gene<span className="text-primary">CV</span>
      </span>
    </Link>
  );
}
