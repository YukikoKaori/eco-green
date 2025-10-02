import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useMemo, useState } from "react";
import ListingCard from "@/listings/components/ListingCard";
import { cn } from "@/lib/utils";
import styles from "@/styles/ListingTabs.module.css";
export default function ListingTabs({ forYou, latest, className = "", pageSize = 8, }) {
    const [tab, setTab] = useState("foryou");
    const data = useMemo(() => (tab === "foryou" ? forYou : latest), [tab, forYou, latest]);
    return (_jsxs("section", { className: cn(styles.container, className), children: [_jsx("div", { className: styles.tabsBar, children: _jsxs("div", { className: styles.tabsWrapper, children: [_jsx(Tab, { active: tab === "foryou", onClick: () => setTab("foryou"), label: "D\u00E0nh cho b\u1EA1n" }), _jsx(Tab, { active: tab === "latest", onClick: () => setTab("latest"), label: "M\u1EDBi nh\u1EA5t" })] }) }), _jsxs("div", { className: styles.contentContainer, children: [_jsx("div", { className: styles.grid, children: data.slice(0, pageSize).map((item) => (_jsx("div", { className: styles.cardWrapper, children: _jsx("div", { className: styles.card, children: _jsx("div", { className: styles.cardReset, children: _jsx(ListingCard, { item: item }) }) }) }, item._key))) }), _jsx("div", { className: styles.ctaContainer, children: _jsx("button", { className: styles.ctaButton, children: "Xem th\u00EAm" }) })] })] }));
}
function Tab({ active, onClick, label, }) {
    return (_jsx("button", { type: "button", onClick: onClick, className: cn(styles.tabButton, active && styles.tabButtonActive), children: label }));
}
