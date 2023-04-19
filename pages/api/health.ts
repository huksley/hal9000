import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    return res.status(true ? 200 : 500).json({ ok: true });
  } catch (e) {
    console.warn("Health failed", e);
    return res.status(500).json({ ok: false });
  }
}
