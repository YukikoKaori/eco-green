import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from "react";
import BannerCarousel from "@/components/ui/BannerCarousel";
import { mockListings } from "@/mocks/products";
import KeywordSection from "@/components/ui/KeywordSection";
import SeoAbout from "@/components/ui/SeoAbout";
import BrandStrip from "@/components/ui/BrandStrip";
import ListingTabs from "@/components/ui/ListingTabs";
export default function HomePage() {
    const [latest, setLatest] = useState([]);
    useEffect(() => {
        const data = mockListings
            .concat(mockListings)
            .slice(0, 12)
            .map((it, idx) => ({ ...it, _key: `${it.id}-${idx}` }));
        setLatest(data);
    }, []);
    const brands = [
        { name: "VinFast", src: "/images/vinfast.png", to: "/xe-dien?brand=VinFast" },
        { name: "BYD", src: "/images/byd.png", to: "/xe-dien?brand=BYD" },
        { name: "Wuling", src: "/images/wuling.png", to: "/xe-dien?brand=Wuling" },
        { name: "Hyundai", src: "/images/hyundai.png", to: "/xe-dien?brand=Hyundai" },
        { name: "BMW", src: "/images/bmw.png", to: "/xe-dien?brand=BMW" },
        { name: "Audi", src: "/images/audi.png", to: "/xe-dien?brand=Audi" },
        { name: "Porsche", src: "/images/porsche.png", to: "/xe-dien?brand=Porsche" },
        { name: "MG", src: "/images/mg.png", to: "/xe-dien?brand=MG" },
    ];
    return (_jsxs("div", { className: "relative w-full mb-10 mt-5", children: [_jsx("div", { "aria-hidden": true, className: "\r\n        fixed inset-0 z-0 bg-no-repeat bg-cover\r\n        bg-[position:center]\r\n        md:bg-[position:center]\r\n        lg:bg-[position:center]\r\n        xl:bg-[position:center_50px]\r\n        ", style: { backgroundImage: "url('/images/home-bg.png')" } }), _jsxs("div", { className: "relative z-10 mx-auto max-w-5xl p-4 md:p-0 space-y-4 ", children: [_jsx("section", { children: _jsx(BannerCarousel, { images: ["/images/banner-1.jpg", "/images/banner-2.jpg"], interval: 4000, heightClass: "h-30 md:h-46 lg:h-52" }) }), _jsx(BrandStrip, { items: brands }), _jsx("section", {}), _jsx(ListingTabs, { forYou: latest.slice(0, 12), latest: latest, pageSize: 8, className: "mt-1" }), _jsx("section", { children: _jsx(SeoAbout, {}) }), _jsx(KeywordSection, {})] })] }));
}
