"use client";

import { useEffect } from "react";
import { assetPath, basePath } from "./base-path";

export function ServiceWorker() {
  useEffect(() => {
    if (process.env.NODE_ENV === "production" && "serviceWorker" in navigator) {
      navigator.serviceWorker.register(assetPath("/sw.js"), { scope: `${basePath || ""}/` }).catch(() => undefined);
    }
  }, []);

  return null;
}
