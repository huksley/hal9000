import { fetchWithTimeout } from "./fetchWithTimeout";
import { hash } from "./hash";
import { okstatus } from "./okstatus";
import { Upload } from "@aws-sdk/lib-storage";
import { S3, CompleteMultipartUploadCommandOutput } from "@aws-sdk/client-s3";

const s3 = new S3({ apiVersion: "2006-03-01" });

// Cache image from url to s3
export const cacheImage = async (url: string, prefix?: string) => {
  if (!process.env.S3_BUCKET) {
    throw new Error("S3_BUCKET not set");
  }

  const { contentType, buffer } = await fetchWithTimeout(url)
    .then(okstatus)
    .then(async (r) => ({
      contentType: r.headers.get("Content-Type") || "image/png",
      buffer: await r.arrayBuffer(),
    }));

  const ext = contentType.split("/")[1];
  const key = [process.env.S3_PREFIX, prefix, hash(url) + "." + ext].filter((v) => !!v).join("/");

  console.info("Writing", process.env.S3_BUCKET, key);
  const upload = new Upload({
    params: {
      Bucket: process.env.S3_BUCKET,
      Key: key,
      Body: Buffer.from(buffer),
      ContentType: contentType ?? "image/png",
      ACL: "public-read",
      CacheControl: "public, max-age=" + 365 * 24 * 60 * 60 + ", immutable",
    },
    client: s3,
    queueSize: 3,
  });

  const uploaded = (await upload.done()) as CompleteMultipartUploadCommandOutput;
  if (uploaded.Location) {
    console.info("Cached in S3", uploaded.Location);
    return uploaded.Location;
  } else {
    console.warn("Upload failed", uploaded);
    throw new Error("Upload failed: " + url);
  }
};
