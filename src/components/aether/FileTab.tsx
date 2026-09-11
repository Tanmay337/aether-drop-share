import { motion } from "framer-motion";
import { File as FileIcon, FileArchive, Image as ImageIcon, Trash2, UploadCloud } from "lucide-react";
import { useRef, useState } from "react";
import { toast } from "sonner";

import { formatBytes, storeFile, type VaultEntry } from "@/lib/aether";

const MAX_FILE = 25 * 1024 * 1024;

function iconFor(type: string, name: string) {
  if (name.endsWith(".zip") || type.includes("zip")) return FileArchive;
  if (type.startsWith("image/")) return ImageIcon;
  return FileIcon;
}

export function FileTab({
  entry,
  onEntry,
}: {
  entry: VaultEntry | null;
  onEntry: (e: VaultEntry | null) => void;
}) {
  const [over, setOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const accept = async (file?: File | null) => {
    if (!file) return;
    if (file.size > MAX_FILE) {
      toast.error("File is larger than 25 MB", { description: "Keep transfers small and scannable." });
      return;
    }
    const stored = await storeFile(file);
    onEntry(stored);
    toast.success("Stored locally", { description: `${file.name} is ready to share.` });
  };

  const Icon = entry ? iconFor(entry.type, entry.name) : UploadCloud;

  return (
    <div className="space-y-4">
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setOver(true);
        }}
        onDragLeave={() => setOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setOver(false);
          void accept(e.dataTransfer.files?.[0]);
        }}
        onClick={() => inputRef.current?.click()}
        className="glass-soft relative grid min-h-[196px] cursor-pointer place-items-center overflow-hidden rounded-2xl px-6 py-8 text-center"
      >
        <svg className="pointer-events-none absolute inset-0 size-full" aria-hidden>
          <rect
            x="1"
            y="1"
            width="calc(100% - 2px)"
            height="calc(100% - 2px)"
            rx="18"
            fill="none"
            stroke={over ? "var(--accent)" : "var(--glass-border)"}
            strokeWidth="1.5"
            strokeDasharray="14 10"
            style={{ animation: "dash-spin 12s linear infinite" }}
          />
        </svg>

        <motion.div animate={{ scale: over ? 1.04 : 1 }} className="relative space-y-2.5">
          <span className="mx-auto grid size-12 place-items-center rounded-2xl bg-primary/20 text-primary">
            <Icon className="size-5" />
          </span>
          <p className="font-display text-sm font-medium">
            {entry ? entry.name : "Drop a .zip, document or media file"}
          </p>
          <p className="text-xs text-muted-foreground">
            {entry
              ? `${formatBytes(entry.size)} · held in your browser vault`
              : "or click to browse · up to 25 MB · never leaves this device"}
          </p>
        </motion.div>

        <input
          ref={inputRef}
          type="file"
          className="hidden"
          onChange={(e) => void accept(e.target.files?.[0])}
        />
      </div>

      {entry && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-soft flex items-center gap-3 rounded-2xl px-4 py-3"
        >
          <div className="min-w-0 flex-1">
            <p className="text-[11px] uppercase tracking-[0.14em] text-muted-foreground">
              Shareable link encoded in QR
            </p>
            <p className="truncate font-mono text-xs text-accent">{entry.link}</p>
          </div>
          <button
            type="button"
            onClick={() => {
              onEntry(null);
              toast("Removed from vault");
            }}
            aria-label="Remove file"
            className="grid size-9 shrink-0 place-items-center rounded-full text-muted-foreground transition-colors hover:bg-glass-strong hover:text-destructive"
          >
            <Trash2 className="size-4" />
          </button>
        </motion.div>
      )}
    </div>
  );
}
