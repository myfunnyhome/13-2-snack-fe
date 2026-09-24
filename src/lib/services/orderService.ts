import { fetchClient } from '@/lib/services/fetchClient';

export type CreateOrderItem = {
  cartItemId: number;
  quantity: number;
};

export type CreateOrderInput = {
  items: CreateOrderItem[];
  requestMessage?: string;
};

export type CreateOrderResult = {
  id: number;
};

export async function createOrder(
  input: CreateOrderInput,
): Promise<CreateOrderResult> {
  return fetchClient<CreateOrderResult>('/orders', {
    method: 'POST',
    body: JSON.stringify(input),
export type MyOrderStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'CANCELED';

export type MyOrderSort = 'latest' | 'lowPrice' | 'highPrice' | '';

export type MyOrder = {
  id: number;
  createdAt: string;
  representativeProductName: string;
  totalItemCount: number;
  totalPrice: number;
  status: MyOrderStatus;
};

export type MyOrdersResponse = {
  items: MyOrder[];
  totalCount: number;
  totalPages: number;
  page: number;
};

export type GetMyOrdersParams = {
  sort?: MyOrderSort;
  page?: number;
  limit?: number;
};

export type MyOrderDetailItem = {
  productId: number;
  productName: string;
  imageUrl: string;
  priceAtOrder: number;
  quantity: number;
  subtotal: number;
};

export type MyOrderDetail = {
  id: number;
  status: MyOrderStatus;
  itemsTotal: number;
  deliveryFee: number;
  totalPrice: number;
  requestMessage: string;
  responseMessage: string;
  requester: {
    id: number;
    name: string;
  };
  handler: {
    id: number;
    name: string;
  };
  createdAt: string;
  updatedAt: string;
  items: MyOrderDetailItem[];
};

export type CancelMyOrderResponse = {
  id: number;
  status: 'CANCELED';
};

//GET /me/orders
export async function getMyOrders(
  params?: GetMyOrdersParams,
): Promise<MyOrdersResponse> {
  const searchParams = new URLSearchParams();

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

  return fetchClient<MyOrdersResponse>(`/me/orders${query ? `?${query}` : ''}`);
}

// GET /me/orders/:id
export async function getMyOrder(id: number): Promise<MyOrderDetail> {
  return fetchClient<MyOrderDetail>(`/me/orders/${id}`);
}

//DELETE /me/orders/:id
export async function cancelMyOrder(
  id: number,
): Promise<CancelMyOrderResponse> {
  return fetchClient<CancelMyOrderResponse>(`/me/orders/${id}`, {
    method: 'DELETE',
  });
}
