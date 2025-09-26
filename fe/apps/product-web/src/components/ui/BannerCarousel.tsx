import { useEffect, useMemo, useState } from "react";

type Props = {
    images: string[];
    interval?: number;
    autoPlay?: boolean;
    heightClass?: string;
};

export default function BannerCarousel({
  images,
  interval = 5000,
  autoPlay = true,
  heightClass = "h-30 md:h40 lg:h-50",
}: Props) {
  const [index, setIndex] = useState(0);
  const total = images.length;
  const safeTotal = useMemo(() => Math.max(total, 1), [total]);

  useEffect(() => {
    if (!autoPlay || total <= 1) return;
    const id = setInterval(() => setIndex((i) => (i + 1) % safeTotal), interval);
    return () => clearInterval(id);
  }, [autoPlay, interval, safeTotal, total]);

  return (
    <div className={`relative w-full overflow-hidden rounded-xl shadow-lg ring-4 ring-white`}>
      {/* Track */}
      <div
        className="flex transition-transform duration-500"
        style={{ transform: `translateX(-${index * 100}%)` }}
      >
        {images.map((src, i) => (
          <div key={i} className={`min-w-full ${heightClass}`}>
            <img
              src={src}
              alt={`banner-${i + 1}`}
              className="w-full h-full object-cover"
              loading={i === 0 ? "eager" : "lazy"}
            />
          </div>
        ))}
      </div>

      {/* Dots */}
      {total > 1 && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
          {images.map((_, i) => {
            const active = i === index;
            return (
              <button
                key={i}
                type="button"
                onClick={() => setIndex(i)}
                aria-label={`Đi tới ảnh ${i + 1}`}
                className={`carousel-dot rounded-full transition-all ${
                  active ? "w-3 h-3 bg-white shadow" : "w-2.5 h-2.5 bg-white/60 hover:bg-white/80"
                }`}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}
