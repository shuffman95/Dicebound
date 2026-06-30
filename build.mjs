import * as esbuild from "esbuild";
import { readFileSync, writeFileSync } from "fs";

// Single source of truth for the app version: package.json. Stamp it into the
// service worker so each release gets a fresh, self-purging cache name.
const pkg = JSON.parse(readFileSync(new URL("./package.json", import.meta.url), "utf8"));
function stampServiceWorker() {
  const swPath = new URL("./www/sw.js", import.meta.url);
  const src = readFileSync(swPath, "utf8");
  const next = src.replace(/const VERSION = "[^"]*";/, `const VERSION = "${pkg.version}";`);
  if (next !== src) { writeFileSync(swPath, next); console.log(`stamped sw.js cache version -> ${pkg.version}`); }
}
stampServiceWorker();

const ctx = {
  entryPoints: ["src/main.ts"],
  bundle: true,
  format: "iife",
  target: ["es2020"],
  outfile: "www/app.js",
  sourcemap: true,
  logLevel: "info",
};

if (process.argv.includes("--watch")) {
  const c = await esbuild.context(ctx);
  await c.watch();
  console.log("watching...");
} else {
  await esbuild.build(ctx);
}
