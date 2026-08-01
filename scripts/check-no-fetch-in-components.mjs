#!/usr/bin/env node
/**
 * CI guardrail: UI components must not call fetch directly.
 * Network belongs in src/lib/network and src/hooks.
 */

import { readFileSync, readdirSync, statSync } from "fs";
import { join } from "path";

const ROOT = join(process.cwd(), "src", "components");
const violations = [];

/** Allow fetch only when importing from network layer patterns (none expected in components) */
const FETCH_PATTERN = /\bfetch\s*\(/;

function walk(dir) {
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

walk(ROOT);

if (violations.length > 0) {
  console.error("UI fetch violations (use @/lib/network or hooks instead):");
  violations.forEach((v) => console.error("  -", v));
  process.exit(1);
}

console.log("OK: no fetch() in src/components");
