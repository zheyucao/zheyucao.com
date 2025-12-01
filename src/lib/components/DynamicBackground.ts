import { ANIMATION_CONSTANTS } from "../../constants/animationConstants";

const svgNS = "http://www.w3.org/2000/svg";

interface Vector {
  x: number;
  y: number;
}

interface HSLColor {
  h: number;
  s: number;
  l: number;
}

// Data-only interface
interface BlobShape {
  id: number;
  pathElement: SVGPathElement;
  position: Vector;
  velocity: Vector;
  radius: number;
  color: string;
  hsl: HSLColor;
  points: Vector[];
  angle: number;
  angularVelocity: number;
  baseAngles: number[];
  baseRadii: number[];
  deformationTime: number;
  deformationSpeed: number;
  deformationAmplitude: number;
}

interface ColorScheme {
  [key: string]: string[];
}

interface DynamicBackgroundConfig {
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

const colorScheme: ColorScheme = {
  reds: ["#FF6B6B", "#FFD93D", "#F2bF47", "#F2B707", "#F28706", "#F26430"],
  oranges: ["#FFa700", "#FF9B58", "#F27149", "#F9c443", "#faD93D"],
  yellows: ["#FFD700", "#FFDB58", "#F2E109", "#F9D423", "#caD93D"],
  greens: ["#90EE90", "#6BCB77", "#3CB371", "#32CD32", "#a0e9c4"],
  cyans: ["#40E0D0", "#AFEEEE", "#7FFFD4", "#B3E0F2", "#9EfDF2"],
  blues: ["#87CEEB", "#64f5ED", "#7De6FF", "#42d5FF", "#7299f9"],
  forest: ["#64f5ED", "#F2E109", "#32CD32", "#32CD32", "#a0e9c4"],
  purples: ["#996BcB", "#c2aFF7", "#8267d7", "#FF55ff", "#e264d0"],
  browns: ["#8B4513", "#A0522D", "#D2691E", "#DAA520", "#8B3030"],
  winter: ["#87CEEB", "#64f5ED", "#7De6FF", "#cccccc", "#ffffff"],
};

export class DynamicBackgroundManager {
  private container: HTMLElement;
  private svgContainer: SVGElement;
  private svgGroup: SVGGElement | null = null;
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
  private fpsHistory: number[] = [];
  private lastTimestamp = 0;
  private lastLogicExecutionTime = 0;
  private observer: IntersectionObserver | null = null;
  private isVisible = true;
  private prefersReducedMotion = false;
  private cleanupListeners: () => void = () => {};
  private forceStaticMode = false;

  constructor(containerId: string, svgId: string) {
    const container = document.getElementById(containerId);
    const svg = document.getElementById(svgId) as SVGElement | null;

    if (!container || !svg) {
      throw new Error("DynamicBackground elements not found");
    }

    this.container = container;
    this.svgContainer = svg;
    this.isMobileDevice =
      ("maxTouchPoints" in navigator && navigator.maxTouchPoints > 0) || window.innerWidth < 1024;

    this.config = {
      numBlobs: this.isMobileDevice ? 3 : 4,
      baseLargeMinBlobSize: 1000,
      baseLargeMaxBlobSize: 1600,
      baseSmallMinBlobSize: 600,
      baseSmallMaxBlobSize: 1000,
      referenceWidth: 1440,
      minScaleFactor: 0.5,
      maxScaleFactor: 1.5,
      speedMultiplier: this.isMobileDevice ? 0.5 : 1,
      mouseInfluenceRadius: 580,
      mouseForce: -800,
      opacity: 0.8,
      enableShapeChanging: false,
      enableCollisionDetection: true,
      enableMouseInteraction: true,
    };

    this.forceStaticMode = !this.detectChromium();
    this.prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    this.init();
  }

  private init() {
    if (this.prefersReducedMotion || this.forceStaticMode) {
      this.initStatic();
    } else {
      this.svgContainer.classList.add("css-hue-shift-active");
      this.initBlobs();
      this.setupEventListeners();
      this.setupIntersectionObserver();
      this.startAnimation();
    }

    // Trigger fade-in
    requestAnimationFrame(() => {
      this.container.classList.add("is-ready");
    });
  }

  private initStatic() {
    this.config.numBlobs = 3;
    this.initBlobs();
  }

  public cleanup() {
    this.container.classList.remove("is-ready");
    this.svgContainer.classList.remove("css-hue-shift-active");
    this.stopAnimation();
    if (this.mouseThrottleTimeout) cancelAnimationFrame(this.mouseThrottleTimeout);
    this.cleanupListeners();
    if (this.observer) this.observer.disconnect();
    this.blobs = [];
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

  private updateCachedRect() {
    if (this.needsRectUpdate) {
      const rect = this.svgContainer.getBoundingClientRect();
      this.cachedContainerRect = {
        width: rect.width,
        height: rect.height,
        left: rect.left,
        top: rect.top,
      };
      this.needsRectUpdate = false;
    }
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
      const currentFps = 1000 / deltaTime;
      this.fpsHistory.push(currentFps);
      if (this.fpsHistory.length > FPS.HISTORY_LENGTH) {
        this.fpsHistory.shift();
      }
    }

    try {
      this.updateCachedRect();
      const containerWidth = this.cachedContainerRect.width;
      const containerHeight = this.cachedContainerRect.height;

      if (this.svgGroup) {
        const offsetLerpFactor = 0.05;
        this.currentOffset.x += (this.targetOffset.x - this.currentOffset.x) * offsetLerpFactor;
        this.currentOffset.y += (this.targetOffset.y - this.currentOffset.y) * offsetLerpFactor;
        this.svgGroup.setAttribute(
          "transform",
          `translate(${this.currentOffset.x}, ${this.currentOffset.y})`
        );
      }

      // Call updateBlob for each blob
      this.blobs.forEach((blob) => this.updateBlob(blob, containerWidth, containerHeight));
    } catch (e) {
      console.error("Error in animation loop:", e);
      this.stopAnimation();
    }
  }

  private updateBlob(blob: BlobShape, containerWidth: number, containerHeight: number) {
    // --- Deformation ---
    blob.deformationTime += 1;

    // --- Movement (Update position based on PREVIOUS velocity) ---
    blob.position.x += blob.velocity.x;
    blob.position.y += blob.velocity.y;
    blob.angle += blob.angularVelocity;

    // --- Mouse Interaction ---
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

    // --- Velocity Limit ---
    const speed = Math.sqrt(blob.velocity.x ** 2 + blob.velocity.y ** 2);
    const maxSpeed = 1.5 * this.config.speedMultiplier;
    if (speed > maxSpeed) {
      blob.velocity.x *= maxSpeed / speed;
      blob.velocity.y *= maxSpeed / speed;
    }

    // --- Damping ---
    blob.velocity.x *= 0.99;
    blob.velocity.y *= 0.99;

    // --- Collision Detection ---
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

    // --- Boundary Check & Clamp ---
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

    // --- Update Transform ---
    blob.pathElement.setAttribute(
      "transform",
      `translate(${blob.position.x}, ${blob.position.y}) rotate(${blob.angle})`
    );
  }

  private initBlobs() {
    this.blobs = [];
    this.svgContainer.innerHTML = "";
    this.svgGroup = document.createElementNS(svgNS, "g");
    this.svgContainer.appendChild(this.svgGroup);

    const { width: containerWidth, height: containerHeight } =
      this.svgContainer.getBoundingClientRect();
    // ... (rest of initBlobs)
    const windowWidth = window.innerWidth;

    const scaleFactor = Math.max(
      this.config.minScaleFactor,
      Math.min(this.config.maxScaleFactor, windowWidth / this.config.referenceWidth)
    );
    const currentLargeMinSize = this.config.baseLargeMinBlobSize * scaleFactor;
    const currentLargeMaxSize = this.config.baseLargeMaxBlobSize * scaleFactor;
    const currentSmallMinSize = this.config.baseSmallMinBlobSize * scaleFactor;
    const currentSmallMaxSize = this.config.baseSmallMaxBlobSize * scaleFactor;

    const initialBlobColorsHex: string[] = [];
    const schemeNames = Object.keys(colorScheme);
    const selectedSchemeName = schemeNames[Math.floor(Math.random() * schemeNames.length)];
    const availableColors = colorScheme[selectedSchemeName] || [];
    const shuffledColors = this.shuffleArray([...availableColors]);

    for (let i = 0; i < this.config.numBlobs; i++) {
      initialBlobColorsHex.push(shuffledColors[i % shuffledColors.length] || "#90EE90");
    }

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
    const radius = this.random(minSize / 2, maxSize / 2);
    const position: Vector = {
      x: this.random(radius, containerWidth - radius),
      y: this.random(radius, containerHeight - radius),
    };

    const initialHsl = this.hexToHsl(initialHex);
    const initialGeometry = this.createBlobPoints(0, 0, radius, 0.3, 0.2, 8);
    const pathData = this.createPathString(initialGeometry.points);
    const velocity: Vector = {
      x: this.random(-1, 1) * this.config.speedMultiplier,
      y: this.random(-1, 1) * this.config.speedMultiplier,
    };
    const initialAngle = this.random(0, 360);
    const angularVelocity = this.random(-0.15, 0.15);

    const pathElement = document.createElementNS(svgNS, "path");
    pathElement.setAttribute("d", pathData);
    pathElement.setAttribute("fill", initialHex);
    pathElement.setAttribute(
      "transform",
      `translate(${position.x}, ${position.y}) rotate(${initialAngle})`
    );
    pathElement.style.opacity = String(this.config.opacity);
    this.svgGroup!.appendChild(pathElement);

    const blob: BlobShape = {
      id: blobIndex,
      pathElement,
      position,
      velocity,
      radius,
      color: initialHex,
      hsl: initialHsl || { h: 0, s: 0, l: 50 },
      points: initialGeometry.points,
      angle: initialAngle,
      angularVelocity,
      baseAngles: initialGeometry.angles,
      baseRadii: initialGeometry.radii,
      deformationTime: 0,
      deformationSpeed: this.random(0.005, 0.015),
      deformationAmplitude: radius * this.random(0.05, 0.15),
    };

    this.blobs.push(blob);
  }

  // Helpers
  private random(min: number, max: number): number {
    return Math.random() * (max - min) + min;
  }

  private shuffleArray<T>(array: T[]): T[] {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
  }

  private hexToHsl(hex: string): HSLColor | null {
    hex = hex.replace(/^#/, "");
    if (hex.length === 3) hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2];
    if (hex.length !== 6) return null;
    const r = parseInt(hex.substring(0, 2), 16) / 255;
    const g = parseInt(hex.substring(2, 4), 16) / 255;
    const b = parseInt(hex.substring(4, 6), 16) / 255;
    const max = Math.max(r, g, b),
      min = Math.min(r, g, b);
    let h = 0,
      s = 0;
    const l = (max + min) / 2;
    if (max !== min) {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      switch (max) {
        case r:
          h = (g - b) / d + (g < b ? 6 : 0);
          break;
        case g:
          h = (b - r) / d + 2;
          break;
        case b:
          h = (r - g) / d + 4;
          break;
      }
      h /= 6;
    }
    return { h: Math.round(h * 360), s: Math.round(s * 100), l: Math.round(l * 100) };
  }

  private createBlobPoints(
    cx: number,
    cy: number,
    r: number,
    irr: number,
    spk: number,
    num: number
  ) {
    const points: Vector[] = [];
    const angles: number[] = [];
    const radii: number[] = [];
    const angleStep = (Math.PI * 2) / num;
    for (let i = 0; i < num; i++) {
      const angle = i * angleStep;
      angles.push(angle);
      let radius = r + this.random(-irr, irr) * r;
      radius += this.random(0, spk) * r;
      radius = Math.max(r * 0.2, radius);
      radii.push(radius);
      points.push({ x: cx + Math.cos(angle) * radius, y: cy + Math.sin(angle) * radius });
    }
    return { points, angles, radii };
  }

  private createPathString(points: Vector[]): string {
    if (points.length < 3) return "";
    let d = `M ${points[0].x} ${points[0].y}`;
    const n = points.length;
    for (let i = 0; i < n; i++) {
      const p0 = points[(i - 1 + n) % n];
      const p1 = points[i];
      const p2 = points[(i + 1) % n];
      const p3 = points[(i + 2) % n];
      const cp1x = p1.x + (p2.x - p0.x) / 6;
      const cp1y = p1.y + (p2.y - p0.y) / 6;
      const cp2x = p2.x - (p3.x - p1.x) / 6;
      const cp2y = p2.y - (p3.y - p1.y) / 6;
      d += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${p2.x} ${p2.y}`;
    }
    d += " Z";
    return d;
  }

  private setupEventListeners() {
    const resizeHandler = () => {
      this.needsRectUpdate = true;
    };
    window.addEventListener("resize", resizeHandler);

    const mousemoveHandler = (event: MouseEvent) => {
      if (this.config.enableMouseInteraction) {
        if (this.mouseThrottleTimeout) cancelAnimationFrame(this.mouseThrottleTimeout);
        this.mouseThrottleTimeout = requestAnimationFrame(() => {
          try {
            this.updateCachedRect();
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
      }
    };
    window.addEventListener("mousemove", mousemoveHandler);

    const mouseleaveHandler = () => {
      this.mousePos = null;
      this.targetOffset.x = 0;
      this.targetOffset.y = 0;
    };
    window.addEventListener("mouseleave", mouseleaveHandler);

    // Store cleanup function
    this.cleanupListeners = () => {
      window.removeEventListener("resize", resizeHandler);
      window.removeEventListener("mousemove", mousemoveHandler);
      window.removeEventListener("mouseleave", mouseleaveHandler);
    };
  }

  // Chromium detection so we can keep heavy animation off Safari/Firefox
  private detectChromium(): boolean {
    const nav = navigator as Navigator & {
      userAgentData?: { brands?: { brand: string; version: string }[] };
    };

    const brands = nav.userAgentData?.brands;
    if (brands?.length) {
      return brands.some(({ brand }) =>
        /Chromium|Chrome|Google Chrome|Microsoft Edge|Brave|Opera/i.test(brand)
      );
    }

    const ua = navigator.userAgent;
    const isIos = /\b(iPad|iPhone|iPod)\b/.test(ua);
    if (isIos) return false;

    const isChromeLike = /Chrome\/|CriOS\//.test(ua);
    const isEdge = /Edg\//.test(ua);
    const isOpera = /OPR\//.test(ua);
    return isChromeLike || isEdge || isOpera;
  }
}
