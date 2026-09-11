import { Eye, EyeOff, Wifi } from "lucide-react";
import { useState } from "react";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import type { WifiEncryption } from "@/lib/aether";

const OPTIONS: { value: WifiEncryption; label: string }[] = [
  { value: "WPA", label: "WPA" },
  { value: "WPA2", label: "WPA2" },
  { value: "WPA3", label: "WPA3" },
  { value: "nopass", label: "Open" },
];

export type WifiState = {
  ssid: string;
  password: string;
  encryption: WifiEncryption;
  hidden: boolean;
};

export function WifiTab({
  state,
  onChange,
}: {
  state: WifiState;
  onChange: (s: WifiState) => void;
}) {
  const [reveal, setReveal] = useState(false);
  const set = <K extends keyof WifiState>(key: K, value: WifiState[K]) =>
    onChange({ ...state, [key]: value });

  return (
    <div className="space-y-5">
      <div className="space-y-2">
        <Label className="text-[11px] uppercase tracking-[0.14em] text-muted-foreground">
          Network name (SSID)
        </Label>
        <div className="relative">
          <Wifi className="absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={state.ssid}
            onChange={(e) => set("ssid", e.target.value)}
            placeholder="Aether-Guest"
            className="glass-soft h-11 rounded-xl border-0 pl-10 shadow-none focus-visible:ring-1 focus-visible:ring-ring"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label className="text-[11px] uppercase tracking-[0.14em] text-muted-foreground">
          Password
        </Label>
        <div className="relative">
          <Input
            type={reveal ? "text" : "password"}
            value={state.password}
            disabled={state.encryption === "nopass"}
            onChange={(e) => set("password", e.target.value)}
            placeholder={state.encryption === "nopass" ? "Open network" : "••••••••••"}
            className="glass-soft h-11 rounded-xl border-0 pr-11 shadow-none focus-visible:ring-1 focus-visible:ring-ring"
          />
          <button
            type="button"
            onClick={() => setReveal((v) => !v)}
            aria-label="Toggle password visibility"
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground transition-colors hover:text-foreground"
          >
            {reveal ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
          </button>
        </div>
      </div>

      <div className="space-y-2">
        <Label className="text-[11px] uppercase tracking-[0.14em] text-muted-foreground">
          Encryption
        </Label>
        <div className="glass-soft grid grid-cols-4 gap-1 rounded-xl p-1">
          {OPTIONS.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => set("encryption", opt.value)}
              className={`rounded-lg py-2 text-xs font-medium transition-colors ${
                state.encryption === opt.value
                  ? "bg-primary/25 text-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      <div className="glass-soft flex items-center justify-between rounded-xl px-4 py-3">
        <div>
          <p className="text-sm font-medium">Hidden network</p>
          <p className="text-xs text-muted-foreground">Adds the H:true flag for cloaked SSIDs.</p>
        </div>
        <Switch checked={state.hidden} onCheckedChange={(v) => set("hidden", v)} />
      </div>
    </div>
  );
}
