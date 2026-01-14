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
  hsl: HSLColor;
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
}

export interface ColorScheme {
  [key: string]: string[];
}
