import { motion } from "framer-motion";
import { Download, ExternalLink, FileArchive, Type, Wifi } from "lucide-react";
import { toast } from "sonner";

import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { detectKind, downloadStoredFile, formatBytes, type VaultEntry } from "@/lib/aether";

function parseWifi(payload: string) {
  const body = payload.replace(/^WIFI:/, "").replace(/;;$/, "");
  const map: Record<string, string> = {};
  body.split(/(?<!\\);/).forEach((part) => {
    const [k, ...rest] = part.split(":");
    if (k) map[k] = rest.join(":").replace(/\\([\\;,:"])/g, "$1");
  });
  return map;
}

export function ScanPreviewModal({
  open,
  onOpenChange,
  payload,
  entry,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  payload: string;
  entry: VaultEntry | null;
}) {
  const kind = detectKind(payload);
  const wifi = kind === "wifi" ? parseWifi(payload) : null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="glass max-w-sm rounded-[28px] border-glass-border p-6">
        <DialogTitle className="font-display text-base">Recipient preview</DialogTitle>
        <DialogDescription className="text-xs text-muted-foreground">
          What a phone sees the moment it scans this code.
        </DialogDescription>

        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          className="mx-auto mt-4 w-[248px] rounded-[36px] border border-glass-border bg-background/70 p-2.5 shadow-2xl backdrop-blur-2xl"
        >
          <div className="relative overflow-hidden rounded-[28px] bg-glass-strong px-4 pb-5 pt-7">
            <span className="absolute left-1/2 top-2.5 h-1.5 w-14 -translate-x-1/2 rounded-full bg-foreground/25" />

            {kind === "wifi" && wifi && (
              <div className="space-y-3 text-center">
                <Wifi className="mx-auto size-6 text-accent" />
                <p className="text-sm font-medium">Join “{wifi["S"]}”?</p>
                <p className="font-mono text-[11px] text-muted-foreground">
                  {wifi["T"] === "nopass" ? "Open network" : `${wifi["T"]} · ${wifi["P"] ?? ""}`}
                </p>
                <button className="w-full rounded-xl bg-primary py-2 text-xs font-semibold text-primary-foreground">
                  Join network
                </button>
              </div>
            )}

            {kind === "file" && (
              <div className="space-y-3 text-center">
                <FileArchive className="mx-auto size-6 text-primary" />
                <p className="truncate text-sm font-medium">{entry?.name ?? "Shared file"}</p>
                <p className="text-[11px] text-muted-foreground">
                  {entry ? formatBytes(entry.size) : ""} · AetherDrop transfer
                </p>
                <button
                  onClick={async () => {
                    if (!entry) return;
                    const ok = await downloadStoredFile(entry);
                    toast[ok ? "success" : "error"](
                      ok ? "File retrieved from vault" : "File is no longer in the vault",
                    );
                  }}
                  className="flex w-full items-center justify-center gap-1.5 rounded-xl bg-primary py-2 text-xs font-semibold text-primary-foreground"
                >
                  <Download className="size-3.5" /> Download
                </button>
              </div>
            )}

            {kind === "url" && (
              <div className="space-y-3 text-center">
                <ExternalLink className="mx-auto size-6 text-accent" />
                <p className="break-all font-mono text-[11px] text-muted-foreground">{payload}</p>
                <a
                  href={payload}
                  target="_blank"
                  rel="noreferrer noopener"
                  className="block w-full rounded-xl bg-primary py-2 text-xs font-semibold text-primary-foreground"
                >
                  Open link
                </a>
              </div>
            )}

            {kind === "text" && (
              <div className="space-y-3">
                <Type className="mx-auto size-6 text-primary" />
                <p className="max-h-40 overflow-y-auto whitespace-pre-wrap break-words text-[12px] leading-relaxed text-foreground/90">
                  {payload}
                </p>
              </div>
            )}
          </div>
        </motion.div>
      </DialogContent>
    </Dialog>
  );
}
