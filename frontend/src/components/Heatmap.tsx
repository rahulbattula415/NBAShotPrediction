import React, { useEffect, useMemo, useRef } from 'react';
import * as d3 from 'd3';
import './Heatmap.css';
import { courtToScreenCoordinates, DEFAULT_COURT_DIMENSIONS, type CourtDimensions, type CourtPosition } from '../courtCoordinates';

export type HeatmapPoint = {
  x: number; // x in provided coordinate space
  y: number; // y in provided coordinate space
  weight?: number; // optional intensity weight/probability (0..1)
};

export interface HeatmapProps {
  width: number;
  height: number;
  data: HeatmapPoint[];
  radius?: number; // base blur radius in px
  maxOpacity?: number; // 0..1
  colorScheme?: readonly string[]; // optional custom palette (unused when using RdYlGn interpolator)
  leagueAverage?: number; // expected league make rate baseline (0..1)
  leagueBand?: number; // +/- band around average to map colors (0..1)
  coordinateSpace?: 'screen' | 'court'; // interpret incoming points as screen px or court feet
  courtDimensions?: CourtDimensions; // required if coordinateSpace === 'court'
  autoResize?: boolean; // if true, match parent size automatically
  className?: string;
}

/**
 * D3 canvas-based heatmap for performance and smooth gradients.
 * Accepts points in screen/SVG coordinates over the basketball court overlay.
 */
const Heatmap: React.FC<HeatmapProps> = ({
  width,
  height,
  data,
  radius = 24,
  maxOpacity = 0.85,
  leagueAverage,
  leagueBand,
  coordinateSpace = 'screen',
  courtDimensions,
  autoResize = false,
  className
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const avg = leagueAverage ?? 0.45;
  const band = Math.max(0.05, Math.min(0.4, leagueBand ?? 0.2));
  const colorScale = useMemo(() => d3.scaleSequential(d3.interpolateRdYlGn)
    .domain([avg - band, avg + band])
    .clamp(true), [avg, band]);

  // Draw colored radial splats per point, blending via 'lighter' for density
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Resolve canvas drawing size if autoResize
    if (autoResize && containerRef.current) {
      const parent = containerRef.current;
      const w = parent.clientWidth || width;
      const h = parent.clientHeight || height;
      const dpr = window.devicePixelRatio || 1;
      const targetW = Math.max(1, Math.floor(w * dpr));
      const targetH = Math.max(1, Math.floor(h * dpr));
      if (canvas.width !== targetW || canvas.height !== targetH) {
        canvas.width = targetW;
        canvas.height = targetH;
      }
      // Scale drawing so logical coordinates match CSS pixels
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    } else {
      const dpr = window.devicePixelRatio || 1;
      const targetW = Math.max(1, Math.floor(width * dpr));
      const targetH = Math.max(1, Math.floor(height * dpr));
      if (canvas.width !== targetW || canvas.height !== targetH) {
        canvas.width = targetW;
        canvas.height = targetH;
      }
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    const drawWidth = (containerRef.current?.clientWidth ?? width);
    const drawHeight = (containerRef.current?.clientHeight ?? height);

    // Clear
    ctx.clearRect(0, 0, drawWidth, drawHeight);

    // Render into an offscreen canvas for subtle blur + controlled composite
    const off = document.createElement('canvas');
    off.width = Math.max(1, Math.floor(drawWidth));
    off.height = Math.max(1, Math.floor(drawHeight));
    const offCtx = off.getContext('2d');
    if (!offCtx) return;

    // Use additive blending for accumulation on offscreen
    const previousComposite = offCtx.globalCompositeOperation;
    offCtx.globalCompositeOperation = 'lighter';

    // Precompute normalization for alpha emphasis
    const emphasisScale = d3.scaleLinear()
      .domain([0, band])
      .range([0.18, maxOpacity])
      .clamp(true);

    for (const p of data) {
      const prob = typeof p.weight === 'number' ? p.weight : avg; // default to league avg if unknown
      // Map coordinates if needed
      let px = p.x;
      let py = p.y;
      if (coordinateSpace === 'court') {
        const dims = courtDimensions ?? DEFAULT_COURT_DIMENSIONS;
        const screen = courtToScreenCoordinates({ x: p.x, y: p.y } as CourtPosition, {
          ...dims,
          width: drawWidth,
          height: drawHeight
        });
        px = screen.x;
        py = screen.y;
      }
      const t = colorScale(prob);
      const color = d3.color(t)?.rgb();
      if (!color) continue;

      const delta = Math.abs(prob - avg);
      const alpha = emphasisScale(delta);
      const radiusFactor = 0.9 + 1.2 * (delta / band); // stronger deviation -> slightly larger footprint
      const r = Math.max(8, radius * radiusFactor);

      const grd = offCtx.createRadialGradient(px, py, 0, px, py, r);
      grd.addColorStop(0, `rgba(${color.r},${color.g},${color.b},${alpha})`);
      grd.addColorStop(1, `rgba(${color.r},${color.g},${color.b},0)`);
      offCtx.fillStyle = grd;
      offCtx.beginPath();
      offCtx.arc(px, py, r, 0, Math.PI * 2);
      offCtx.fill();
    }

    // restore offscreen composite
    offCtx.globalCompositeOperation = previousComposite;

    // Subtle blur to smooth transitions
    ctx.save();
    ctx.filter = 'blur(1.2px)';
    ctx.drawImage(off, 0, 0, drawWidth, drawHeight);
    ctx.restore();
  }, [autoResize, avg, band, colorScale, coordinateSpace, courtDimensions, data, height, maxOpacity, radius, width]);

  return (
    <div ref={containerRef} style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}>
      <canvas
        ref={canvasRef}
        className={`heatmap-canvas${className ? ` ${className}` : ''}`}
        width={width}
        height={height}
        style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none' }}
      />
    </div>
  );
};

export default Heatmap;


