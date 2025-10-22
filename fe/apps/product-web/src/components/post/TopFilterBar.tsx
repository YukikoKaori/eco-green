import { useId } from "react";
import { ChevronDown } from "lucide-react";

export type TopFilters = {
  area: "all" | string;
  condition: "" | "NEW" | "USED";
  brand: string;
  priceFrom?: number;
  priceTo?: number;
  yearFrom?: number;
  yearTo?: number;
};

export default function TopFilterBar({
  type,
  value,
  onChange,
  keyword,
  onKeywordChange,
}: {
  type: "VEHICLE" | "BATTERY";
  value: TopFilters;
  onChange: (v: TopFilters) => void;
  keyword: string;
  onKeywordChange: (v: string) => void;
}) {
  const id = useId();
  const brandsEV = [
    "VinFast","BYD","Wuling","BMW","Audi","Porsche","Hyundai","Kia","Honda","Tesla",
  ];
  const brandsPin = ["CATL","BYD","LG","Panasonic","Samsung","Tesla"];

  return (
    <div className="sticky top-16 z-10 bg-white border rounded-lg px-2 sm:px-3 py-2">
      <div className="flex flex-wrap items-center gap-2">
        <Pill active icon label="Toàn quốc" onClick={() => onChange({ ...value, area: "all" })} />
        {/* Tình trạng */}
        <Dropdown
          label="Tình trạng"
          options={[
            { label: "Tất cả", value: "" },
            { label: "Mới", value: "NEW" },
            { label: "Đã sử dụng", value: "USED" },
          ]}
          value={value.condition}
          onChange={(v) => onChange({ ...value, condition: v as any })}
        />
        {/* Hãng */}
        <Dropdown
          label="Hãng xe"
          options={[{ label: "Tất cả", value: "" }, ...((type === "VEHICLE" ? brandsEV : brandsPin).map(b => ({label: b, value: b})))]}
          value={value.brand}
          onChange={(v) => onChange({ ...value, brand: v })}
        />
        {/* Giá */}
        <Dropdown
          label="Giá"
          options={[
            { label: "Tất cả", value: "" },
            { label: "Dưới 200 triệu", value: "0-200" },
            { label: "200–300 triệu", value: "200-300" },
            { label: "300–400 triệu", value: "300-400" },
            { label: "400–500 triệu", value: "400-500" },
          ]}
          value={rangeToValue(value.priceFrom, value.priceTo)}
          onChange={(raw) => {
            const [pf, pt] = raw ? raw.split("-").map(Number) : [undefined, undefined];
            onChange({ ...value, priceFrom: pf ? pf * 1_000_000 : undefined, priceTo: pt ? pt * 1_000_000 : undefined });
          }}
        />
        {/* Năm sản xuất (xe) */}
        {type === "VEHICLE" && (
          <Dropdown
            label="Năm sản xuất"
            options={[
              { label: "Tất cả", value: "" },
              { label: "Trước 2018", value: "-2017" },
              { label: "2018–2020", value: "2018-2020" },
              { label: "2021–2023", value: "2021-2023" },
              { label: "2024–2025", value: "2024-2025" },
            ]}
            value={yearRangeToValue(value.yearFrom, value.yearTo)}
            onChange={(raw) => {
              if (!raw) return onChange({ ...value, yearFrom: undefined, yearTo: undefined });
              const [a, b] = raw.split("-").map((x) => (x ? Number(x) : undefined));
              onChange({ ...value, yearFrom: a, yearTo: b });
            }}
          />
        )}

        <div className="ml-auto flex items-center gap-2">
          <input
            id={id}
            placeholder="Tìm theo tiêu đề…"
            value={keyword}
            onChange={(e) => onKeywordChange(e.target.value)}
            className="h-9 px-3 text-sm border rounded-md"
          />
        </div>
      </div>
    </div>
  );
}

function Pill({ label, onClick, active=false, icon=false }: {label:string; onClick:()=>void; active?:boolean; icon?:boolean}) {
  return (
    <button
      className={`h-9 px-3 rounded-full border text-sm whitespace-nowrap ${active ? "bg-emerald-50 border-emerald-300 text-emerald-700" : "hover:bg-slate-50"}`}
      onClick={onClick}
    >
      {label}
    </button>
  );
}

function Dropdown({
  label,
  options,
  value,
  onChange,
}: {
  label: string;
  options: { label: string; value: string }[];
  value?: string;
  onChange: (v: string) => void;
}) {
  const currentLabel = options.find((o) => o.value === value)?.label || label;
  return (
    <div className="relative">
      <select
        className="h-9 pl-3 pr-6 text-sm border rounded-full appearance-none bg-white hover:bg-slate-50"
        value={value || ""}
        onChange={(e) => onChange(e.target.value)}
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>
      <ChevronDown className="w-4 h-4 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-slate-500" />
    </div>
  );
}

function rangeToValue(from?: number, to?: number) {
  if (!from && !to) return "";
  const f = Math.round((from || 0) / 1_000_000);
  const t = Math.round((to || 0) / 1_000_000);
  return `${f}-${t}`;
}
function yearRangeToValue(from?: number, to?: number) {
  if (!from && !to) return "";
  return `${from || ""}-${to || ""}`;
}
