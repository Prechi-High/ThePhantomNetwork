/**
 * Asset Preloader — Staged Asset Loading
 *
 * Assets load in priority order so the first spin is never hitched.
 *
 * Stages:
 *   critical  — wheel, HUD, core sounds (blocks gameplay start)
 *   ready     — particles, skill icons, avatars (loads during network intro)
 *   deferred  — cosmetics, historical artwork (loads after gameplay begins)
 *
 * Nothing in "deferred" ever blocks gameplay.
 */

export type AssetStage = "critical" | "ready" | "deferred";
export type AssetType  = "audio" | "image" | "font";

export interface AssetEntry {
  id:    string;
  url:   string;
  type:  AssetType;
  stage: AssetStage;
}

// ── Asset manifest ────────────────────────────────────────────────────────

export const ASSET_MANIFEST: AssetEntry[] = [
  // ---- CRITICAL: wheel + HUD + core audio ----
  { id: "spin-start",       url: "/audio/wheel/spin-start.mp3",    type: "audio",  stage: "critical" },
  { id: "spin-loop",        url: "/audio/wheel/spin-loop.mp3",     type: "audio",  stage: "critical" },
  { id: "spin-stop",        url: "/audio/wheel/spin-stop.mp3",     type: "audio",  stage: "critical" },
  { id: "reveal-burst",     url: "/audio/wheel/reveal-burst.mp3",  type: "audio",  stage: "critical" },
  { id: "outcome-advance",  url: "/audio/wheel/outcome-advance.mp3",type:"audio",  stage: "critical" },
  { id: "outcome-steal",    url: "/audio/wheel/outcome-steal.mp3", type: "audio",  stage: "critical" },
  { id: "outcome-void",     url: "/audio/wheel/outcome-void.mp3",  type: "audio",  stage: "critical" },
  { id: "token-tick",       url: "/audio/wheel/token-tick.mp3",    type: "audio",  stage: "critical" },

  // ---- READY: particles + remaining audio ----
  { id: "spin-slowdown",    url: "/audio/wheel/spin-slowdown.mp3", type: "audio",  stage: "ready" },
  { id: "outcome-acquire",  url: "/audio/wheel/outcome-acquire.mp3",type:"audio",  stage: "ready" },
  { id: "outcome-discover", url: "/audio/wheel/outcome-discover.mp3",type:"audio", stage: "ready" },
  { id: "tokens-complete",  url: "/audio/wheel/tokens-complete.mp3",type:"audio",  stage: "ready" },

  // ---- DEFERRED: ambient, cosmetics ----
  { id: "arena-idle",       url: "/audio/ambient/arena-idle.mp3",  type: "audio",  stage: "deferred" },
];

// ── Asset Preloader ───────────────────────────────────────────────────────

interface LoadState {
  loaded: Set<string>;
  failed: Set<string>;
  progress: number;
}

type ProgressCallback = (stage: AssetStage, progress: number, total: number) => void;

export class AssetPreloader {
  private state: LoadState = { loaded: new Set(), failed: new Set(), progress: 0 };
  private audioCache: Map<string, HTMLAudioElement> = new Map();

  /** Load all assets for a given stage */
  async loadStage(
    stage: AssetStage,
    onProgress?: ProgressCallback,
  ): Promise<{ loaded: number; failed: number }> {
    const assets = ASSET_MANIFEST.filter((a) => a.stage === stage);
    if (assets.length === 0) return { loaded: 0, failed: 0 };

    let loaded = 0;
    let failed = 0;

    await Promise.allSettled(
      assets.map(async (asset) => {
        try {
          await this.loadAsset(asset);
          loaded++;
          this.state.loaded.add(asset.id);
          onProgress?.(stage, loaded + failed, assets.length);
        } catch {
          failed++;
          this.state.failed.add(asset.id);
          onProgress?.(stage, loaded + failed, assets.length);
        }
      })
    );

    return { loaded, failed };
  }

  private async loadAsset(asset: AssetEntry): Promise<void> {
    if (this.state.loaded.has(asset.id)) return; // already loaded

    if (asset.type === "audio") {
      return this.preloadAudio(asset);
    }
    if (asset.type === "image") {
      return this.preloadImage(asset);
    }
  }

  private preloadAudio(asset: AssetEntry): Promise<void> {
    return new Promise((resolve, reject) => {
      if (typeof window === "undefined") { resolve(); return; }
      const audio = new Audio();
      audio.preload = "auto";
      audio.src = asset.url;
      audio.oncanplaythrough = () => {
        this.audioCache.set(asset.id, audio);
        resolve();
      };
      audio.onerror = () => reject(new Error(`Failed to preload audio: ${asset.url}`));
      // Resolve after 3s even if not fully loaded (mobile may not fire canplaythrough)
      setTimeout(resolve, 3000);
    });
  }

  private preloadImage(asset: AssetEntry): Promise<void> {
    return new Promise((resolve, reject) => {
      if (typeof window === "undefined") { resolve(); return; }
      const img = new Image();
      img.onload  = () => resolve();
      img.onerror = () => reject(new Error(`Failed to preload image: ${asset.url}`));
      img.src = asset.url;
    });
  }

  getCachedAudio(id: string): HTMLAudioElement | undefined {
    return this.audioCache.get(id);
  }

  isLoaded(id: string): boolean { return this.state.loaded.has(id); }
  isFailed(id: string): boolean { return this.state.failed.has(id); }

  getProgress(): { loaded: number; failed: number; total: number } {
    return {
      loaded: this.state.loaded.size,
      failed: this.state.failed.size,
      total:  ASSET_MANIFEST.length,
    };
  }

  clear(): void {
    this.audioCache.forEach((a) => { a.src = ""; });
    this.audioCache.clear();
    this.state = { loaded: new Set(), failed: new Set(), progress: 0 };
  }
}

export const assetPreloader = new AssetPreloader();
