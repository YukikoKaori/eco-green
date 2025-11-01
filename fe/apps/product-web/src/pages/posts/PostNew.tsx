import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Image as ImageIcon, Trash2, Star, Info } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import AddressPicker from "@/pages/posts/components/AddressPicker";
import { useVNAddress } from "@/hooks/useVNAddress";

import {
  postVehicle,
  postBattery,
  type ImageMeta,
  type VehiclePostData,
  type BatteryPostData,
  fetchBatteryBrands,
  fetchVehicleCategories,
  fetchBatteryTypes,
  fetchVehicleBrandsByCategory,
  fetchModelsByTypeAndBrand,
  fetchVersionsByModel,
  type Brand,
  type OptionItem,
} from "@/api/PostApi";

import AIPriceChat from "@/components/ai/AIPricer";
import AIPriceFab from "@/components/ai/AIPriceFab";
import AINudgeDialog, { wasAINudgeDismissed } from "@/components/ai/AINudgeDialog";

type Category = "vehicle" | "battery";
type ImgItem = { file: File; url: string; cover?: boolean };

type FormState = {
  category: Category;
  title: string;
  description: string;
  price: string;
  addressDetail: string;

  batteryTypeId?: string;
  capacityKwh?: string;
  healthPercent?: string;
  voltageV?: string;

  year?: string;
  mileageKm?: string;
  batteryHealthPercent?: string;

  brandId?: string;
};

const MAX_IMAGES = 10;
const MIN_IMAGES = 1;
const MAX_TITLE = 50;
const MAX_DESC = 1500;

/* VND helpers */
function formatVNDInput(raw: string | number) {
  const digits = String(raw).replace(/[^\d]/g, "");
  if (!digits) return "";
  return Number(digits).toLocaleString("vi-VN");
}
function parseVNDToNumber(raw: string) {
  const digits = raw.replace(/[^\d]/g, "");
  return digits ? Number(digits) : 0;
}

export default function PostNew() {
  const { user } = useAuth();
  const nav = useNavigate();

  const addr = useVNAddress();
  const { provinceCode, districtCode, wardCode, provinceName, districtName, wardName } = addr;

  /* Images */
  const [imgs, setImgs] = useState<ImgItem[]>([]);
  const [dragOver, setDragOver] = useState(false);
  const fileRef = useRef<HTMLInputElement | null>(null);

  /* Form (không autosave) */
  const [form, setForm] = useState<FormState>({
    category: "vehicle",
    title: "",
    description: "",
    price: "",
    addressDetail: "",
  });

  const isVehicle = form.category === "vehicle";

  /* Catalog states */
  const [vehicleCategories, setVehicleCategories] = useState<OptionItem[]>([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>("");

  const [vehicleBrands, setVehicleBrands] = useState<Brand[]>([]);
  const [batteryBrands, setBatteryBrands] = useState<Brand[]>([]);
  const [batteryTypes, setBatteryTypes] = useState<OptionItem[]>([]);

  const [models, setModels] = useState<OptionItem[]>([]);
  const [versions, setVersions] = useState<OptionItem[]>([]);
  const [selectedBrandId, setSelectedBrandId] = useState<string>("");
  const [selectedModelId, setSelectedModelId] = useState<string>("");
  const [selectedVersionId, setSelectedVersionId] = useState<string>("");

  const [aiOpen, setAiOpen] = useState(false);
  //popup
  const [showAINudge, setShowAINudge] = useState(false);
  useEffect(() => {
    if (!wasAINudgeDismissed()) {
      const t = setTimeout(() => setShowAINudge(true), 500);
      return () => clearTimeout(t);
    }
  }, []);

  function findNameById<T extends { id: string; name: string }>(list: T[], id?: string) {
    return (list.find((x) => x.id === id)?.name ?? "").trim();
  }

  const aiPayload = useMemo(() => {
    const brandName = isVehicle
      ? findNameById(vehicleBrands, selectedBrandId)
      : findNameById(batteryBrands, form.brandId);

    return {
      title: form.title || undefined,
      brandName: brandName || undefined,
      modelName: findNameById(models, selectedModelId) || undefined,
      versionName: findNameById(versions, selectedVersionId) || undefined,
      batteryHealth: isVehicle ? (form.batteryHealthPercent || undefined) : (form.healthPercent || undefined),
      mileageKm: isVehicle ? (form.mileageKm || undefined) : undefined,
      manufactureYear: isVehicle ? (form.year || undefined) : undefined,
    };
  }, [
    form.title,
    form.brandId,
    form.healthPercent,
    form.batteryHealthPercent,
    form.mileageKm,
    form.year,
    isVehicle,
    vehicleBrands,
    batteryBrands,
    models,
    versions,
    selectedBrandId,
    selectedModelId,
    selectedVersionId,
  ]);

  // lấy mô tả với tiêu đề từ AI
  const applyAiToForm = (p: { priceVnd?: number; title?: string; description?: string }) => {
    setForm((f) => ({
      ...f,
      ...(p.title ? { title: p.title } : {}),
      ...(p.description ? { description: p.description } : {}),
      ...(p.priceVnd ? { price: formatVNDInput(p.priceVnd) } : {}),
    }));
    toast.success("Đã áp dụng gợi ý AI.");
  };

  /* ==== Effects ==== */
  useEffect(() => {
    (async () => {
      try {
        const [cats, bb, bt] = await Promise.all([
          fetchVehicleCategories(),
          fetchBatteryBrands(),
          fetchBatteryTypes(),
        ]);
        setVehicleCategories(cats);
        setBatteryBrands(bb);
        setBatteryTypes(bt);
      } catch (e) {
        console.error(e);
        toast.error("Không tải được danh mục/hãng/loại pin.");
      }
    })();
  }, []);

  useEffect(() => {
    if (imgs.length && !imgs.some((i) => i.cover)) {
      setImgs((arr) => arr.map((it, idx) => ({ ...it, cover: idx === 0 })));
    }
    return () => {
      imgs.forEach((i) => URL.revokeObjectURL(i.url));
    };
  }, [imgs.length]);

  useEffect(() => {
    if (!isVehicle) return;
    setSelectedBrandId("");
    setSelectedModelId("");
    setSelectedVersionId("");
    setModels([]);
    setVersions([]);

    if (!selectedCategoryId) {
      setVehicleBrands([]);
      return;
    }

    (async () => {
      try {
        const brands = await fetchVehicleBrandsByCategory(selectedCategoryId);
        setVehicleBrands(brands);
      } catch {
        toast.error("Không tải được Hãng xe theo Loại xe.");
      }
    })();
  }, [isVehicle, selectedCategoryId]);

  useEffect(() => {
    if (!isVehicle) return;

    if (!selectedCategoryId || !selectedBrandId) {
      setModels([]);
      setSelectedModelId("");
      setVersions([]);
      setSelectedVersionId("");
      return;
    }

    (async () => {
      try {
        const list = await fetchModelsByTypeAndBrand(selectedCategoryId, selectedBrandId);
        setModels(list);
        setSelectedModelId("");
        setVersions([]);
        setSelectedVersionId("");
      } catch {
        toast.error("Không tải được Dòng xe.");
      }
    })();
  }, [isVehicle, selectedCategoryId, selectedBrandId]);

  useEffect(() => {
    if (!isVehicle) return;

    if (!selectedModelId) {
      setVersions([]);
      setSelectedVersionId("");
      return;
    }

    (async () => {
      try {
        const list = await fetchVersionsByModel(selectedModelId);
        setVersions(list);
        setSelectedVersionId("");
      } catch {
        toast.error("Không tải được Phiên bản.");
      }
    })();
  }, [isVehicle, selectedModelId]);

  const titleLeft = MAX_TITLE - (form.title?.length || 0);
  const descLeft = MAX_DESC - (form.description?.length || 0);

  const canSubmit = useMemo(() => {
    if (imgs.length < MIN_IMAGES) return false;
    if (!form.title || !form.price) return false;
    if (!form.description?.trim()) return false;            
    if (!form.addressDetail?.trim()) return false;          
    if (parseVNDToNumber(form.price) <= 0) return false;
    if (!provinceCode || !districtCode || !wardCode) return false;

    if (isVehicle) {
      if (!selectedCategoryId) return false;
      if (!selectedBrandId) return false;
      if (!selectedModelId) return false; 
      if (!form.year || !form.mileageKm || !form.batteryHealthPercent) return false;
    } else {
      if (!form.brandId) return false;
      if (!form.batteryTypeId) return false;
      if (!form.capacityKwh || !form.healthPercent || !form.voltageV) return false;
    }
    return true;
  }, [
    imgs.length,
    form,
    provinceCode,
    districtCode,
    wardCode,
    isVehicle,
    selectedCategoryId,
    selectedBrandId,
    selectedModelId,
  ]);

  const pickFiles = () => fileRef.current?.click();
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
  const setCover = (i: number) => setImgs((arr) => arr.map((it, idx) => ({ ...it, cover: idx === i })));

  const buildImagesMeta = (): ImageMeta[] =>
    imgs.map((_, idx) => ({ position: idx, isPrimary: !!imgs[idx].cover }));

  /* Submit */
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

      const baseAddress = {
        city: (provinceName ?? "").trim(),
        district: (districtName ?? "").trim(),
        ward: (wardName ?? "").trim(),
        addressDetail: form.addressDetail || "",
      };

      const priceVND = parseVNDToNumber(form.price);

      let created:
        | import("@/api/PostApi").VehiclePostResponse
        | import("@/api/PostApi").BatteryPostResponse;

      if (isVehicle) {
        const baseData = {
          title: form.title,
          description: form.description,
          price: priceVND,
          ...baseAddress,
          brandId: selectedBrandId,
          batteryHealthPercent: Number(form.batteryHealthPercent),
          mileageKm: Number(form.mileageKm),
          modelId: selectedModelId,
          year: Number(form.year),
          categoryId: selectedCategoryId,
        };
        const data: VehiclePostData = {
          ...(baseData as VehiclePostData),
          ...(selectedVersionId ? { versionId: selectedVersionId } : {}),
        } as any;
        created = await postVehicle(data, orderedFiles, imagesMeta);
      } else {
        const data: BatteryPostData = {
          title: form.title,
          description: form.description,
          price: priceVND,
          ...baseAddress,
          brandId: form.brandId!,
          batteryTypeId: form.batteryTypeId!,
          capacityKwh: Number(form.capacityKwh),
          healthPercent: Number(form.healthPercent),
          voltageV: Number(form.voltageV),
        };
        created = await postBattery(data, orderedFiles, imagesMeta);
      }

      localStorage.setItem(
        "last_post_created",
        JSON.stringify({ ...created, kind: isVehicle ? "vehicle" : "battery" })
      );

      const productId = (created as any).productId;
      toast.success("Đăng tin thành công!");
      nav(`/postnotice?productId=${encodeURIComponent(productId)}`, {
        replace: true,
        state: { created, type: isVehicle ? "vehicle" : "battery", productId },
      });
    } catch (err: any) {
      const msg = err?.response?.data?.message || "Đăng tin thất bại.";
      toast.error(msg);
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  }

  const Required = () => <span className="ml-1 text-red-500">*</span>;

  const brandNameForNudge = useMemo(() => {
    return isVehicle
      ? findNameById(vehicleBrands, selectedBrandId)
      : findNameById(batteryBrands, form.brandId);
  }, [isVehicle, vehicleBrands, selectedBrandId, batteryBrands, form.brandId]);

  const nudgeFields = useMemo(() => ({
    brandName: brandNameForNudge || undefined,
    modelName: findNameById(models, selectedModelId) || undefined,
    versionName: findNameById(versions, selectedVersionId) || undefined, 
    year: form.year || undefined,
    mileageKm: form.mileageKm || undefined,
    batteryHealth: (isVehicle ? form.batteryHealthPercent : form.healthPercent) || undefined,
    batteryTypeId: form.batteryTypeId || undefined,
    capacityKwh: form.capacityKwh || undefined,
    voltageV: form.voltageV || undefined,
  }), [
    brandNameForNudge, models, selectedModelId, versions, selectedVersionId,
    form.year, form.mileageKm, form.batteryHealthPercent, form.healthPercent,
    form.batteryTypeId, form.capacityKwh, form.voltageV, isVehicle
  ]);

  return (
    <>
      <AINudgeDialog 
        open={showAINudge}
        onOpenChange={setShowAINudge}
        fields={nudgeFields}
      />
      <AIPriceChat
        open={aiOpen}
        onOpenChange={setAiOpen}
        payload={aiPayload}
        onApply={applyAiToForm}
      />
      <AIPriceFab onClick={() => setAiOpen(true)} />

      <form onSubmit={onSubmit} className="container mx-auto max-w-6xl px-4 py-6">
        <div className="overflow-x-auto bg-gray-100">
          <div className="min-w-[1120px] flex items-start gap-2">
            {/* LEFT: Images */}
            <section className="sticky top-4 h-fit w-[460px] shrink-0 rounded-xl p-10 ">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-[#0f766e]">
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
                onClick={() => fileRef.current?.click()}
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

            {/* RIGHT: Form */}
            <section className="isolate flex-1 bg-white p-4 ">
              <div className="grid grid-cols-3 gap-4">
                <div className="flex flex-col gap-1">
                  <Label className="text-[#0f766e]">Danh mục<Required /></Label>
                  <Select
                    value={form.category}
                    onValueChange={(v) => setForm((f) => ({ ...f, category: v as Category }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Chọn danh mục" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="vehicle">Xe điện</SelectItem>
                      <SelectItem value="battery">Pin điện</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {isVehicle ? (
                  <>
                    {/* Loại xe */}
                    <div className="flex flex-col gap-1">
                      <Label className="text-[#0f766e]">Loại xe<Required /></Label>
                      <Select value={selectedCategoryId} onValueChange={(v) => setSelectedCategoryId(v)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Chọn loại xe" />
                        </SelectTrigger>
                        <SelectContent>
                          {vehicleCategories.map((c) => (
                            <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Hãng xe */}
                    {selectedCategoryId && (
                      <div className="flex flex-col gap-1">
                        <Label className="text-[#0f766e]">Hãng xe<Required /></Label>
                        <Select value={selectedBrandId} onValueChange={(v) => setSelectedBrandId(v)}>
                          <SelectTrigger>
                            <SelectValue placeholder="Chọn hãng" />
                          </SelectTrigger>
                          <SelectContent>
                            {vehicleBrands.map((b) => (
                              <SelectItem key={b.id} value={b.id}>{b.name}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    )}

                    {/* Dòng xe */}
                    {selectedCategoryId && selectedBrandId && (
                      <div className="flex flex-col gap-1">
                        <Label className="text-[#0f766e]">Dòng xe<Required /></Label>
                        <Select
                          value={selectedModelId}
                          onValueChange={(v) => setSelectedModelId(v)}
                          disabled={models.length === 0}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Chọn dòng" />
                          </SelectTrigger>
                          <SelectContent>
                            {models.map((m) => (
                              <SelectItem key={m.id} value={m.id}>{m.name}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    )}

                    {/* Phiên bản (KHÔNG bắt buộc) */}
                    {selectedCategoryId && selectedBrandId && selectedModelId && (
                      <div className="flex flex-col gap-1">
                        <Label className="text-[#0f766e]">Phiên bản</Label>
                        <Select
                          value={selectedVersionId}
                          onValueChange={(v) => setSelectedVersionId(v)}
                          disabled={versions.length === 0}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Không bắt buộc" />
                          </SelectTrigger>
                          <SelectContent>
                            {versions.map((v) => (
                              <SelectItem key={v.id} value={v.id}>{v.name}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    )}
                  </>
                ) : (
                  <>
                    {/* Hãng pin */}
                    <div className="flex flex-col gap-1">
                      <Label className="text-[#0f766e]">Hãng pin<Required /></Label>
                      <Select
                        value={form.brandId || ""}
                        onValueChange={(v) => setForm((f) => ({ ...f, brandId: v }))}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Chọn hãng" />
                        </SelectTrigger>
                        <SelectContent>
                          {batteryBrands.map((b) => (
                            <SelectItem key={b.id} value={b.id}>{b.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Loại pin */}
                    <div className="flex flex-col gap-1">
                      <Label className="text-[#0f766e]">Loại pin<Required /></Label>
                      <Select
                        value={form.batteryTypeId || ""}
                        onValueChange={(v) => setForm((f) => ({ ...f, batteryTypeId: v }))}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Chọn loại pin" />
                        </SelectTrigger>
                        <SelectContent>
                          {batteryTypes.map((t) => (
                            <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </>
                )}
              </div>

              <div className="mt-4 grid grid-cols-3 gap-4">
                {isVehicle ? (
                  <>
                    <div className="flex flex-col gap-1">
                      <Label className="text-[#0f766e]">Năm sản xuất<Required /></Label>
                      <Input
                        inputMode="numeric"
                        value={form.year || ""}
                        onChange={(e) => setForm((f) => ({ ...f, year: e.target.value.replace(/\D/g, "") }))}
                      />
                    </div>
                    <div className="flex flex-col gap-1">
                      <Label className="text-[#0f766e]">Số km đã đi (km)<Required /></Label>
                      <Input
                        inputMode="numeric"
                        value={form.mileageKm || ""}
                        onChange={(e) => setForm((f) => ({ ...f, mileageKm: e.target.value.replace(/[^\d]/g, "") }))}
                      />
                    </div>
                    <div className="flex flex-col gap-1">
                      <Label className="text-[#0f766e]">Sức khỏe pin (%)<Required /></Label>
                      <Input
                        inputMode="numeric"
                        value={form.batteryHealthPercent || ""}
                        onChange={(e) =>
                          setForm((f) => ({ ...f, batteryHealthPercent: e.target.value.replace(/[^\d]/g, "") }))
                        }
                      />
                    </div>
                  </>
                ) : (
                  <>
                    <div className="flex flex-col gap-1">
                      <Label className="text-[#0f766e]">Dung lượng (kWh)<Required /></Label>
                      <Input
                        inputMode="decimal"
                        value={form.capacityKwh || ""}
                        onChange={(e) => setForm((f) => ({ ...f, capacityKwh: e.target.value.replace(/[^\d.]/g, "") }))}
                      />
                    </div>
                    <div className="flex flex-col gap-1">
                      <Label className="text-[#0f766e]">Sức khỏe pin (%)<Required /></Label>
                      <Input
                        inputMode="numeric"
                        value={form.healthPercent || ""}
                        onChange={(e) => setForm((f) => ({ ...f, healthPercent: e.target.value.replace(/[^\d]/g, "") }))}
                      />
                    </div>
                    <div className="flex flex-col gap-1">
                      <Label className="text-[#0f766e]">Điện áp (V)<Required /></Label>
                      <Input
                        inputMode="numeric"
                        value={form.voltageV || ""}
                        onChange={(e) => setForm((f) => ({ ...f, voltageV: e.target.value.replace(/[^\d]/g, "") }))}
                      />
                    </div>
                  </>
                )}
              </div>

              <div className="mt-6">
                <h3 className="mb-2 font-semibold text-[#0f766e]">Tiêu đề tin & mô tả</h3>

                <div className="flex flex-col gap-1">
                  <Label className="text-[#0f766e]">Tiêu đề<Required /></Label>
                  <Input
                    maxLength={MAX_TITLE}
                    placeholder="VD: VinFast VF8 bản Plus 2023"
                    value={form.title}
                    onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                  />
                </div>

                <div className="mt-1 text-xs text-gray-500">{titleLeft}/50 kí tự</div>

                <div className="mt-3 flex flex-col gap-1">
                  <Label className="text-[#0f766e]">Mô tả<Required /></Label>
                  <Textarea
                    maxLength={MAX_DESC}
                    rows={6}
                    placeholder={`- Tình trạng, bảo hành\n- Lý do bán, thời gian sử dụng\n- Phụ kiện đi kèm…`}
                    value={form.description}
                    onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                  />
                </div>

                <div className="text-xs text-gray-500">{descLeft}/1500 kí tự</div>

                {/* ---- GIÁ (nhập tay hoặc bấm AI ở góc) ---- */}
                <div className="mt-4 flex flex-col gap-1">
                  <div className="flex items-center justify-between">
                    <Label className="text-[#0f766e]">Giá (VND)<Required /></Label>
                  </div>

                  <Input
                    placeholder="VD: 400.000.000"
                    inputMode="numeric"
                    value={form.price}
                    onChange={(e) => {
                      const v = e.target.value;
                      const formatted = formatVNDInput(v);
                      setForm((f) => ({ ...f, price: formatted }));
                    }}
                  />
                </div>
              </div>

              {/* Địa chỉ */}
              <div className="mt-2">
                <h3 className="mb-2 font-semibold text-[#0f766e]">Địa chỉ <Required/></h3>
                <AddressPicker
                  addr={addr}
                  addressDetail={form.addressDetail}
                  onAddressDetailChange={(v) => setForm((f) => ({ ...f, addressDetail: v }))}
                />
              </div>

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
    </>
  );
}
