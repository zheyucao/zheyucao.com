import type { DynamicBackgroundConfig } from "./types";

export function createConfig(isMobileDevice: boolean): DynamicBackgroundConfig {
  return {
    numBlobs: isMobileDevice ? 3 : 4,
    baseLargeMinBlobSize: 1000,
    baseLargeMaxBlobSize: 1600,
    baseSmallMinBlobSize: 600,
    baseSmallMaxBlobSize: 1000,
    referenceWidth: 1440,
    minScaleFactor: 0.5,
    maxScaleFactor: 1.5,
    speedMultiplier: isMobileDevice ? 0.5 : 1,
    mouseInfluenceRadius: 580,
    mouseForce: -800,
    opacity: 0.8,
    enableShapeChanging: false,
    enableCollisionDetection: true,
    enableMouseInteraction: true,
  };
}
