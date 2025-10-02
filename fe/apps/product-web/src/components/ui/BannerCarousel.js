import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useMemo, useState } from "react";
export default function BannerCarousel({ images, interval = 5000, autoPlay = true, heightClass = "h-30 md:h40 lg:h-50", }) {
    const [index, setIndex] = useState(0);
    const total = images.length;
    const safeTotal = useMemo(() => Math.max(total, 1), [total]);
    useEffect(() => {
        if (!autoPlay || total <= 1)
            return;
        const id = setInterval(() => setIndex((i) => (i + 1) % safeTotal), interval);
        return () => clearInterval(id);
    }, [autoPlay, interval, safeTotal, total]);
    return (_jsxs("div", { className: `relative w-full overflow-hidden rounded-xl shadow-lg ring-4 ring-white`, children: [_jsx("div", { className: "flex transition-transform duration-500", style: { transform: `translateX(-${index * 100}%)` }, children: images.map((src, i) => (_jsx("div", { className: `min-w-full ${heightClass}`, children: _jsx("img", { src: src, alt: `banner-${i + 1}`, className: "w-full h-full object-cover", loading: i === 0 ? "eager" : "lazy" }) }, i))) }), total > 1 && (_jsx("div", { className: "absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2", children: images.map((_, i) => {
                    const active = i === index;
                    return (_jsx("button", { type: "button", onClick: () => setIndex(i), "aria-label": `Đi tới ảnh ${i + 1}`, className: `carousel-dot rounded-full transition-all ${active ? "w-3 h-3 bg-white shadow" : "w-2.5 h-2.5 bg-white/60 hover:bg-white/80"}` }, i));
                }) }))] }));
}
