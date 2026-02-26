import { useRef, useCallback, useState, useEffect } from 'react';
import { playScratchSound } from '../utils/audioGenerator';

interface UseScratchCanvasOptions {
  onReveal: () => void;
  revealThreshold?: number;
}

export function useScratchCanvas({ onReveal, revealThreshold = 0.6 }: UseScratchCanvasOptions) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const isDrawing = useRef(false);
  const hasRevealed = useRef(false);
  const hasScratchedOnce = useRef(false);
  const [scratchProgress, setScratchProgress] = useState(0);
  const animFrameRef = useRef<number>(0);

  const initCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const w = canvas.width;
    const h = canvas.height;

    // Draw silver/grey scratch overlay with texture
    const gradient = ctx.createLinearGradient(0, 0, w, h);
    gradient.addColorStop(0, '#b0bec5');
    gradient.addColorStop(0.3, '#cfd8dc');
    gradient.addColorStop(0.6, '#90a4ae');
    gradient.addColorStop(1, '#b0bec5');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, w, h);

    // Add texture dots
    for (let i = 0; i < 800; i++) {
      const x = Math.random() * w;
      const y = Math.random() * h;
      const r = Math.random() * 1.5;
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${Math.random() > 0.5 ? '255,255,255' : '0,0,0'},${Math.random() * 0.15})`;
      ctx.fill();
    }

    // Add "SCRATCH HERE" text
    ctx.font = 'bold 16px Inter, system-ui, sans-serif';
    ctx.fillStyle = 'rgba(255,255,255,0.7)';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('✦ SCRATCH HERE ✦', w / 2, h / 2);
  }, []);

  useEffect(() => {
    initCanvas();
  }, [initCanvas]);

  const getPos = (e: MouseEvent | TouchEvent, canvas: HTMLCanvasElement) => {
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    if ('touches' in e) {
      return {
        x: (e.touches[0].clientX - rect.left) * scaleX,
        y: (e.touches[0].clientY - rect.top) * scaleY,
      };
    }
    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY,
    };
  };

  const scratch = useCallback((x: number, y: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.globalCompositeOperation = 'destination-out';
    ctx.beginPath();
    ctx.arc(x, y, 28, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalCompositeOperation = 'source-over';
  }, []);

  const calculateProgress = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return 0;
    const ctx = canvas.getContext('2d');
    if (!ctx) return 0;

    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const pixels = imageData.data;
    let transparent = 0;
    const total = pixels.length / 4;
    for (let i = 3; i < pixels.length; i += 4) {
      if (pixels[i] < 128) transparent++;
    }
    return transparent / total;
  }, []);

  const handlePointerDown = useCallback((e: MouseEvent | TouchEvent) => {
    isDrawing.current = true;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const pos = getPos(e, canvas);
    scratch(pos.x, pos.y);
  }, [scratch]);

  const handlePointerMove = useCallback((e: MouseEvent | TouchEvent) => {
    if (!isDrawing.current) return;
    e.preventDefault();
    const canvas = canvasRef.current;
    if (!canvas) return;
    const pos = getPos(e, canvas);
    scratch(pos.x, pos.y);

    if (!hasScratchedOnce.current) {
      hasScratchedOnce.current = true;
      playScratchSound();
    }

    // Throttle progress calculation
    if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    animFrameRef.current = requestAnimationFrame(() => {
      const progress = calculateProgress();
      setScratchProgress(progress);
      if (progress >= revealThreshold && !hasRevealed.current) {
        hasRevealed.current = true;
        onReveal();
      }
    });
  }, [scratch, calculateProgress, onReveal, revealThreshold]);

  const handlePointerUp = useCallback(() => {
    isDrawing.current = false;
    // Play scratch sound on each lift
    if (hasScratchedOnce.current) {
      playScratchSound();
    }
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    canvas.addEventListener('mousedown', handlePointerDown);
    canvas.addEventListener('mousemove', handlePointerMove);
    canvas.addEventListener('mouseup', handlePointerUp);
    canvas.addEventListener('touchstart', handlePointerDown, { passive: false });
    canvas.addEventListener('touchmove', handlePointerMove, { passive: false });
    canvas.addEventListener('touchend', handlePointerUp);

    return () => {
      canvas.removeEventListener('mousedown', handlePointerDown);
      canvas.removeEventListener('mousemove', handlePointerMove);
      canvas.removeEventListener('mouseup', handlePointerUp);
      canvas.removeEventListener('touchstart', handlePointerDown);
      canvas.removeEventListener('touchmove', handlePointerMove);
      canvas.removeEventListener('touchend', handlePointerUp);
    };
  }, [handlePointerDown, handlePointerMove, handlePointerUp]);

  return { canvasRef, scratchProgress };
}
