const MAX_IMAGE_EDGE = 1600;

/** Downscale photos before upload. This reduces slow admin uploads and the bytes
 * every visitor later downloads, while preserving GIFs and small images. */
export async function optimizeImageForUpload(file: File): Promise<File> {
  if (!file.type.startsWith("image/") || file.type === "image/gif" || file.size < 350 * 1024) return file;

  const source = await createImageBitmap(file);
  const scale = Math.min(1, MAX_IMAGE_EDGE / Math.max(source.width, source.height));
  if (scale === 1 && file.type === "image/webp") { source.close(); return file; }

  const canvas = document.createElement("canvas");
  canvas.width = Math.max(1, Math.round(source.width * scale));
  canvas.height = Math.max(1, Math.round(source.height * scale));
  canvas.getContext("2d")?.drawImage(source, 0, 0, canvas.width, canvas.height);
  source.close();

  const type = file.type === "image/png" ? "image/png" : "image/webp";
  const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, type, 0.82));
  if (!blob || blob.size >= file.size) return file;
  const extension = type === "image/png" ? "png" : "webp";
  return new File([blob], file.name.replace(/\.[^.]+$/, `.${extension}`), { type, lastModified: file.lastModified });
}
