import { cn } from "@/lib/utils";

/**
 * Reserved advertising space.
 *
 * No ad network is wired up yet — this only holds the layout so that plugging
 * in a provider later (AdSense, Ezoic, a direct sponsor...) does not shift the
 * page. Render the real script inside this box and keep the same dimensions.
 *
 * Sizes follow common IAB formats:
 *  - leaderboard: 728x90 desktop / 320x100 mobile
 *  - rectangle:   300x250
 *  - skyscraper:  300x600 (sidebar, desktop only)
 */
export type AdFormat = "leaderboard" | "rectangle" | "skyscraper";

const formats: Record<AdFormat, string> = {
  leaderboard: "h-[100px] w-full max-w-[728px] sm:h-[90px]",
  rectangle: "h-[250px] w-full max-w-[300px]",
  skyscraper: "hidden h-[600px] w-[300px] lg:block",
};

export function AdSlot({
  format = "leaderboard",
  slotId,
  className,
  label = "Espacio publicitario",
}: {
  format?: AdFormat;
  /** Identifier you will hand to the ad provider once integrated. */
  slotId: string;
  className?: string;
  label?: string;
}) {
  return (
    <aside
      aria-label={label}
      data-ad-slot={slotId}
      data-ad-format={format}
      className={cn("mx-auto flex justify-center", className)}
    >
      <div
        className={cn(
          "border-line text-ink-muted bg-surface-dark/60 grid place-items-center rounded-card border border-dashed text-center",
          formats[format],
        )}
      >
        <span className="text-[0.6875rem] tracking-[0.18em] uppercase">
          Publicidad
        </span>
      </div>
    </aside>
  );
}
