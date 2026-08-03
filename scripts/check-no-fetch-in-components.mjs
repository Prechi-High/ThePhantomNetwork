#!/usr/bin/env node
/**
 * CI guardrail: UI must not call fetch directly.
 * Network belongs in src/lib/network and src/hooks.
 */

import { readFileSync, readdirSync, statSync } from "fs";
import { join } from "path";

const ROOTS = [
  join(process.cwd(), "src", "components"),
  join(process.cwd(), "src", "app", "(player)"),
];
const violations = [];
const FETCH_PATTERN = /\bfetch\s*\(/;

function walk(dir) {
  if (!statSync(dir, { throwIfNoEntry: false })?.isDirectory()) return;
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) {
      walk(full);
    } else if (/\.(tsx|ts)$/.test(entry)) {
      const content = readFileSync(full, "utf8");
      if (FETCH_PATTERN.test(content)) {
        violations.push(full.replace(process.cwd() + "\\", "").replace(process.cwd() + "/", ""));
      }
    }
  }
}

for (const root of ROOTS) walk(root);

if (violations.length > 0) {
  console.error("UI fetch violations (use @/lib/network or hooks instead):");
  violations.forEach((v) => console.error("  -", v));
  process.exit(1);
}

console.log("OK: no fetch() in src/components or src/app/(player)");
