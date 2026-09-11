import { motion } from "framer-motion";
import { Copy, Download, FileCode2, Smartphone, Sparkles } from "lucide-react";
import { QRCodeCanvas, QRCodeSVG } from "qrcode.react";
import { useRef } from "react";
import { toast } from "sonner";

import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { AETHER_ICON, QR_BYTE_LIMIT, byteLength, detectKind, formatBytes } from "@/lib/aether";

export type QrStyle = {
  rounding: number;
  palette: number;
  icon: boolean;
};

export const PALETTES = [
  { name: "Aether", fg: "#0d0b16", bg: "#ffffff" },
  { name: "Violet", fg: "#4c1d95", bg: "#f5f3ff" },
  { name: "Cyan", fg: "#0e4d59", bg: "#ecfeff" },
  { name: "Inverse", fg: "#ede9fe", bg: "#15121f" },
];

const KIND_LABEL: Record<string, string> = {
  text: "Plain text",
  url: "Web link",
  wifi: "Wi-Fi credentials",
  file: "File transfer link",
};

export function QrPanel({
  value,
  style,
  onStyle,
  onSimulate,
}: {
  value: string;
  style: QrStyle;
  onStyle: (s: QrStyle) => void;
  onSimulate: () => void;
}) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<HTMLDivElement>(null);
  const palette = PALETTES[style.palette] ?? PALETTES[0]!;
  const bytes = byteLength(value);
  const oversize = bytes > QR_BYTE_LIMIT;
  const ready = value.length > 0 && !oversize;

  const imageSettings = { src: AETHER_ICON, height: 42, width: 42, excavate: true };

  const downloadPng = () => {
    const canvas = wrapRef.current?.querySelector("canvas");
    if (!canvas) return;
    const a = document.createElement("a");
    a.href = canvas.toDataURL("image/png");
    a.download = "aetherdrop-qr.png";
    a.click();
    toast.success("PNG downloaded");
  };

  const downloadSvg = () => {
    const svg = svgRef.current?.querySelector("svg");
    if (!svg) return;
    const source = new XMLSerializer().serializeToString(svg);
    const url = URL.createObjectURL(new Blob([source], { type: "image/svg+xml" }));
    const a = document.createElement("a");
    a.href = url;
    a.download = "aetherdrop-qr.svg";
    a.click();
    URL.revokeObjectURL(url);
    toast.success("SVG downloaded");
  };

  const copyPayload = async () => {
    try {
      await navigator.clipboard.writeText(value);
      toast.success("Payload copied");
    } catch {
      toast.error("Couldn't reach the clipboard");
    }
  };

  return (
    <motion.aside
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
      className="glass space-y-6 rounded-[28px] p-5 sm:p-7"
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="font-display text-sm font-semibold tracking-tight">Live QR</p>
          <p className="text-xs text-muted-foreground">
            {ready ? KIND_LABEL[detectKind(value)] : "Waiting for a payload"}
          </p>
        </div>
        <span className="glass-soft rounded-full px-3 py-1.5 font-mono text-[11px] text-muted-foreground">
          {formatBytes(bytes)}
        </span>
      </div>

      {/* pedestal */}
      <div className="relative grid place-items-center pb-6">
        <div
          className="absolute bottom-1 h-10 w-3/4 rounded-full opacity-60 blur-2xl"
          style={{ background: "linear-gradient(90deg, var(--indigo-orb), var(--violet-orb))" }}
        />
        <motion.div
          ref={wrapRef}
          key={`${style.palette}-${style.icon}`}
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.35 }}
          className="glass relative grid aspect-square w-full max-w-[300px] place-items-center overflow-hidden p-5"
          style={{ borderRadius: `${12 + style.rounding * 0.34}px` }}
        >
          {ready ? (
            <div
              className="overflow-hidden"
              style={{ borderRadius: `${style.rounding * 0.28}px`, background: palette.bg }}
            >
              <QRCodeCanvas
                value={value}
                size={252}
                level="M"
                marginSize={2}
                fgColor={palette.fg}
                bgColor={palette.bg}
                {...(style.icon ? { imageSettings } : {})}
              />
            </div>
          ) : (
            <div className="space-y-2 px-6 text-center">
              <Sparkles className="mx-auto size-5 text-primary" />
              <p className="text-xs text-muted-foreground">
                {oversize
                  ? "Payload is too large to encode — trim it down."
                  : "Add text, a file, or Wi-Fi details to materialise the code."}
              </p>
            </div>
          )}
        </motion.div>
      </div>

      {/* hidden SVG twin for vector export */}
      <div ref={svgRef} className="hidden">
        {ready && (
          <QRCodeSVG
            value={value}
            size={512}
            level="M"
            marginSize={2}
            fgColor={palette.fg}
            bgColor={palette.bg}
            {...(style.icon ? { imageSettings } : {})}
          />
        )}
      </div>

      {/* customisation */}
      <div className="space-y-5">
        <div className="space-y-2.5">
          <div className="flex items-center justify-between text-[11px] uppercase tracking-[0.14em] text-muted-foreground">
            <span>Corner rounding</span>
            <span className="font-mono normal-case tracking-normal">{style.rounding}%</span>
          </div>
          <Slider
            value={[style.rounding]}
            max={100}
            step={1}
            onValueChange={([v]) => onStyle({ ...style, rounding: v ?? 0 })}
          />
        </div>

        <div className="space-y-2.5">
          <p className="text-[11px] uppercase tracking-[0.14em] text-muted-foreground">Palette</p>
          <div className="flex gap-2">
            {PALETTES.map((p, i) => (
              <button
                key={p.name}
                type="button"
                onClick={() => onStyle({ ...style, palette: i })}
                aria-label={p.name}
                className={`h-9 flex-1 rounded-xl border transition-all ${
                  style.palette === i
                    ? "border-primary ring-2 ring-ring"
                    : "border-border hover:border-primary/60"
                }`}
                style={{ background: `linear-gradient(135deg, ${p.bg} 50%, ${p.fg} 50%)` }}
              />
            ))}
          </div>
        </div>

        <div className="glass-soft flex items-center justify-between rounded-xl px-4 py-3">
          <div>
            <p className="text-sm font-medium">Embedded icon</p>
            <p className="text-xs text-muted-foreground">Drops the Aether mark in the centre.</p>
          </div>
          <Switch
            checked={style.icon}
            onCheckedChange={(v) => onStyle({ ...style, icon: v })}
          />
        </div>
      </div>

      {/* quick actions */}
      <div className="grid grid-cols-2 gap-2">
        <ActionButton onClick={downloadPng} disabled={!ready} icon={Download} label="PNG" />
        <ActionButton onClick={downloadSvg} disabled={!ready} icon={FileCode2} label="SVG" />
        <ActionButton onClick={copyPayload} disabled={!ready} icon={Copy} label="Copy payload" />
        <ActionButton onClick={onSimulate} disabled={!ready} icon={Smartphone} label="Simulate scan" />
      </div>
    </motion.aside>
  );
}

function ActionButton({
  onClick,
  disabled,
  icon: Icon,
  label,
}: {
  onClick: () => void;
  disabled: boolean;
  icon: typeof Copy;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="glass-soft flex items-center justify-center gap-2 rounded-xl px-3 py-2.5 text-xs font-medium transition-colors hover:bg-glass-strong disabled:cursor-not-allowed disabled:opacity-40"
    >
      <Icon className="size-3.5" />
      {label}
    </button>
  );
}
