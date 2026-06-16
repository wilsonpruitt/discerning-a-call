import type { Metadata } from "next";
import { EB_Garamond, Inter } from "next/font/google";
import "./globals.css";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";

const garamond = EB_Garamond({
  subsets: ["latin"],
  style: ["normal", "italic"],
  variable: "--font-serif-src",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans-src",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://discern.wrootlabs.com"),
  title: {
    default: "Discerning a Call — a companion for exploring ministry",
    template: "%s · Discerning a Call",
  },
  description:
    "A faithful companion for anyone sensing a call to ministry — whatever stage of life you are in. Paths, next steps, seminaries, and the candidacy process, explained plainly.",
  openGraph: {
    title: "Discerning a Call",
    description:
      "A faithful companion for anyone sensing a call to ministry — whatever stage of life you are in.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      className={`${garamond.variable} ${inter.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <SiteHeader />
        <main className="flex-1">{children}</main>
        <SiteFooter />
      </body>
    </html>
  );
}
