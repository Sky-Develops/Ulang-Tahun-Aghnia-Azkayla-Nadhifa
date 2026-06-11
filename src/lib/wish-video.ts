"use client";

import type { Wish } from "@/types";

type ExportOptions = {
  wishes: Wish[];
  title: string;
  profilePhotoUrl?: string;
  onProgress?: (message: string) => void;
};

const WIDTH = 390;
const HEIGHT = 520;
const FPS = 30;
const DURATION_MS = 18_000;

function pickMimeType() {
  const types = ["video/mp4;codecs=h264", "video/webm;codecs=vp9", "video/webm;codecs=vp8", "video/webm"];
  return types.find((type) => MediaRecorder.isTypeSupported(type)) || "";
}

function downloadUrl(url: string, filename: string) {
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  anchor.rel = "noopener";
  anchor.style.display = "none";
  document.body.appendChild(anchor);
  anchor.click();
  window.setTimeout(() => anchor.remove(), 0);
}

function wrapText(ctx: CanvasRenderingContext2D, text: string, maxWidth: number) {
  const words = text.trim().split(/\s+/);
  const lines: string[] = [];
  let current = "";

  words.forEach((word) => {
    const test = current ? `${current} ${word}` : word;
    if (ctx.measureText(test).width > maxWidth && current) {
      lines.push(current);
      current = word;
    } else {
      current = test;
    }
  });

  if (current) lines.push(current);
  return lines.slice(0, 4);
}

function loadProfileImage(url?: string) {
  return new Promise<HTMLImageElement | null>((resolve) => {
    if (!url) {
      resolve(null);
      return;
    }

    const image = new Image();
    image.crossOrigin = "anonymous";
    image.onload = () => resolve(image);
    image.onerror = () => resolve(null);
    image.src = url;
  });
}

function drawEmoji(ctx: CanvasRenderingContext2D, emoji: string, x: number, y: number, size: number, flip = false) {
  ctx.save();
  ctx.translate(x, y);
  if (flip) ctx.scale(-1, 1);
  ctx.font = `${size}px serif`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(emoji, 0, 0);
  ctx.restore();
}

function drawScene(ctx: CanvasRenderingContext2D, wishes: Wish[], profileImage: HTMLImageElement | null, time: number) {
  const surfaceY = 64;
  ctx.clearRect(0, 0, WIDTH, HEIGHT);

  const sky = ctx.createLinearGradient(0, 0, 0, surfaceY);
  sky.addColorStop(0, "#75cfff");
  sky.addColorStop(1, "#b7e8ff");
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, WIDTH, surfaceY);

  ctx.save();
  ctx.globalAlpha = 0.42;
  drawEmoji(ctx, "☁️", 88 + Math.sin(time * 0.7) * 5, 18, 15);
  drawEmoji(ctx, "☁️", 205 + Math.sin(time * 0.5) * 6, 16, 15);
  drawEmoji(ctx, "☀️", 317, 25, 23);
  ctx.strokeStyle = "rgba(25,60,80,.65)";
  ctx.lineWidth = 1.2;
  [230, 264].forEach((x, index) => {
    ctx.beginPath();
    ctx.arc(x, 24 + index * 2, 6, Math.PI * 1.12, Math.PI * 1.88);
    ctx.stroke();
  });
  ctx.restore();

  const water = ctx.createLinearGradient(0, surfaceY, 0, HEIGHT);
  water.addColorStop(0, "#087bb6");
  water.addColorStop(0.35, "#073a8c");
  water.addColorStop(0.72, "#080864");
  water.addColorStop(1, "#020024");
  ctx.beginPath();
  ctx.moveTo(0, surfaceY);
  for (let x = 0; x <= WIDTH; x += 6) {
    ctx.lineTo(x, surfaceY + Math.sin(x * 0.028 + time * 1.2) * 3 + Math.sin(x * 0.065 + time * 0.8) * 1.5);
  }
  ctx.lineTo(WIDTH, HEIGHT);
  ctx.lineTo(0, HEIGHT);
  ctx.closePath();
  ctx.fillStyle = water;
  ctx.fill();

  ctx.save();
  ctx.globalAlpha = 0.045;
  for (let i = 0; i < 5; i += 1) {
    const x = 55 + i * 64 + Math.sin(time * 0.45 + i) * 7;
    ctx.beginPath();
    ctx.moveTo(x - 10, surfaceY);
    ctx.lineTo(x - 34, HEIGHT - 120);
    ctx.lineTo(x + 34, HEIGHT - 120);
    ctx.lineTo(x + 10, surfaceY);
    ctx.closePath();
    ctx.fillStyle = "#bcecff";
    ctx.fill();
  }
  ctx.restore();

  drawEmoji(ctx, "⛵", 48 + ((time * 11) % 470), surfaceY - 8, 22);
  drawEmoji(ctx, "🛳️", 245 - ((time * 9) % 470), surfaceY - 9, 22, true);
  drawEmoji(ctx, "🐦", 198 + Math.sin(time * 2) * 8, 50, 18);
  drawEmoji(ctx, "🐦", 312 + Math.sin(time * 1.8) * 6, 50, 18);

  for (let i = 0; i < 36; i += 1) {
    const x = (i * 57 + Math.sin(i * 9.1) * 14 + Math.sin(time + i) * 3) % WIDTH;
    const y = HEIGHT - ((time * (18 + (i % 5) * 4) + i * 41) % (HEIGHT - surfaceY + 40));
    ctx.globalAlpha = 0.1 + (i % 4) * 0.025;
    ctx.beginPath();
    ctx.arc(x, y, 1.5 + (i % 4), 0, Math.PI * 2);
    ctx.strokeStyle = "rgba(142,220,255,.55)";
    ctx.lineWidth = 0.8;
    ctx.stroke();
  }
  ctx.globalAlpha = 1;

  const animals = ["🐠", "🐙", "🦀", "🐟", "🦈", "🤿"];
  animals.forEach((emoji, index) => {
    const dir = index % 2 === 0 ? 1 : -1;
    const rawX = (time * (22 + index * 4) + index * 74) % (WIDTH + 120);
    const x = dir > 0 ? rawX - 60 : WIDTH + 60 - rawX;
    const y = surfaceY + 72 + index * 39 + Math.sin(time * 1.4 + index) * 12;
    drawEmoji(ctx, emoji, x, y, emoji === "🦈" ? 31 : 22, dir < 0);
  });

  const floorY = HEIGHT - 31;
  ctx.fillStyle = "rgba(176,151,91,.3)";
  ctx.beginPath();
  ctx.moveTo(0, floorY);
  for (let x = 0; x <= WIDTH; x += 18) ctx.lineTo(x, floorY + Math.sin(x * 0.04 + time) * 4);
  ctx.lineTo(WIDTH, HEIGHT);
  ctx.lineTo(0, HEIGHT);
  ctx.closePath();
  ctx.fill();

  for (let i = 0; i < 9; i += 1) {
    const x = 28 + i * 41;
    const bend = Math.sin(time * 1.1 + i) * 7;
    ctx.beginPath();
    ctx.moveTo(x, floorY + 4);
    ctx.quadraticCurveTo(x + bend, floorY - 22, x + bend * 0.5, floorY - 48);
    ctx.strokeStyle = "rgba(34,139,34,.18)";
    ctx.lineWidth = 2;
    ctx.stroke();
  }

  const bubbleWishes = wishes.length ? wishes : [{ id: "sample", message: "Semoga Kayla selalu sehat dan bahagia.", approved: true, pinned: false }];
  bubbleWishes.slice(0, 8).forEach((wish, index) => {
    const cycle = 9;
    const local = (time + index * 1.15) % cycle;
    const startX = 58 + ((index * 74) % (WIDTH - 105));
    const y = floorY - 16 - local * 42;
    if (y < surfaceY + 24 || y > floorY) return;

    const alpha = Math.min(1, local / 0.9, (cycle - local) / 1.2);
    const x = startX + Math.sin(time * 1.7 + index) * 13;
    const message = String(wish.message || "").trim();
    const radius = Math.min(73, Math.max(38, 28 + message.length * 0.72));

    ctx.save();
    ctx.globalAlpha = Math.max(0, alpha);
    const gradient = ctx.createRadialGradient(x - radius * 0.28, y - radius * 0.28, radius * 0.08, x, y, radius);
    gradient.addColorStop(0, "rgba(190,242,255,.26)");
    gradient.addColorStop(0.72, "rgba(80,205,235,.1)");
    gradient.addColorStop(1, "rgba(80,205,235,.03)");
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = "rgba(135,225,255,.48)";
    ctx.lineWidth = 1.3;
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(x - radius * 0.35, y - radius * 0.35, radius * 0.17, 0, Math.PI * 2);
    ctx.fillStyle = "rgba(255,255,255,.32)";
    ctx.fill();

    ctx.font = "600 11px Inter, Arial, sans-serif";
    const lines = wrapText(ctx, message, radius * 1.35);
    const lineHeight = 14;
    const firstY = y - ((lines.length - 1) * lineHeight) / 2;
    ctx.fillStyle = "rgba(255,255,255,.9)";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    lines.forEach((line, lineIndex) => ctx.fillText(line, x, firstY + lineIndex * lineHeight));
    ctx.restore();
  });

  [46, 102, 206, 302, 346].forEach((x, index) => {
    drawEmoji(ctx, index % 2 ? "🐚" : "🪸", x, floorY + 15, 15);
  });

  const subX = ((time * 34) % (WIDTH + 170)) - 80;
  const subY = HEIGHT - 88 + Math.sin(time * 0.9) * 7;
  ctx.save();
  ctx.translate(subX, subY);
  ctx.fillStyle = "#ffd600";
  ctx.beginPath();
  ctx.ellipse(0, 0, 62, 22, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = "#bd9600";
  ctx.lineWidth = 2;
  ctx.stroke();
  ctx.fillStyle = "#8ed8f8";
  ctx.beginPath();
  ctx.arc(20, 0, 13, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
  if (profileImage) {
    ctx.save();
    ctx.beginPath();
    ctx.arc(20, 0, 10, 0, Math.PI * 2);
    ctx.clip();
    ctx.drawImage(profileImage, 10, -10, 20, 20);
    ctx.restore();
  } else {
    drawEmoji(ctx, "👶", 20, 0, 14);
  }
  ctx.fillStyle = "#bd9600";
  ctx.fillRect(-8, -24, 5, 13);
  ctx.fillRect(-12, -27, 16, 5);
  ctx.restore();
}

export async function exportWishesVideo({ wishes, profilePhotoUrl, onProgress }: ExportOptions) {
  const approved = wishes.filter((wish) => wish.approved);
  const exportWishes = (approved.length ? approved : wishes).slice(0, 20);
  if (!exportWishes.length) throw new Error("Belum ada ucapan untuk diexport.");
  if (!("MediaRecorder" in window)) throw new Error("Browser ini belum mendukung export video. Coba pakai Chrome atau Edge terbaru.");

  const mimeType = pickMimeType();
  if (!mimeType) throw new Error("Browser ini belum mendukung format video untuk direkam.");

  onProgress?.("Merekam animasi lautan gelembung menjadi video...");

  const canvas = document.createElement("canvas");
  canvas.width = WIDTH;
  canvas.height = HEIGHT;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas video gagal dibuat.");

  const profileImage = await loadProfileImage(profilePhotoUrl);
  const stream = canvas.captureStream(FPS);
  const recorder = new MediaRecorder(stream, { mimeType, videoBitsPerSecond: 4_500_000 });
  const chunks: BlobPart[] = [];

  recorder.ondataavailable = (event) => {
    if (event.data.size) chunks.push(event.data);
  };

  const done = new Promise<Blob>((resolve, reject) => {
    recorder.onerror = () => reject(new Error("Perekaman video gagal."));
    recorder.onstop = () => resolve(new Blob(chunks, { type: mimeType }));
  });

  let frameId = 0;
  const startedAt = performance.now();

  function render(now: number) {
    const elapsed = now - startedAt;
    drawScene(ctx as CanvasRenderingContext2D, exportWishes, profileImage, elapsed / 1000);
    if (elapsed < DURATION_MS) {
      frameId = requestAnimationFrame(render);
    } else if (recorder.state === "recording") {
      recorder.stop();
      stream.getTracks().forEach((track) => track.stop());
    }
  }

  recorder.start(250);
  frameId = requestAnimationFrame(render);

  const blob = await done.finally(() => cancelAnimationFrame(frameId));
  if (!blob.size) throw new Error("File video kosong. Coba download ulang.");

  const extension = mimeType.includes("mp4") ? "mp4" : "webm";
  const filename = `kayla-lautan-gelembung-ucapan.${extension}`;
  const url = URL.createObjectURL(blob);
  downloadUrl(url, filename);
  onProgress?.(`Video selesai dibuat. Kalau belum muncul di Downloads, klik tombol Simpan Video.`);

  return { url, filename };
}
