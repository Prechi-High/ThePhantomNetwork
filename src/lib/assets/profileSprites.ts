import type { ProfileSpriteRegistry } from "./types";

export const ProfileSprites: ProfileSpriteRegistry = {
  WINNING: {
    spritePath: "/assets/sprites/profile/winning/spritesheet.png",
    metadataPath: "/assets/sprites/profile/winning/spritesheet.json",
    fps: 24,
    loop: true,
    priority: 7,
  },
  LOW_TOKENS: {
    spritePath: "/assets/sprites/profile/low_tokens/spritesheet.png",
    metadataPath: "/assets/sprites/profile/low_tokens/spritesheet.json",
    fps: 24,
    loop: true,
    priority: 6,
  },
  ELIMINATED: {
    spritePath: "/assets/sprites/profile/eliminated/spritesheet.png",
    metadataPath: "/assets/sprites/profile/eliminated/spritesheet.json",
    fps: 24,
    loop: true,
    priority: 9,
  },
  REVIVING: {
    spritePath: "/assets/sprites/profile/reviving/spritesheet.png",
    metadataPath: "/assets/sprites/profile/reviving/spritesheet.json",
    fps: 24,
    loop: true,
    priority: 8,
  },
};
