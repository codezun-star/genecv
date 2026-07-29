import Link from "next/link";

import { Container } from "@/components/layout/container";
import { Logo } from "@/components/layout/logo";
import { footerNav, siteConfig } from "@/lib/site";

export function Footer() {
  return (
    <footer className="border-line bg-canvas mt-20 border-t">
      <Container className="py-12">
        <div className="grid gap-10 md:grid-cols-[1.4fr_repeat(3,1fr)]">
          <div className="max-w-xs">
            <Logo />
            <p className="text-ink-soft mt-4 text-sm leading-relaxed">
              {siteConfig.description}
            </p>
          </div>

          {footerNav.map((group) => (
            <div key={group.title}>
              <h2 className="text-ink text-sm font-semibold">{group.title}</h2>
              <ul className="mt-3 space-y-0.5">
                {group.links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-ink-soft hover:text-primary inline-flex min-h-9 items-center text-sm transition-colors duration-150"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="border-line text-ink-muted mt-10 flex flex-col gap-2 border-t pt-6 text-sm sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {new Date().getFullYear()} {siteConfig.name}. Hecho por Codezun.
          </p>
          <p>
            Tus datos se guardan solo en tu navegador. Sin registro, sin
            servidores.
          </p>
        </div>
      </Container>
    </footer>
  );
}
