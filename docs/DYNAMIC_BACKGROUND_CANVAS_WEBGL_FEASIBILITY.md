# DynamicBackground Canvas/WebGL Rewrite Feasibility Assessment

## Executive Summary

This document assesses the feasibility of rewriting the current SVG-based `DynamicBackground` component using Canvas 2D or WebGL. Based on analysis of the current implementation and requirements, **both Canvas 2D and WebGL are viable options**, with Canvas 2D being the recommended approach for this use case due to lower complexity and sufficient performance characteristics.

---

## Current Implementation Analysis

### Overview

The current implementation (`src/lib/components/DynamicBackground.ts`) uses **SVG with JavaScript animation** to create animated blob shapes as a decorative background effect.

### Key Features

| Feature | Description |
|---------|-------------|
| **Blob Rendering** | 3-4 blob shapes rendered using SVG `<path>` elements |
| **Animation** | `requestAnimationFrame` loop at 60 FPS target |
| **Movement** | Velocity-based physics with damping |
| **Mouse Interaction** | Blobs react to mouse position with configurable force |
| **Collision Detection** | Blob-to-blob collision with push forces |
| **Hue Shifting** | CSS animation for color cycling |
| **Accessibility** | Respects `prefers-reduced-motion` |
| **Performance Optimization** | IntersectionObserver for visibility-based pausing, FPS throttling |
| **Browser Compatibility** | Falls back to static mode on Firefox |

### Current Architecture

```
DynamicBackgroundManager
├── SVG Container
│   └── SVG Group (for parallax offset)
│       └── Path Elements (blob shapes)
├── Animation Loop (RAF)
├── Event Listeners (resize, mouse)
├── IntersectionObserver (visibility)
└── Blob Data Structures (physics state)
```

### Current Limitations

1. **Firefox Performance**: Currently disabled on Firefox due to performance issues
2. **DOM Manipulation**: Each frame updates multiple SVG path `transform` attributes
3. **Memory Overhead**: SVG path strings recreation (though minimized with transform-only updates)
4. **Scalability**: Adding more blobs increases DOM manipulation overhead

---

## Canvas 2D Approach

### Implementation Strategy

Replace SVG rendering with HTML5 Canvas 2D API while maintaining the same animation logic.

```typescript
// Conceptual structure
class CanvasDynamicBackground {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private blobs: BlobShape[];
  
  private render() {
    this.ctx.clearRect(0, 0, this.width, this.height);
    for (const blob of this.blobs) {
      this.ctx.beginPath();
      // Draw blob path using ctx.bezierCurveTo()
      this.ctx.fill();
    }
  }
}
```

### Advantages

| Aspect | Benefit |
|--------|---------|
| **Performance** | No DOM manipulation per frame; direct pixel/path manipulation |
| **Memory** | No SVG string parsing/recreation; single bitmap buffer |
| **Firefox** | Canvas performs consistently across browsers, likely fixes Firefox issues |
| **Batched Drawing** | All blobs drawn in single context without layout reflow |
| **Filters** | Canvas blur filter can replace CSS blur (GPU-accelerated on most browsers) |

### Challenges

| Challenge | Mitigation |
|-----------|------------|
| **Resolution/DPI** | Use `devicePixelRatio` for crisp rendering on high-DPI displays |
| **Accessibility** | Add ARIA labels; Canvas is not semantically meaningful (same as current SVG) |
| **Color Management** | Port hex-to-HSL utilities; Canvas uses the same color formats |
| **Blur Effect** | Use `ctx.filter = 'blur(Xpx)'` or OffscreenCanvas with filter |

### Estimated Effort

- **Lines of Code**: ~400-450 lines (comparable to current ~590 lines)
- **Development Time**: 2-3 days for core implementation + testing
- **Risk Level**: Low - straightforward API mapping

### Browser Support

- Canvas 2D: **99%+ global browser support**
- All features needed are well-supported (paths, bezier curves, transforms, filters)

---

## WebGL Approach

### Implementation Strategy

Use WebGL shaders for blob rendering, potentially leveraging metaball/SDF techniques.

```typescript
// Conceptual structure
class WebGLDynamicBackground {
  private canvas: HTMLCanvasElement;
  private gl: WebGLRenderingContext;
  private program: WebGLProgram;
  private uniforms: { time: WebGLUniformLocation; ... };
  
  private render() {
    // Update uniforms with blob positions
    // Run fragment shader for metaball/blob rendering
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
  }
}
```

### Advantages

| Aspect | Benefit |
|--------|---------|
| **GPU Performance** | All rendering on GPU; ideal for complex effects |
| **Metaballs** | Can implement organic merging blobs using SDF techniques |
| **Visual Quality** | Smooth gradients, soft edges, procedural effects |
| **Scalability** | Can handle many more blobs without performance degradation |
| **Future Potential** | Easy to add effects (glow, distortion, particles) |

### Challenges

| Challenge | Mitigation/Note |
|-----------|-----------------|
| **Complexity** | Requires shader programming (GLSL); higher learning curve |
| **Debugging** | WebGL errors are less intuitive than Canvas 2D |
| **Over-Engineering** | Current use case (3-4 blobs) doesn't require GPU power |
| **Mobile Battery** | WebGL can drain battery faster on mobile |
| **Context Loss** | Need to handle WebGL context loss/restore |
| **Fallback** | Need Canvas 2D or CSS fallback for WebGL-unsupported browsers |

### Estimated Effort

- **Lines of Code**: ~600-800 lines (including shaders and fallback logic)
- **Development Time**: 5-7 days for full implementation + testing
- **Risk Level**: Medium - shader complexity and edge cases

### Browser Support

- WebGL 1.0: **97%+ global browser support**
- Need to handle context loss and provide fallback

---

## Comparison Matrix

| Criteria | SVG (Current) | Canvas 2D | WebGL |
|----------|--------------|-----------|-------|
| **Implementation Complexity** | ✓ Current | ✓ Low | ⚠️ Medium-High |
| **Performance** | ⚠️ DOM overhead | ✓ Good | ✓✓ Best |
| **Firefox Compatibility** | ✗ Issues | ✓ Expected Good | ✓ Expected Good |
| **Browser Support** | ✓ 99%+ | ✓ 99%+ | ✓ 97%+ |
| **Development Time** | N/A | 2-3 days | 5-7 days |
| **Maintainability** | ✓ JS only | ✓ JS only | ⚠️ JS + GLSL |
| **Visual Fidelity** | ✓ Good | ✓ Good | ✓✓ Best |
| **Future Extensibility** | ⚠️ Limited | ✓ Moderate | ✓✓ High |
| **Mobile Battery** | ✓ Low | ✓ Low | ⚠️ Higher |

---

## Recommendation

### Primary Recommendation: **Canvas 2D**

Canvas 2D is the recommended approach for the following reasons:

1. **Right-Sized Solution**: The current use case (3-4 animated blobs) doesn't require GPU shader power
2. **Firefox Fix**: Canvas 2D likely resolves the Firefox performance issues that necessitated the current static fallback
3. **Lower Risk**: Straightforward migration path from current SVG implementation
4. **Maintainability**: Pure JavaScript, no shader knowledge required
5. **Consistent Performance**: Canvas 2D performs well across all modern browsers

### When to Consider WebGL

Consider WebGL if future requirements include:
- Significantly more animated elements (20+ blobs)
- Advanced visual effects (metaball merging, glow, distortion)
- Particle systems or complex procedural animations
- Already using a WebGL library for other features

---

## Migration Path

### Phase 1: Canvas 2D Implementation (Recommended)

```
1. Create new CanvasDynamicBackground.ts
2. Migrate blob physics logic (largely unchanged)
3. Replace SVG rendering with Canvas 2D drawing
4. Implement DPI-aware canvas sizing
5. Add CSS blur via canvas filter or CSS
6. Test across browsers (especially Firefox)
7. Update DynamicBackground.astro to use new component
8. Remove Firefox static fallback
```

### Phase 2: Optional WebGL Enhancement

If performance demands increase or advanced effects are desired:

```
1. Create WebGL renderer as alternative
2. Implement GLSL fragment shader for blobs
3. Add feature detection and fallback to Canvas 2D
4. Profile and compare performance
```

---

## Technical Implementation Notes

### Canvas 2D Drawing Blob Shapes

The current SVG path can be converted to Canvas bezier curves:

```typescript
private drawBlob(blob: BlobShape) {
  const ctx = this.ctx;
  ctx.save();
  ctx.translate(blob.position.x, blob.position.y);
  ctx.rotate((blob.angle * Math.PI) / 180);
  
  ctx.beginPath();
  const points = blob.points;
  ctx.moveTo(points[0].x, points[0].y);
  
  // Smoothing factor for Catmull-Rom to Bezier conversion (divides tangent vectors)
  const BEZIER_SMOOTHING = 6;
  
  for (let i = 0; i < points.length; i++) {
    const p0 = points[(i - 1 + points.length) % points.length];
    const p1 = points[i];
    const p2 = points[(i + 1) % points.length];
    const p3 = points[(i + 2) % points.length];
    
    // Calculate control points using Catmull-Rom spline tangent approximation
    const cp1x = p1.x + (p2.x - p0.x) / BEZIER_SMOOTHING;
    const cp1y = p1.y + (p2.y - p0.y) / BEZIER_SMOOTHING;
    const cp2x = p2.x - (p3.x - p1.x) / BEZIER_SMOOTHING;
    const cp2y = p2.y - (p3.y - p1.y) / BEZIER_SMOOTHING;
    
    ctx.bezierCurveTo(cp1x, cp1y, cp2x, cp2y, p2.x, p2.y);
  }
  
  ctx.closePath();
  ctx.fillStyle = blob.color;
  ctx.fill();
  ctx.restore();
}
```

### Handling High-DPI Displays

```typescript
private setupCanvas() {
  const dpr = window.devicePixelRatio || 1;
  const rect = this.container.getBoundingClientRect();
  
  this.canvas.width = rect.width * dpr;
  this.canvas.height = rect.height * dpr;
  this.canvas.style.width = `${rect.width}px`;
  this.canvas.style.height = `${rect.height}px`;
  
  this.ctx.scale(dpr, dpr);
}
```

### Canvas Blur Implementation Options

1. **CSS Filter on Canvas Element** (Recommended):
   ```css
   canvas { filter: blur(80px); }
   ```

2. **Canvas API Filter** (Alternative):
   ```typescript
   ctx.filter = 'blur(80px)';
   ```

3. **OffscreenCanvas Post-Processing** (Advanced):
   Draw to offscreen canvas, apply blur, composite to main canvas

---

## Conclusion

Rewriting the DynamicBackground using Canvas 2D or WebGL is **feasible and recommended**. Canvas 2D provides the best balance of performance improvement, development effort, and maintainability. WebGL is available as a future enhancement if more complex visual effects are desired.

The migration from SVG to Canvas 2D should:
- Improve cross-browser performance consistency
- Potentially resolve Firefox compatibility issues
- Maintain current visual appearance
- Keep codebase maintainable

---

## References

- [MDN Canvas Tutorial](https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API/Tutorial)
- [MDN WebGL Tutorial](https://developer.mozilla.org/en-US/docs/Web/API/WebGL_API/Tutorial)
- [Canvas vs SVG Performance](https://css-tricks.com/when-to-use-svg-vs-when-to-use-canvas/)
- [High DPI Canvas](https://developer.mozilla.org/en-US/docs/Web/API/Window/devicePixelRatio#correcting_resolution_in_a_canvas)
