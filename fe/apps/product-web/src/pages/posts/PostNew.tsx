import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/contexts/AuthContext";
import { Image as ImageIcon, Trash2, Star, Info } from "lucide-react";
import { toast } from "sonner";

import {
  postVehicle,
  postBattery,
  type ImageMeta,
  type VehiclePostData,
  type BatteryPostData,
  fetchVehicleBrands,
  fetchBatteryBrands,
  type Brand,
} from "@/api/PostApi";

import AddressPicker from "@/pages/posts/components/AddressPicker"
import { useVNAddress } from "@/hooks/useVNAddress";

type Category = "vehicle" | "battery";
type ImgItem = { file: File; url: string; cover?: boolean };

type FormState = {
  category: Category;

  title: string;
  description: string;
  price: string;          

  addressDetail: string;

  brandId?: string;
  batteryTypeId?: string;

  builtInBatteryCapacityAh?: string;
  builtInBatteryVoltageV?: string;
  removableBattery?: boolean;
  batteryHealthPercent?: string;

  motorPowerW?: string;
  maxSpeedKmh?: string;
  mileageKm?: string;
  rangeKm?: string;
  chargingTimeHours?: string;

  model?: string;
  year?: string;
  color?: string;
  origin?: string;
  weightKg?: string;
  warrantyMonths?: string;
  ownersCount?: string;

  hasInsurance?: boolean;
  hasRegistration?: boolean;
  licensePlate?: string;

  // Battery
  capacityKwh?: string;
  healthPercent?: string;
  voltageV?: string;
  originBattery?: string;
};

const MAX_IMAGES = 10;
const MIN_IMAGES = 1;
const MAX_TITLE = 50;
const MAX_DESC = 1500;

export default function PostNew() {
  const { user } = useAuth();
  const nav = useNavigate();

  const addr = useVNAddress();
  const {
    provinceCode, districtCode, wardCode,
    provinceName, districtName, wardName,
  } = addr;

  /* HÌNH ẢNH */
  const [imgs, setImgs] = useState<ImgItem[]>([]);
  const [dragOver, setDragOver] = useState(false);
  const fileRef = useRef<HTMLInputElement | null>(null);

  /* FORM */
  const [form, setForm] = useState<FormState>({
    category: "vehicle",
    title: "",
    description: "",
    price: "",
    addressDetail: "",
    brandId: "",
    removableBattery: true,
    hasInsurance: false,
    hasRegistration: false,
  });

  /* BRANDS theo category */
  const [vehicleBrands, setVehicleBrands] = useState<Brand[]>([]);
  const [batteryBrands, setBatteryBrands] = useState<Brand[]>([]);
  useEffect(() => {
    (async () => {
      try {
        const [vb, bb] = await Promise.all([fetchVehicleBrands(), fetchBatteryBrands()]);
        setVehicleBrands(vb);
        setBatteryBrands(bb);
      } catch (e) {
        console.error(e);
        toast.error("Không tải được danh sách hãng.");
      }
    })();
  }, []);

  const isVehicle = form.category === "vehicle";

  useEffect(() => {
    if (imgs.length && !imgs.some((i) => i.cover)) {
      setImgs((arr) => arr.map((it, idx) => ({ ...it, cover: idx === 0 })));
    }
  }, [imgs.length]);

  /* Validate */
  const titleLeft = MAX_TITLE - (form.title?.length || 0);
  const descLeft = MAX_DESC - (form.description?.length || 0);

  const canSubmit = useMemo(() => {
    if (imgs.length < MIN_IMAGES) return false;
    if (!form.title || !form.price) return false;
    if (!form.brandId) return false;
    if (!provinceCode || !districtCode || !wardCode) return false;
    return true;
  }, [imgs.length, form, provinceCode, districtCode, wardCode]);

  /* Helpers */
  function pickFiles() {
    fileRef.current?.click();
  }
  function addFiles(files: FileList | null) {
    if (!files?.length) return;
    const remain = MAX_IMAGES - imgs.length;
    const list = Array.from(files).slice(0, remain);
    const valid = list.filter((f) => /^image\//.test(f.type) && f.size <= 6 * 1024 * 1024);
    setImgs((arr) => [...arr, ...valid.map((f) => ({ file: f, url: URL.createObjectURL(f) }))]);
  }
  function onDrop(e: React.DragEvent) {
    e.preventDefault();
    e.stopPropagation();
    setDragOver(false);
    addFiles(e.dataTransfer.files);
  }
  function removeImg(i: number) {
    setImgs((arr) => {
      const next = [...arr];
      URL.revokeObjectURL(next[i]?.url);
      next.splice(i, 1);
      return next;
    });
  }
  function setCover(i: number) {
    setImgs((arr) => arr.map((it, idx) => ({ ...it, cover: idx === i })));
  }

  function parsePriceToVND(raw: string) {
    const cleaned = raw.replace(/[^\d]/g, "");
    return cleaned ? Number(cleaned) * 1_000_000 : 0;
  }

  const buildImagesMeta = (): ImageMeta[] =>
    imgs.map((_, idx) => ({ position: idx, isPrimary: !!imgs[idx].cover }));

  /* SUBMIT */
  const [submitting, setSubmitting] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!canSubmit || submitting) return;

    setSubmitting(true);
    try {
      const orderedFiles = imgs
        .slice()
        .sort((a, b) => (a.cover ? -1 : 0) - (b.cover ? -1 : 0))
        .map((i) => i.file);

      const imagesMeta = buildImagesMeta();

      const DEFAULT_CONDITION: "NEW" | "USED" = "USED";

      const baseAddress = {
        city: (provinceName ?? "").trim(),
        district: (districtName ?? "").trim(),
        ward: (wardName ?? "").trim(),
        addressDetail: form.addressDetail || "",
      };

      if (isVehicle) {
        const data: VehiclePostData = {
          title: form.title,
          description: form.description || undefined,
          conditionType: DEFAULT_CONDITION,
          price: parsePriceToVND(form.price),

          ...baseAddress,

          brandId: form.brandId || undefined,

          builtInBatteryCapacityAh: form.builtInBatteryCapacityAh ? Number(form.builtInBatteryCapacityAh) : null,
          builtInBatteryVoltageV: form.builtInBatteryVoltageV ? Number(form.builtInBatteryVoltageV) : null,
          removableBattery: form.removableBattery ?? null,
          batteryHealthPercent: form.batteryHealthPercent ? Number(form.batteryHealthPercent) : null,

          motorPowerW: form.motorPowerW ? Number(form.motorPowerW) : null,
          maxSpeedKmh: form.maxSpeedKmh ? Number(form.maxSpeedKmh) : null,
          mileageKm: form.mileageKm ? Number(form.mileageKm) : null,
          rangeKm: form.rangeKm ? Number(form.rangeKm) : null,
          chargingTimeHours: form.chargingTimeHours ? Number(form.chargingTimeHours) : null,

          model: form.model || null,
          year: form.year ? Number(form.year) : null,
          color: form.color || null,
          origin: form.origin || null,
          weightKg: form.weightKg ? Number(form.weightKg) : null,
          warrantyMonths: form.warrantyMonths ? Number(form.warrantyMonths) : null,
          ownersCount: form.ownersCount ? Number(form.ownersCount) : null,

          hasInsurance: form.hasInsurance ?? null,
          hasRegistration: form.hasRegistration ?? null,
          licensePlate: form.licensePlate || null,
        };

        await postVehicle(data, orderedFiles, imagesMeta);
      } else {
        const data: BatteryPostData = {
          title: form.title,
          description: form.description || undefined,
          conditionType: DEFAULT_CONDITION,
          price: parsePriceToVND(form.price),

          ...baseAddress,

          brandId: form.brandId || undefined,
          batteryTypeId: form.batteryTypeId || undefined,

          capacityKwh: form.capacityKwh ? Number(form.capacityKwh) : null,
          healthPercent: form.healthPercent ? Number(form.healthPercent) : null,
          origin: form.originBattery || null,
          voltageV: form.voltageV ? Number(form.voltageV) : null,
        };

        await postBattery(data, orderedFiles, imagesMeta);
      }

      toast.success("Đăng tin thành công!");
      nav("/account/posts", { replace: true });
    } catch (err: any) {
      const msg = err?.response?.data?.message || "Đăng tin thất bại.";
      toast.error(msg);
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  }

  const Required = () => <span className="ml-1 text-red-500">*</span>;

  /* ========== UI ========== */
  return (
    <form onSubmit={onSubmit} className="container mx-auto max-w-6xl px-4 py-6">
      <div className="overflow-x-auto bg-gray-100">
        <div className="min-w-[1120px] flex items-start gap-2">
          {/* LEFT: images */}
          <section className="sticky top-4 h-fit w-[460px] shrink-0 rounded-xl p-10 ">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">
                Hình ảnh sản phẩm <Required />
              </h2>
              <span className="inline-flex items-center gap-1 text-xs text-gray-500">
                <Info className="h-4 w-4" /> Đăng từ {String(MIN_IMAGES).padStart(2, "0")} đến {String(MAX_IMAGES).padStart(2, "0")} hình
              </span>
            </div>

            <div
              className={`mt-3 grid cursor-pointer place-content-center rounded-lg border-2 border-dashed p-5 text-center transition
              ${dragOver ? "border-[#0f766e] bg-teal-50" : "bg-white"}`}
              onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onDrop={onDrop}
              onClick={pickFiles}
            >
              <div className="flex flex-col items-center gap-2 text-gray-500">
                <div className="grid h-16 w-16 place-content-center rounded-full border border-teal-200 bg-teal-50">
                  <ImageIcon className="h-8 w-8 text-teal-600" />
                </div>
                <div className="font-medium">Kéo thả ảnh vào đây hoặc bấm để chọn</div>
                <div className="text-xs">Hỗ trợ JPG/PNG, tối đa 6MB/ảnh</div>
              </div>
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                onChange={(e) => addFiles(e.target.files)}
              />
            </div>

            {imgs.length > 0 && (
              <div className="mt-4 grid grid-cols-3 gap-3 sm:grid-cols-4">
                {imgs.map((it, i) => (
                  <figure key={i} className="relative isolate overflow-hidden rounded-md border bg-white">
                    <img src={it.url} alt={`img-${i}`} className="aspect-square w-full object-cover" />
                    <div className="absolute left-1 top-1 z-20 flex gap-1">
                      <button
                        type="button"
                        onClick={() => setCover(i)}
                        className={`inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-xs shadow-sm
                          ${it.cover ? "bg-[#0f766e] text-white" : "border bg-white/95 text-gray-700"}`}
                        title="Đặt ảnh bìa"
                      >
                        <Star className={`h-3.5 w-3.5 ${it.cover ? "fill-white" : ""}`} /> Bìa
                      </button>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeImg(i)}
                      title="Xóa"
                      className="absolute right-1 top-1 z-20 grid h-7 w-7 place-content-center rounded border bg-white/95 text-gray-700 shadow-sm hover:bg-red-50 hover:text-red-600"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </figure>
                ))}
              </div>
            )}

            <div className="mt-3 text-xs text-gray-600">
              Đã chọn <b>{imgs.length}</b> / {MAX_IMAGES} hình
              {imgs.length < MIN_IMAGES && (
                <span className="ml-2 text-red-600">• Cần tối thiểu {MIN_IMAGES} hình</span>
              )}
            </div>
          </section>

          {/* RIGHT: form */}
          <section className="isolate flex-1 bg-white p-4 ">
            {/* Nhóm 0: danh mục + hãng */}
            <div className="grid grid-cols-3 gap-4">
              <div className="flex flex-col gap-1">
                <Label>Danh mục<Required /></Label>
                <Select
                  value={form.category}
                  onValueChange={(v) => setForm((f) => ({ ...f, category: v as Category, brandId: "" }))}
                >
                  <SelectTrigger className="relative z-10">
                    <SelectValue placeholder="Chọn danh mục" />
                  </SelectTrigger>
                  <SelectContent className="z-50">
                    <SelectItem value="vehicle">Xe điện</SelectItem>
                    <SelectItem value="battery">Pin điện</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="col-span-2 flex flex-col gap-1">
                <Label>Hãng<Required /></Label>
                <Select
                  value={form.brandId || ""}
                  onValueChange={(v) => setForm((f) => ({ ...f, brandId: v }))}
                >
                  <SelectTrigger className="relative z-10">
                    <SelectValue placeholder="Chọn hãng" />
                  </SelectTrigger>
                  <SelectContent className="z-50">
                    {(isVehicle ? vehicleBrands : batteryBrands).map((b) => (
                      <SelectItem key={b.id} value={b.id}>{b.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Nhóm 1: Khác nhau theo danh mục */}
            <div className="mt-4 grid grid-cols-3 gap-4">
              {isVehicle ? (
                <>
                  <div className="flex flex-col gap-1">
                    <Label>Model</Label>
                    <Input value={form.model || ""} onChange={(e) => setForm((f) => ({ ...f, model: e.target.value }))} />
                  </div>
                  <div className="flex flex-col gap-1">
                    <Label>Năm sản xuất</Label>
                    <Input
                      inputMode="numeric"
                      value={form.year || ""}
                      onChange={(e) => setForm((f) => ({ ...f, year: e.target.value.replace(/\D/g, "") }))}
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <Label>Màu sắc</Label>
                    <Input value={form.color || ""} onChange={(e) => setForm((f) => ({ ...f, color: e.target.value }))} />
                  </div>

                  <div className="flex flex-col gap-1">
                    <Label>Pin tích hợp (Ah)</Label>
                    <Input
                      inputMode="numeric"
                      value={form.builtInBatteryCapacityAh || ""}
                      onChange={(e) => setForm((f) => ({ ...f, builtInBatteryCapacityAh: e.target.value.replace(/[^\d.]/g, "") }))}
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <Label>Điện áp pin (V)</Label>
                    <Input
                      inputMode="numeric"
                      value={form.builtInBatteryVoltageV || ""}
                      onChange={(e) => setForm((f) => ({ ...f, builtInBatteryVoltageV: e.target.value.replace(/[^\d.]/g, "") }))}
                    />
                  </div>
                  {/* <div className="flex flex-col gap-1">
                    <Label>Sức khỏe pin (%)</Label>
                    <Input
                      inputMode="numeric"
                      value={form.batteryHealthPercent || ""}
                      onChange={(e) => setForm((f) => ({ ...f, batteryHealthPercent: e.target.value.replace(/[^\d]/g, "") }))}
                    />
                  </div> */}

                  {/* <div className="flex flex-col gap-1">
                    <Label>Công suất motor (W)</Label>
                    <Input
                      inputMode="numeric"
                      value={form.motorPowerW || ""}
                      onChange={(e) => setForm((f) => ({ ...f, motorPowerW: e.target.value.replace(/[^\d]/g, "") }))}
                    />
                  </div> */}
                  <div className="flex flex-col gap-1">
                    <Label>Số km đã đi (km)</Label>
                    <Input
                      inputMode="numeric"
                      value={form.mileageKm || ""}
                      onChange={(e) => setForm((f) => ({ ...f, mileageKm: e.target.value.replace(/[^\d]/g, "") }))}
                    />
                  </div>
                  {/* <div className="flex flex-col gap-1">
                    <Label>Tầm hoạt động (km)</Label>
                    <Input
                      inputMode="numeric"
                      value={form.rangeKm || ""}
                      onChange={(e) => setForm((f) => ({ ...f, rangeKm: e.target.value.replace(/[^\d]/g, "") }))}
                    />
                  </div> */}

                  {/* <div className="flex flex-col gap-1">
                    <Label>Thời gian sạc (giờ)</Label>
                    <Input
                      inputMode="decimal"
                      value={form.chargingTimeHours || ""}
                      onChange={(e) => setForm((f) => ({ ...f, chargingTimeHours: e.target.value.replace(/[^\d.]/g, "") }))}
                    />
                  </div> */}
                  {/* <div className="flex flex-col gap-1">
                    <Label>Trọng lượng (kg)</Label>
                    <Input
                      inputMode="decimal"
                      value={form.weightKg || ""}
                      onChange={(e) => setForm((f) => ({ ...f, weightKg: e.target.value.replace(/[^\d.]/g, "") }))}
                    />
                  </div> */}
                </>
              ) : (
                <>
                  <div className="flex flex-col gap-1">
                    <Label>Dung lượng (kWh)</Label>
                    <Input
                      inputMode="decimal"
                      value={form.capacityKwh || ""}
                      onChange={(e) => setForm((f) => ({ ...f, capacityKwh: e.target.value.replace(/[^\d.]/g, "") }))}
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <Label>Sức khỏe pin (%)</Label>
                    <Input
                      inputMode="numeric"
                      value={form.healthPercent || ""}
                      onChange={(e) => setForm((f) => ({ ...f, healthPercent: e.target.value.replace(/[^\d]/g, "") }))}
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <Label>Điện áp (V)</Label>
                    <Input
                      inputMode="numeric"
                      value={form.voltageV || ""}
                      onChange={(e) => setForm((f) => ({ ...f, voltageV: e.target.value.replace(/[^\d]/g, "") }))}
                    />
                  </div>
                  {/* <div className="flex flex-col gap-1">
                    <Label>Xuất xứ</Label>
                    <Input
                      value={form.originBattery || ""}
                      onChange={(e) => setForm((f) => ({ ...f, originBattery: e.target.value }))}
                    />
                  </div> */}
                </>
              )}
            </div>

            {/* Giá & Tiêu đề & Mô tả */}
            <div className="mt-6">
              <h3 className="mb-2 font-semibold text-gray-800">Tiêu đề tin & mô tả</h3>
              <div className="flex flex-col gap-1">
                <Label>Tiêu đề<Required /></Label>
                <Input
                  maxLength={MAX_TITLE}
                  placeholder="VD: VinFast Feliz S - New 2024"
                  value={form.title}
                  onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                />
                <div className="text-xs text-gray-500">{titleLeft}/50 kí tự</div>
              </div>

              <div className="mt-3 flex flex-col gap-1">
                <Label>Mô tả</Label>
                <Textarea
                  maxLength={MAX_DESC}
                  rows={6}
                  placeholder={`- Tình trạng, bảo hành\n- Lý do bán, thời gian sử dụng\n- Phụ kiện đi kèm…`}
                  value={form.description}
                  onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                />
                <div className="text-xs text-gray-500">{descLeft}/1500 kí tự</div>
              </div>

              <div className="mt-4 flex flex-col gap-1">
                <Label>Giá<Required /></Label>
                <Input
                  placeholder="VD: 21"
                  inputMode="decimal"
                  value={form.price}
                  onChange={(e) => setForm((f) => ({ ...f, price: e.target.value.replace(/[^\d.]/g, "") }))}
                />
              </div>
            </div>

            <AddressPicker
              addr={addr}
              addressDetail={form.addressDetail}
              onAddressDetailChange={(v) => setForm((f) => ({ ...f, addressDetail: v }))}
            />

            {/* Actions */}
            <div className="mt-6 flex flex-wrap justify-end gap-3">
              <Button type="button" variant="outline" onClick={() => window.history.back()}>
                Quay lại
              </Button>
              <Button
                type="submit"
                disabled={!canSubmit || submitting}
                className="!bg-[#0f766e] !hover:bg-[#0e6a64]"
              >
                {submitting ? "Đang đăng..." : "Đăng tin"}
              </Button>
            </div>
          </section>
        </div>
      </div>
    </form>
  );
}
