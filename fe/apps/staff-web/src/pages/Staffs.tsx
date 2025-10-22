import { useEffect, useState } from "react";
import { getStaffs, Account } from "@/api/accounts";
import { Separator } from "@/components/ui/separator";

export default function StaffsPage() {
  const [rows, setRows] = useState<Account[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        setRows(await getStaffs());
      } catch (e: any) {
        setErr(e?.response?.data?.message || e?.message || "Tải dữ liệu thất bại");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) return <div>Đang tải…</div>;
  if (err)     return <div className="text-red-600">{err}</div>;

  return (
    <div>
      <h2 className="text-xl font-bold text-emerald-800">Nhân viên</h2>
      <Separator className="my-3" />
      <div className="overflow-auto rounded-lg border bg-white">
        <table className="w-full text-sm">
          <thead className="bg-emerald-50 text-emerald-900">
            <tr>
              <th className="px-3 py-2 text-left">Họ tên</th>
              <th className="px-3 py-2 text-left">SĐT</th>
              <th className="px-3 py-2 text-left">Email</th>
              <th className="px-3 py-2 text-left">Trạng thái</th>
              <th className="px-3 py-2 text-left">Tạo lúc</th>
            </tr>
          </thead>
          <tbody>
            {rows.map(r => (
              <tr key={r.id} className="border-t hover:bg-emerald-50/40">
                <td className="px-3 py-2">{r.fullName || r.username}</td>
                <td className="px-3 py-2">{r.phone || "-"}</td>
                <td className="px-3 py-2">{r.email || "-"}</td>
                <td className="px-3 py-2">{r.status}</td>
                <td className="px-3 py-2">{r.createdAt?.slice(0, 19).replace("T", " ") || "-"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
