import { spawn } from "node:child_process";
import { createReadStream } from "node:fs";
import { stat } from "node:fs/promises";
import { createServer } from "node:http";
import { extname, join, normalize } from "node:path";

const root = new URL("../out/", import.meta.url).pathname;
const types = { ".css": "text/css", ".html": "text/html", ".js": "application/javascript", ".json": "application/json", ".png": "image/png", ".svg": "image/svg+xml", ".webp": "image/webp", ".woff2": "font/woff2" };
const server = createServer(async (request, response) => {
  const pathname = decodeURIComponent(new URL(request.url, "http://127.0.0.1").pathname);
  if (!pathname.startsWith("/questmark/")) return response.writeHead(404).end();
  const relative = pathname.slice("/questmark/".length) || "index.html";
  const file = normalize(join(root, relative));
  if (!file.startsWith(root)) return response.writeHead(403).end();
  try {
    const info = await stat(file);
    const target = info.isDirectory() ? join(file, "index.html") : file;
    response.setHeader("Content-Type", types[extname(target)] || "application/octet-stream");
    createReadStream(target).pipe(response);
  } catch { response.writeHead(404).end(); }
});
await new Promise((resolve) => server.listen(4173, "127.0.0.1", resolve));
const test = spawn("npx", ["playwright", "test"], { stdio: "inherit", env: { ...process.env, PLAYWRIGHT_BASE_URL: "http://127.0.0.1:4173/questmark/", PLAYWRIGHT_PAGES: "1" } });
const code = await new Promise((resolve) => test.on("exit", resolve));
server.close();
process.exitCode = code ?? 1;
