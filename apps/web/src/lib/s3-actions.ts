import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { authMiddleware } from "@repo/auth/tanstack/middleware";
import { createServerFn } from "@tanstack/react-start";

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

    const s3Client = new S3Client({
      region: "auto",
      endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
      credentials: {
        accessKeyId,
        secretAccessKey,
      },
    });

    // Always use .webp extension since we convert on the client side
    const fileName = `${process.env.R2_FOLDER_NAME}/${crypto.randomUUID()}.webp`;

    const command = new PutObjectCommand({
      Bucket: bucketName,
      Key: fileName,
      ContentType: data.contentType || "image/webp",
    });

    const uploadUrl = await getSignedUrl(s3Client, command, { expiresIn: 3600 });
    const finalUrl = `${publicUrl}/${fileName}`;

    return { uploadUrl, finalUrl };
  });
