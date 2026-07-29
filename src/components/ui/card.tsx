import { cn } from "@/lib/utils";

export function Card({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      className={cn(
        "border-line bg-canvas rounded-card border p-6 shadow-soft",
        className,
      )}
      {...props}
    />
  );
}

export function CardTitle({
  className,
  ...props
}: React.ComponentProps<"h3">) {
  return (
    <h3
      className={cn("font-display text-ink text-lg font-semibold", className)}
      {...props}
    />
  );
}

export function CardText({ className, ...props }: React.ComponentProps<"p">) {
  return (
    <p
      className={cn("text-ink-soft mt-2 text-sm leading-relaxed", className)}
      {...props}
    />
  );
}
