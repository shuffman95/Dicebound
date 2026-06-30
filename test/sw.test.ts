import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

const root = new URL("../", import.meta.url);
const sw = readFileSync(fileURLToPath(new URL("www/sw.js", root)), "utf8");
const pkg = JSON.parse(readFileSync(fileURLToPath(new URL("package.json", root)), "utf8")) as { version: string };

test("the service worker cache is versioned (no static cache name)", () => {
  assert.match(sw, /const CACHE = `dicebound-\$\{VERSION\}`/, "cache name should derive from VERSION");
  assert.doesNotMatch(sw, /"dicebound-v1"/, "the old static cache name must be gone");
});

test("the service worker version is stamped to match package.json (run after build)", () => {
  const m = sw.match(/const VERSION = "([^"]+)";/);
  assert.ok(m, "sw.js declares a VERSION");
  assert.equal(m![1], pkg.version, "build.mjs must stamp sw.js to the package version");
});

test("the precache lists the core app shell and icons", () => {
  for (const asset of ["./index.html", "./styles.css", "./app.js", "./manifest.webmanifest", "./icons/icon-512.png"]) {
    assert.ok(sw.includes(`"${asset}"`), `precache should include ${asset}`);
  }
});

test("the worker installs, activates (purging old caches), and intercepts fetches update-safely", () => {
  for (const ev of ["install", "activate", "fetch", "message"]) {
    assert.ok(sw.includes(`addEventListener("${ev}"`), `handles ${ev}`);
  }
  assert.ok(sw.includes("skipWaiting"), "takes over promptly");
  assert.ok(sw.includes("clients.claim"), "claims open clients");
  assert.ok(sw.includes("caches.delete"), "purges stale caches on activate");
  // network-first navigations so a deployed update is seen online
  assert.ok(sw.includes("isNavigation"), "distinguishes navigations for network-first");
});
