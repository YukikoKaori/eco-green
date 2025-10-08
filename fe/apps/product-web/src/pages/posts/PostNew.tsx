// src/pages/posts/PostNew.tsx
import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/contexts/AuthContext";
import { Image as ImageIcon, Trash2, Star, Info } from "lucide-react";

type Category = "xe_dien" | "pin_dien";
type ImgItem = { file: File; url: string; cover?: boolean };

type FormState = {
  category: Category;
  brand: string;
  title: string;
  description: string;
  price: string;
  address: string;

  /* Xe điện */
  year?: string;
  odoKm?: string;

  /* Pin điện */
  pinType?: string;
  capacityWh?: string;
  voltage?: string;

  /* Mở rộng cho xe điện */
  origin?: string;
  bodyType?: string;
  seats?: string;
  color?: string;
  plate?: string;
  owners?: string;
};

const MAX_IMAGES = 10;
const MIN_IMAGES = 1;
const MAX_TITLE = 50;
const MAX_DESC = 1500;

const BRANDS = ["VinFast", "Yadea", "Gogoro", "Honda", "Xiaomi", "Dat Bike", "Khác"];
const PIN_TYPES = ["LFP (LiFePO₄)", "NMC", "NCA", "Lead Acid", "Khác"];

/** Fake API: tạo tin, trả về id để điều hướng sang trang Notice */
async function createListing(form: FormState, images: File[]) {
  // Ở bản thật: gọi API backend, truyền FormData
  const fd = new FormData();
  Object.entries(form).forEach(([k, v]) => v != null && fd.append(k, String(v)));
  images.forEach((f) => fd.append("images", f));

  // Giả lập độ trễ
  await new Promise((r) => setTimeout(r, 600));

  // Giả lập thành công + id tin
  return { ok: true, id: crypto.randomUUID() };
}

export default function PostNew() {
  const { user } = useAuth();
  const nav = useNavigate();

  // ===== Hình ảnh =====
  const [imgs, setImgs] = useState<ImgItem[]>([]);
  const [dragOver, setDragOver] = useState(false);
  const fileRef = useRef<HTMLInputElement | null>(null);

  // ===== Form =====
  const [form, setForm] = useState<FormState>({
    category: "xe_dien",
    brand: "",
    title: "",
    description: "",
    price: "",
    address: user?.address || "",

    // xe điện
    year: "",
    odoKm: "",

    // pin điện
    pinType: "",
    capacityWh: "",
    voltage: "",

    // mở rộng
    origin: "",
    bodyType: "",
    seats: "",
    color: "",
    plate: "",
    owners: "",
  });

  const isXeDien = form.category === "xe_dien";
  const titleLeft = MAX_TITLE - (form.title?.length || 0);
  const descLeft = MAX_DESC - (form.description?.length || 0);

  const canSubmit = useMemo(() => {
    if (imgs.length < MIN_IMAGES) return false;
    if (!form.title || !form.brand || !form.price || !form.address) return false;
    if (isXeDien && (!form.year || !form.odoKm)) return false;
    if (!isXeDien && (!form.pinType || !form.capacityWh || !form.voltage)) return false;
    return true;
  }, [imgs.length, form, isXeDien]);

  // tự đặt ảnh đầu tiên làm bìa khi chưa chọn
  useEffect(() => {
    if (imgs.length && !imgs.some((i) => i.cover)) {
      setImgs((arr) => arr.map((it, idx) => ({ ...it, cover: idx === 0 })));
    }
  }, [imgs.length]);

  function pick() {
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

  // ===== Submit =====
  const [submitting, setSubmitting] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!canSubmit || submitting) return;

    setSubmitting(true);
    try {
      // Ưu tiên file ảnh bìa lên đầu
      const images = imgs
        .slice()
        .sort((a, b) => (a.cover ? -1 : 0) - (b.cover ? -1 : 0))
        .map((i) => i.file);

      const res = await createListing(form, images);

      if (res.ok) {
        // ✅ Điều hướng sang trang Notice ngay sau khi tạo tin
        nav(`/post/notice/${res.id}`, {
          state: {
            firstPostFree: true,       // ví dụ flag lần đầu
            postedDays: 60,            // ví dụ số ngày đăng
            startAt: new Date().toISOString(),
          },
          replace: true,
        });
      } else {
        alert("Có lỗi khi đăng tin.");
      }
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="container mx-auto max-w-6xl px-4 py-6">
      {/* TRÁI–PHẢI cố định; màn nhỏ kéo ngang */}
      <div className="overflow-x-auto bg-gray-100">
        <div className="min-w-[1120px] flex items-start gap-2">
          {/* LEFT: images */}
          <section className="sticky top-4 h-fit w-[460px] shrink-0 rounded-xl p-10 ">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">Hình ảnh sản phẩm</h2>
              <span className="inline-flex items-center gap-1 text-xs text-gray-500">
                <Info className="h-4 w-4" /> Đăng từ {String(MIN_IMAGES).padStart(2, "0")} đến {String(MAX_IMAGES).padStart(2, "0")} hình
              </span>
            </div>

            <div
              className={`mt-3 grid cursor-pointer place-content-center rounded-lg border-2 border-dashed p-5 text-center transition
              ${dragOver ? "border-[#0f766e] bg-teal-50" : "bg-white"}`}
              onDragOver={(e) => {
                e.preventDefault();
                setDragOver(true);
              }}
              onDragLeave={() => setDragOver(false)}
              onDrop={onDrop}
              onClick={pick}
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
            {/* Nhóm 1: Danh mục & Hãng */}
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-1">
                <Label>Danh mục</Label>
                <Select
                  value={form.category}
                  onValueChange={(v) => setForm((f) => ({ ...f, category: v as Category }))}
                >
                  <SelectTrigger className="relative z-10">
                    <SelectValue placeholder="Chọn danh mục" />
                  </SelectTrigger>
                  <SelectContent className="z-50">
                    <SelectItem value="xe_dien">Xe điện</SelectItem>
                    <SelectItem value="pin_dien">Pin điện</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex flex-col gap-1">
                <Label>Hãng</Label>
                <Select value={form.brand} onValueChange={(v) => setForm((f) => ({ ...f, brand: v }))}>
                  <SelectTrigger className="relative z-10">
                    <SelectValue placeholder="Chọn hãng" />
                  </SelectTrigger>
                  <SelectContent className="z-50">
                    {BRANDS.map((b) => (
                      <SelectItem key={b} value={b}>
                        {b}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Nhóm 2: khác nhau theo danh mục */}
            <div className="mt-4 grid grid-cols-2 gap-4">
              {isXeDien ? (
                <>
                  <div className="flex flex-col gap-1">
                    <Label>Năm sản xuất</Label>
                    <Input
                      placeholder="VD: 2022"
                      inputMode="numeric"
                      value={form.year}
                      onChange={(e) => setForm((f) => ({ ...f, year: e.target.value.replace(/\D/g, "") }))}
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <Label>Số km đã đi</Label>
                    <Input
                      placeholder="VD: 3500"
                      inputMode="numeric"
                      value={form.odoKm}
                      onChange={(e) => setForm((f) => ({ ...f, odoKm: e.target.value.replace(/\D/g, "") }))}
                    />
                  </div>
                </>
              ) : (
                <>
                  <div className="flex flex-col gap-1">
                    <Label>Loại pin</Label>
                    <Select value={form.pinType} onValueChange={(v) => setForm((f) => ({ ...f, pinType: v }))}>
                      <SelectTrigger className="relative z-10">
                        <SelectValue placeholder="Chọn loại pin" />
                      </SelectTrigger>
                      <SelectContent className="z-50">
                        {PIN_TYPES.map((p) => (
                          <SelectItem key={p} value={p}>
                            {p}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex flex-col gap-1">
                    <Label>Dung lượng (Wh/Ah)</Label>
                    <Input
                      placeholder="VD: 960 Wh"
                      value={form.capacityWh}
                      onChange={(e) => setForm((f) => ({ ...f, capacityWh: e.target.value }))}
                    />
                  </div>
                </>
              )}
            </div>

            {/* Nhóm 3 */}
            {isXeDien ? (
              <div className="mt-4 grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1">
                  <Label>Xuất xứ</Label>
                  <Input
                    placeholder="VD: Việt Nam / Nhập khẩu"
                    value={form.origin}
                    onChange={(e) => setForm((f) => ({ ...f, origin: e.target.value }))}
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <Label>Kiểu dáng</Label>
                  <Input
                    placeholder="VD: Scooter, Underbone…"
                    value={form.bodyType}
                    onChange={(e) => setForm((f) => ({ ...f, bodyType: e.target.value }))}
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <Label>Số chỗ</Label>
                  <Input
                    placeholder="VD: 2"
                    value={form.seats}
                    onChange={(e) => setForm((f) => ({ ...f, seats: e.target.value }))}
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <Label>Màu sắc</Label>
                  <Input
                    placeholder="VD: Xanh, Đen…"
                    value={form.color}
                    onChange={(e) => setForm((f) => ({ ...f, color: e.target.value }))}
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <Label>Biển số xe</Label>
                  <Input
                    placeholder="VD: 59A1-123.45"
                    value={form.plate}
                    onChange={(e) => setForm((f) => ({ ...f, plate: e.target.value }))}
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <Label>Số đời chủ</Label>
                  <Input
                    placeholder="VD: 1"
                    value={form.owners}
                    onChange={(e) => setForm((f) => ({ ...f, owners: e.target.value }))}
                  />
                </div>
              </div>
            ) : (
              <div className="mt-4 grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1">
                  <Label>Điện áp (V)</Label>
                  <Input
                    placeholder="VD: 48V / 60V"
                    value={form.voltage}
                    onChange={(e) => setForm((f) => ({ ...f, voltage: e.target.value }))}
                  />
                </div>
              </div>
            )}

            {/* Giá */}
            <div className="mt-4 grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-1">
                <Label>Giá (Triệu đồng)</Label>
                <Input
                  placeholder="VD: 15"
                  inputMode="numeric"
                  value={form.price}
                  onChange={(e) => setForm((f) => ({ ...f, price: e.target.value.replace(/[^\d.]/g, "") }))}
                />
              </div>
            </div>

            {/* Tiêu đề & mô tả */}
            <div className="mt-6">
              <h3 className="mb-2 font-semibold text-gray-800">Tiêu đề tin đăng và mô tả chi tiết</h3>

              <div className="flex flex-col gap-1">
                <Label>Tiêu đề tin đăng</Label>
                <Input
                  maxLength={MAX_TITLE}
                  placeholder="VD: Xe điện Dat Bike mới chạy 3.000km"
                  value={form.title}
                  onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                />
                <div className="text-xs text-gray-500">{titleLeft}/50 kí tự</div>
              </div>

              <div className="mt-3 flex flex-col gap-1">
                <Label>Mô tả chi tiết</Label>
                <Textarea
                  maxLength={MAX_DESC}
                  rows={6}
                  placeholder={`- Xuất xứ, tình trạng
- Lý do bán, thời gian sử dụng
- Phụ kiện, giấy tờ
- Chính sách bảo hành (nếu có)`}
                  value={form.description}
                  onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                />
                <div className="text-xs text-gray-500">{descLeft}/1500 kí tự</div>
              </div>
            </div>

            {/* Thông tin người bán */}
            <div className="mt-6">
              <h3 className="mb-2 font-semibold text-gray-800">Thông tin người bán</h3>
              <div className="flex flex-col gap-1">
                <Label>Địa chỉ</Label>
                <Input
                  placeholder="Số nhà, đường, phường/xã, quận/huyện, tỉnh/thành"
                  value={form.address}
                  onChange={(e) => setForm((f) => ({ ...f, address: e.target.value }))}
                />
              </div>
            </div>

            {/* Actions */}
            <div className="mt-6 flex flex-wrap justify-end gap-3">
              <Button type="button" variant="outline" onClick={() => window.history.back()}>
                Xem trước
              </Button>
              <Button type="button" variant="outline" onClick={() => alert("Đã lưu nháp (demo)")}>
                Lưu nháp
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
