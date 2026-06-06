import { authMiddleware } from "@repo/auth/tanstack/middleware";
import { createServerFn } from "@tanstack/react-start";
import { AwsClient } from "aws4fetch";

export const $getPresignedUrl = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .inputValidator((data: { contentType: string }) => data)
  .handler(async ({ data }) => {
    const accountId = process.env.R2_ACCOUNT_ID;
    const accessKeyId = process.env.R2_ACCESS_KEY_ID;
    const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY;
    const bucketName = process.env.R2_BUCKET_NAME;
    const publicUrl = process.env.R2_PUBLIC_URL;
    const folderName = process.env.R2_FOLDER_NAME || "auction-it";

    if (
      !accountId ||
      !accessKeyId ||
      !secretAccessKey ||
      !bucketName ||
      !publicUrl ||
      !folderName
    ) {
      throw new Error("Missing R2 configuration in server environment variables.");
    }

    // Initialize the lightweight edge-native AWS client
    const aws = new AwsClient({
      accessKeyId,
      secretAccessKey,
      service: "s3",
      region: "auto",
    });

    // Always use .webp extension since we convert on the client side
    const fileName = `${folderName}/${crypto.randomUUID()}.webp`;

    // Construct the target S3 URL
    const s3Url = `https://${accountId}.r2.cloudflarestorage.com/${bucketName}/${fileName}`;

    // Generate a presigned PUT request url valid for 1 hour (3600s)
    const signedRequest = await aws.sign(s3Url, {
      method: "PUT",
      headers: { "Content-Type": data.contentType || "image/webp" },
      aws: { signQuery: true, allHeaders: true },
    });

    const finalUrl = `${publicUrl}/${fileName}`;

    // Extract the fully signed URL containing the credentials query parameters
    return { uploadUrl: signedRequest.url, finalUrl };
  });
