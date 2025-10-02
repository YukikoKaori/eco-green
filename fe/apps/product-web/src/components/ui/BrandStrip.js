import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useCallback, useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";
export default function BrandStrip({ title = "Tin bán xe và pin theo hãng", items, className = "", size = "sm", }) {
    const scrollerRef = useRef(null);
    const [atStart, setAtStart] = useState(true);
    const [atEnd, setAtEnd] = useState(false);
    // cấu hình theo size
    const cfg = size === "md"
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
        if (!el)
            return;
        const max = el.scrollWidth - el.clientWidth;
        setAtStart(el.scrollLeft <= 0);
        setAtEnd(el.scrollLeft >= max - 1);
    }, []);
    const scrollByStep = useCallback((dir) => {
        const el = scrollerRef.current;
        if (!el)
            return;
        const step = Math.max(220, Math.round(el.clientWidth * 0.7));
        el.scrollBy({ left: dir === "right" ? step : -step, behavior: "smooth" });
        setTimeout(updateEdges, 320);
    }, [updateEdges]);
    useEffect(() => {
        updateEdges();
        const onResize = () => updateEdges();
        window.addEventListener("resize", onResize);
        return () => window.removeEventListener("resize", onResize);
    }, [updateEdges]);
    return (_jsx("section", { className: `space-y-2 ${className}`, children: _jsxs("div", { className: "relative rounded-xl border bg-white shadow-sm pt-2.5 ", children: [_jsx("h3", { className: "text-sm md:text-base font-semibold md:pl-3", style: { color: "#0f766e" }, children: title }), _jsx("div", { className: "mt-3 w-full border-t-2 border-grey-500/80" }), _jsxs("div", { className: "relative mt-6", children: [_jsx("div", { ref: scrollerRef, className: `flex ${cfg.gap} overflow-hidden ${cfg.rightPad} pb-2`, children: items.map((b) => (_jsxs(Link, { to: b.to ?? "#", className: `${cfg.itemMin} flex flex-col items-center md:pl-9`, children: [_jsx("div", { className: `${cfg.circle} rounded-full bg-white p-2
                                        grid place-items-center shadow ring-1 ring-black/5 overflow-hidden`, children: _jsx("img", { src: b.src, alt: b.name, loading: "lazy", className: `${cfg.img} object-contain` }) }), _jsx("span", { className: `mt-2 md:mt-3 font-semibold text-neutral-900 ${cfg.label}`, children: b.name })] }, b.name))) }), _jsx("button", { type: "button", onClick: () => scrollByStep("left"), disabled: atStart, "aria-label": "Previous", className: "absolute left-3 top-1/2 -translate-y-1/2 h-10 w-10 rounded-full\r\n                       bg-white ring-1 ring-black/10 shadow flex items-center justify-center\r\n                       hover:bg-gray-50 disabled:opacity-40 disabled:pointer-events-none", children: _jsx(ChevronLeft, { className: "h-5 w-5" }) }), _jsx("button", { type: "button", onClick: () => scrollByStep("right"), disabled: atEnd, "aria-label": "Next", className: "absolute right-3 top-1/2 -translate-y-1/2 h-10 w-10 rounded-full\r\n                       bg-white ring-1 ring-black/10 shadow flex items-center justify-center\r\n                       hover:bg-gray-50 disabled:opacity-40 disabled:pointer-events-none", children: _jsx(ChevronRight, { className: "h-5 w-5" }) })] })] }) }));
}
