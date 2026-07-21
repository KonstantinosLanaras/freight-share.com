import { useRef, useState, useImperativeHandle, forwardRef } from 'react';
import { Button } from '@/components/ui/button';
import { Eraser } from 'lucide-react';

export interface SignaturePadHandle {
  /** Returns a PNG data URL, or null if nothing has been drawn. */
  toDataURL: () => string | null;
  clear: () => void;
}

interface SignaturePadProps {
  className?: string;
}

function getPoint(canvas: HTMLCanvasElement, e: React.PointerEvent) {
  const rect = canvas.getBoundingClientRect();
  return { x: e.clientX - rect.left, y: e.clientY - rect.top };
}

export const SignaturePad = forwardRef<SignaturePadHandle, SignaturePadProps>(function SignaturePad(
  { className },
  ref
) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const drawingRef = useRef(false);
  const [hasDrawn, setHasDrawn] = useState(false);

  useImperativeHandle(ref, () => ({
    toDataURL: () => (hasDrawn ? canvasRef.current?.toDataURL('image/png') ?? null : null),
    clear: () => {
      const canvas = canvasRef.current;
      const ctx = canvas?.getContext('2d');
      if (canvas && ctx) ctx.clearRect(0, 0, canvas.width, canvas.height);
      setHasDrawn(false);
    },
  }));

  const startDraw = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;
    drawingRef.current = true;
    const { x, y } = getPoint(canvas, e);
    ctx.beginPath();
    ctx.moveTo(x, y);
    canvas.setPointerCapture(e.pointerId);
  };

  const draw = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!drawingRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;
    const { x, y } = getPoint(canvas, e);
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
    ctx.strokeStyle = '#1a1a1a';
    ctx.lineTo(x, y);
    ctx.stroke();
    if (!hasDrawn) setHasDrawn(true);
  };

  const endDraw = () => {
    drawingRef.current = false;
  };

  const handleClear = () => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (canvas && ctx) ctx.clearRect(0, 0, canvas.width, canvas.height);
    setHasDrawn(false);
  };

  return (
    <div className={className}>
      <div className="relative rounded-md border border-input bg-background">
        <canvas
          ref={canvasRef}
          width={400}
          height={140}
          className="w-full touch-none rounded-md"
          onPointerDown={startDraw}
          onPointerMove={draw}
          onPointerUp={endDraw}
          onPointerLeave={endDraw}
        />
        {!hasDrawn && (
          <span className="pointer-events-none absolute inset-0 flex items-center justify-center text-sm text-muted-foreground">
            Sign here
          </span>
        )}
      </div>
      <Button type="button" variant="ghost" size="sm" className="mt-1" onClick={handleClear} disabled={!hasDrawn}>
        <Eraser className="h-3.5 w-3.5 mr-1" />
        Clear
      </Button>
    </div>
  );
});
