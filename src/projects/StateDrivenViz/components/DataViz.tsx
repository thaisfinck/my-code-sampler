import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ChangeEvent,
} from 'react';
import { useStateDrivenVizStore } from '../stores/dataVizStore';
import type { Category, DataPoint } from '../types/dataVizTypes';

const CATEGORY_COLORS: Record<Category, string> = {
  A: '#823460',
  B: '#c61c73',
  C: '#f184bc',
};

const PADDING = 26;

const clamp = (v: number, min: number, max: number) =>
  Math.min(max, Math.max(min, v));

const getDomains = (points: DataPoint[]) => {
  if (!points.length) {
    return {
      xMin: 0,
      xMax: 100,
      yMin: 0,
      yMax: 100,
      valueMin: 0,
      valueMax: 1,
    };
  }

  let xMin = points[0]!.x;
  let xMax = points[0]!.x;
  let yMin = points[0]!.y;
  let yMax = points[0]!.y;
  let valueMin = points[0]!.value;
  let valueMax = points[0]!.value;

  for (let i = 1; i < points.length; i += 1) {
    const p = points[i]!;
    if (p.x < xMin) xMin = p.x;
    if (p.x > xMax) xMax = p.x;
    if (p.y < yMin) yMin = p.y;
    if (p.y > yMax) yMax = p.y;
    if (p.value < valueMin) valueMin = p.value;
    if (p.value > valueMax) valueMax = p.value;
  }

  return { xMin, xMax, yMin, yMax, valueMin, valueMax };
};

const DataViz = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [canvasSize, setCanvasSize] = useState({ width: 0, height: 0 });

  const data = useStateDrivenVizStore((state) => state.data);
  const filters = useStateDrivenVizStore((state) => state.filters);
  const viewMode = useStateDrivenVizStore((state) => state.viewMode);
  const density = useStateDrivenVizStore((state) => state.density);
  const setViewMode = useStateDrivenVizStore((state) => state.setViewMode);
  const setValueRange = useStateDrivenVizStore((state) => state.setValueRange);
  const toggleCategory = useStateDrivenVizStore(
    (state) => state.toggleCategory
  );
  const regenerateData = useStateDrivenVizStore(
    (state) => state.regenerateData
  );
  const setDensityCellSizePx = useStateDrivenVizStore(
    (state) => state.setDensityCellSizePx
  );

  // Layer 1 derived state: filtered data.
  const filteredData = useMemo(
    () =>
      data.filter((p) => {
        const inValueRange =
          p.value >= filters.valueRange[0] && p.value <= filters.valueRange[1];
        const inCategory = filters.categories.has(p.category);
        return inValueRange && inCategory;
      }),
    [data, filters]
  );

  // Layer 2 derived state: domains and radial scale.
  const domains = useMemo(() => getDomains(filteredData), [filteredData]);

  const handleResize = useCallback(() => {
    const el = containerRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const width = Math.max(260, rect.width);
    const height = 220;
    setCanvasSize({ width, height });
  }, []);

  useEffect(() => {
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [handleResize]);

  const handleMinChange = (event: ChangeEvent<HTMLInputElement>) => {
    const nextMin = Number.parseFloat(event.target.value);
    if (Number.isNaN(nextMin)) return;
    const [, currentMax] = filters.valueRange;
    const clampedMin = clamp(nextMin, 0, currentMax);
    setValueRange([clampedMin, currentMax]);
  };

  const handleMaxChange = (event: ChangeEvent<HTMLInputElement>) => {
    const nextMax = Number.parseFloat(event.target.value);
    if (Number.isNaN(nextMax)) return;
    const [currentMin] = filters.valueRange;
    const clampedMax = clamp(nextMax, currentMin, 100);
    setValueRange([currentMin, clampedMax]);
  };

  const handleCategoryToggle = (category: Category) => {
    toggleCategory(category);
  };

  const handleDensityCellSizeChange = (
    event: ChangeEvent<HTMLInputElement>
  ) => {
    const next = Number.parseInt(event.target.value, 10);
    if (Number.isNaN(next)) return;
    setDensityCellSizePx(clamp(next, 8, 50));
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const { width, height } = canvasSize;
    if (!width || !height) return;

    canvas.width = width;
    canvas.height = height;

    ctx.clearRect(0, 0, width, height);
    ctx.save();

    const innerWidth = width - PADDING * 3;
    const innerHeight = height - PADDING * 2;
    const { xMin, xMax, yMin, yMax, valueMin, valueMax } = domains;

    const xSpan = xMax - xMin || 1;
    const ySpan = yMax - yMin || 1;
    const valueSpan = valueMax - valueMin || 1;

    const projectX = (x: number) => PADDING + ((x - 1) / xSpan) * innerWidth;
    const projectY = (y: number) =>
      height - PADDING - ((y - yMin) / ySpan) * innerHeight;
    const projectRadius = (value: number) =>
      3 + ((value - valueMin) / valueSpan) * 8;

    // Axes
    ctx.strokeStyle = '#888';
    ctx.lineWidth = 0.5;
    ctx.beginPath();
    ctx.moveTo(PADDING, height - PADDING); // x-axis
    ctx.lineTo(width - PADDING, height - PADDING); // x-axis
    ctx.moveTo(PADDING, height - PADDING); // y-axis
    ctx.lineTo(PADDING, PADDING); // y-axis
    ctx.stroke();

    if (!filteredData.length) {
      ctx.fillStyle = '#888';
      ctx.font =
        '12px system-ui, -apple-system, BlinkMacSystemFont, sans-serif';
      ctx.fillText('No points in current filter', PADDING + 8, height / 2);
      ctx.restore();
      return;
    }

    if (viewMode === 'scatter') {
      filteredData.forEach((p) => {
        ctx.beginPath();
        ctx.fillStyle = CATEGORY_COLORS[p.category];
        ctx.globalAlpha = 0.9;
        ctx.arc(
          projectX(p.x),
          projectY(p.y),
          projectRadius(p.value),
          0,
          Math.PI * 2
        );
        ctx.fill();
      });
    } else {
      const cellSize = density.cellSizePx;
      const cols = Math.max(1, Math.floor(innerWidth / cellSize));
      const rows = Math.max(1, Math.floor(innerHeight / cellSize));

      const grid: number[][] = Array.from({ length: rows }, () =>
        Array.from({ length: cols }, () => 0)
      );

      filteredData.forEach((p) => {
        const sx = projectX(p.x) - PADDING;
        const sy = height - PADDING - (height - projectY(p.y) - PADDING);
        const col = clamp(Math.floor(sx / cellSize), 0, cols - 1);
        const row = clamp(Math.floor(sy / cellSize), 0, rows - 1);
        grid[row]![col] += 1;
      });

      let maxBin = 0;
      for (let r = 0; r < rows; r += 1) {
        for (let c = 0; c < cols; c += 1) {
          if (grid[r]![c] > maxBin) maxBin = grid[r]![c];
        }
      }
      const maxCount = maxBin || 1;

      for (let r = 0; r < rows; r += 1) {
        for (let c = 0; c < cols; c += 1) {
          const count = grid[r]![c];
          if (!count) continue;
          const intensity = count / maxCount;

          const x = PADDING + c * cellSize;
          const y = PADDING + r * cellSize;

          ctx.fillStyle = `rgba(198, 28, 115, ${intensity * 0.85})`;
          ctx.fillRect(x, y, cellSize, cellSize);
        }
      }
    }

    ctx.restore();
  }, [canvasSize, filteredData, domains, viewMode, density]);

  const minValue = filters.valueRange[0];
  const maxValue = filters.valueRange[1];

  return (
    <div className="project-wrapper">
      <div className="project-controls">
        <div className="project-control-row">
          <span className="project-label">View</span>
          <div className="project-toggle-wrapper">
            <button
              type="button"
              className={
                viewMode === 'scatter'
                  ? 'project-toggle-btn active'
                  : 'project-toggle-btn'
              }
              onClick={() => setViewMode('scatter')}
            >
              Scatter
            </button>
            <button
              type="button"
              className={
                viewMode === 'density'
                  ? 'project-toggle-btn active'
                  : 'project-toggle-btn'
              }
              onClick={() => setViewMode('density')}
            >
              Density
            </button>
          </div>
        </div>

        <div className="project-control-row">
          <span className="project-label">Value range</span>
          <div className="project-range">
            <input
              type="range"
              min={0}
              max={100}
              value={minValue}
              onChange={handleMinChange}
            />
            <input
              type="range"
              min={0}
              max={100}
              value={maxValue}
              onChange={handleMaxChange}
            />
            <span className="project-range-values">
              {Math.round(minValue)} – {Math.round(maxValue)}
            </span>
          </div>
        </div>

        <div className="project-control-row">
          <span className="project-label">Categories</span>
          <div className="project-buttons-wrapper">
            {(['A', 'B', 'C'] as Category[]).map((cat) => (
              <button
                key={cat}
                type="button"
                className={
                  filters.categories.has(cat)
                    ? 'project-checkbox-button active'
                    : 'project-checkbox-button'
                }
                style={{ borderColor: CATEGORY_COLORS[cat] }}
                onClick={() => handleCategoryToggle(cat)}
              >
                <span
                  className="project-checkbox-dot"
                  style={{ backgroundColor: CATEGORY_COLORS[cat] }}
                />
                {cat}
              </button>
            ))}
          </div>
        </div>

        <div className="project-control-row">
          <span className="project-label">Density grid</span>
          <div className="project-range">
            <input
              type="range"
              min={8}
              max={50}
              value={density.cellSizePx}
              onChange={handleDensityCellSizeChange}
            />
            <span className="project-range-values">
              cell ~{density.cellSizePx.toFixed(0)}px
            </span>
          </div>
        </div>

        <div className="project-control-row">
          <button
            type="button"
            className="project-button"
            onClick={() => regenerateData(650)}
          >
            Regenerate data
          </button>
        </div>
      </div>

      <div ref={containerRef}>
        <canvas
          ref={canvasRef}
          width={canvasSize.width}
          height={canvasSize.height}
          className="project-canvas"
        />
      </div>
    </div>
  );
};

export default DataViz;
