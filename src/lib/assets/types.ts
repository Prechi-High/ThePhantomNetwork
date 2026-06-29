export interface SpriteFrame {
  frame: { x: number; y: number; w: number; h: number };
  rotated: boolean;
  trimmed: boolean;
  spriteSourceSize: { x: number; y: number; w: number; h: number };
  sourceSize: { w: number; h: number };
}

export interface SpritesheetMetadata {
  frames: Record<string, SpriteFrame>;
  meta: {
    app: string;
    version: string;
    image: string;
    format: string;
    size: { w: number; h: number };
    scale: string;
    comment: string;
  };
}

export interface SpriteConfig {
  /** URL or path to the spritesheet image */
  spritePath: string;
  /** URL or path to the spritesheet metadata JSON */
  metadataPath: string;
  /** Frames per second (default: 24) */
  fps?: number;
  /** Loop the animation (default: true) */
  loop?: boolean;
  /** Priority for state precedence (higher = more important) */
  priority: number;
  /** Optional frame order override (defaults to metadata order) */
  frameOrder?: string[];
}

export type ProfileSpriteState =
  | "ACTIVE"
  | "WINNING"
  | "LOW_TOKENS"
  | "ELIMINATED"
  | "REVIVING"
  | "SHIELDED"
  | "CLOAK"
  | "TARGETED"
  | "STEAL_SUCCESS"
  | "DEFAULT";

export type ProfileSpriteRegistry = {
  [key in ProfileSpriteState]?: SpriteConfig;
};
