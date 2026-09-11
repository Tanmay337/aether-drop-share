export const QR_BYTE_LIMIT = 2200;

export function byteLength(value: string) {
  if (typeof TextEncoder === "undefined") return value.length;
  return new TextEncoder().encode(value).length;
}

export function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

export type WifiEncryption = "WPA" | "WPA2" | "WPA3" | "nopass";

function escapeWifi(value: string) {
  return value.replace(/([\\;,:"])/g, "\\$1");
}

export function buildWifiPayload(opts: {
  ssid: string;
  password: string;
  encryption: WifiEncryption;
  hidden: boolean;
}) {
  if (!opts.ssid.trim()) return "";
  const type = opts.encryption === "WPA3" ? "WPA" : opts.encryption;
  const parts = [`T:${type}`, `S:${escapeWifi(opts.ssid)}`];
  if (opts.encryption !== "nopass") parts.push(`P:${escapeWifi(opts.password)}`);
  if (opts.hidden) parts.push("H:true");
  return `WIFI:${parts.join(";")};;`;
}

export type PayloadKind = "text" | "url" | "wifi" | "file";

export function detectKind(value: string): PayloadKind {
  if (value.startsWith("WIFI:")) return "wifi";
  if (/^https?:\/\/\S+$/i.test(value.trim())) {
    return value.includes("/d/") ? "file" : "url";
  }
  return "text";
}

/* ---------- local file vault (IndexedDB, falls back to in-memory) ---------- */

export type VaultEntry = {
  id: string;
  name: string;
  size: number;
  type: string;
  link: string;
};

const memory = new Map<string, Blob>();
const DB_NAME = "aetherdrop";
const STORE = "files";

function openDb(): Promise<IDBDatabase | null> {
  return new Promise((resolve) => {
    if (typeof indexedDB === "undefined") return resolve(null);
    const req = indexedDB.open(DB_NAME, 1);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(STORE)) db.createObjectStore(STORE);
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => resolve(null);
  });
}

export function makeId() {
  const bytes = new Uint8Array(6);
  crypto.getRandomValues(bytes);
  return Array.from(bytes)
    .map((b) => b.toString(36).padStart(2, "0"))
    .join("")
    .slice(0, 10);
}

export function linkFor(id: string) {
  const origin = typeof window !== "undefined" ? window.location.origin : "https://aetherdrop.app";
  return `${origin}/d/${id}`;
}

export async function storeFile(file: File): Promise<VaultEntry> {
  const id = makeId();
  memory.set(id, file);
  const db = await openDb();
  if (db) {
    await new Promise<void>((resolve) => {
      const tx = db.transaction(STORE, "readwrite");
      tx.objectStore(STORE).put(file, id);
      tx.oncomplete = () => resolve();
      tx.onerror = () => resolve();
    });
    db.close();
  }
  return { id, name: file.name, size: file.size, type: file.type || "application/octet-stream", link: linkFor(id) };
}

export async function readFile(id: string): Promise<Blob | null> {
  if (memory.has(id)) return memory.get(id)!;
  const db = await openDb();
  if (!db) return null;
  const blob = await new Promise<Blob | null>((resolve) => {
    const tx = db.transaction(STORE, "readonly");
    const req = tx.objectStore(STORE).get(id);
    req.onsuccess = () => resolve((req.result as Blob) ?? null);
    req.onerror = () => resolve(null);
  });
  db.close();
  return blob;
}

export async function downloadStoredFile(entry: VaultEntry) {
  const blob = await readFile(entry.id);
  if (!blob) return false;
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = entry.name;
  a.click();
  URL.revokeObjectURL(url);
  return true;
}

/* ---------- embedded icon for QR center ---------- */

export const AETHER_ICON =
  "data:image/svg+xml;base64," +
  btoaSafe(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48"><rect width="48" height="48" rx="14" fill="#0d0b16"/><path d="M24 10l10 20-10-6-10 6 10-20z" fill="#a78bfa"/><circle cx="24" cy="35" r="3" fill="#67e8f9"/></svg>`,
  );

function btoaSafe(input: string) {
  if (typeof btoa !== "undefined") return btoa(input);
  return Buffer.from(input, "utf-8").toString("base64");
}
