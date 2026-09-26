import { fetchClient } from './fetchClient';

export type AdminOrderStatus = 'PENDING' | 'APPROVED';

export type AdminOrderSort = 'latest' | 'lowPrice' | 'highPrice';

export type AdminOrderRequester = {
  id: number;
  name: string;
};

export type AdminOrderHandler = {
  id: number;
  name: string;
} | null;

export type AdminOrderListItem = {
  id: number;
  createdAt: string;
  representativeProductName: string;
  totalItemCount: number;
  totalPrice: number;
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'CANCELED';
  requester: AdminOrderRequester;
  handler: AdminOrderHandler;
};

export type AdminOrderListResponse = {
  items: AdminOrderListItem[];
  totalCount: number;
  totalPages: number;
  page: number;
};

export type AdminOrderDetailItem = {
  productId: number;
  productName: string;
  imageUrl: string;
  priceAtOrder: number;
  quantity: number;
  subtotal: number;
};

export type AdminOrderDetail = {
  id: number;
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'CANCELED';
  itemsTotal: number;
  deliveryFee: number;
  totalPrice: number;
  requestMessage: string;
  responseMessage: string | null;
  requester: AdminOrderRequester;
  handler: AdminOrderHandler;
  createdAt: string;
  updatedAt: string;
  items: AdminOrderDetailItem[];
};

export type AdminOrderActionResponse = {
  id: number;
  status: 'APPROVED' | 'REJECTED';
};

export type AdminOrderListParams = {
  status?: AdminOrderStatus;
  sort?: AdminOrderSort;
  page?: number;
  limit?: number;
};

export type AdminOrderResponseMessage = {
  responseMessage: string;
};

export async function getAdminOrders(
  params?: AdminOrderListParams,
): Promise<AdminOrderListResponse> {
  const searchParams = new URLSearchParams();

  if (params?.status) {
    searchParams.set('status', params.status);
  }

  if (params?.sort) {
    searchParams.set('sort', params.sort);
  }

  if (params?.page !== undefined) {
    searchParams.set('page', String(params.page));
  }

  if (params?.limit !== undefined) {
    searchParams.set('limit', String(params.limit));
  }

  const query = searchParams.toString();

  return fetchClient<AdminOrderListResponse>(
    `/admin/orders${query ? `?${query}` : ''}`,
  );
}

export async function getAdminOrder(
  orderId: number,
): Promise<AdminOrderDetail> {
  return fetchClient<AdminOrderDetail>(`/admin/orders/${orderId}`);
}

export async function approveAdminOrder(
  orderId: number,
  data: AdminOrderResponseMessage,
): Promise<AdminOrderActionResponse> {
  return fetchClient<AdminOrderActionResponse>(
    `/admin/orders/${orderId}/approve`,
    {
      method: 'PATCH',
      body: JSON.stringify(data),
    },
  );
}

export async function rejectAdminOrder(
  orderId: number,
  data: AdminOrderResponseMessage,
): Promise<AdminOrderActionResponse> {
  return fetchClient<AdminOrderActionResponse>(
    `/admin/orders/${orderId}/reject`,
    {
      method: 'PATCH',
      body: JSON.stringify(data),
    },
  );
}
