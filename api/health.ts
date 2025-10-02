import type { VercelRequest, VercelResponse } from '@vercel/node';
import { setCors } from './_lib/cors';

export default function handler(req: VercelRequest, res: VercelResponse) {
  setCors(res);
  if (req.method === 'OPTIONS') return res.status(200).end();
  res.status(200).json({ status: 'ok' });
}
