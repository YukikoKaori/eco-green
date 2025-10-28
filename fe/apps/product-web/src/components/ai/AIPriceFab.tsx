import { memo } from "react";

export default memo(function AIPriceFab({ onClick }: { onClick: () => void }) {
  return (
    <button
      id="eco-ai-fab"
      type="button"
      onClick={onClick}
      aria-label="EcoAI gợi ý giá phù hợp"
      className="fixed right-4 bottom-6 z-[60] p-0 bg-transparent outline-none border-0 group
                 focus:outline-none focus:ring-0 focus-visible:outline-none focus-visible:ring-0"
      style={{ background: "transparent", border: 0, boxShadow: "none" }}
    >
      <div className="relative w-[150px] h-[150px] select-none">
        <span
          aria-hidden
          className="pointer-events-none absolute inset-0 rounded-full blur-xl opacity-10 animate-pulse"
          style={{
            background:
              "radial-gradient(60% 60% at 50% 50%, rgba(16,185,129,0.45) 0%, rgba(16,185,129,0.15) 20%, rgba(16,185,129,0) 60%)",
          }}
        />
        <span
          aria-hidden
          className="pointer-events-none absolute inset-[-8px]"
          style={{
            background:
              "radial-gradient(50% 50% at 50% 50%, rgba(56,189,248,0) 65%, rgba(45,212,191,0.35) 80%, rgba(34,197,94,0) 100%)",
            filter: "blur(40px)",
          }}
        />
        <img
          src="/images/eco-bot.png"
          alt="EcoGreen AI"
          draggable="false"
          className="absolute inset-0 m-auto w-[140px] h-[140px] object-contain transition-transform duration-200 group-hover:scale-110"
          style={{
            background: "transparent",
            border: 0,
            boxShadow: "none",
            filter: "drop-shadow(0 0 5px rgba(43, 184, 137, 0.84)) drop-shadow(0 0 16px rgba(43, 219, 199, 0.35))",
          }}
        />
        <span
          aria-hidden
          className="pointer-events-none absolute top-1/2 -translate-y-1/2 -left-1/3 w-1/3 h-[120%] skew-x-12 opacity-0 group-hover:opacity-80 transition-opacity duration-200"
          style={{
            background:
              "linear-gradient(90deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0.45) 50%, rgba(255,255,255,0) 100%)",
            filter: "blur(2px)",
            transform: "translate(-50%, -50%) skewX(12deg)",
            animation: "ecoShimmer 1.2s ease-out forwards",
          }}
        />
      </div>
      <div
        className="mx-auto mt-1 w-max rounded-full px-3 py-1 text-xs font-medium text-white shadow-lg select-none"
        style={{
          background:
            "linear-gradient(90deg, #0ea5e9, #22c55e, #14b8a6, #0ea5e9)",
          backgroundSize: "300% 100%",
          animation: "ecoGradientFlow 3s linear infinite",
        }}
      >
        Gợi ý giá EcoAI
      </div>
      <style>{`
        @keyframes ecoShimmer {
          0%   { left: -35%; opacity: 0; }
          10%  { opacity: 0.85; }
          100% { left: 135%; opacity: 0; }
        }
        @keyframes ecoGradientFlow {
          0%   { background-position: 0% 50%; }
          100% { background-position: 300% 50%; }
        }
      `}</style>
    </button>
  );
});
