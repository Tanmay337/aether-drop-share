import { motion } from "framer-motion";
import { Lock, Moon, Sun, Triangle } from "lucide-react";
import { useEffect, useState } from "react";

export function Header() {
  const [light, setLight] = useState(false);

  useEffect(() => {
    document.documentElement.classList.toggle("light", light);
  }, [light]);

  return (
    <motion.header
      initial={{ opacity: 0, y: -16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      className="mx-auto flex w-full max-w-7xl items-center justify-between gap-3 px-4 py-5 sm:px-6"
    >
      <div className="glass flex items-center gap-2.5 rounded-full py-2 pl-2.5 pr-4">
        <span className="grid size-8 place-items-center rounded-full bg-primary/25 text-primary">
          <Triangle className="size-4" strokeWidth={2.5} />
        </span>
        <span className="font-display text-[15px] font-semibold tracking-tight">AetherDrop</span>
      </div>

      <div className="flex items-center gap-2">
        <div className="glass-soft hidden items-center gap-2 rounded-full px-3.5 py-2 sm:flex">
          <span className="relative grid place-items-center">
            <span className="absolute size-2.5 animate-ping rounded-full bg-accent/60" />
            <span className="size-1.5 rounded-full bg-accent" />
          </span>
          <Lock className="size-3.5 text-muted-foreground" />
          <span className="text-xs font-medium text-muted-foreground">
            Encrypted locally · Ready
          </span>
        </div>

        <button
          type="button"
          onClick={() => setLight((v) => !v)}
          aria-label="Toggle theme"
          className="glass grid size-10 place-items-center rounded-full text-muted-foreground transition-colors hover:text-foreground"
        >
          {light ? <Sun className="size-4" /> : <Moon className="size-4" />}
        </button>
      </div>
    </motion.header>
  );
}
