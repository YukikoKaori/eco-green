import { useCallback, useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";

export type BrandItem = {
  id?: string;           
  name: string;
  src: string;
  to?: string;
};

type Props = {
  title?: string;
  items: BrandItem[];
  className?: string;
  size?: "sm" | "md";
};

export default function BrandStrip({
  title = "Tin bán xe và pin theo hãng",
  items,
  className = "",
  size = "sm",
}: Props) {
  const scrollerRef = useRef<HTMLDivElement | null>(null);
  const [atStart, setAtStart] = useState(true);
  const [atEnd, setAtEnd] = useState(false);
  const [showNav, setShowNav] = useState(false);

  const cfg =
    size === "md"
      ? { gap: "gap-10", itemMin: "min-w-[5.5rem]", circle: "h-[88px] w-[88px]", img: "h-14 w-14", label: "text-[18px]", rightPad: "pr-16", labelMax: "max-w-[6.5rem]" }
      : { gap: "gap-8",  itemMin: "min-w-[4.5rem]",  circle: "h-[72px] w-[72px]", img: "h-10 w-10", label: "text-[15px]", rightPad: "pr-14", labelMax: "max-w-[5.75rem]" };

  const updateEdges = useCallback(() => {
    const el = scrollerRef.current; if (!el) return;
    const max = el.scrollWidth - el.clientWidth;
    setAtStart(el.scrollLeft <= 0);
    setAtEnd(el.scrollLeft >= max - 1);
  }, []);

  const scrollByStep = useCallback((dir: "left" | "right") => {
    const el = scrollerRef.current; if (!el) return;
    const step = Math.max(260, Math.round(el.clientWidth * 0.7));
    el.scrollBy({ left: dir === "right" ? step : -step, behavior: "smooth" });
    setTimeout(updateEdges, 320);
  }, [updateEdges]);

  useEffect(() => {
    updateEdges();
    const el = scrollerRef.current;
    const onResize = () => updateEdges();
    const onScroll = () => updateEdges();
    const blockWheel = (e: WheelEvent) => { if (e.deltaX !== 0 || e.ctrlKey) e.preventDefault(); };
    const blockTouchMove = (e: TouchEvent) => { e.preventDefault(); };

    window.addEventListener("resize", onResize);
    el?.addEventListener("scroll", onScroll, { passive: true });
    el?.addEventListener("wheel", blockWheel, { passive: false });
    el?.addEventListener("touchmove", blockTouchMove, { passive: false });

    return () => {
      window.removeEventListener("resize", onResize);
      el?.removeEventListener("scroll", onScroll as any);
      el?.removeEventListener("wheel", blockWheel as any);
      el?.removeEventListener("touchmove", blockTouchMove as any);
    };
  }, [updateEdges]);

  const sizePx = 40;
  const arrowBtnBase: React.CSSProperties = {
    position: "absolute", top: "50%", width: `${sizePx}px`, height: `${sizePx}px`,
    borderRadius: "9999px", background: "#fff", border: "1px solid rgba(0,0,0,.08)",
    boxShadow: "0 6px 20px rgba(0,0,0,.12)", display: "flex", alignItems: "center",
    justifyContent: "center", cursor: "pointer", zIndex: 50, transition: "opacity .15s, box-shadow .12s, transform .12s"
  };
  const leftArrowStyle: React.CSSProperties  = { ...arrowBtnBase, left: 0,  transform: "translate(-50%, -50%)" };
  const rightArrowStyle: React.CSSProperties = { ...arrowBtnBase, right: 0, transform: "translate(50%, -50%)" };
  const vis = (disabled: boolean): React.CSSProperties => ({ opacity: showNav ? (disabled ? 0.35 : 1) : 0, pointerEvents: showNav && !disabled ? "auto" : "none" });

  return (
    <section className={`space-y-2 ${className}`}>
      <div className="relative rounded-xl border bg-white shadow-sm pt-1.5">
        <h3 className="text-sm md:text-base font-semibold md:pl-3" style={{ color: "#0f766e" }}>{title}</h3>
        <div className="mt-2 w-full border-t border-gray-200" />
        <div
          className="relative my-3"
          onMouseEnter={() => setShowNav(true)} onMouseLeave={() => setShowNav(false)}
          onFocus={() => setShowNav(true)} onBlur={() => setShowNav(false)}
        >
          {showNav && !atStart && <div className="pointer-events-none absolute left-0 top-0 h-full w-6 bg-gradient-to-r from-white to-transparent z-10" />}
          {showNav && !atEnd   && <div className="pointer-events-none absolute right-0 top-0 h-full w-12 bg-gradient-to-l from-white to-transparent z-10" />}

          <div
            ref={scrollerRef}
            className={`flex ${cfg.gap} overflow-x-auto no-scrollbar ${cfg.rightPad} pb-1 pl-4 pr-12 md:pl-6 md:pr-14 scroll-smooth`}
            style={{ touchAction: "pan-y" }}
          >
            {items.map((b, i) => (
              <Link
                key={b.id ?? `${b.name}-${i}`}  
                to={b.to ?? "#"}
                className={`${cfg.itemMin} flex flex-col items-center`}
              >
                <div className={`${cfg.circle} rounded-full bg-white p-2 grid place-items-center shadow ring-1 ring-black/5 overflow-hidden`}>
                  <img src={b.src} alt={b.name} loading="lazy" className={`${cfg.img} object-contain`} />
                </div>
                <span title={b.name} className={`mt-1 md:mt-2 font-semibold text-neutral-900 ${cfg.label} ${cfg.labelMax} whitespace-nowrap overflow-hidden text-ellipsis tracking-wide`}>
                  {b.name}
                </span>
              </Link>
            ))}
          </div>

          <button
            type="button" onClick={() => scrollByStep("left")} disabled={atStart} aria-label="Previous"
            style={{ ...leftArrowStyle, ...vis(atStart) }}
            onMouseEnter={(e) => (e.currentTarget.style.boxShadow = "0 10px 28px rgba(0,0,0,.16)")}
            onMouseLeave={(e) => (e.currentTarget.style.boxShadow = "0 6px 20px rgba(0,0,0,.12)")}
          >
            <ChevronLeft style={{ width: 20, height: 20, color: "#111" }} />
          </button>

          <button
            type="button" onClick={() => scrollByStep("right")} disabled={atEnd} aria-label="Next"
            style={{ ...rightArrowStyle, ...vis(atEnd) }}
            onMouseEnter={(e) => (e.currentTarget.style.boxShadow = "0 10px 28px rgba(0,0,0,.16)")}
            onMouseLeave={(e) => (e.currentTarget.style.boxShadow = "0 6px 20px rgba(0,0,0,.12)")}
          >
            <ChevronRight style={{ width: 20, height: 20, color: "#111" }} />
          </button>
        </div>
      </div>
    </section>
  );
}
