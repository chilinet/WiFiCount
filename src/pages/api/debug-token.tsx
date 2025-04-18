// pages/api/debug-token.ts
import { getToken } from "next-auth/jwt";
import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  console.log('Decoded token:', token);
  res.status(200).json(token);
}