"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useState } from "react";

import { Container } from "@/components/layout/container";
import { Logo } from "@/components/layout/logo";
import { buttonStyles } from "@/components/ui/button";
import { mainNav } from "@/lib/site";
import { cn } from "@/lib/utils";

export function Navbar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  // Close the mobile sheet whenever the route changes.
  useEffect(() => setOpen(false), [pathname]);

  return (
    <header className="border-line bg-canvas/85 sticky top-0 z-40 border-b backdrop-blur-md">
      <Container>
        <nav
          aria-label="Principal"
          className="flex h-16 items-center justify-between gap-4"
        >
          <Logo />

          <ul className="hidden items-center gap-1 md:flex">
            {mainNav.map((item) => {
              const active = pathname.startsWith(item.href);
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    aria-current={active ? "page" : undefined}
                    className={cn(
                      "relative rounded-field px-3 py-2 text-[0.9375rem] font-medium transition-colors duration-150",
                      active
                        ? "text-primary"
                        : "text-ink-soft hover:text-primary hover:bg-secondary-soft",
                    )}
                  >
                    {item.label}
                    {active && (
                      <motion.span
                        layoutId="nav-active"
                        className="bg-primary absolute inset-x-3 -bottom-px h-0.5 rounded-full"
                        transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
                      />
                    )}
                  </Link>
                </li>
              );
            })}
          </ul>

          <div className="flex items-center gap-2">
            <Link
              href="/crear"
              className={buttonStyles({ size: "sm", className: "hidden sm:inline-flex" })}
            >
              Crear mi CV
            </Link>

            <button
              type="button"
              onClick={() => setOpen((v) => !v)}
              aria-expanded={open}
              aria-controls="menu-movil"
              aria-label={open ? "Cerrar menú" : "Abrir menú"}
              className="text-ink-soft hover:bg-secondary-soft hover:text-primary grid size-10 place-items-center rounded-field transition-colors duration-150 md:hidden"
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                strokeLinecap="round"
                className="size-5"
              >
                {open ? (
                  <path d="M6 6l12 12M18 6L6 18" />
                ) : (
                  <path d="M4 7h16M4 12h16M4 17h16" />
                )}
              </svg>
            </button>
          </div>
        </nav>
      </Container>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            id="menu-movil"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
            className="border-line bg-canvas overflow-hidden border-t md:hidden"
          >
            <Container className="flex flex-col gap-1 py-4">
              {mainNav.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="text-ink-soft hover:bg-secondary-soft hover:text-primary rounded-field px-3 py-2.5 font-medium transition-colors duration-150"
                >
                  {item.label}
                </Link>
              ))}
              <Link
                href="/crear"
                className={buttonStyles({ className: "mt-2 w-full" })}
              >
                Crear mi CV
              </Link>
            </Container>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
