import { useEffect, useMemo, useState } from "react";
import { fetchPublicBrands } from "@/api/brands"; 
import type { BrandItem } from "@/components/ui/BrandStrip";

export function useBrandItems(opts?: {
  type?: "VEHICLE" | "BATTERY" | "ALL";
  buildLink?: (b: { id: string; name: string; type: string }) => string;
}) {
  const { type = "VEHICLE", buildLink } = opts ?? {};
  const [rows, setRows] = useState<Array<{ id: string; name: string; logoUrl: string | null; type: string }>>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setLoading(true);
        const data = await fetchPublicBrands();
        if (mounted) setRows(data ?? []);
      } catch (e: any) {
        if (mounted) setError(e?.message ?? "Load brands failed");
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, []);

  const items: BrandItem[] = useMemo(() => {
    const filtered =
      type === "ALL" ? rows : rows.filter(r => String(r.type).toUpperCase() === type);

    const byName = new Map<string, { id: string; name: string; logoUrl: string | null; type: string }>();
    for (const r of filtered) {
      const key = r.name.trim().toLowerCase();
      const cur = byName.get(key);
      if (!cur) byName.set(key, r);
      else if (cur.type !== "VEHICLE" && r.type === "VEHICLE") byName.set(key, r);
    }
    const unique = Array.from(byName.values());

    return unique.map<BrandItem>(b => ({
      id: b.id,                                
      name: b.name,
      src: b.logoUrl || "/images/brand-placeholder.png",
      to: buildLink ? buildLink(b) : `/search?brand=${encodeURIComponent(b.name)}`,
    }));
  }, [rows, type, buildLink]);

  return { items, loading, error };
}
