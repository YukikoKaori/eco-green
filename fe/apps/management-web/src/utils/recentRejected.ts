// src/utils/recentRejected.ts
export type RejectedItem = any; // hoặc PendingProduct nếu bạn muốn typed

const KEY = "recent_rejected_posts";

export function pushRecentRejected(item: RejectedItem) {
  try {
    const raw = localStorage.getItem(KEY);
    const arr = raw ? JSON.parse(raw) as RejectedItem[] : [];
    // đẩy lên đầu, tránh trùng id
    const next = [item, ...arr.filter(x => (x.id || x.productId) !== (item.id || item.productId))].slice(0, 50);
    localStorage.setItem(KEY, JSON.stringify(next));
  } catch {}
}

export function getRecentRejected(): RejectedItem[] {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function clearRecentRejected() {
  localStorage.removeItem(KEY);
}
