import { ClipboardPaste, Eraser, Link2 } from "lucide-react";
import { toast } from "sonner";

import { Textarea } from "@/components/ui/textarea";
import { QR_BYTE_LIMIT, byteLength, formatBytes } from "@/lib/aether";

const CHAR_LIMIT = 1800;

export function TextTab({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const bytes = byteLength(value);
  const pct = Math.min(100, (bytes / QR_BYTE_LIMIT) * 100);

  const paste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (!text) {
        toast.error("Clipboard is empty");
        return;
      }
      onChange(text.slice(0, CHAR_LIMIT));
      toast.success("Pasted from clipboard");
    } catch {
      toast.error("Clipboard access was blocked");
    }
  };

  return (
    <div className="space-y-4">
      <div className="glass-soft rounded-2xl p-1.5">
        <Textarea
          value={value}
          onChange={(e) => onChange(e.target.value.slice(0, CHAR_LIMIT))}
          placeholder="Paste a link, a note, a wallet address — anything you want to hand over."
          className="min-h-[168px] resize-none border-0 bg-transparent text-[15px] leading-relaxed shadow-none focus-visible:ring-0"
        />
        <div className="flex flex-wrap items-center gap-2 border-t border-border/70 px-2 py-2">
          <button
            type="button"
            onClick={paste}
            className="glass-soft flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition-colors hover:bg-glass-strong"
          >
            <ClipboardPaste className="size-3.5" /> Paste
          </button>
          <button
            type="button"
            onClick={() => onChange("")}
            className="glass-soft flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            <Eraser className="size-3.5" /> Clear
          </button>
          <button
            type="button"
            onClick={() => onChange("https://")}
            className="glass-soft flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            <Link2 className="size-3.5" /> URL
          </button>
          <span className="ml-auto font-mono text-[11px] text-muted-foreground">
            {value.length}/{CHAR_LIMIT}
          </span>
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between text-[11px] text-muted-foreground">
          <span className="uppercase tracking-[0.14em]">Payload size</span>
          <span className="font-mono">
            {formatBytes(bytes)} / {formatBytes(QR_BYTE_LIMIT)}
          </span>
        </div>
        <div className="h-1.5 overflow-hidden rounded-full bg-muted">
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{
              width: `${pct}%`,
              background:
                pct > 88
                  ? "var(--destructive)"
                  : "linear-gradient(90deg, var(--indigo-orb), var(--violet-orb), var(--cyan-orb))",
            }}
          />
        </div>
      </div>
    </div>
  );
}
