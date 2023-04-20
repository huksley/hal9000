import { cacheImage } from "@/components/cacheFile";
import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const url =
      (req.query.url as string) ??
      "https://oaidalleapiprodscus.blob.core.windows.net/private/org-CNX8L2yy8ZmvGAJiicBEbZc2/user-RvI5nXgujytQf2zesXSjqQgE/img-xjPTkSvC0xbFiOX941f16RZk.png?st=2023-04-20T05%3A36%3A41Z&se=2023-04-20T07%3A36%3A41Z&sp=r&sv=2021-08-06&sr=b&rscd=inline&rsct=image/png&skoid=6aaadede-4fb3-4698-a8f6-684d7786b067&sktid=a48cca56-e6da-484e-a814-9c849652bcb3&skt=2023-04-20T05%3A04%3A18Z&ske=2023-04-21T05%3A04%3A18Z&sks=b&skv=2021-08-06&sig=h7Ydhiga%2BE04pz/2ESPcxhgIHRCAKbxDIiBClOA2IOo%3D";
    if (url) {
      const cachedUrl = await cacheImage(url, "test");
      console.info("Uploaded as " + cachedUrl);
      return res.status(200).json({ ok: true, url: cachedUrl });
    }
    return res.status(true ? 200 : 500).json({ ok: true });
  } catch (e) {
    console.warn("Health failed", e);
    return res.status(500).json({ ok: false });
  }
}
