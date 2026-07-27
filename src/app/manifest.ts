import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "QuestMark",
    short_name: "QuestMark",
    description: "Build proof beyond the screen.",
    start_url: "/",
    display: "standalone",
    background_color: "#ddebf4",
    theme_color: "#184e6c",
    icons: [{ src: "/icon.svg", sizes: "any", type: "image/svg+xml" }],
  };
}
