import type { Metadata, Viewport } from "next";
import { Inter, Plus_Jakarta_Sans } from "next/font/google";
import Script from "next/script";

import { Footer } from "@/components/layout/footer";
import { Navbar } from "@/components/layout/navbar";
import { SOCIAL_BAR_SRC } from "@/lib/ads";
import { OG_IMAGE, siteConfig } from "@/lib/site";

import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const jakarta = Plus_Jakarta_Sans({
  variable: "--font-jakarta",
  subsets: ["latin"],
  display: "swap",
  weight: ["500", "600", "700", "800"],
});

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: {
    default: `${siteConfig.name} — ${siteConfig.tagline}`,
    template: `%s | ${siteConfig.name}`,
  },
  description: siteConfig.description,
  applicationName: siteConfig.name,
  keywords: [
    "generador de cv",
    "crear curriculum",
    "curriculum vitae gratis",
    "plantillas de cv",
    "cv ats",
    "resume builder",
  ],
  // La autoría apunta a GeneCV y no a la marca matriz: cada subdominio es un
  // sitio con nombre propio, y señalar al dominio padre desde los metadatos es
  // parte de lo que lleva a Search a rotular el resultado con el padre.
  authors: [{ name: siteConfig.name, url: siteConfig.url }],
  creator: siteConfig.name,
  publisher: siteConfig.name,
  openGraph: {
    type: "website",
    url: siteConfig.url,
    siteName: siteConfig.name,
    locale: siteConfig.locale,
    title: `${siteConfig.name} — ${siteConfig.tagline}`,
    description: siteConfig.description,
    images: [OG_IMAGE],
  },
  twitter: {
    card: "summary_large_image",
    title: `${siteConfig.name} — ${siteConfig.tagline}`,
    description: siteConfig.description,
    creator: siteConfig.twitter,
    images: [OG_IMAGE],
  },
  // Sin `robots` aquí a propósito: indexar es lo que hace un rastreador si
  // nadie le dice lo contrario, así que la etiqueta no añadía nada, y en la
  // página de error se juntaba con el `noindex` que pone Next y dejaba dos
  // `<meta name="robots">` que se contradicen. Cada página real declara el
  // suyo en `buildMetadata`.

  // Instalada en iOS: sin barra del navegador y con el nombre corto.
  appleWebApp: {
    capable: true,
    title: siteConfig.name,
    statusBarStyle: "default",
  },
};

export const viewport: Viewport = {
  themeColor: "#234D68",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang={siteConfig.lang}
      className={`${inter.variable} ${jakarta.variable} h-full antialiased`}
    >
      <body className="bg-surface text-ink flex min-h-full flex-col">
        <a
          href="#contenido"
          className="bg-primary sr-only rounded-b-lg px-4 py-2 text-white focus:not-sr-only focus:absolute focus:top-0 focus:left-4 focus:z-50"
        >
          Saltar al contenido
        </a>
        <Navbar />
        <main id="contenido" className="flex-1">
          {children}
        </main>
        <Footer />

        {/*
          Barra social: el formato flotante de la red, en todas las rutas y una
          sola vez. Va con `lazyOnload` —se pide cuando el navegador está
          ocioso— porque es publicidad: no puede competir por el hilo principal
          con el editor ni con la generación del PDF.
        */}
        <Script
          id="social-bar"
          src={SOCIAL_BAR_SRC}
          strategy="lazyOnload"
        />
      </body>
    </html>
  );
}
