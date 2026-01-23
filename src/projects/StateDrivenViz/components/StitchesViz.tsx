import { useEffect, useRef, type ChangeEvent } from 'react';
import { useStitchesVizStore } from '../stores/stitchesVizStore';
import type { Stitches } from '../types/stitchesVizTypes';

const STITCH_COLORS: Record<Stitches, string> = {
  Cross: '#823460',
  Back: '#c61c73',
  French: '#f184bc',
};

const StitchesViz = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const data = useStitchesVizStore((state) => state.data);
  const filters = useStitchesVizStore((state) => state.filters);
  const setAmountOfStitches = useStitchesVizStore(
    (state) => state.setAmountOfStitches
  );
  const toggleStitch = useStitchesVizStore((state) => state.toggleStitch);
  const regenerateData = useStitchesVizStore((state) => state.regenerateData);

  const handleChangeAmount = (e: ChangeEvent<HTMLInputElement>) => {
    const amount = Math.max(3, Math.min(60, Number(e.target.value)));
    setAmountOfStitches(amount);
    regenerateData(amount);
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Create the stitches visualization based on data and filters
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const filteredData = data.filter((d) => filters.stitches.has(d.stitch));

    filteredData.forEach((d) => {
      const x = (d.x / 100) * canvas.width;
      const y = (d.y / 100) * canvas.height;
      const size = 12;

      if (d.stitch === 'Cross') {
        ctx.strokeStyle = STITCH_COLORS.Cross;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(x - size / 2, y - size / 2);
        ctx.lineTo(x + size / 2, y + size / 2);
        ctx.moveTo(x + size / 2, y - size / 2);
        ctx.lineTo(x - size / 2, y + size / 2);
        ctx.stroke();
      } else if (d.stitch === 'Back') {
        ctx.strokeStyle = STITCH_COLORS.Back;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(x - size / 2, y);
        ctx.lineTo(x + size / 2, y);
        ctx.stroke();
      } else if (d.stitch === 'French') {
        ctx.fillStyle = STITCH_COLORS.French;
      }

      ctx.beginPath();
      ctx.arc(x, y, size / 10, 0, Math.PI * 2);
      ctx.fill();
    });
  }, [data, filters]);

  return (
    <div className="project-wrapper">
      <div className="project-controls">
        <div className="project-control-row">
          <span className="project-label">Stitch Types:</span>
          <div className="project-buttons-wrapper">
            {(['Cross', 'Back', 'French'] as Stitches[]).map((stitch) => (
              <button
                key={stitch}
                type="button"
                className={
                  filters.stitches.has(stitch)
                    ? 'project-checkbox-button active'
                    : 'project-checkbox-button'
                }
                style={{ borderColor: STITCH_COLORS[stitch] }}
                onClick={() => toggleStitch(stitch)}
              >
                <span
                  className="project-checkbox-dot"
                  style={{ backgroundColor: STITCH_COLORS[stitch] }}
                />
                {stitch}
              </button>
            ))}
          </div>
        </div>
        <div className="project-control-row">
          <span className="project-label">Number of Stitches:</span>
          <div className="project-range">
            <input
              type="range"
              min={3}
              max={60}
              value={filters.amountOfStitches}
              onChange={handleChangeAmount}
            />
            <span>{filters.amountOfStitches} </span>
          </div>
        </div>
        <div className="project-control-row">
          <button
            type="button"
            className="project-button"
            onClick={() => regenerateData(40)}
          >
            Regenerate Data
          </button>
        </div>
      </div>
      <canvas ref={canvasRef} className="project-canvas" />
    </div>
  );
};

export default StitchesViz;
