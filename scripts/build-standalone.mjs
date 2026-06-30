// Produces a single self-contained HTML file (CSS + JS inlined) that runs the
// whole game with no external files — handy for hosting anywhere or opening
// directly in a browser. (No service worker; for an installable iOS PWA use the
// GitHub Pages build instead.)
import * as esbuild from "esbuild";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");

const result = await esbuild.build({
  entryPoints: [path.join(root, "src/main.ts")],
  bundle: true,
  format: "iife",
  target: ["es2020"],
  minify: true,
  write: false,
});
const js = result.outputFiles[0].text;
const css = fs.readFileSync(path.join(root, "www/styles.css"), "utf8");

const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover" />
<meta name="theme-color" content="#0e0b14" />
<meta name="apple-mobile-web-app-capable" content="yes" />
<meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
<meta name="apple-mobile-web-app-title" content="Dicebound" />
<title>Dicebound: The Hollow Crown</title>
<style>${css}</style>
</head>
<body>
<div id="app"></div>
<div id="splash" class="splash" aria-hidden="true">
  <div class="crest">👑</div>
  <div class="stitle">Dicebound</div>
  <div class="stag">The Hollow Crown</div>
</div>
<div id="dice-layer" class="dice-layer hidden" aria-hidden="true">
  <div class="dice-die" id="dice-die">20</div>
  <div class="dice-caption" id="dice-caption"></div>
</div>
<script>${js}</script>
</body>
</html>`;

const outDir = path.join(root, "dist");
fs.mkdirSync(outDir, { recursive: true });
const out = path.join(outDir, "dicebound-standalone.html");
fs.writeFileSync(out, html);
console.log("wrote", path.relative(root, out), (html.length / 1024).toFixed(0) + "kb");
