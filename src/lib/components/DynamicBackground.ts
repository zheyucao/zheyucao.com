import { ANIMATION_CONSTANTS } from "../../constants/animationConstants";
import { createConfig } from "./dynamicBackground/config";
import { pickInitialColors } from "./dynamicBackground/colorSchemes";
import { buildPathFromPoints, createBlobPoints } from "./dynamicBackground/geometry";
import { hexToHsl, random } from "./dynamicBackground/utils";
import { hexToOklch, oklchToHex } from "./dynamicBackground/oklchColors";
import type { BlobShape, DynamicBackgroundConfig, Vector } from "./dynamicBackground/types";

export class DynamicBackgroundManager {
  private container: HTMLElement;
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private blobs: BlobShape[] = [];
  private rafId: number | null = null;
  private mouseThrottleTimeout: number | null = null;
  private mousePos: Vector | null = null;
  private targetOffset: Vector = { x: 0, y: 0 };
  private currentOffset: Vector = { x: 0, y: 0 };
  private cachedContainerRect = { width: 0, height: 0, left: 0, top: 0 };
  private needsRectUpdate = true;
  private isMobileDevice: boolean;
  private config: DynamicBackgroundConfig;
  private lastTimestamp = 0;
  private lastLogicExecutionTime = 0;
  private observer: IntersectionObserver | null = null;
  private themeObserver: MutationObserver | null = null;
  private isVisible = true;
  private prefersReducedMotion = false;
  private cleanupListeners: () => void = () => {};
  private forceStaticMode = false;
  private dpr = 1;

  constructor(containerId: string, canvasId: string) {
    const container = document.getElementById(containerId);
    const canvas = document.getElementById(canvasId) as HTMLCanvasElement | null;

    if (!container || !canvas) {
      throw new Error("DynamicBackground elements not found");
    }

    const ctx = canvas.getContext("2d");
    if (!ctx) {
      throw new Error("Canvas 2D context not available");
    }

    this.container = container;
    this.canvas = canvas;
    this.ctx = ctx;
    this.isMobileDevice =
      ("maxTouchPoints" in navigator && navigator.maxTouchPoints > 0) || window.innerWidth < 1024;

    this.config = createConfig(this.isMobileDevice);

    this.forceStaticMode = this.shouldForceStaticMode();
    this.prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    this.init();
  }

  private init() {
    this.ensureCanvasSize();
    this.setupThemeObserver();

    if (this.prefersReducedMotion || this.forceStaticMode) {
      this.initStatic();
      this.setupEventListeners(true);
    } else {
      this.initBlobs();
      this.setupEventListeners();
      this.setupIntersectionObserver();
      this.startAnimation();
    }

    requestAnimationFrame(() => {
      this.container.classList.add("is-ready");
    });
  }

  private initStatic() {
    this.config.numBlobs = 3;
    this.config.enableMouseInteraction = false;
    this.initBlobs();
    this.drawFrame();
  }

  public cleanup() {
    this.container.classList.remove("is-ready");
    this.canvas.classList.remove("css-hue-shift-active");
    this.stopAnimation();
    if (this.mouseThrottleTimeout) cancelAnimationFrame(this.mouseThrottleTimeout);
    this.cleanupListeners();
    if (this.observer) this.observer.disconnect();
    if (this.themeObserver) this.themeObserver.disconnect();
    this.blobs = [];
    this.ctx.setTransform(1, 0, 0, 1, 0, 0);
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
  }

  private isDarkMode(): boolean {
    return document.documentElement.classList.contains("dark");
  }

  private setupThemeObserver() {
    this.themeObserver = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === "attributes" && mutation.attributeName === "class") {
          // Theme changed, regenerate blobs with new colors
          // We can just call initBlobs() which clears and repopulates this.blobs
          this.initBlobs();
          if (this.config.numBlobs === 3) {
            // If in static mode, redraw immediately
            this.drawFrame();
          }
        }
      });
    });

    this.themeObserver.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });
  }

  private setupIntersectionObserver() {
    this.observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          this.isVisible = entry.isIntersecting;
          if (this.isVisible) {
            if (!this.rafId) this.startAnimation();
          } else {
            this.stopAnimation();
          }
        });
      },
      { threshold: 0 }
    );
    this.observer.observe(this.container);
  }

  private startAnimation() {
    if (!this.rafId && this.isVisible && !this.prefersReducedMotion && !this.forceStaticMode) {
      this.lastTimestamp = performance.now();
      this.lastLogicExecutionTime = performance.now();
      this.rafId = requestAnimationFrame(this.animate.bind(this));
    }
  }

  private stopAnimation() {
    if (this.rafId) {
      cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }
  }

  private ensureCanvasSize() {
    if (!this.needsRectUpdate) return;
    const rect = this.container.getBoundingClientRect();
    this.cachedContainerRect = {
      width: rect.width,
      height: rect.height,
      left: rect.left,
      top: rect.top,
    };
    this.dpr = window.devicePixelRatio || 1;
    this.canvas.width = Math.max(1, Math.floor(rect.width * this.dpr));
    this.canvas.height = Math.max(1, Math.floor(rect.height * this.dpr));
    this.canvas.style.width = `${rect.width}px`;
    this.canvas.style.height = `${rect.height}px`;
    this.needsRectUpdate = false;
  }

  private animate(timestamp: number) {
    this.rafId = requestAnimationFrame(this.animate.bind(this));

    const { FPS } = ANIMATION_CONSTANTS;
    const targetFrameInterval = 1000 / FPS.TARGET;

    const elapsedSinceLastExecution = timestamp - this.lastLogicExecutionTime;
    if (elapsedSinceLastExecution < targetFrameInterval) {
      return;
    }
    this.lastLogicExecutionTime = timestamp - (elapsedSinceLastExecution % targetFrameInterval);

    const deltaTime = timestamp - this.lastTimestamp;
    this.lastTimestamp = timestamp;

    if (!this.isMobileDevice && deltaTime > 0) {
      // Logic for non-mobile devices if needed
    }

    try {
      this.ensureCanvasSize();
      const containerWidth = this.cachedContainerRect.width;
      const containerHeight = this.cachedContainerRect.height;

      const offsetLerpFactor = 0.05;
      this.currentOffset.x += (this.targetOffset.x - this.currentOffset.x) * offsetLerpFactor;
      this.currentOffset.y += (this.targetOffset.y - this.currentOffset.y) * offsetLerpFactor;

      this.blobs.forEach((blob) => this.updateBlob(blob, containerWidth, containerHeight));
      this.drawFrame();
    } catch (e) {
      console.error("Error in animation loop:", e);
      this.stopAnimation();
    }
  }

  private drawFrame() {
    this.ensureCanvasSize();
    const ctx = this.ctx;
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
    ctx.translate(this.currentOffset.x, this.currentOffset.y);
    ctx.globalAlpha = this.config.opacity;

    for (const blob of this.blobs) {
      ctx.save();
      ctx.translate(blob.position.x, blob.position.y);
      ctx.rotate((blob.angle * Math.PI) / 180);
      ctx.fillStyle = blob.color;
      ctx.fill(blob.path);
      ctx.restore();
    }

    ctx.globalAlpha = 1;
    ctx.setTransform(1, 0, 0, 1, 0, 0);
  }

  private updateBlob(blob: BlobShape, containerWidth: number, containerHeight: number) {
    blob.deformationTime += 1;

    // Smooth color shifting using OKLCH
    // Increment hue slightly each frame (approx 0.1 deg/frame ~ 6 deg/sec)
    blob.oklch.h = (blob.oklch.h + 0.1) % 360;
    // Update the render color
    blob.color = oklchToHex(blob.oklch);

    blob.position.x += blob.velocity.x;
    blob.position.y += blob.velocity.y;
    blob.angle += blob.angularVelocity;

    if (this.config.enableMouseInteraction && this.mousePos) {
      const dx = blob.position.x - this.mousePos.x;
      const dy = blob.position.y - this.mousePos.y;
      const distSquared = dx * dx + dy * dy;
      const influenceDist = this.config.mouseInfluenceRadius + blob.radius * 1.2;

      if (distSquared < influenceDist * influenceDist) {
        const dist = Math.sqrt(distSquared);
        if (influenceDist > 0.1) {
          const force = Math.pow((influenceDist - dist) / influenceDist, 1.5);
          const angle = Math.atan2(dy, dx);
          blob.velocity.x +=
            Math.cos(angle) * force * this.config.mouseForce * this.config.speedMultiplier;
          blob.velocity.y +=
            Math.sin(angle) * force * this.config.mouseForce * this.config.speedMultiplier;
        }
      }
    }

    const speed = Math.sqrt(blob.velocity.x ** 2 + blob.velocity.y ** 2);
    const maxSpeed = 1.5 * this.config.speedMultiplier;
    if (speed > maxSpeed) {
      blob.velocity.x *= maxSpeed / speed;
      blob.velocity.y *= maxSpeed / speed;
    }

    blob.velocity.x *= 0.99;
    blob.velocity.y *= 0.99;

    if (this.config.enableCollisionDetection) {
      const collisionPushForce = 0.01;
      for (const otherBlob of this.blobs) {
        if (blob.id === otherBlob.id) continue;

        const dx = otherBlob.position.x - blob.position.x;
        const dy = otherBlob.position.y - blob.position.y;
        const distSquared = dx * dx + dy * dy;
        const minDist = (blob.radius + otherBlob.radius) * 0.5;
        const minDistSquared = minDist * minDist;

        if (distSquared < minDistSquared && distSquared > 0) {
          const dist = Math.sqrt(distSquared);
          const overlap = minDist - dist;
          const angle = Math.atan2(dy, dx);
          const pushX = Math.cos(angle) * overlap * collisionPushForce;
          const pushY = Math.sin(angle) * overlap * collisionPushForce;

          blob.velocity.x -= pushX;
          blob.velocity.y -= pushY;
        }
      }
    }

    const pushForce = 0.05 * this.config.speedMultiplier;
    if (blob.position.x < blob.radius) blob.velocity.x += pushForce;
    if (blob.position.x > containerWidth - blob.radius) blob.velocity.x -= pushForce;
    if (blob.position.y < blob.radius) blob.velocity.y += pushForce;
    if (blob.position.y > containerHeight - blob.radius) blob.velocity.y -= pushForce;

    blob.position.x = Math.max(
      blob.radius / 2,
      Math.min(containerWidth - blob.radius / 2, blob.position.x)
    );
    blob.position.y = Math.max(
      blob.radius / 2,
      Math.min(containerHeight - blob.radius / 2, blob.position.y)
    );
  }

  private initBlobs() {
    this.blobs = [];
    this.needsRectUpdate = true;
    this.ensureCanvasSize();

    const { width: containerWidth, height: containerHeight } = this.cachedContainerRect;
    const windowWidth = window.innerWidth;

    const scaleFactor = Math.max(
      this.config.minScaleFactor,
      Math.min(this.config.maxScaleFactor, windowWidth / this.config.referenceWidth)
    );
    const currentLargeMinSize = this.config.baseLargeMinBlobSize * scaleFactor;
    const currentLargeMaxSize = this.config.baseLargeMaxBlobSize * scaleFactor;
    const currentSmallMinSize = this.config.baseSmallMinBlobSize * scaleFactor;
    const currentSmallMaxSize = this.config.baseSmallMaxBlobSize * scaleFactor;

    const colorConfig = this.isDarkMode() ? this.config.colors.dark : this.config.colors.light;

    const initialBlobColorsHex = pickInitialColors(this.config.numBlobs, colorConfig);

    const largeBlobCount = Math.ceil(this.config.numBlobs / 2);
    for (let i = 0; i < largeBlobCount; i++) {
      this.createSingleBlob(
        i,
        currentLargeMinSize,
        currentLargeMaxSize,
        initialBlobColorsHex[i],
        containerWidth,
        containerHeight
      );
    }

    for (let i = largeBlobCount; i < this.config.numBlobs; i++) {
      this.createSingleBlob(
        i,
        currentSmallMinSize,
        currentSmallMaxSize,
        initialBlobColorsHex[i % initialBlobColorsHex.length],
        containerWidth,
        containerHeight
      );
    }
  }

  private createSingleBlob(
    blobIndex: number,
    minSize: number,
    maxSize: number,
    initialHex: string,
    containerWidth: number,
    containerHeight: number
  ) {
    const radius = random(minSize / 2, maxSize / 2);
    const safeWidth = Math.max(containerWidth, radius * 2);
    const safeHeight = Math.max(containerHeight, radius * 2);
    const position: Vector = {
      x: random(radius, safeWidth - radius),
      y: random(radius, safeHeight - radius),
    };

    const initialHsl = hexToHsl(initialHex);
    // Initialize OKLCH for consistent color shifting
    const initialOklch = hexToOklch(initialHex);

    const initialGeometry = createBlobPoints(0, 0, radius, 0.3, 0.2, 8);
    const path = buildPathFromPoints(initialGeometry.points);
    const velocity: Vector = {
      x: random(-1, 1) * this.config.speedMultiplier,
      y: random(-1, 1) * this.config.speedMultiplier,
    };
    const initialAngle = random(0, 360);
    const angularVelocity = random(-0.15, 0.15);

    const blob: BlobShape = {
      id: blobIndex,
      position,
      velocity,
      radius,
      color: initialHex,
      hsl: initialHsl || { h: 0, s: 0, l: 50 },
      oklch: initialOklch,
      points: initialGeometry.points,
      path,
      angle: initialAngle,
      angularVelocity,
      baseAngles: initialGeometry.angles,
      baseRadii: initialGeometry.radii,
      deformationTime: 0,
      deformationSpeed: random(0.005, 0.015),
      deformationAmplitude: radius * random(0.05, 0.15),
    };

    this.blobs.push(blob);
  }

  private setupEventListeners(staticMode = false) {
    const resizeHandler = () => {
      this.needsRectUpdate = true;
      if (staticMode || (!this.rafId && (this.prefersReducedMotion || this.forceStaticMode))) {
        this.drawFrame();
      }
    };
    window.addEventListener("resize", resizeHandler);

    let mousemoveHandler: ((event: MouseEvent) => void) | null = null;
    let mouseleaveHandler: (() => void) | null = null;

    if (this.config.enableMouseInteraction && !staticMode) {
      mousemoveHandler = (event: MouseEvent) => {
        if (this.mouseThrottleTimeout) cancelAnimationFrame(this.mouseThrottleTimeout);
        this.mouseThrottleTimeout = requestAnimationFrame(() => {
          try {
            this.ensureCanvasSize();
            const mouseX = event.clientX;
            const mouseY = event.clientY;
            this.mousePos = {
              x: mouseX - this.cachedContainerRect.left,
              y: mouseY - this.cachedContainerRect.top,
            };
            const centerX = window.innerWidth / 2;
            const centerY = window.innerHeight / 2;
            const offsetScale = -0.03;
            this.targetOffset.x = (mouseX - centerX) * offsetScale;
            this.targetOffset.y = (mouseY - centerY) * offsetScale;
          } catch (e) {
            console.error("Error in mousemove handler:", e);
          }
        });
      };
      window.addEventListener("mousemove", mousemoveHandler);

      mouseleaveHandler = () => {
        this.mousePos = null;
        this.targetOffset.x = 0;
        this.targetOffset.y = 0;
      };
      window.addEventListener("mouseleave", mouseleaveHandler);
    }

    this.cleanupListeners = () => {
      window.removeEventListener("resize", resizeHandler);
      if (mousemoveHandler) window.removeEventListener("mousemove", mousemoveHandler);
      if (mouseleaveHandler) window.removeEventListener("mouseleave", mouseleaveHandler);
    };
  }

  /**
   * Detect browsers with known canvas performance issues.
   * Uses CSS feature detection instead of fragile user-agent sniffing.
   */
  private shouldForceStaticMode(): boolean {
    // Firefox has known issues with canvas filter effects and animation performance.
    // Use CSS feature detection: -moz-appearance is Firefox-specific.
    return CSS.supports("(-moz-appearance: none)");
  }
}
