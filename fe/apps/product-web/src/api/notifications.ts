import api from "@/lib/axios";

export type NotificationDTO = {
  id: string;
  title: string;
  content: string;
  type: string;     
  refId?: string;   
  createdAt: string;
  read: boolean;
};

export type NotificationPage = {
  content: NotificationDTO[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
};

export async function listMemberNotifications(params?: {
  page?: number;
  size?: number;
}) {
  const { page = 0, size = 20 } = params || {};
  const { data } = await api.get<NotificationPage>("/member/notifications", {
    params: { page, size },
  });
  return data;
}

export async function markNotificationRead(id: string) {
  const { data } = await api.patch<{
    message: string;
    notification: NotificationDTO;
  }>(`/member/notifications/${id}/read`);
  return data;
}

export async function getUnreadNotificationCount() {
  const { data } = await api.get<{ unreadCount: number }>(
    "/member/notifications/unread-count"
  );
  return data;
}

export async function markAllNotificationsRead() {
  const { data } = await api.patch<{
    updatedCount: number;
    message: string;
  }>("/member/notifications/read-all");
  return data;
}

export async function deleteNotification(id: string) {
  const { data } = await api.delete<{
    message: string;
    success: boolean;
  }>(`/member/notifications/${id}`);
  return data;
}

export async function deleteAllNotifications(force = true) {
  const { data } = await api.delete<{
    success: boolean;
    deletedCount: number;
    message: string;
  }>("/member/notifications/all", {
    params: { force },
  });
  return data;
}
