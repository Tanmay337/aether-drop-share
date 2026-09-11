export function AmbientBackground() {
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      <div
        className="orb h-[46vw] w-[46vw] bg-violet-orb"
        style={{ top: "-8vh", left: "-6vw", animation: "drift-a 22s ease-in-out infinite" }}
      />
      <div
        className="orb h-[38vw] w-[38vw] bg-indigo-orb"
        style={{ top: "28vh", right: "-8vw", animation: "drift-b 26s ease-in-out infinite" }}
      />
      <div
        className="orb h-[30vw] w-[30vw] bg-cyan-orb"
        style={{ bottom: "-12vh", left: "26vw", animation: "drift-c 30s ease-in-out infinite" }}
      />
      <div
        className="absolute inset-0 opacity-[0.05]"
        style={{
          backgroundImage:
            "radial-gradient(circle at 1px 1px, currentColor 1px, transparent 0)",
          backgroundSize: "22px 22px",
        }}
      />
    </div>
  );
}
