import { Button } from "@repo/ui/components/button";
import { Loader2Icon, UploadCloudIcon, XIcon, ImageIcon } from "lucide-react";
import { useState, useRef } from "react";
import { toast } from "sonner";

import { convertToWebP } from "#/lib/image-utils";
import { $getPresignedUrl } from "#/lib/s3-actions";

interface ImageUploadProps {
  id?: string;
  value: string;
  onChange: (url: string) => void;
  className?: string;
}

async function performUpload(
  file: File,
  setIsUploading: (val: boolean) => void,
  onChange: (url: string) => void,
) {
  if (!file.type.startsWith("image/")) {
    toast.error("Please select a valid image file.");
    return;
  }

  try {
    setIsUploading(true);

    // 1. Convert to WebP locally
    toast.info("Optimizing image (converting to WebP)...");
    const webpBlob = await convertToWebP(file);

    // 2. Get Presigned URL
    toast.info("Requesting secure upload link…");
    const { uploadUrl, finalUrl } = await $getPresignedUrl({
      data: { contentType: "image/webp" },
    });

    // 3. Upload to R2 directly
    toast.info("Uploading to cloud storage…");
    const uploadResponse = await fetch(uploadUrl, {
      method: "PUT",
      body: webpBlob,
      headers: {
        "Content-Type": "image/webp",
      },
    });

    if (!uploadResponse.ok) {
      throw new Error(`Upload failed: ${uploadResponse.statusText}`);
    }

    // 4. Set final URL in parent form
    toast.success("Image uploaded successfully!");
    onChange(finalUrl);
    setIsUploading(false);
  } catch (err: any) {
    console.error("Upload error:", err);
    toast.error(err.message || "Failed to upload image.");
    setIsUploading(false);
  }
}

export function ImageUpload({ id, value, onChange, className = "" }: ImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Reset input so the same file can be selected again if needed
    if (inputRef.current) inputRef.current.value = "";

    await performUpload(file, setIsUploading, onChange);
  };

  return (
    <div className={`relative flex flex-col gap-2 ${className}`}>
      {value ? (
        <div className="group relative flex aspect-square w-full max-w-[150px] items-center justify-center overflow-hidden rounded-none border border-[#3c3c3c] bg-neutral-950">
          <img src={value} alt="Uploaded preview" className="size-full object-cover" />
          <div className="absolute inset-0 flex items-center justify-center gap-2 bg-neutral-950/60 opacity-0 transition-opacity group-hover:opacity-100">
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              className="bg-white p-2 text-black hover:bg-gray-200"
              title="Change Image"
            >
              <UploadCloudIcon className="size-4" />
            </button>
            <button
              type="button"
              onClick={() => onChange("")}
              className="bg-red-600 p-2 text-white hover:bg-red-700"
              title="Remove Image"
            >
              <XIcon className="size-4" />
            </button>
          </div>
          {isUploading && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-neutral-950/80">
              <Loader2Icon className="mb-2 size-6 animate-spin text-white" />
              <span className="text-[10px] font-bold tracking-wider text-white uppercase">
                Uploading
              </span>
            </div>
          )}
        </div>
      ) : (
        <Button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={isUploading}
          variant="outline"
          className="flex aspect-square w-full max-w-[150px] flex-col items-center justify-center gap-2 rounded-none border border-dashed border-[#3c3c3c] bg-[#1a1a1a] text-[#bbbbbb] transition-colors hover:bg-[#2a2a2a] hover:text-white"
        >
          {isUploading ? (
            <>
              <Loader2Icon className="mb-1 size-6 animate-spin" />
              <span className="text-[10px] font-bold tracking-wider uppercase">Uploading…</span>
            </>
          ) : (
            <>
              <ImageIcon className="mb-1 size-6" />
              <span className="text-[10px] font-bold tracking-wider uppercase">Upload Image</span>
            </>
          )}
        </Button>
      )}

      <input
        id={id}
        ref={inputRef}
        type="file"
        aria-label="Upload image"
        accept="image/png, image/jpeg, image/jpg, image/webp"
        className="hidden"
        onChange={handleFileChange}
      />
    </div>
  );
}
