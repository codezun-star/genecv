import * as React from "react";

import { cn } from "@/lib/utils";

type Variant = "primary" | "secondary" | "outline" | "ghost" | "danger";
type Size = "sm" | "md" | "lg";

const base =
  "inline-flex items-center justify-center gap-2 rounded-field font-semibold whitespace-nowrap transition-[background-color,border-color,color,box-shadow,transform] duration-150 ease-out-brand active:translate-y-px disabled:pointer-events-none disabled:opacity-50";

const variants: Record<Variant, string> = {
  primary:
    "bg-primary text-white shadow-soft hover:bg-primary-dark focus-visible:outline-primary",
  secondary: "bg-secondary text-white hover:bg-secondary-dark",
  outline:
    "border border-line-strong bg-canvas text-ink hover:bg-surface hover:border-secondary",
  ghost: "text-secondary hover:bg-secondary-soft hover:text-primary",
  danger: "text-danger hover:bg-danger/10",
};

const sizes: Record<Size, string> = {
  sm: "h-9 px-3 text-sm",
  md: "h-11 px-5 text-[0.9375rem]",
  lg: "h-13 px-7 text-base",
};

/** Class string for anchors/links that should look like a button. */
export function buttonStyles({
  variant = "primary",
  size = "md",
  className,
}: {
  variant?: Variant;
  size?: Size;
  className?: string;
} = {}) {
  return cn(base, variants[variant], sizes[size], className);
}

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
}

export function Button({
  className,
  variant = "primary",
  size = "md",
  type = "button",
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      className={buttonStyles({ variant, size, className })}
      {...props}
    />
  );
}
