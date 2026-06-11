import { spawn } from "node:child_process";
import { mkdtemp, readFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import ffmpegInstaller from "@ffmpeg-installer/ffmpeg";
import sharp from "sharp";
import type { NextRequest } from "next/server";

export const runtime = "nodejs";
export const maxDuration = 300;

type ExportWish = {
  id?: string;
  name?: string;
  message: string;
  approved?: boolean;
  pinned?: boolean;
};

const WIDTH = 1280;
const HEIGHT = 720;
const FPS = 6;
const WISH_GAP = 1.8;
const WISH_VISIBLE = 5.8;
const MAX_WISHES = 35;

function escapeXml(value: unknown) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function wrapText(text: string, maxChars: number) {
  const words = text.trim().split(/\s+/);
  const lines: string[] = [];
  let current = "";

  words.forEach((word) => {
    const test = current ? `${current} ${word}` : word;
    if (test.length > maxChars && current) {
      lines.push(current);
      current = word;
    } else {
      current = test;
    }
  });

  if (current) lines.push(current);
  return lines.slice(0, 5);
}

async function getProfileImageDataUrl(url?: string) {
  if (!url) return null;

  try {
    const response = await fetch(url);
    if (!response.ok) return null;

    const contentType = response.headers.get("content-type") || "image/jpeg";
    const bytes = Buffer.from(await response.arrayBuffer());
    return `data:${contentType};base64,${bytes.toString("base64")}`;
  } catch {
    return null;
  }
}

function bubbleSvg(wish: ExportWish, age: number, index: number) {
  if (age < 0 || age > WISH_VISIBLE) return "";

  const fadeIn = Math.min(1, age / 0.8);
  const fadeOut = Math.min(1, (WISH_VISIBLE - age) / 1.4);
  const opacity = Math.max(0, Math.min(fadeIn, fadeOut));
  const lane = index % 4;
  const radius = 95 + Math.min(36, wish.message.length * 0.35);
  const x = 210 + lane * 285 + Math.sin(age * 1.4 + lane) * 20;
  const y = HEIGHT - 82 - age * 48 - lane * 12;
  const hue = 172 + (index % 5) * 12;
  const lines = wrapText(wish.message, 22);
  const lineHeight = 31;
  const firstLineY = y - (lines.length * lineHeight) / 2 + lineHeight / 2;
  const name = wish.name
    ? `<text x="${x}" y="${y + (lines.length * lineHeight) / 2 + 30}" text-anchor="middle" font-size="18" font-weight="700" fill="rgb(255,224,26)">- ${escapeXml(wish.name)}</text>`
    : "";

  return `
    <g opacity="${opacity.toFixed(3)}">
      <circle cx="${x}" cy="${y}" r="${radius}" fill="hsla(${hue},85%,75%,.16)" stroke="hsla(${hue},90%,78%,.68)" stroke-width="3"/>
      <circle cx="${x - radius * 0.34}" cy="${y - radius * 0.34}" r="${radius * 0.16}" fill="rgba(255,255,255,.42)"/>
      ${lines
        .map((line, lineIndex) => `<text x="${x}" y="${firstLineY + lineIndex * lineHeight}" text-anchor="middle" dominant-baseline="middle" font-size="24" font-weight="800" fill="rgb(245,252,255)">${escapeXml(line)}</text>`)
        .join("")}
      ${name}
    </g>
  `;
}

function fishSvg(time: number) {
  const colors = ["#FFB703", "#8ECAE6", "#FB8500", "#90BE6D", "#F15BB5", "#00BBF9"];

  return colors
    .map((color, index) => {
      const dir = index % 2 === 0 ? 1 : -1;
      const rawX = (time * (42 + index * 8) + index * 190) % (WIDTH + 170);
      const x = dir > 0 ? rawX - 80 : WIDTH + 80 - rawX;
      const y = 196 + index * 58 + Math.sin(time * 1.3 + index) * 18;
      const flip = dir > 0 ? 1 : -1;
      const bodyX = index === 5 ? 34 : 24;
      const bodyY = index === 5 ? 15 : 12;

      return `
        <g transform="translate(${x.toFixed(2)} ${y.toFixed(2)}) scale(${flip} 1)">
          <ellipse cx="0" cy="0" rx="${bodyX}" ry="${bodyY}" fill="${color}" opacity=".95"/>
          <polygon points="-24,0 -42,-13 -42,13" fill="${color}" opacity=".9"/>
          <circle cx="12" cy="-4" r="3" fill="#062047"/>
        </g>
      `;
    })
    .join("");
}

function profileSvg(profileImageDataUrl: string | null) {
  if (profileImageDataUrl) {
    return `
      <clipPath id="profileClip"><circle cx="38" cy="0" r="29"/></clipPath>
      <image href="${profileImageDataUrl}" x="9" y="-29" width="58" height="58" clip-path="url(#profileClip)" preserveAspectRatio="xMidYMid slice"/>
    `;
  }

  return `
    <circle cx="38" cy="-4" r="12" fill="#FFD7B5"/>
    <path d="M24 18 Q38 30 52 18" fill="#2D6CDF"/>
    <circle cx="33" cy="-5" r="2" fill="#062047"/>
    <circle cx="43" cy="-5" r="2" fill="#062047"/>
    <path d="M33 5 Q38 9 43 5" fill="none" stroke="#9B4D2E" stroke-width="2" stroke-linecap="round"/>
  `;
}

function frameSvg({
  time,
  wishes,
  title,
  profileImageDataUrl,
}: {
  time: number;
  wishes: ExportWish[];
  title: string;
  profileImageDataUrl: string | null;
}) {
  const waves = Array.from({ length: 161 }, (_, index) => {
    const x = index * 8;
    const y = 96 + Math.sin(x * 0.023 + time * 2.2) * 6 + Math.sin(x * 0.047 + time * 1.4) * 3;
    return `${x},${y.toFixed(2)}`;
  }).join(" ");

  const ambientBubbles = Array.from({ length: 46 }, (_, index) => {
    const x = (index * 79 + Math.sin(index) * 37 + Math.sin(time * 0.7 + index) * 10) % WIDTH;
    const y = HEIGHT - ((time * (21 + (index % 5) * 5) + index * 41) % (HEIGHT - 96 + 80));
    return `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${3 + (index % 5)}" fill="none" stroke="rgba(160,230,255,.24)" stroke-width="1.2"/>`;
  }).join("");

  const subX = ((time * 78) % (WIDTH + 330)) - 160;
  const subY = HEIGHT - 150 + Math.sin(time * 0.8) * 24;
  const propeller = time * 520;
  const bubbleLayer = wishes.map((wish, index) => bubbleSvg(wish, time - (2 + index * WISH_GAP), index)).join("");

  return `
    <svg xmlns="http://www.w3.org/2000/svg" width="${WIDTH}" height="${HEIGHT}" viewBox="0 0 ${WIDTH} ${HEIGHT}">
      <defs>
        <linearGradient id="sky" x1="0" y1="0" x2="0" y2="96">
          <stop offset="0" stop-color="#7FD7FF"/>
          <stop offset="1" stop-color="#C9F1FF"/>
        </linearGradient>
        <linearGradient id="water" x1="0" y1="96" x2="0" y2="720">
          <stop offset="0" stop-color="#0086C9"/>
          <stop offset=".32" stop-color="#024B9A"/>
          <stop offset=".66" stop-color="#06186D"/>
          <stop offset="1" stop-color="#020024"/>
        </linearGradient>
        <filter id="softGlow">
          <feGaussianBlur stdDeviation="8" result="blur"/>
          <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
        </filter>
      </defs>
      <rect width="${WIDTH}" height="96" fill="url(#sky)"/>
      <circle cx="1185" cy="42" r="25" fill="#FFE01A" opacity=".92"/>
      <g opacity=".42" fill="#FFFFFF">
        <ellipse cx="${145 + Math.sin(time * 0.5) * 18}" cy="42" rx="42" ry="14"/>
        <ellipse cx="${118 + Math.sin(time * 0.5) * 18}" cy="44" rx="23" ry="11"/>
        <ellipse cx="${640 + Math.sin(time * 0.42) * 16}" cy="34" rx="48" ry="14"/>
        <ellipse cx="${610 + Math.sin(time * 0.42) * 16}" cy="37" rx="25" ry="11"/>
      </g>
      <polygon points="0,96 ${waves} ${WIDTH},${HEIGHT} 0,${HEIGHT}" fill="url(#water)"/>
      <g opacity=".08">
        ${Array.from({ length: 7 }, (_, i) => {
          const rx = 120 + i * 170 + Math.sin(time * 0.4 + i) * 18;
          return `<polygon points="${rx - 12},96 ${rx - 58},562 ${rx + 58},562 ${rx + 12},96" fill="#C7F3FF"/>`;
        }).join("")}
      </g>
      <text x="${WIDTH / 2}" y="58" text-anchor="middle" font-family="Arial,sans-serif" font-size="42" font-weight="800" fill="rgb(245,252,255)">${escapeXml(title)}</text>
      <text x="${WIDTH / 2}" y="86" text-anchor="middle" font-family="Arial,sans-serif" font-size="21" font-weight="700" fill="rgb(202,238,255)">Lautan doa dan ucapan untuk Kayla</text>
      <g>${ambientBubbles}</g>
      <g>${fishSvg(time)}</g>
      <g font-family="Arial,sans-serif" filter="url(#softGlow)">${bubbleLayer}</g>
      <g transform="translate(${subX.toFixed(2)} ${subY.toFixed(2)})">
        <ellipse cx="0" cy="0" rx="112" ry="42" fill="#FFD719" stroke="#C99100" stroke-width="5"/>
        <circle cx="38" cy="0" r="29" fill="#87CEEB" stroke="#C99100" stroke-width="5"/>
        ${profileSvg(profileImageDataUrl)}
        <rect x="-18" y="-49" width="9" height="25" fill="#C99100"/>
        <rect x="-30" y="-56" width="34" height="10" fill="#C99100"/>
        <g transform="translate(-112 0) rotate(${propeller})" fill="#A87500">
          <rect x="-4" y="-24" width="8" height="48"/>
          <rect x="-24" y="-4" width="48" height="8"/>
        </g>
      </g>
      <path d="M0 674 ${Array.from({ length: 55 }, (_, index) => {
        const x = index * 24;
        const y = 674 + Math.sin(x * 0.04 + time) * 7;
        return `L${x} ${y.toFixed(2)}`;
      }).join(" ")} L1280 720 L0 720 Z" fill="rgba(190,165,95,.34)"/>
    </svg>
  `;
}

async function renderFrames(tempDir: string, wishes: ExportWish[], title: string, profileImageDataUrl: string | null) {
  const duration = Math.ceil(2 + wishes.length * WISH_GAP + WISH_VISIBLE + 2);
  const totalFrames = duration * FPS;

  for (let frame = 0; frame < totalFrames; frame += 1) {
    const svg = frameSvg({
      time: frame / FPS,
      wishes,
      title,
      profileImageDataUrl,
    });
    await sharp(Buffer.from(svg)).png().toFile(path.join(tempDir, `frame-${String(frame).padStart(5, "0")}.png`));
  }
}

async function encodeMp4(tempDir: string) {
  const outputPath = path.join(tempDir, "kayla-lautan-ucapan.mp4");

  await new Promise<void>((resolve, reject) => {
    const ffmpeg = spawn(ffmpegInstaller.path, [
      "-y",
      "-framerate",
      String(FPS),
      "-i",
      path.join(tempDir, "frame-%05d.png"),
      "-c:v",
      "libx264",
      "-pix_fmt",
      "yuv420p",
      "-movflags",
      "faststart",
      outputPath,
    ]);

    let errorOutput = "";
    ffmpeg.stderr.on("data", (chunk) => {
      errorOutput += chunk.toString();
    });
    ffmpeg.on("error", reject);
    ffmpeg.on("close", (code) => {
      if (code === 0) resolve();
      else reject(new Error(errorOutput || `ffmpeg gagal dengan code ${code}`));
    });
  });

  return outputPath;
}

export async function POST(request: NextRequest) {
  let tempDir = "";

  try {
    const body = await request.json();
    const wishes = Array.isArray(body?.wishes)
      ? body.wishes
          .filter((wish: ExportWish) => typeof wish?.message === "string" && wish.message.trim())
          .slice(0, MAX_WISHES)
      : [];

    if (!wishes.length) {
      return new Response("Belum ada ucapan untuk diexport.", { status: 400 });
    }

    tempDir = await mkdtemp(path.join(tmpdir(), "kayla-wishes-"));
    const profileImageDataUrl = await getProfileImageDataUrl(body?.profilePhotoUrl);
    await renderFrames(tempDir, wishes, String(body?.title || "Kayla's 2nd Birthday"), profileImageDataUrl);
    const outputPath = await encodeMp4(tempDir);
    const mp4 = await readFile(outputPath);

    return new Response(mp4, {
      headers: {
        "Content-Type": "video/mp4",
        "Content-Disposition": 'attachment; filename="kayla-lautan-ucapan.mp4"',
        "Cache-Control": "no-store",
      },
    });
  } catch (error) {
    return new Response(error instanceof Error ? error.message : "Export MP4 gagal.", { status: 500 });
  } finally {
    if (tempDir) {
      await rm(tempDir, { recursive: true, force: true });
    }
  }
}
