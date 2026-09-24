import { fetchClient } from './fetchClient';

export type OrderStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'CANCELED';

export type OrderListSort = 'latest' | 'lowPrice' | 'highPrice';

export type OrderListItem = {
  id: number;
  createdAt: string;
  representativeProductName: string;
  totalItemCount: number;
  totalPrice: number;
  status: OrderStatus;
  requester: { id: number; name: string };
  handler: { id: number; name: string } | null;
};

export type OrderListResult = {
  items: OrderListItem[];
  totalCount: number;
  totalPages: number;
  page: number;
};

export type OrgOrderListParams = {
  status: 'PENDING' | 'APPROVED';
  sort?: OrderListSort;
  page?: number;
  limit?: number;
};

export function getOrgOrders(
  params: OrgOrderListParams,
): Promise<OrderListResult> {
  const query = new URLSearchParams({
    status: params.status,
    ...(params.sort && { sort: params.sort }),
    ...(params.page && { page: String(params.page) }),
    ...(params.limit && { limit: String(params.limit) }),
  });

  return fetchClient<OrderListResult>(`/admin/orders?${query.toString()}`);
}

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
