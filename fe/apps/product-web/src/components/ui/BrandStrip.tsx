import { useCallback, useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";

export type BrandItem = {
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

    // cấu hình theo size
    const cfg =
        size === "md"
            ? {
                gap: "gap-15",
                itemMin: "min-w-[5.5rem]",
                circle: "h-[88px] w-[88px]",
                img: "h-14 w-14",
                label: "text-[18px]",
                rightPad: "pr-16",
            }
            : {
                // sm
                gap: "gap-12",
                itemMin: "min-w-[4.75rem]",
                circle: "h-[72px] w-[72px]",
                img: "h-10 w-10",
                label: "text-[15px]",
                rightPad: "pr-14",
            };

    const updateEdges = useCallback(() => {
        const el = scrollerRef.current;
        if (!el) return;
        const max = el.scrollWidth - el.clientWidth;
        setAtStart(el.scrollLeft <= 0);
        setAtEnd(el.scrollLeft >= max - 1);
    }, []);

    const scrollByStep = useCallback(
        (dir: "left" | "right") => {
            const el = scrollerRef.current;
            if (!el) return;
            const step = Math.max(220, Math.round(el.clientWidth * 0.7));
            el.scrollBy({ left: dir === "right" ? step : -step, behavior: "smooth" });
            setTimeout(updateEdges, 320);
        },
        [updateEdges]
    );

    useEffect(() => {
        updateEdges();
        const onResize = () => updateEdges();
        window.addEventListener("resize", onResize);
        return () => window.removeEventListener("resize", onResize);
    }, [updateEdges]);

    return (
        <section className={`space-y-2 ${className}`}>
            <div className="relative rounded-xl border bg-white shadow-sm pt-2.5 ">
                {/* Header + line */}
                <h3
                    className="text-sm md:text-base font-semibold md:pl-3"
                    style={{ color: "#0f766e" }}
                >
                    {title}
                </h3>
                <div className="mt-3 w-full border-t-2 border-grey-500/80" />

                {/* Strip + nút 2 bên */}
                <div className="relative mt-6">
                    <div
                        ref={scrollerRef}
                        className={`flex ${cfg.gap} overflow-hidden ${cfg.rightPad} pb-2`}
                    >
                        {items.map((b) => (
                            <Link
                                key={b.name}
                                to={b.to ?? "#"}
                                className={`${cfg.itemMin} flex flex-col items-center md:pl-9`}
                            >
                                <div
                                    className={`${cfg.circle} rounded-full bg-white p-2
                                        grid place-items-center shadow ring-1 ring-black/5 overflow-hidden`}
                                >
                                    <img
                                        src={b.src}
                                        alt={b.name}
                                        loading="lazy"
                                        className={`${cfg.img} object-contain`}
                                    />
                                </div>

                                <span className={`mt-2 md:mt-3 font-semibold text-neutral-900 ${cfg.label}`}>
                                    {b.name}
                                </span>
                            </Link>
                        ))}
                    </div>

                    {/* Prev */}
                    <button
                        type="button"
                        onClick={() => scrollByStep("left")}
                        disabled={atStart}
                        aria-label="Previous"
                        className="absolute left-3 top-1/2 -translate-y-1/2 h-10 w-10 rounded-full
                       bg-white ring-1 ring-black/10 shadow flex items-center justify-center
                       hover:bg-gray-50 disabled:opacity-40 disabled:pointer-events-none"
                    >
                        <ChevronLeft className="h-5 w-5" />
                    </button>

                    {/* Next */}
                    <button
                        type="button"
                        onClick={() => scrollByStep("right")}
                        disabled={atEnd}
                        aria-label="Next"
                        className="absolute right-3 top-1/2 -translate-y-1/2 h-10 w-10 rounded-full
                       bg-white ring-1 ring-black/10 shadow flex items-center justify-center
                       hover:bg-gray-50 disabled:opacity-40 disabled:pointer-events-none"
                    >
                        <ChevronRight className="h-5 w-5" />
                    </button>
                </div>
            </div>
        </section>
    );
}
