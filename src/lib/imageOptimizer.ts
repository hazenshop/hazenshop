export interface CompressionResult {
  file: File;
  blob: Blob;
  dataUrl: string;
  originalSizeBytes: number;
  compressedSizeBytes: number;
  savedBytes: number;
  percentSaved: number;
  width: number;
  height: number;
}

export function formatBytes(bytes: number, decimals: number = 1): string {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + " " + sizes[i];
}

/**
 * Optimizes and converts any image file (PNG, JPG, HEIC, etc.) to WebP format
 * with dimension capping (default max 1600px) and quality compression.
 */
export async function optimizeAndConvertToWebP(
  file: File,
  options: {
    maxDimension?: number;
    quality?: number; // 0.1 to 1.0 (default 0.82)
    outputFileName?: string;
  } = {}
): Promise<CompressionResult> {
  const { maxDimension = 1600, quality = 0.82, outputFileName } = options;
  const originalSizeBytes = file.size;

  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        let width = img.width;
        let height = img.height;

        // Smart Aspect Ratio Scaling
        if (width > maxDimension || height > maxDimension) {
          if (width > height) {
            height = Math.round((height * maxDimension) / width);
            width = maxDimension;
          } else {
            width = Math.round((width * maxDimension) / height);
            height = maxDimension;
          }
        }

        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");

        if (!ctx) {
          reject(new Error("Unable to create 2D canvas context"));
          return;
        }

        // High quality rendering
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = "high";
        ctx.drawImage(img, 0, 0, width, height);

        // Convert to WebP Data URL
        const dataUrl = canvas.toDataURL("image/webp", quality);

        canvas.toBlob(
          (blob) => {
            if (!blob) {
              reject(new Error("Canvas to WebP Blob conversion failed"));
              return;
            }

            const cleanBaseName = file.name
              .replace(/\.[^/.]+$/, "")
              .toLowerCase()
              .replace(/[^a-z0-9_-]+/g, "-");

            const finalName = outputFileName || `${cleanBaseName}-${Date.now()}.webp`;
            const compressedFile = new File([blob], finalName, {
              type: "image/webp",
              lastModified: Date.now(),
            });

            const compressedSizeBytes = blob.size;
            const savedBytes = Math.max(0, originalSizeBytes - compressedSizeBytes);
            const percentSaved =
              originalSizeBytes > 0
                ? Math.round(((originalSizeBytes - compressedSizeBytes) / originalSizeBytes) * 100)
                : 0;

            resolve({
              file: compressedFile,
              blob,
              dataUrl,
              originalSizeBytes,
              compressedSizeBytes,
              savedBytes,
              percentSaved: Math.max(0, percentSaved),
              width,
              height,
            });
          },
          "image/webp",
          quality
        );
      };

      img.onerror = () => reject(new Error("Failed to load image for compression"));
      img.src = e.target?.result as string;
    };

    reader.onerror = () => reject(new Error("Failed to read file"));
    reader.readAsDataURL(file);
  });
}
