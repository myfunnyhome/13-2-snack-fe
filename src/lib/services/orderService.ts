import { fetchClient } from './fetchClient';

export type OrderStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'CANCELED';

export type OrderDetailItem = {
  productId: number;
  productName: string;
  imageUrl: string | null;
  priceAtOrder: number;
  quantity: number;
  subtotal: number;
};

export type OrderDetail = {
  id: number;
  status: OrderStatus;
  itemsTotal: number;
  deliveryFee: number;
  totalPrice: number;
  requestMessage: string | null;
  responseMessage: string | null;
  requester: { id: number; name: string };
  handler: { id: number; name: string } | null;
  createdAt: string;
  updatedAt: string;
  items: OrderDetailItem[];
};

export function getOrderDetail(id: number | string): Promise<OrderDetail> {
  return fetchClient<OrderDetail>(`/admin/orders/${id}`);
}

export type OrderDecisionInput = {
  responseMessage: string;
};

export type OrderDecisionResult = {
  id: number;
  status: OrderStatus;
};

export function approveOrder(
  id: number | string,
  data: OrderDecisionInput,
): Promise<OrderDecisionResult> {
  return fetchClient<OrderDecisionResult>(`/admin/orders/${id}/approve`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  });
}

export function rejectOrder(
  id: number | string,
  data: OrderDecisionInput,
): Promise<OrderDecisionResult> {
  return fetchClient<OrderDecisionResult>(`/admin/orders/${id}/reject`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  });
}
