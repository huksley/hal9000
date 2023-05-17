import { JWT } from "google-auth-library";

/**
 * Make a Gaxios client for Google Cloud APIs from a service account email and private key.
 *
 * @param email
 * @param privateKey
 * @returns
 */
export const makeGaxiosClient = (email: string, privateKey: string) => {
  const client = new JWT({
    email: email,
    key: privateKey,
    scopes: ["https://www.googleapis.com/auth/cloud-platform"],
  });
  return client;
};
