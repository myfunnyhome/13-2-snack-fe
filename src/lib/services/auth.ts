const SIGNOUT_PATH = '/auth/signout';

export async function signOut(): Promise<void> {
  const baseUrl = process.env.NEXT_PUBLIC_API_URL;

  if (!baseUrl) {
    return;
  }

  await fetch(`${baseUrl}${SIGNOUT_PATH}`, {
    method: 'POST',
    credentials: 'include',
  }).catch(() => undefined);
}
