/* eslint-disable no-unused-vars */
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type ChangeEvent,
  type MouseEvent,
} from 'react';
import { useParticleStore } from '../../../app/particleStore';
import './interactiveParticleBackground.css';

type Particle = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
};

const createParticles = (
  width: number,
  height: number,
  count: number
): Particle[] => {
  const particles: Particle[] = [];
  for (let i = 0; i < count; i += 1) {
    particles.push({
      x: Math.random() * width,
      y: Math.random() * height,
      vx: (Math.random() - 0.5) * 0.5,
      vy: (Math.random() - 0.5) * 0.5,
      radius: 1 + Math.random() * 2,
    });
  }
  return particles;
};

const InteractiveParticleBackground = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animationRef = useRef<number | null>(null);
  const particlesRef = useRef<Particle[]>([]);

  type ParticleStore = {
    enabled: boolean;
    particleCount: number;
    interactionEnabled: boolean;
    setEnabled: (enabled: boolean) => void;
    setParticleCount: (count: number) => void;
    setInteractionEnabled: (enabled: boolean) => void;
  };

  const enabled = useParticleStore((state: ParticleStore) => state.enabled);
  const particleCount = useParticleStore(
    (state: ParticleStore) => state.particleCount
  );
  const interactionEnabled = useParticleStore(
    (state: ParticleStore) => state.interactionEnabled
  );
  const setEnabled = useParticleStore(
    (state: ParticleStore) => state.setEnabled
  );
  const setParticleCount = useParticleStore(
    (state: ParticleStore) => state.setParticleCount
  );
  const setInteractionEnabled = useParticleStore(
    (state: ParticleStore) => state.setInteractionEnabled
  );

  const [canvasSize, setCanvasSize] = useState({ width: 0, height: 0 });
  const [mousePos, setMousePos] = useState<{ x: number; y: number } | null>(
    null
  );

  const handleResize = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    setCanvasSize({ width: rect.width, height: rect.height });
  }, []);

  const handleMouseMove = useCallback(
    (event: MouseEvent<HTMLCanvasElement>) => {
      if (!interactionEnabled) return;
      const rect = event.currentTarget.getBoundingClientRect();
      setMousePos({
        x: event.clientX - rect.left,
        y: event.clientY - rect.top,
      });
    },
    [interactionEnabled]
  );

  const handleMouseLeave = useCallback(() => {
    setMousePos(null);
  }, []);

  const handleToggleEnabled = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      setEnabled(event.target.checked);
    },
    [setEnabled]
  );

  const handleToggleInteraction = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      setInteractionEnabled(event.target.checked);
    },
    [setInteractionEnabled]
  );

  const handleParticleCountChange = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      const next = Number.parseInt(event.target.value, 10);
      if (Number.isNaN(next)) return;
      setParticleCount(next);
    },
    [setParticleCount]
  );

  useEffect(() => {
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [handleResize]);

  useEffect(() => {
    // Recalculate particles only when canvasSize or particleCount changes
    particlesRef.current = createParticles(
      canvasSize.width || 300,
      canvasSize.height || 150,
      particleCount
    );
  }, [canvasSize, particleCount]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let lastTime = performance.now();

    const render = (time: number) => {
      const delta = time - lastTime;
      lastTime = time;

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      if (enabled) {
        particlesRef.current.forEach((p) => {
          p.x += p.vx * (delta * 0.06);
          p.y += p.vy * (delta * 0.06);

          if (p.x < 0 || p.x > canvas.width) p.vx *= -1;
          if (p.y < 0 || p.y > canvas.height) p.vy *= -1;

          if (mousePos) {
            const dx = p.x - mousePos.x;
            const dy = p.y - mousePos.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist < 60) {
              p.x += dx * 0.02;
              p.y += dy * 0.02;
            }
          }

          ctx.beginPath();
          ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
          ctx.fillStyle = '#fff';
          ctx.fill();
        });
      }

      animationRef.current = requestAnimationFrame(render);
    };

    animationRef.current = requestAnimationFrame(render);

    return () => {
      if (animationRef.current !== null) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [enabled, mousePos]);

  return (
    <div className="interactive-particle-wrapper">
      <div className="control-panel">
        <label>
          <input
            className="toggle-checkbox"
            type="checkbox"
            checked={enabled}
            onChange={handleToggleEnabled}
          />
          Enabled
        </label>
        <label>
          <input
            className="toggle-checkbox"
            type="checkbox"
            checked={interactionEnabled}
            onChange={handleToggleInteraction}
          />
          Interaction
        </label>
        <label className="particle-intensity-control">
          <span>Intensity</span>
          <input
            type="range"
            min={20}
            max={400}
            value={particleCount}
            onChange={handleParticleCountChange}
          />
          <span className="particle-intensity-value">{particleCount}</span>
        </label>
      </div>
      <canvas
        ref={canvasRef}
        width={canvasSize.width}
        height={canvasSize.height}
        className="interactive-particle-canvas"
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
      />
    </div>
  );
};

export default InteractiveParticleBackground;
