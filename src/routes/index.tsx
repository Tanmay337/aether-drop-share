import { createFileRoute } from "@tanstack/react-router";
import { AnimatePresence, motion } from "framer-motion";
import { FileArchive, ScanLine, Type, Wifi } from "lucide-react";
import { useMemo, useState } from "react";

import { AmbientBackground } from "@/components/aether/AmbientBackground";
import { Header } from "@/components/aether/Header";
import { FileTab } from "@/components/aether/FileTab";
import { QrPanel, type QrStyle } from "@/components/aether/QrPanel";
import { ScanPreviewModal } from "@/components/aether/ScanPreviewModal";
import { ScanTab } from "@/components/aether/ScanTab";
import { TextTab } from "@/components/aether/TextTab";
import { WifiTab, type WifiState } from "@/components/aether/WifiTab";
import { buildWifiPayload, type VaultEntry } from "@/lib/aether";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "AetherDrop — Share files & data with dynamic QR codes" },
      {
        name: "description",
        content:
          "AetherDrop turns text, links, files and Wi-Fi credentials into live QR codes in your browser. Nothing leaves your device.",
      },
      { property: "og:title", content: "AetherDrop — Dynamic QR sharing" },
      {
        property: "og:description",
        content:
          "Generate live QR codes for text, links, ZIP transfers and Wi-Fi access, and scan codes with your camera.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

const TABS = [
  { id: "text", label: "Text & Links", icon: Type },
  { id: "file", label: "File & ZIP", icon: FileArchive },
  { id: "wifi", label: "Wi-Fi", icon: Wifi },
  { id: "scan", label: "Scanner", icon: ScanLine },
] as const;

type TabId = (typeof TABS)[number]["id"];

function Index() {
  const [tab, setTab] = useState<TabId>("text");
  const [text, setText] = useState("");
  const [entry, setEntry] = useState<VaultEntry | null>(null);
  const [wifi, setWifi] = useState<WifiState>({
    ssid: "",
    password: "",
    encryption: "WPA2",
    hidden: false,
  });
  const [style, setStyle] = useState<QrStyle>({ rounding: 34, palette: 0, icon: true });
  const [preview, setPreview] = useState(false);

  const payload = useMemo(() => {
    if (tab === "file") return entry?.link ?? "";
    if (tab === "wifi") return buildWifiPayload(wifi);
    return text;
  }, [tab, text, entry, wifi]);

  return (
    <div className="relative min-h-screen font-sans">
      <AmbientBackground />
      <Header />

      <main className="mx-auto w-full max-w-7xl px-4 pb-20 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          className="mx-auto max-w-2xl pb-10 pt-6 text-center sm:pt-12"
        >
          <h1 className="text-gradient font-display text-[clamp(2rem,5vw,3.25rem)] font-semibold leading-[1.05] tracking-tight">
            Hand anything over
            <br />
            with a single glance.
          </h1>
          <p className="mx-auto mt-4 max-w-md text-sm leading-relaxed text-muted-foreground">
            Text, links, archives and Wi-Fi keys become live QR codes — generated and stored entirely
            inside your browser.
          </p>
        </motion.div>

        <div className="grid items-start gap-5 lg:grid-cols-[minmax(0,1fr)_400px]">
          <motion.section
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
            className="glass space-y-6 rounded-[28px] p-5 sm:p-7"
          >
            <div className="glass-soft grid grid-cols-2 gap-1 rounded-2xl p-1 sm:grid-cols-4">
              {TABS.map(({ id, label, icon: Icon }) => (
                <button
                  key={id}
                  type="button"
                  onClick={() => setTab(id)}
                  className="relative flex items-center justify-center gap-1.5 rounded-xl px-2 py-2.5 text-xs font-medium transition-colors"
                >
                  {tab === id && (
                    <motion.span
                      layoutId="tab-pill"
                      transition={{ type: "spring", stiffness: 420, damping: 34 }}
                      className="absolute inset-0 rounded-xl bg-primary/25"
                    />
                  )}
                  <Icon
                    className={`relative size-3.5 ${tab === id ? "text-foreground" : "text-muted-foreground"}`}
                  />
                  <span className={`relative ${tab === id ? "" : "text-muted-foreground"}`}>
                    {label}
                  </span>
                </button>
              ))}
            </div>

            <AnimatePresence mode="wait">
              <motion.div
                key={tab}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.24 }}
              >
                {tab === "text" && <TextTab value={text} onChange={setText} />}
                {tab === "file" && <FileTab entry={entry} onEntry={setEntry} />}
                {tab === "wifi" && <WifiTab state={wifi} onChange={setWifi} />}
                {tab === "scan" && (
                  <ScanTab
                    onDecoded={(value) => {
                      setText(value);
                    }}
                  />
                )}
              </motion.div>
            </AnimatePresence>
          </motion.section>

          <QrPanel
            value={payload}
            style={style}
            onStyle={setStyle}
            onSimulate={() => setPreview(true)}
          />
        </div>
      </main>

      <ScanPreviewModal
        open={preview}
        onOpenChange={setPreview}
        payload={payload}
        entry={entry}
      />
    </div>
  );
}
