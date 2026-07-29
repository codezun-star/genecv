import { cn } from "@/lib/utils";

type Tone = "primary" | "secondary" | "success" | "warning" | "premium";

const tones: Record<Tone, string> = {
  primary: "bg-primary-soft text-primary border-primary-100",
  secondary: "bg-secondary-soft text-secondary-700 border-secondary-200",
  success: "bg-success/10 text-success border-success/20",
  warning: "bg-warning/10 text-warning border-warning/25",
  premium: "bg-primary text-white border-primary-dark",
};

export function Badge({
  tone = "secondary",
  className,
  ...props
}: React.ComponentProps<"span"> & { tone?: Tone }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-semibold",
        tones[tone],
        className,
      )}
      {...props}
    />
  );
}
