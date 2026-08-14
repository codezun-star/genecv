"use client";

import { AnimatePresence, motion } from "motion/react";
import { useEffect, useRef, useState } from "react";

import { TemplateRenderer } from "@/components/cv/templates/render";
import { getTemplate } from "@/lib/cv/templates";
import type { CvView } from "@/lib/cv/view";
import { cn } from "@/lib/utils";

/** A4 at 96dpi. The sheet renders at this size and is scaled to fit. */
export const SHEET_WIDTH = 794;
export const SHEET_HEIGHT = 1123;

export function CvSheet({
  view,
  templateId,
}: {
  view: CvView;
  templateId: string;
}) {
  return (
    <div
      style={{ width: SHEET_WIDTH, height: SHEET_HEIGHT }}
      className="overflow-hidden bg-white text-black"
    >
      <TemplateRenderer view={view} template={getTemplate(templateId)} />
    </div>
  );
}

/**
 * Renders the A4 sheet scaled down to whatever width is available. The sheet
 * itself always keeps real A4 dimensions so the on-screen proportions match
 * the exported PDF.
 */
export function CvPreview({
  view,
  templateId,
  className,
}: {
  view: CvView;
  templateId: string;
  className?: string;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(0.5);

  useEffect(() => {
    const element = containerRef.current;
    if (!element) return;

    const observer = new ResizeObserver(([entry]) => {
      const width = entry.contentRect.width;
      if (width > 0) setScale(width / SHEET_WIDTH);
    });

    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={containerRef} className={cn("w-full", className)}>
      <div
        style={{ height: SHEET_HEIGHT * scale }}
        className="relative w-full overflow-hidden"
      >
        <div
          style={{
            transform: `scale(${scale})`,
            transformOrigin: "top left",
            width: SHEET_WIDTH,
            height: SHEET_HEIGHT,
          }}
          className="shadow-lift absolute top-0 left-0 rounded-[2px] ring-1 ring-black/5"
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={templateId}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
              className="h-full w-full"
            >
              <CvSheet view={view} templateId={templateId} />
            </motion.div>
          </AnimatePresence>

        </div>
      </div>
    </div>
  );
}

