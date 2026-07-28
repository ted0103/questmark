import type { Metadata, Viewport } from "next";
import "@fontsource-variable/manrope";
import "./globals.css";

const title = "QuestMark | Build proof beyond the screen";
const description = "Complete real-world quests, collect proof of experience, and map the skills you actually demonstrate.";
const canonical = "https://ted0103.github.io/questmark/";
const socialImage = `${canonical}og.png`;

export const metadata: Metadata = {
  metadataBase: new URL(canonical),
  title,
  description,
  manifest: "/questmark/manifest.webmanifest",
  alternates: { canonical },
  appleWebApp: { capable: true, title: "QuestMark", statusBarStyle: "default" },
  icons: { apple: "/questmark/apple-touch-icon.png" },
  openGraph: { title, description, type: "website", url: canonical, images: [{ url: socialImage, width: 1200, height: 630, alt: "QuestMark liquid-glass skill world" }] },
  twitter: { card: "summary_large_image", title, description, images: [socialImage] },
};

export const viewport: Viewport = { themeColor: "#184e6c", colorScheme: "light dark" };

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body>{children}</body></html>;
}
