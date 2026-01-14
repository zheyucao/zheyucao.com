export interface Vector {
  x: number;
  y: number;
}

export interface HSLColor {
  h: number;
  s: number;
  l: number;
}

export interface OKLCHColor {
  l: number; // 0-1 lightness
  c: number; // 0-0.4+ chroma
  h: number; // 0-360 hue angle
}

export interface BlobShape {
  id: number;
  position: Vector;
  velocity: Vector;
  radius: number;
  color: string;
  hsl: HSLColor; // Kept for legacy compatibility if needed
  oklch: OKLCHColor; // For high-quality color shifting
  points: Vector[];
  path: Path2D;
  angle: number;
  angularVelocity: number;
  baseAngles: number[];
  baseRadii: number[];
  deformationTime: number;
  deformationSpeed: number;
  deformationAmplitude: number;
}

export interface ColorScheme {
  [key: string]: string[];
}

export type HarmonyScheme =
  | "analogous"
  | "complementary"
  | "triadic"
  | "tetradic"
  | "split-complementary"
  | "warm"
  | "cool";

export type ColorStrategy = "oklch-automatic" | "manual-curated";

export interface ColorModeConfig {
  strategy: ColorStrategy;

  // For manual strategy:
  // Option A: allowed keys from curatedSchemes (e.g. "blues", "reds")
  curatedSchemes?: string[];
  // Option B: Provide a custom fixed palette of hex codes
  customPalette?: string[];

  // For automatic strategy:
  harmonySchemes?: HarmonyScheme[]; // Allowed schemes (e.g. ["analogous", "warm"])
  baseHue?: number; // Fixed base hue (0-360) for generation
  preset?: {
    lightness: number;
    chroma: number;
  };
  forceMonochrome?: boolean; // If true, forces single color family
}

export interface DynamicBackgroundConfig {
  numBlobs: number;
  baseLargeMinBlobSize: number;
  baseLargeMaxBlobSize: number;
  baseSmallMinBlobSize: number;
  baseSmallMaxBlobSize: number;
  referenceWidth: number;
  minScaleFactor: number;
  maxScaleFactor: number;
  speedMultiplier: number;
  mouseInfluenceRadius: number;
  mouseForce: number;
  opacity: number;
  enableShapeChanging: boolean;
  enableCollisionDetection: boolean;
  enableMouseInteraction: boolean;
  // New color config
  colors: {
    light: ColorModeConfig;
    dark: ColorModeConfig;
  };
}
