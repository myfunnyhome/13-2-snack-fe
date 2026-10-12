import { fetchClient } from '@/lib/services/fetchClient';

export type SnackySource = {
  documentId: string;
  section: string;
};

export type SnackyAnswer = {
  answer: string;
  sources: SnackySource[];
};

export async function askSnacky(question: string): Promise<SnackyAnswer> {
  return fetchClient<SnackyAnswer>('/snacky/answers', {
    method: 'POST',
    body: JSON.stringify({ question }),
  });
}
