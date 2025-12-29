/* eslint-disable no-unused-vars */
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type MouseEvent,
} from 'react';
import './interactiveParticleBackground.css';
import { useEmitterStore } from '../../../app/emitterStore';

type Particle = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
};

const Emitter = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animationRef = useRef<number | null>(null);
  const particlesRef = useRef<Particle[]>([]);

  type ParticleStore = {
    enabled: boolean;
    interactionEnabled: boolean;
    setEnabled: (enabled: boolean) => void;
    setInteractionEnabled: (enabled: boolean) => void;
  };

  const enabled = useEmitterStore((state) => state.enabled);

  const setEnabled = useEmitterStore(
    (state: ParticleStore) => state.setEnabled
  );

  const [canvasSize, setCanvasSize] = useState({ width: 0, height: 0 });

  const handleResize = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    setCanvasSize({ width: rect.width, height: rect.height });
  }, []);

  const handleMouseMove = useCallback(
    (event: MouseEvent<HTMLCanvasElement>) => {
      setEnabled(true);
      const rect = event.currentTarget.getBoundingClientRect();
      const mouseX = event.clientX - rect.left;
      const mouseY = event.clientY - rect.top;

      // Add new particles at the mouse position
      for (let i = 0; i < 5; i++) {
        particlesRef.current.push({
          x: mouseX,
          y: mouseY,
          vx: (Math.random() - 0.5) * 2,
          vy: Math.random() * 2 + 1,
          radius: 1 + Math.random() * 2,
        });
      }
    },
    [setEnabled]
  );

  useEffect(() => {
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [handleResize]);

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
        particlesRef.current.forEach((p, index) => {
          p.x += p.vx * (delta * 0.06);
          p.y += p.vy * (delta * 0.06);

          // Remove particles that are out of bounds
          if (p.y > canvas.height || p.x < 0 || p.x > canvas.width) {
            particlesRef.current.splice(index, 1);
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
  }, [enabled]);

  return (
    <div className="interactive-particle-wrapper">
      <canvas
        ref={canvasRef}
        width={canvasSize.width}
        height={canvasSize.height}
        className="interactive-particle-canvas"
        onMouseMove={handleMouseMove}
      />
    </div>
  );
};

export default Emitter;
