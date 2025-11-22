import { useEffect, useRef, useState } from "react";
import type { LucideIcon } from "lucide-react";

const BRAND = "#246f67";

function easeOutCubic(t: number) { return 1 - Math.pow(1 - t, 3); }

function AnimatedNumber({
  value, duration = 800, format,
}: { value: number; duration?: number; format?: (n: number) => string }) {
  const [display, setDisplay] = useState(0);
  const startRef = useRef<number | null>(null);
  const fromRef = useRef(0);

  useEffect(() => {
    fromRef.current = display;
    startRef.current = null;
    let raf = 0;

    const step = (ts: number) => {
      if (startRef.current == null) startRef.current = ts;
      const p = Math.min(1, (ts - startRef.current) / duration);
      const eased = easeOutCubic(p);
      const v = Math.round(fromRef.current + (value - fromRef.current) * eased);
      setDisplay(v);
      if (p < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [value, duration]); 

  return <span>{format ? format(display) : display.toLocaleString("vi-VN")}</span>;
}

export default function StatsCard({
  title, value, delta, icon: Icon, format,
}:{
  title: string;
  value: number | string;
  delta?: string;
  icon: LucideIcon;
  format?: (n: number) => string;
}) {
  const isNumber = typeof value === "number" && Number.isFinite(value as number);

  return (
    <div className="border rounded-2xl bg-white p-4">
      <div className="flex items-start justify-between">
        <div>
          {/* Tiêu đề xanh đậm và to hơn */}
          <p className="text-sm md:text-[15px] font-semibold" style={{ color: BRAND }}>
            {title}
          </p>

          {/* Giá trị xanh đậm */}
          <h3 className="text-xl md:text-2xl font-bold mt-1" style={{ color: BRAND }}>
            {isNumber ? <AnimatedNumber value={value as number} format={format} /> : value}
          </h3>

          {delta && (
            <p className="text-xs mt-1 text-emerald-700">
              {delta}
            </p>
          )}
        </div>

        {/* Icon nền xanh nhạt */}
        <div className="p-2 rounded-xl" style={{ backgroundColor: "#e9f5f2" }}>
          <Icon className="h-5 w-5" style={{ color: BRAND }} />
        </div>
      </div>
    </div>
  );
}
