import * as esbuild from "esbuild";

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
