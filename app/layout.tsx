import type { Metadata, Viewport } from "next";
import {
  Anton,
  Bricolage_Grotesque,
  Geist,
  Geist_Mono,
  Kaushan_Script,
} from "next/font/google";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { MotionProvider } from "@/components/motion/motion-provider";
import { EVENT } from "@/lib/event";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const display = Bricolage_Grotesque({
  variable: "--font-display-face",
  subsets: ["latin"],
  axes: ["opsz", "wdth"],
});

// Heavy poster face for the event title, like the flyer's "SOUND WAVE".
const poster = Anton({
  variable: "--font-poster-face",
  subsets: ["latin"],
  weight: "400",
});

// Dry-brush script for "The Ember Prelude".
const script = Kaushan_Script({
  variable: "--font-script-face",
  subsets: ["latin"],
  weight: "400",
});

export const metadata: Metadata = {
  title: {
    default: `${EVENT.name}: ${EVENT.subtitle} · Register`,
    template: `%s · ${EVENT.shortName}`,
  },
  description: EVENT.description,
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#0d0a0a",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} ${display.variable} ${poster.variable} ${script.variable} h-full`}
    >
      <body className="flex min-h-dvh flex-col">
        <MotionProvider>
          <SiteHeader />
          <main className="flex-1">{children}</main>
          <SiteFooter />
        </MotionProvider>
      </body>
    </html>
  );
}
