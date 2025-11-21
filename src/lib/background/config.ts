/**
 * DynamicBackground Configuration
 * Centralized configuration for dynamic background behavior
 */

export interface DynamicBackgroundConfig {
    // Blob configuration
    numBlobs: number;
    baseLargeMinBlobSize: number;
    baseLargeMaxBlobSize: number;
    baseSmallMinBlobSize: number;
    baseSmallMaxBlobSize: number;

    // Canvas configuration
    referenceWidth: number;
    baseSpeed: number;

    // Mouse interaction
    mouseInfluenceRadius: number;
    mouseForce: number;
    opacity: number;

    // Feature flags
    enableShapeChanging: boolean;
    enableCollisionDetection: boolean;
    enableMouseInteraction: boolean;
}

export const defaultConfig: DynamicBackgroundConfig = {
    numBlobs: 4,
    baseLargeMinBlobSize: 1000,
    baseLargeMaxBlobSize: 1600,
    baseSmallMinBlobSize: 600,
    baseSmallMaxBlobSize: 1000,
    referenceWidth: 1440,
    baseSpeed: 0.0005,
    mouseInfluenceRadius: 580,
    mouseForce: -800,
    opacity: 0.8,
    enableShapeChanging: false,
    enableCollisionDetection: true,
    enableMouseInteraction: true,
};

// Mobile/low-spec device configuration
export const mobileConfig: Partial<DynamicBackgroundConfig> = {
    numBlobs: 3, // Fewer blobs on lower-spec devices
};

/**
 * Detect if device is mobile or low-spec
 */
export function isMobileDevice(): boolean {
    return ("maxTouchPoints" in navigator && navigator.maxTouchPoints > 0) || window.innerWidth < 1024;
}

/**
 * Get appropriate config for current device
 */
export function getDeviceConfig(): DynamicBackgroundConfig {
    if (isMobileDevice()) {
        return { ...defaultConfig, ...mobileConfig };
    }
    return defaultConfig;
}
