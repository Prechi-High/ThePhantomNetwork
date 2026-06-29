import { ProfileSprites } from "./profileSprites";
import type { ProfileSpriteRegistry, SpriteConfig, SpritesheetMetadata } from "./types";

export class AssetRegistry {
  private static profileSprites: ProfileSpriteRegistry = ProfileSprites;
  private static loadedMetadata = new Map<string, SpritesheetMetadata | null>();
  private static loadedImages = new Map<string, HTMLImageElement>();

  static getProfileSprite(state: string): SpriteConfig | undefined {
    return this.profileSprites[state as keyof ProfileSpriteRegistry];
  }

  static async getSpritesheetMetadata(path: string): Promise<SpritesheetMetadata | null> {
    if (this.loadedMetadata.has(path)) {
      return this.loadedMetadata.get(path) ?? null;
    }

    try {
      const response = await fetch(path);
      const metadata = await response.json() as SpritesheetMetadata;
      this.loadedMetadata.set(path, metadata);
      return metadata;
    } catch (error) {
      console.error(`Failed to load metadata for ${path}`, error);
      return null;
    }
  }

  static async loadImage(path: string): Promise<HTMLImageElement | null> {
    if (this.loadedImages.has(path)) {
      return this.loadedImages.get(path) || null;
    }

    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        this.loadedImages.set(path, img);
        resolve(img);
      };
      img.onerror = () => {
        console.error(`Failed to load image ${path}`);
        resolve(null);
      };
      img.src = path;
    });
  }
}
