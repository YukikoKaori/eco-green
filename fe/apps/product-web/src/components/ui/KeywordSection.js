import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
export default function KeywordSection() {
    const keywords = [
        "Ô tô điện VinFast", "BYD Seal", "Wuling Mini EV", "Hyundai Ioniq 5",
        "Hongqi E-HS9", "VinFast VF5", "BYD Atto 3", "Wuling Bingo",
        "Ô tô điện BYD", "Mua bán ô tô điện cũ", "VinFast VF8", "VinFast VF9",
        "Mercedes-Benz EQS", "VinFast VF3", "BYD Dolphin", "BMW i7",
        "Haima 7X-E", "VinFast VF6", "Audi e-tron GT", "VinFast VF7",
        "VinFast Limo Green", "Porsche Taycan", "VinFast VFe34 cũ",
        "VinFast Nerio Green", "VinFast EC Van", "VinFast Minio Green",
        "BYD M6", "VinFast Herio Green"
    ];
    return (_jsxs("section", { className: "border rounded-xl shadow-sm bg-white p-4 md:p-6", children: [_jsx("h3", { className: "text-lg font-semibold text-teal-700 mb-3", children: "C\u00E1c t\u1EEB kh\u00F3a ph\u1ED5 bi\u1EBFn" }), _jsx("div", { className: "grid grid-cols-2 md:grid-cols-4 gap-2 text-sm text-muted-foreground", children: keywords.map((k, i) => (_jsx("span", { className: "hover:text-sky-600 cursor-pointer", children: k }, `kw-${i}`))) })] }));
}
