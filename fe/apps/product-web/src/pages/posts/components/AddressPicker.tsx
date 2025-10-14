import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { useVNAddress } from "@/hooks/useVNAddress";
import clsx from "clsx";

type Props = {
  addr: ReturnType<typeof useVNAddress>;
  addressDetail: string;
  onAddressDetailChange: (v: string) => void;
};

const LabelReq = ({ children }: { children: React.ReactNode }) => (
  <Label className="text-[13px] text-gray-700">
    {children}
    <span className="ml-1 text-red-500">*</span>
  </Label>
);

export default function AddressPicker({ addr, addressDetail, onAddressDetailChange }: Props) {
  const {
    provinces, districts, wards,
    loadingProv, loadingDist, loadingWard,
    provinceCode, setProvinceCode,
    districtCode, setDistrictCode,
    wardCode, setWardCode,
  } = addr;

  const trigBase =
    "h-10 w-full rounded-md border bg-white px-3 !text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-teal-500/50";

  return (
    <section className="mt-6 rounded-xl border bg-white p-4">
      <h3 className="mb-3 text-base font-semibold text-gray-800">Địa chỉ</h3>

      <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-4">
        {/* Province */}
        <div className="flex flex-col gap-1">
          <LabelReq>Tỉnh/Thành</LabelReq>
          <Select value={provinceCode} onValueChange={setProvinceCode}>
            <SelectTrigger className={trigBase}>
              <SelectValue placeholder={loadingProv ? "Đang tải..." : "Chọn tỉnh/thành"} />
            </SelectTrigger>
            <SelectContent className="max-h-72">
              {provinces.map((p) => (
                <SelectItem key={p.code} value={p.code}>
                  {p.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* District */}
        <div className="flex flex-col gap-1">
          <LabelReq>Quận/Huyện</LabelReq>
          <Select
            value={districtCode}
            onValueChange={setDistrictCode}
            disabled={!provinceCode || loadingDist}
          >
            <SelectTrigger
              className={clsx(
                trigBase,
                (!provinceCode || loadingDist) && "cursor-not-allowed opacity-60"
              )}
            >
              <SelectValue
                placeholder={
                  !provinceCode ? "Chọn tỉnh trước" : loadingDist ? "Đang tải..." : "Chọn quận/huyện"
                }
              />
            </SelectTrigger>
            <SelectContent className="max-h-72">
              {districts.map((d) => (
                <SelectItem key={d.code} value={d.code}>
                  {d.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Ward */}
        <div className="flex flex-col gap-1">
          <LabelReq>Phường/Xã</LabelReq>
          <Select
            value={wardCode}
            onValueChange={setWardCode}
            disabled={!districtCode || loadingWard}
          >
            <SelectTrigger
              className={clsx(
                trigBase,
                (!districtCode || loadingWard) && "cursor-not-allowed opacity-60"
              )}
            >
              <SelectValue
                placeholder={
                  !districtCode ? "Chọn quận/huyện trước" : loadingWard ? "Đang tải..." : "Chọn phường/xã"
                }
              />
            </SelectTrigger>
            <SelectContent className="max-h-72">
              {wards.map((w) => (
                <SelectItem key={w.code} value={w.code}>
                  {w.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Address detail (optional) */}
        <div className="flex flex-col gap-1 md:col-span-2 lg:col-span-4">
          <Label className="text-[13px] text-gray-700">Địa chỉ chi tiết</Label>
          <input
            className="h-10 w-full rounded-md border bg-white px-3 text-sm shadow-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-500/50"
            placeholder="Số nhà, đường…"
            value={addressDetail}
            onChange={(e) => onAddressDetailChange(e.target.value)}
          />
        </div>
      </div>
    </section>
  );
}
