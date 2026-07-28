import { createHash } from "node:crypto";
import { readdir, readFile, writeFile } from "node:fs/promises";
import { join, relative, sep } from "node:path";
import { fileURLToPath } from "node:url";

const output = fileURLToPath(new URL("../out/", import.meta.url));
const basePath = process.env.NEXT_PUBLIC_BASE_PATH || "/questmark";

async function files(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  return (await Promise.all(entries.map((entry) => entry.isDirectory() ? files(join(directory, entry.name)) : [join(directory, entry.name)]))).flat();
}

const assets = (await files(output)).filter((file) => !file.endsWith(`${sep}sw.js`));
const urls = assets.map((file) => {
  const name = relative(output, file).split(sep).join("/");
  return name === "index.html" ? `${basePath}/` : `${basePath}/${name}`;
});
if (urls.some((url) => !url.startsWith(`${basePath}/`))) throw new Error("Generated a root-path asset URL");

const hash = createHash("sha256");
for (let index = 0; index < assets.length; index += 1) {
  hash.update(urls[index]);
  hash.update(await readFile(assets[index]));
}
const cache = `questmark-${hash.digest("hex").slice(0, 12)}`;
const worker = `const CACHE=${JSON.stringify(cache)};
const PRECACHE=${JSON.stringify(urls)};
const SHELL=${JSON.stringify(`${basePath}/`)};
self.addEventListener("install",event=>event.waitUntil(caches.open(CACHE).then(cache=>cache.addAll(PRECACHE))));
self.addEventListener("activate",event=>event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(key=>key.startsWith("questmark-")&&key!==CACHE).map(key=>caches.delete(key)))).then(()=>self.clients.claim())));
self.addEventListener("fetch",event=>{if(event.request.method!=="GET"||new URL(event.request.url).origin!==self.location.origin)return;event.respondWith(caches.match(event.request).then(cached=>cached||fetch(event.request).catch(()=>event.request.mode==="navigate"?caches.match(SHELL):Promise.reject(new Error("offline")))))});
`;
await writeFile(join(output, "sw.js"), worker);
console.log(`Generated ${cache} with ${urls.length} assets`);
