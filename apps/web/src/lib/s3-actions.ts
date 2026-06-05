import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { authMiddleware } from "@repo/auth/tanstack/middleware";
import { createServerFn } from "@tanstack/react-start";
import { v4 as uuidv4 } from "uuid";

const getS3Client = () => {
  const accountId = process.env.R2_ACCOUNT_ID;
  const accessKeyId = process.env.R2_ACCESS_KEY_ID;
  const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY;

  if (!accountId || !accessKeyId || !secretAccessKey) {
    throw new Error("Missing R2 credentials in server environment variables.");
  }

  return new S3Client({
    region: "auto",
    endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
    credentials: {
      accessKeyId,
      secretAccessKey,
    },
  });
};

export const $getPresignedUrl = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .inputValidator((data: { contentType: string }) => data)
  .handler(async ({ data }) => {
    const bucketName = process.env.R2_BUCKET_NAME;
    const publicUrl = process.env.R2_PUBLIC_URL;

    if (!bucketName || !publicUrl) {
      throw new Error("Missing R2 bucket configuration in server environment variables.");
    }

    const s3Client = getS3Client();

    // Always use .webp extension since we convert on the client side
    const fileName = `${uuidv4()}.webp`;

    const command = new PutObjectCommand({
      Bucket: bucketName,
      Key: fileName,
      ContentType: data.contentType || "image/webp",
    });

    const uploadUrl = await getSignedUrl(s3Client, command, { expiresIn: 3600 });
    const finalUrl = `${publicUrl}/${fileName}`;

    return { uploadUrl, finalUrl };
  });
