"use client";

import { supabase } from "@/lib/supabase";
import type { GalleryType } from "@/types";

const IMAGE_MAX_SIZE = 1600;
const PROFILE_MAX_SIZE = 900;
const WEBP_QUALITY = 0.82;

function safeName(name: string) {
  return name
    .replace(/\.[^.]+$/, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 48) || "upload";
}

async function imageToWebp(file: File, maxSize = IMAGE_MAX_SIZE) {
  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, maxSize / Math.max(bitmap.width, bitmap.height));
  const width = Math.max(1, Math.round(bitmap.width * scale));
  const height = Math.max(1, Math.round(bitmap.height * scale));
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas tidak tersedia.");
  ctx.drawImage(bitmap, 0, 0, width, height);
  bitmap.close();

  const blob = await new Promise<Blob>((resolve, reject) => {
    canvas.toBlob((result) => (result ? resolve(result) : reject(new Error("Konversi WebP gagal."))), "image/webp", WEBP_QUALITY);
  });

  return new File([blob], `${safeName(file.name)}.webp`, { type: "image/webp" });
}

async function videoToGif(file: File, onProgress?: (progress: number) => void) {
  const { FFmpeg } = await import("@ffmpeg/ffmpeg");
  const ffmpeg = new FFmpeg();

  ffmpeg.on("progress", ({ progress }) => {
    onProgress?.(Math.min(68, 8 + Math.round(progress * 60)));
  });

  onProgress?.(5);
  await ffmpeg.load();

  const inputName = `input.${file.name.split(".").pop() || "mp4"}`;
  const outputName = "output.gif";
  try {
    await ffmpeg.writeFile(inputName, new Uint8Array(await file.arrayBuffer()));
    await ffmpeg.exec([
      "-i",
      inputName,
      "-t",
      "6",
      "-vf",
      "fps=8,scale=480:-1:flags=lanczos,split[s0][s1];[s0]palettegen=max_colors=96[p];[s1][p]paletteuse=dither=bayer",
      "-loop",
      "0",
      outputName,
    ]);

    const data = await ffmpeg.readFile(outputName);
    const bytes = typeof data === "string" ? new TextEncoder().encode(data) : data;
    const gifBytes = new Uint8Array(bytes.byteLength);
    gifBytes.set(bytes);
    return new File([gifBytes.buffer], `${safeName(file.name)}.gif`, { type: "image/gif" });
  } finally {
    await Promise.allSettled([ffmpeg.deleteFile(inputName), ffmpeg.deleteFile(outputName)]);
    ffmpeg.terminate();
  }
}

async function uploadFile(file: File, path: string, onProgress?: (progress: number) => void, progressBase = 0, progressSpan = 100) {
  onProgress?.(Math.min(95, progressBase + Math.round(progressSpan * 0.75)));
  const { error } = await supabase.storage.from("media").upload(path, file, {
    cacheControl: "31536000",
    contentType: file.type,
    upsert: false,
  });
  if (error) throw error;

  const { data } = supabase.storage.from("media").getPublicUrl(path);
  onProgress?.(100);
  return data.publicUrl;
}

export async function uploadProfilePhoto(file: File, onProgress?: (progress: number) => void) {
  const webp = await imageToWebp(file, PROFILE_MAX_SIZE);
  return uploadFile(webp, `profile/main-${Date.now()}.webp`, onProgress);
}

export async function uploadGalleryFile(file: File, type: GalleryType, onProgress?: (progress: number) => void) {
  const optimized = type === "photo" ? await imageToWebp(file) : await videoToGif(file, onProgress);
  const extension = type === "photo" ? "webp" : "gif";
  const folder = type === "photo" ? "photo" : "gif";
  return uploadFile(optimized, `gallery/${folder}/${Date.now()}-${safeName(file.name)}.${extension}`, onProgress, type === "photo" ? 0 : 70, type === "photo" ? 100 : 30);
}
