import { useEffect, useRef } from 'react';

interface WaterDropIntroProps {
  onComplete: () => void;
}

interface Drop {
  x: number;
  y: number;
  size: number;
  speed: number;
  opacity: number;
  delay: number;
}

export default function WaterDropIntro({ onComplete }: WaterDropIntroProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const startTimeRef = useRef<number>(0);
  const animRef = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const drops: Drop[] = Array.from({ length: 20 }, () => ({
      x: Math.random() * canvas.width,
      y: -Math.random() * canvas.height * 0.5,
      size: 8 + Math.random() * 18,
      speed: 2 + Math.random() * 4,
      opacity: 0.6 + Math.random() * 0.4,
      delay: Math.random() * 0.8,
    }));

    const duration = 2200;

    const drawDrop = (x: number, y: number, size: number, opacity: number) => {
      ctx.save();
      ctx.globalAlpha = opacity;
      ctx.beginPath();
      // Water drop shape
      ctx.moveTo(x, y - size);
      ctx.bezierCurveTo(x + size * 0.6, y - size * 0.3, x + size * 0.8, y + size * 0.4, x, y + size);
      ctx.bezierCurveTo(x - size * 0.8, y + size * 0.4, x - size * 0.6, y - size * 0.3, x, y - size);
      ctx.closePath();

      const grad = ctx.createRadialGradient(x - size * 0.2, y - size * 0.2, size * 0.1, x, y, size);
      grad.addColorStop(0, 'rgba(255,255,255,0.9)');
      grad.addColorStop(0.4, 'rgba(96,165,250,0.8)');
      grad.addColorStop(1, 'rgba(29,78,216,0.6)');
      ctx.fillStyle = grad;
      ctx.fill();

      // Highlight
      ctx.beginPath();
      ctx.ellipse(x - size * 0.25, y - size * 0.3, size * 0.15, size * 0.25, -0.5, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(255,255,255,0.6)';
      ctx.fill();
      ctx.restore();
    };

    const animate = (timestamp: number) => {
      if (!startTimeRef.current) startTimeRef.current = timestamp;
      const elapsed = timestamp - startTimeRef.current;
      const progress = Math.min(elapsed / duration, 1);

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Background gradient
      const bgGrad = ctx.createLinearGradient(0, 0, 0, canvas.height);
      bgGrad.addColorStop(0, `rgba(29,78,216,${0.9 * (1 - progress)})`);
      bgGrad.addColorStop(1, `rgba(219,234,254,${0.9 * (1 - progress)})`);
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      drops.forEach((drop) => {
        const dropProgress = Math.max(0, (progress - drop.delay) / (1 - drop.delay));
        if (dropProgress <= 0) return;
        const currentY = drop.y + dropProgress * (canvas.height * 1.3);
        const fadeOut = progress > 0.7 ? 1 - (progress - 0.7) / 0.3 : 1;
        drawDrop(drop.x, currentY, drop.size, drop.opacity * fadeOut);
      });

      if (progress < 1) {
        animRef.current = requestAnimationFrame(animate);
      } else {
        onComplete();
      }
    };

    animRef.current = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(animRef.current);
    };
  }, [onComplete]);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 z-50 w-full h-full"
      style={{ touchAction: 'none' }}
    />
  );
}
