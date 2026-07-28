import type { MetadataRoute } from "next";
import { assetPath, basePath } from "./base-path";

export const dynamic = "force-static";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "QuestMark",
    short_name: "QuestMark",
    description: "Build proof beyond the screen.",
    id: basePath ? `${basePath}/` : "/",
    start_url: `${basePath || ""}/`,
    scope: `${basePath || ""}/`,
    display: "standalone",
    background_color: "#ddebf4",
    theme_color: "#184e6c",
    icons: [
      { src: assetPath("/icon-192.png"), sizes: "192x192", type: "image/png", purpose: "any" },
      { src: assetPath("/icon-512.png"), sizes: "512x512", type: "image/png", purpose: "any" },
      { src: assetPath("/icon-maskable-512.png"), sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
