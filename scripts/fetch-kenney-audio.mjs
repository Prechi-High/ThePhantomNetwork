#!/usr/bin/env node
/**
 * Fetches CC0 Kenney / OpenGameArt samples and maps them to Legacy audio cue paths.
 * Run: npm run fetch-audio
 */

import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, "..");
const AUDIO_ROOT = path.join(ROOT, "public", "audio");

/** CC0 Kenney packs — gamesounds.xyz mirror (kenney.nl / GitHub paths often move) */
const KENNEY_MIRROR = "https://gamesounds.xyz/Kenney%27s%20Sound%20Pack";
const UI_BASE = `${KENNEY_MIRROR}/UI%20Audio`;
const KENNEY_BASE = `${KENNEY_MIRROR}/Interface%20Sounds`;
const KENNEY_IMPACT_BASE = `${KENNEY_MIRROR}/Impact%20Sounds`;

/** target path (under public/) → source URL */
const AUDIO_MAP = {
  "audio/ui/button-tap.ogg": `${UI_BASE}/click1.ogg`,
  "audio/ui/hud-tick.ogg": `${UI_BASE}/switch1.ogg`,

  "audio/wheel/spin-start.ogg": `${KENNEY_BASE}/maximize_006.ogg`,
  "audio/wheel/spin-loop.ogg": `${KENNEY_BASE}/scroll_005.ogg`,
  "audio/wheel/spin-slowdown.ogg": `${KENNEY_BASE}/minimize_006.ogg`,
  "audio/wheel/spin-stop.ogg": `${KENNEY_IMPACT_BASE}/impactMetal_medium_000.ogg`,
  "audio/wheel/token-tick.ogg": `${UI_BASE}/switch2.ogg`,
  "audio/wheel/energy-charge.ogg": `${KENNEY_BASE}/confirmation_004.ogg`,
  "audio/wheel/reveal-burst.ogg": `${KENNEY_IMPACT_BASE}/impactGeneric_light_004.ogg`,
  "audio/wheel/outcome-advance.ogg": `${KENNEY_IMPACT_BASE}/impactBell_heavy_000.ogg`,
  "audio/wheel/outcome-acquire.ogg": `${KENNEY_BASE}/confirmation_001.ogg`,
  "audio/wheel/outcome-discover.ogg": `${KENNEY_BASE}/confirmation_003.ogg`,
  "audio/wheel/outcome-steal.ogg": `${KENNEY_IMPACT_BASE}/impactMetal_heavy_004.ogg`,
  "audio/wheel/outcome-void.ogg": `${KENNEY_BASE}/back_004.ogg`,
  "audio/wheel/tokens-complete.ogg": `${KENNEY_BASE}/confirmation_002.ogg`,

  "audio/combat/steal-activate.ogg": `${KENNEY_IMPACT_BASE}/impactMetal_heavy_002.ogg`,
  "audio/combat/shield-hit.ogg": `${KENNEY_IMPACT_BASE}/impactMetal_medium_004.ogg`,
  "audio/combat/guardian-arm.ogg": `${KENNEY_IMPACT_BASE}/impactBell_heavy_001.ogg`,
  "audio/combat/guardian-hum.ogg": `${KENNEY_BASE}/scroll_003.ogg`,
  "audio/combat/guardian-block.ogg": `${KENNEY_IMPACT_BASE}/impactMetal_heavy_000.ogg`,
  "audio/combat/revive-start.ogg": `${KENNEY_BASE}/open_002.ogg`,
  "audio/combat/revive-complete.ogg": `${KENNEY_BASE}/confirmation_004.ogg`,
  "audio/combat/steal-ready.ogg": `${KENNEY_BASE}/maximize_003.ogg`,
  "audio/combat/counterstrike-arm.ogg": `${KENNEY_BASE}/maximize_005.ogg`,
  "audio/combat/counterstrike-hit.ogg": `${KENNEY_IMPACT_BASE}/impactMetal_heavy_003.ogg`,
  "audio/combat/intercept-success.ogg": `${KENNEY_BASE}/confirmation_004.ogg`,
  "audio/combat/disrupt-active.ogg": `${KENNEY_BASE}/error_004.ogg`,
  "audio/combat/mark-placed.ogg": `${KENNEY_BASE}/select_001.ogg`,
  "audio/combat/cloak-active.ogg": `${KENNEY_BASE}/back_003.ogg`,
  "audio/combat/insurance-pulse.ogg": `${KENNEY_BASE}/toggle_003.ogg`,

  "audio/reward/rank-up.ogg": `${KENNEY_BASE}/confirmation_004.ogg`,
  "audio/reward/rank-down.ogg": `${KENNEY_BASE}/back_001.ogg`,
  "audio/reward/legacy-forged.ogg": `${KENNEY_IMPACT_BASE}/impactBell_heavy_004.ogg`,

  "audio/ambient/arena-idle.ogg": `${KENNEY_BASE}/scroll_001.ogg`,
  "audio/ambient/wheel-idle.ogg": `${KENNEY_BASE}/scroll_002.ogg`,
  "audio/ambient/phase-end.ogg": `${KENNEY_IMPACT_BASE}/impactBell_heavy_002.ogg`,
  "audio/ambient/elimination-fade.ogg": `${KENNEY_BASE}/back_004.ogg`,
  "audio/ambient/wind.ogg": `${KENNEY_BASE}/scroll_001.ogg`,
  "audio/ambient/thunder.ogg": `${KENNEY_IMPACT_BASE}/impactBell_heavy_002.ogg`,
  "audio/ambient/heartbeat.ogg": `${KENNEY_BASE}/toggle_003.ogg`,
  "audio/ambient/banner-cloth.ogg": `${KENNEY_BASE}/scroll_004.ogg`,
  "audio/ambient/energy-crackle.ogg": `${KENNEY_BASE}/confirmation_004.ogg`,

  "audio/countdown/tick-deep.ogg": `${UI_BASE}/switch3.ogg`,
  "audio/countdown/go-burst.ogg": `${KENNEY_IMPACT_BASE}/impactBell_heavy_004.ogg`,

  "audio/victory/orchestra-hit.ogg": `${KENNEY_IMPACT_BASE}/impactBell_heavy_004.ogg`,
  "audio/victory/choir-pad.ogg": `${KENNEY_BASE}/scroll_003.ogg`,

  "audio/ui/prestige-tone.ogg": `${KENNEY_IMPACT_BASE}/impactBell_heavy_000.ogg`,
};

async function download(url, dest) {
  const dir = path.dirname(dest);
  await mkdir(dir, { recursive: true });
  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const buf = Buffer.from(await res.arrayBuffer());
    await writeFile(dest, buf);
    console.log(`✓ ${path.relative(ROOT, dest)}`);
    return true;
  } catch (err) {
    console.warn(`✗ ${path.relative(ROOT, dest)} — ${err.message}`);
    return false;
  }
}

async function main() {
  console.log("Fetching Legacy cinematic audio (CC0 Kenney)...\n");
  let ok = 0;
  let fail = 0;

  for (const [rel, url] of Object.entries(AUDIO_MAP)) {
    const dest = path.join(ROOT, "public", rel);
    if (await download(url, dest)) ok++;
    else fail++;
  }

  console.log(`\nDone: ${ok} ok, ${fail} failed`);
  if (fail > 0) {
    console.log("Some URLs may have moved — re-run after updating AUDIO_MAP in scripts/fetch-kenney-audio.mjs");
    process.exitCode = fail === Object.keys(AUDIO_MAP).length ? 1 : 0;
  }
}

main();
