import { motion } from "framer-motion";
import { Camera, CameraOff, ImageDown, ScanLine } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";

type ScanResult = { text: string; source: "camera" | "image" };

async function decodeImageData(data: ImageData) {
  const mod = await import("jsqr");
  const jsQR = (mod as unknown as { default: typeof import("jsqr").default }).default ?? mod;
  return (jsQR as typeof import("jsqr").default)(data.data, data.width, data.height, {
    inversionAttempts: "attemptBoth",
  });
}

export function ScanTab({ onDecoded }: { onDecoded: (value: string) => void }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const rafRef = useRef<number | null>(null);
  const [live, setLive] = useState(false);
  const [result, setResult] = useState<ScanResult | null>(null);
  const [over, setOver] = useState(false);

  const stop = useCallback(() => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    rafRef.current = null;
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    setLive(false);
  }, []);

  useEffect(() => stop, [stop]);

  const tick = useCallback(async () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas || video.readyState < 2) {
      rafRef.current = requestAnimationFrame(() => void tick());
      return;
    }
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext("2d", { willReadFrequently: true });
    if (!ctx) return;
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const code = await decodeImageData(ctx.getImageData(0, 0, canvas.width, canvas.height));
    if (code?.data) {
      setResult({ text: code.data, source: "camera" });
      onDecoded(code.data);
      toast.success("QR decoded");
      stop();
      return;
    }
    rafRef.current = requestAnimationFrame(() => void tick());
  }, [onDecoded, stop]);

  const start = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" },
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
      setLive(true);
      setResult(null);
      void tick();
    } catch {
      toast.error("Camera unavailable", { description: "Grant camera access or drop an image instead." });
    }
  };

  const decodeFile = async (file?: File | null) => {
    if (!file) return;
    const bitmap = await createImageBitmap(file);
    const canvas = document.createElement("canvas");
    canvas.width = bitmap.width;
    canvas.height = bitmap.height;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.drawImage(bitmap, 0, 0);
    const code = await decodeImageData(ctx.getImageData(0, 0, canvas.width, canvas.height));
    if (code?.data) {
      setResult({ text: code.data, source: "image" });
      onDecoded(code.data);
      toast.success("QR decoded from image");
    } else {
      toast.error("No QR code found in that image");
    }
  };

  return (
    <div className="space-y-4">
      <div className="glass-soft relative aspect-[4/3] overflow-hidden rounded-2xl">
        <video ref={videoRef} muted playsInline className="size-full object-cover" />
        <canvas ref={canvasRef} className="hidden" />

        {!live && (
          <div className="absolute inset-0 grid place-items-center gap-3 p-6 text-center">
            <div className="space-y-3">
              <span className="mx-auto grid size-12 place-items-center rounded-2xl bg-primary/20 text-primary">
                <ScanLine className="size-5" />
              </span>
              <p className="font-display text-sm font-medium">Viewfinder idle</p>
              <p className="mx-auto max-w-xs text-xs text-muted-foreground">
                Point your camera at a QR code, or drop a screenshot below to decode it.
              </p>
            </div>
          </div>
        )}

        {live && (
          <>
            <div className="pointer-events-none absolute inset-8 rounded-2xl border border-accent/60" />
            <div
              className="pointer-events-none absolute left-8 right-8 h-0.5 bg-accent/80"
              style={{ animation: "scanline 2.4s ease-in-out infinite alternate" }}
            />
          </>
        )}
      </div>

      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={live ? stop : () => void start()}
          className="glass flex items-center gap-2 rounded-full px-4 py-2 text-xs font-medium"
        >
          {live ? <CameraOff className="size-3.5" /> : <Camera className="size-3.5" />}
          {live ? "Stop camera" : "Start camera"}
        </button>

        <label
          onDragOver={(e) => {
            e.preventDefault();
            setOver(true);
          }}
          onDragLeave={() => setOver(false)}
          onDrop={(e) => {
            e.preventDefault();
            setOver(false);
            void decodeFile(e.dataTransfer.files?.[0]);
          }}
          className={`glass-soft flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-full px-4 py-2 text-xs font-medium transition-colors ${
            over ? "text-accent" : "text-muted-foreground"
          }`}
        >
          <ImageDown className="size-3.5" /> Drop or choose a QR image
          <input
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => void decodeFile(e.target.files?.[0])}
          />
        </label>
      </div>

      {result && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-soft space-y-1.5 rounded-2xl px-4 py-3"
        >
          <p className="text-[11px] uppercase tracking-[0.14em] text-muted-foreground">
            Decoded via {result.source}
          </p>
          <p className="break-all font-mono text-xs text-accent">{result.text}</p>
        </motion.div>
      )}
    </div>
  );
}
