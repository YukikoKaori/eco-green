import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Filter, ChevronDown } from "lucide-react";
import { fetchProvinces, type Province } from "@/api/search";

export type SearchFilterState = {
  city: string;
  minPrice?: number;
  maxPrice?: number;
  yearFrom?: number;
  yearTo?: number;
};

function Chip({
  active,
  children,
  onClick,
  className = "",
}: {
  active?: boolean;
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        "inline-flex items-center gap-1.5 px-3 py-1.5 border transition-colors rounded-md",
        active
          ? "bg-emerald-100 border-emerald-300 text-emerald-800"
          : "bg-emerald-50 border-emerald-200 text-emerald-700 hover:bg-emerald-100",
        className,
      ].join(" ")}
    >
      {children}
      <ChevronDown className="w-4 h-4 text-emerald-600 opacity-90" />
    </button>
  );
}

export function SearchFilterBar({
  value,
  onChange,
}: {
  value: SearchFilterState;
  onChange: (v: SearchFilterState) => void;
}) {
  const [open, setOpen] = useState<null | "city" | "price" | "year">(null);
  const [provinces, setProvinces] = useState<Province[]>([]);

  useEffect(() => {
    fetchProvinces().then(setProvinces).catch(() => setProvinces([]));
  }, []);
  const displayCity = useMemo(() => value.city || "Toàn quốc", [value.city]);

  useEffect(() => {
    const sw = window.innerWidth - document.documentElement.clientWidth;
    if (open) {
      document.body.style.overflow = "hidden";
      document.body.style.paddingRight = `${sw}px`;
    } else {
      document.body.style.overflow = "";
      document.body.style.paddingRight = "";
    }
    return () => {
      document.body.style.overflow = "";
      document.body.style.paddingRight = "";
    };
  }, [open]);

  return (
    <>
      <div className="sticky z-40 top-[calc(var(--navbar-h,64px))] left-0 right-0">
        <div className="mx-auto bg-emerald-100">
          <div className="flex items-center gap-2 px-50 py-2">
            <span className="inline-flex items-center gap-1.5 text-slate-700 mr-1">
              <Filter className="w-4 h-4" />
              <span className="text-sm font-medium">Lọc</span>
            </span>

            <Chip active={!value.city} onClick={() => setOpen("city")}>
              {displayCity}
            </Chip>
            <Chip onClick={() => setOpen("price")}>Giá</Chip>
            <Chip onClick={() => setOpen("year")}>Năm sản xuất</Chip>
          </div>
        </div>
      </div>

      {/* City */}
      <Dialog open={open === "city"} onOpenChange={() => setOpen(null)}>
        <DialogContent className="sm:max-w-md p-0 overflow-hidden shadow-xl border">
          <DialogHeader className="px-4 py-3 border-b pr-20">
            <div className="flex items-center justify-between">
              <DialogTitle className="text-base text-emerald-800 font-semibold">
                Chọn tỉnh thành
              </DialogTitle>
              <Button
                variant="link"
                className="px-2 !bg-[#00BFAE] text-white"
                onClick={() => onChange({ ...value, city: "" })}
              >
                Bỏ lọc
              </Button>
            </div>
          </DialogHeader>
          <ScrollArea className="h-[320px] text-sm">
            <ul className="divide-y">
              {provinces.map((p) => (
                <li key={p.code}>
                  <button
                    className={
                      "w-full text-left px-6 py-3 hover:bg-emerald-50 transition " +
                      (value.city === p.name ? "text-emerald-700 font-medium" : "")
                    }
                    onClick={() => {
                      onChange({ ...value, city: p.name });
                      setOpen(null);
                    }}
                  >
                    {p.name}
                  </button>
                </li>
              ))}
            </ul>
          </ScrollArea>
        </DialogContent>
      </Dialog>

      {/* Price */}
      <Dialog open={open === "price"} onOpenChange={() => setOpen(null)}>
        <DialogContent className="sm:max-w-md p-0 overflow-hidden rounded-2xl shadow-xl border">
          <DialogHeader className="px-4 py-3 border-b pr-20">
            <div className="flex items-center justify-between">
              <DialogTitle className="text-base text-emerald-800 font-semibold">Giá</DialogTitle>
              <Button
                variant="link"
                className="px-2 !bg-[#00BFAE] text-white"
                onClick={() => onChange({ ...value, minPrice: undefined, maxPrice: undefined })}
              >
                Bỏ lọc
              </Button>
            </div>
          </DialogHeader>
          <div className="px-4 py-4">
            <div className="flex items-center gap-3">
              <VNDInput
                placeholder="Giá tối thiểu"
                value={value.minPrice}
                onChange={(v) => onChange({ ...value, minPrice: v })}
              />
              <span>-</span>
              <VNDInput
                placeholder="Giá tối đa"
                value={value.maxPrice}
                onChange={(v) => onChange({ ...value, maxPrice: v })}
              />
            </div>
            <div className="mt-4 flex justify-end">
              <Button className="!bg-[#00BFAE] hover:bg-emerald-700" onClick={() => setOpen(null)}>
                Áp dụng
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Year */}
      <Dialog open={open === "year"} onOpenChange={() => setOpen(null)}>
        <DialogContent className="sm:max-w-md p-0 overflow-hidden rounded-2xl shadow-xl border">
          <DialogHeader className="px-4 py-3 border-b pr-20">
            <div className="flex items-center justify-between">
              <DialogTitle className="text-base text-emerald-800 font-semibold">
                Năm sản xuất
              </DialogTitle>
              <Button
                variant="link"
                className="px-2 !bg-[#00BFAE] text-white"
                onClick={() => onChange({ ...value, yearFrom: undefined, yearTo: undefined })}
              >
                Bỏ lọc
              </Button>
            </div>
          </DialogHeader>
          <div className="px-4 py-4">
            <div className="flex items-center gap-3">
              <YearInput
                placeholder="Năm từ"
                value={value.yearFrom}
                onChange={(v) => onChange({ ...value, yearFrom: v })}
              />
              <span>-</span>
              <YearInput
                placeholder="Năm đến"
                value={value.yearTo}
                onChange={(v) => onChange({ ...value, yearTo: v })}
              />
            </div>
            <div className="mt-4 flex justify-end">
              <Button className="!bg-[#00BFAE] hover:bg-emerald-700" onClick={() => setOpen(null)}>
                Áp dụng
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

function VNDInput({
  placeholder,
  value,
  onChange,
}: {
  placeholder: string;
  value?: number;
  onChange: (v?: number) => void;
}) {
  const fmt = (n: number) => n.toLocaleString("vi-VN", { maximumFractionDigits: 0 });
  const [display, setDisplay] = useState(value != null ? fmt(value) : "");
  useEffect(() => {
    setDisplay(value != null ? fmt(value) : "");
  }, [value]);

  const handleChange = (s: string) => {
    const digits = s.replace(/[^\d]/g, "");
    if (!digits) {
      setDisplay("");
      onChange(undefined);
      return;
    }
    const n = Number(digits);
    setDisplay(fmt(n));
    onChange(Number.isFinite(n) ? n : undefined);
  };

  return (
    <div className="relative w-full">
      <Input
        placeholder={placeholder}
        inputMode="numeric"
        value={display}
        onChange={(e) => handleChange(e.target.value)}
      />
      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-slate-500">
        VND
      </span>
    </div>
  );
}

/* ======================== Year Input ======================== */
function YearInput({
  placeholder,
  value,
  onChange,
}: {
  placeholder: string;
  value?: number;
  onChange: (v?: number) => void;
}) {
  const [display, setDisplay] = useState(value != null ? String(value) : "");

  useEffect(() => {
    setDisplay(value != null ? String(value) : "");
  }, [value]);

  const handleChange = (s: string) => {
    // Chỉ giữ lại số, tối đa 4 ký tự (VD: 2024)
    const digits = s.replace(/[^\d]/g, "").slice(0, 4);
    if (!digits) {
      setDisplay("");
      onChange(undefined);
      return;
    }
    const n = Number(digits);
    setDisplay(digits);
    onChange(Number.isFinite(n) ? n : undefined);
  };

  return (
    <Input
      placeholder={placeholder}
      inputMode="numeric"
      value={display}
      onChange={(e) => handleChange(e.target.value)}
    />
  );
}
