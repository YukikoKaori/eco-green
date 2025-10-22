import { Link } from "react-router-dom";
import { Phone } from "lucide-react";

export default function RowListing({
  id, to, img, title, price, subtitleLeft, subtitleRight, seller, address,
}: {
  id: string;
  to: string;
  img: string;
  title: string;
  price: string;
  subtitleLeft?: string;
  subtitleRight?: string;
  seller?: string;
  address?: string;
}) {
  return (
    <Link to={to} className="block rounded-lg border hover:shadow-sm">
      <div className="grid grid-cols-[140px_1fr_44px] gap-3 p-3 items-center">
        <div className="w-[140px] h-[100px] rounded-md overflow-hidden bg-slate-100">
          <img src={img} alt={title} className="w-full h-full object-cover" loading="lazy" />
        </div>

        <div className="min-w-0">
          <div className="text-[15px] font-semibold line-clamp-1">{title}</div>
          <div className="text-[#d4205b] font-bold mt-1">{price}</div>
          <div className="flex gap-2 text-xs text-slate-500 mt-1">
            {subtitleLeft && <span>{subtitleLeft}</span>}
            {subtitleRight && <span>• {subtitleRight}</span>}
          </div>
          <div className="flex gap-2 text-xs text-slate-600 mt-1">
            {seller && <span className="font-medium">{seller}</span>}
            {address && <span>• {address}</span>}
          </div>
        </div>

        <div className="flex justify-end">
          <button
            className="w-10 h-10 rounded-md border flex items-center justify-center hover:bg-slate-50"
            title="Hiện số"
            onClick={(e) => { e.preventDefault();  }}
          >
            <Phone className="w-4 h-4" />
          </button>
        </div>
      </div>
    </Link>
  );
}
