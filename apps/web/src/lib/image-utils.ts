/**
 * Converts an image File to a WebP Blob.
 * This reads the file, draws it onto an off-screen canvas (scaling down if too large),
 * and exports it as a 'image/webp' blob.
 *
 * @param file The original image File (e.g. PNG, JPEG)
 * @param maxWidth The maximum width for the image
 * @param maxHeight The maximum height for the image
 * @param quality WebP compression quality (0 to 1)
 * @returns A Promise that resolves to the WebP Blob
 */
export async function convertToWebP(
  file: File,
  maxWidth = 1024,
  maxHeight = 1024,
  quality = 0.85,
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = (err) => reject(err);
    reader.onload = (event) => {
      const img = new Image();
      img.onerror = (err) => reject(err);
      img.onload = () => {
        let width = img.width;
        let height = img.height;

        // Calculate aspect ratio while ensuring max dimensions are not exceeded
        if (width > maxWidth || height > maxHeight) {
          const ratio = Math.min(maxWidth / width, maxHeight / height);
          width = Math.round(width * ratio);
          height = Math.round(height * ratio);
        }

        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext("2d");
        if (!ctx) {
          return reject(new Error("Failed to get 2d canvas context."));
        }

        ctx.drawImage(img, 0, 0, width, height);

        canvas.toBlob(
          (blob) => {
            if (blob) {
              resolve(blob);
            } else {
              reject(new Error("Canvas toBlob returned null."));
            }
          },
          "image/webp",
          quality,
        );
      };

      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  });
}
