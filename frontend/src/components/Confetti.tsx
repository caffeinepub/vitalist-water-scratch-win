import { useEffect, useRef } from 'react';
import { playWinningChime } from '../utils/audioGenerator';

interface ConfettiProps {
  triggered: boolean;
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  color: string;
  size: number;
  rotation: number;
  rotationSpeed: number;
  shape: 'rect' | 'circle';
  opacity: number;
}

const COLORS = [
  '#1d4ed8', '#2563eb', '#3b82f6', '#60a5fa',
  '#ffffff', '#f0f9ff',
  '#f59e0b', '#fbbf24', '#fcd34d', '#fde68a',
];

export default function Confetti({ triggered }: ConfettiProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef<number>(0);
  const hasPlayedRef = useRef(false);

  useEffect(() => {
    if (!triggered) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    if (!hasPlayedRef.current) {
      hasPlayedRef.current = true;
      playWinningChime();
    }

    const particles: Particle[] = Array.from({ length: 120 }, () => ({
      x: canvas.width / 2 + (Math.random() - 0.5) * canvas.width * 0.4,
      y: canvas.height * 0.3 + Math.random() * canvas.height * 0.2,
      vx: (Math.random() - 0.5) * 8,
      vy: -6 - Math.random() * 8,
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
      size: 6 + Math.random() * 8,
      rotation: Math.random() * Math.PI * 2,
      rotationSpeed: (Math.random() - 0.5) * 0.2,
      shape: Math.random() > 0.5 ? 'rect' : 'circle',
      opacity: 1,
    }));

    const startTime = performance.now();
    const duration = 3500;

    const animate = (timestamp: number) => {
      const elapsed = timestamp - startTime;
      const progress = elapsed / duration;

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      particles.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.25; // gravity
        p.vx *= 0.99;
        p.rotation += p.rotationSpeed;
        p.opacity = Math.max(0, 1 - progress * 1.2);

        ctx.save();
        ctx.globalAlpha = p.opacity;
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rotation);
        ctx.fillStyle = p.color;

        if (p.shape === 'rect') {
          ctx.fillRect(-p.size / 2, -p.size / 4, p.size, p.size / 2);
        } else {
          ctx.beginPath();
          ctx.arc(0, 0, p.size / 2, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.restore();
      });

      if (elapsed < duration) {
        animRef.current = requestAnimationFrame(animate);
      } else {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
      }
    };

    animRef.current = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(animRef.current);
    };
  }, [triggered]);

  if (!triggered) return null;

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 z-40 pointer-events-none w-full h-full"
    />
  );
}
