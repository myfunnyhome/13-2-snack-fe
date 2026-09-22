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
  });
}
