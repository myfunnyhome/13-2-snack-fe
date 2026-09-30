import { cookies } from 'next/headers';

export async function checkAuth(): Promise<boolean> {
  const cookieStore = await cookies();

  return Boolean(cookieStore.get('accessToken')?.value);
}

export async function checkAuthWithRefresh(): Promise<boolean> {
  const cookieStore = await cookies();

  const accessToken = cookieStore.get('accessToken')?.value;
  const refreshToken = cookieStore.get('refreshToken')?.value;

  return Boolean(accessToken ?? refreshToken);
}
