import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { Listing } from "../types";

export default function ListingCard({ item }: { item: Listing }) {
  return (
    <Card className="hover:shadow-lg transition">
      <div className="aspect-video w-full overflow-hidden rounded-t-xl bg-muted">
        {item.thumbnail ? (
          <img
            src={item.thumbnail}
            alt={item.title}
            className="h-full w-full object-cover"
          />
        ) : null}
      </div>
      <CardHeader className="pb-2">
        <CardTitle className="line-clamp-2 text-base">{item.title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-1 text-sm text-muted-foreground">
        <div className="text-rose-600 font-semibold text-lg">
          {item.price.toLocaleString()} đ
        </div>
        <div className="flex gap-3">
          {item.distance && <span>{item.distance}</span>}
          {item.location && <span>• {item.location}</span>}
        </div>
      </CardContent>
    </Card>
  );
}
