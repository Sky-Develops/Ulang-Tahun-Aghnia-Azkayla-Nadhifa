"use client";

import { useEffect, useRef } from "react";
import type { Wish } from "@/types";

type SceneWish = {
  message: string;
  pinned?: boolean;
};

export function WallOfWishes({ wishes, profilePhotoUrl }: { wishes: Wish[]; profilePhotoUrl?: string }) {
  const sorted = [...wishes].sort((a, b) => Number(b.pinned) - Number(a.pinned));

  return (
    <section id="wishes" className="reference-ocean-section">
      <div className="public-wishes-inner">
        <div className="text-center">
          <h2 className="tree-section-title">🫧 Lautan Gelembung Ucapan</h2>
          <p className="tree-section-sub">
            Gelembung berisi doa untuk Kayla. Ikan, kapal, burung, dan kapal selam berenang menemani.
          </p>
        </div>

        <div className="tree-section">
          <ReferenceOceanScene wishes={sorted.map((wish) => ({ message: wish.message, pinned: wish.pinned }))} profilePhotoUrl={profilePhotoUrl} />
        </div>
      </div>
    </section>
  );
}

function ReferenceOceanScene({ wishes, profilePhotoUrl }: { wishes: SceneWish[]; profilePhotoUrl?: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const tooltipMsgRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const wrapper = wrapperRef.current;
    const tooltip = tooltipRef.current;
    const tooltipMsg = tooltipMsgRef.current;
    if (!canvas || !wrapper) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const canvasEl = canvas;
    const ctxEl = ctx;
    const wrapperEl = wrapper;
    let dpr = 1;
    let cw = 1000;
    let ch = 600;
    let af = 0;
    let t = 0;
    let sceneScale = 1;
    let nextWishAt = 0;
    const surfaceY = 50;
    let fishes: any[] = [];
    let ambBub: any[] = [];
    let wishBub: any[] = [];
    let snails: any[] = [];
    let ships: any[] = [];
    let birds: any[] = [];
    let submarine: any;
    let diver: any;
    let profileImage: HTMLImageElement | null = null;

    const sceneWishes = wishes.length
      ? wishes
      : [
          { message: "Selamat ulang tahun Kayla sayang!" },
          { message: "Semoga Kayla selalu sehat dan ceria." },
          { message: "Kayla makin pintar dan bahagia." },
        ];

    if (profilePhotoUrl) {
      const image = new Image();
      image.crossOrigin = "anonymous";
      image.onload = () => {
        profileImage = image;
      };
      image.onerror = () => {
        profileImage = null;
      };
      image.src = profilePhotoUrl;
    }

    function resize() {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      const rect = wrapperEl.getBoundingClientRect();
      const w = Math.max(300, Math.round(rect.width || wrapperEl.clientWidth || 1000));
      const isMobile = w < 560;
      const isTablet = w >= 560 && w < 900;
      sceneScale = isMobile ? 0.66 : isTablet ? 0.82 : 1;
      const ratio = isMobile ? 1.15 : isTablet ? 0.82 : 0.62;
      const minH = isMobile ? 380 : isTablet ? 470 : 560;
      const maxH = isMobile ? 560 : isTablet ? 650 : 760;
      const h = Math.max(minH, Math.min(Math.round(w * ratio), maxH));
      canvasEl.width = Math.round(w * dpr);
      canvasEl.height = Math.round(h * dpr);
      canvasEl.style.width = "100%";
      canvasEl.style.height = `${h}px`;
      wrapperEl.style.height = `${h}px`;
      wrapperEl.style.minHeight = `${h}px`;
      cw = w;
      ch = h;
    }

    const fishTypes = [
      { e: "\u{1F420}", s: 24 },
      { e: "\u{1F41F}", s: 20 },
      { e: "\u{1F988}", s: 34 },
      { e: "\u{1F421}", s: 18 },
      { e: "\u{1F42C}", s: 30 },
      { e: "\u{1F419}", s: 26 },
      { e: "\u{1F991}", s: 22 },
      { e: "\u{1F433}", s: 36 },
      { e: "\u{1F980}", s: 16 },
      { e: "\u{1F93F}", s: 24 },
    ];

    function mkFish() {
      const f = fishTypes[Math.floor(Math.random() * fishTypes.length)];
      const fromLeft = Math.random() > 0.5;
      return {
        x: fromLeft ? -60 : cw + 60,
        y: surfaceY + 28 + Math.random() * Math.max(70, ch - surfaceY - 118 * sceneScale),
        spd: (0.24 + Math.random() * 0.56) * (sceneScale < 0.8 ? 0.86 : 1),
        dir: fromLeft ? 1 : -1,
        e: f.e,
        sz: (f.s + Math.random() * 7) * sceneScale,
        wo: Math.random() * 6.28,
        wa: (6 + Math.random() * 12) * sceneScale,
        ws: 0.4 + Math.random() * 0.8,
      };
    }

    function initFish() {
      const count = cw < 560 ? 5 : cw < 900 ? 7 : 9;
      fishes = Array.from({ length: count }, () => {
        const f = mkFish();
        f.x = Math.random() * cw;
        return f;
      });
    }

    function drawFish(c: CanvasRenderingContext2D) {
      fishes.forEach((f, i) => {
        f.x += f.spd * f.dir;
        const wy = Math.sin(t * f.ws + f.wo) * f.wa;
        if ((f.dir > 0 && f.x > cw + 90) || (f.dir < 0 && f.x < -90)) {
          fishes[i] = mkFish();
          return;
        }
        c.save();
        c.translate(f.x, f.y + wy);
        if (f.dir < 0) c.scale(-1, 1);
        c.font = `${f.sz}px serif`;
        c.textAlign = "center";
        c.textBaseline = "middle";
        c.fillText(f.e, 0, 0);
        c.restore();
      });
    }

    function mkAmb() {
      return {
        x: Math.random() * cw,
        y: ch - 25,
        sz: (1.4 + Math.random() * 3.8) * sceneScale,
        spd: (0.18 + Math.random() * 0.36) * Math.max(sceneScale, 0.75),
        wo: Math.random() * 6.28,
        op: 0.08 + Math.random() * 0.15,
      };
    }

    function initAmb() {
      const count = cw < 560 ? 18 : cw < 900 ? 24 : 30;
      ambBub = Array.from({ length: count }, () => {
        const b = mkAmb();
        b.y = surfaceY + Math.random() * (ch - surfaceY - 40);
        return b;
      });
    }

    function drawAmb(c: CanvasRenderingContext2D) {
      ambBub.forEach((b, i) => {
        b.y -= b.spd;
        b.wo += 0.02;
        const bx = b.x + Math.sin(b.wo) * 2;
        if (b.y < surfaceY - 5) {
          ambBub[i] = mkAmb();
          return;
        }
        c.save();
        c.globalAlpha = b.op;
        c.beginPath();
        c.arc(bx, b.y, b.sz, 0, 6.28);
        c.strokeStyle = "rgba(135,206,235,0.5)";
        c.lineWidth = 0.7;
        c.stroke();
        c.beginPath();
        c.arc(bx - b.sz * 0.3, b.y - b.sz * 0.3, b.sz * 0.18, 0, 6.28);
        c.fillStyle = "rgba(255,255,255,0.35)";
        c.fill();
        c.restore();
      });
    }

    function syncSnails() {
      const floorY = ch - 28;
      snails = [];
      const emitterCount = cw < 560 ? 5 : cw < 900 ? 6 : 7;
      const wishCount = cw < 560 ? 2 : 3;
      const sp = cw / (emitterCount + 1);
      for (let i = 0; i < emitterCount; i += 1) {
        const isWish = i < wishCount && i < sceneWishes.length;
        snails.push({
          x: sp * (i + 1),
          y: floorY,
          isWish,
          wish: isWish ? sceneWishes[i % sceneWishes.length] : null,
          timer: isWish ? 90 + i * 190 : 50 + Math.random() * 180 + i * 34,
          openT: 0,
        });
      }
      if (sceneWishes.length > wishCount) {
        let wi = 0;
        snails.forEach((s) => {
          if (s.isWish) {
            s.wishPool = sceneWishes;
            s.poolIdx = wi;
            wi += 1;
          }
        });
      }
    }

    function drawSnails(c: CanvasRenderingContext2D) {
      snails.forEach((s) => {
        s.timer -= 1;
        if (s.timer <= 0) {
          if (s.isWish && Date.now() < nextWishAt) {
            s.timer = Math.max(45, Math.round((nextWishAt - Date.now()) / 16)) + Math.random() * 35;
            return;
          }
          s.openT = 25;
          if (s.isWish) {
            const w = s.wishPool ? s.wishPool[s.poolIdx % s.wishPool.length] : s.wish;
            if (w) {
              spawnWish(s.x, s.y - 12, w);
              nextWishAt = Date.now() + 5000;
            }
            if (s.wishPool) s.poolIdx += 1;
          } else {
            for (let j = 0; j < 3; j += 1) {
              const nb = mkAmb();
              nb.x = s.x + (Math.random() - 0.5) * 12;
              nb.y = s.y - 10;
              nb.sz = (2 + Math.random() * 3) * sceneScale;
              nb.spd = (0.3 + Math.random() * 0.3) * Math.max(sceneScale, 0.75);
              ambBub.push(nb);
            }
          }
          s.timer = s.isWish ? 210 + Math.random() * 260 : 150 + Math.random() * 220;
        }
        if (s.openT > 0) s.openT -= 1;
        c.save();
        c.font = `${Math.round((s.openT > 0 ? 22 : 18) * sceneScale)}px serif`;
        c.textAlign = "center";
        c.textBaseline = "bottom";
        c.fillText("\u{1F40C}", s.x, s.y + 12);
        c.restore();
      });
    }

    function spawnWish(x: number, y: number, wish: SceneWish) {
      const msg = String(wish.message || "").trim();
      if (!msg) return;
      const fs = Math.max(7.5, Math.min(11, (msg.length < 30 ? 11 : 9.5) * Math.max(sceneScale, 0.78)));
      const maxW = (msg.length < 20 ? 70 : msg.length < 50 ? 90 : 120) * Math.max(sceneScale, 0.72);
      ctxEl.font = `600 ${fs}px Inter,sans-serif`;
      const words = msg.split(" ");
      const lines: string[] = [];
      let cur = "";
      words.forEach((word) => {
        const test = cur ? `${cur} ${word}` : word;
        if (ctxEl.measureText(test).width > maxW * 1.5 && cur) {
          lines.push(cur);
          cur = word;
        } else {
          cur = test;
        }
      });
      if (cur) lines.push(cur);
      const lh = fs * 1.4;
      const r = Math.max(
        27 * sceneScale,
        Math.max((lines.length * lh) / 1.6 + 10 * sceneScale, ctxEl.measureText(msg.slice(0, 20)).width / 1.4 + 12 * sceneScale),
      );
      const maxR = cw < 560 ? 54 : cw < 900 ? 70 : 88;
      const activeLimit = cw < 560 ? 3 : cw < 900 ? 4 : 5;
      if (wishBub.length >= activeLimit) wishBub.splice(0, wishBub.length - activeLimit + 1);
      wishBub.push({
        x,
        y,
        r: Math.min(r, maxR),
        spd: (0.35 + Math.random() * 0.25) * Math.max(sceneScale, 0.78),
        wo: Math.random() * 6.28,
        wa: (2 + Math.random() * 3) * sceneScale,
        hue: 175 + Math.random() * 45,
        lines,
        fs,
        op: 0,
        phase: "rise",
        msg,
      });
    }

    function drawWishBub(c: CanvasRenderingContext2D) {
      wishBub = wishBub.filter((b) => b.op > 0 || b.phase === "rise");
      wishBub.forEach((b) => {
        b.y -= b.spd;
        b.wo += 0.015;
        const bx = b.x + Math.sin(b.wo) * b.wa;
        if (b.phase === "rise" && b.op < 1) b.op = Math.min(1, b.op + 0.035);
        if (b.y - b.r < surfaceY + 15 && b.phase === "rise") b.phase = "fade";
        if (b.phase === "fade") b.op -= 0.03;
        if (b.op <= 0) return;

        c.save();
        c.globalAlpha = b.op;
        c.shadowColor = `hsla(${b.hue},80%,70%,0.35)`;
        c.shadowBlur = 10;
        const g = c.createRadialGradient(bx - b.r * 0.2, b.y - b.r * 0.2, b.r * 0.08, bx, b.y, b.r);
        g.addColorStop(0, `hsla(${b.hue},70%,82%,.25)`);
        g.addColorStop(0.7, `hsla(${b.hue},60%,65%,.1)`);
        g.addColorStop(1, `hsla(${b.hue},50%,55%,.03)`);
        c.beginPath();
        c.arc(bx, b.y, b.r, 0, 6.28);
        c.fillStyle = g;
        c.fill();
        c.shadowBlur = 0;
        c.beginPath();
        c.arc(bx, b.y, b.r, 0, 6.28);
        c.strokeStyle = `hsla(${b.hue},70%,72%,.5)`;
        c.lineWidth = Math.max(0.9, 1.3 * sceneScale);
        c.stroke();
        c.beginPath();
        c.arc(bx - b.r * 0.3, b.y - b.r * 0.3, b.r * 0.17, 0, 6.28);
        c.fillStyle = "rgba(255,255,255,.35)";
        c.fill();
        const lh = b.fs * 1.4;
        const totalH = b.lines.length * lh;
        const sy = b.y - totalH / 2 + lh * 0.5;
        c.font = `600 ${b.fs}px Inter,sans-serif`;
        c.fillStyle = "rgba(255,255,255,.85)";
        c.textAlign = "center";
        c.textBaseline = "middle";
        b.lines.forEach((line: string, li: number) => c.fillText(line, bx, sy + li * lh));
        c.restore();
      });
    }

    function initSubmarine() {
      submarine = { x: -200 * sceneScale, y: ch - 75 * sceneScale, spd: (0.32 + Math.random() * 0.14) * Math.max(sceneScale, 0.82), dir: 1 };
    }

    function drawSubmarine(c: CanvasRenderingContext2D) {
      const s = submarine;
      s.x += s.spd * s.dir;
      if (s.x > cw + 220 * sceneScale) {
        s.x = -220 * sceneScale;
        s.y = ch - (65 + Math.random() * 30) * sceneScale;
        s.spd = (0.28 + Math.random() * 0.18) * Math.max(sceneScale, 0.82);
      }
      c.save();
      c.translate(s.x, s.y);
      c.scale(sceneScale, sceneScale);
      c.fillStyle = "#FFD700";
      c.beginPath();
      c.ellipse(0, 0, 55, 22, 0, 0, 6.28);
      c.fill();
      c.strokeStyle = "#DAA520";
      c.lineWidth = 2;
      c.stroke();
      c.fillStyle = "#87CEEB";
      c.beginPath();
      c.arc(18, 0, 12, 0, 6.28);
      c.fill();
      c.stroke();
      if (profileImage) {
        c.save();
        c.beginPath();
        c.arc(18, 0, 10, 0, 6.28);
        c.clip();
        c.drawImage(profileImage, 8, -10, 20, 20);
        c.restore();
      } else {
        c.font = "14px serif";
        c.textAlign = "center";
        c.textBaseline = "middle";
        c.fillText("\u{1F476}", 18, 0);
      }
      c.fillStyle = "#DAA520";
      c.fillRect(-5, -22, 4, 12);
      c.fillRect(-8, -24, 10, 4);
      const pa = t * 8;
      c.save();
      c.translate(-55, 0);
      c.rotate(pa);
      c.fillStyle = "#B8860B";
      c.fillRect(-2, -10, 4, 20);
      c.fillRect(-10, -2, 20, 4);
      c.restore();
      c.restore();
    }

    function initDiver() {
      diver = { x: cw + 80 * sceneScale, y: ch - 110 * sceneScale, spd: (0.22 + Math.random() * 0.1) * Math.max(sceneScale, 0.82), dir: -1, wo: Math.random() * 6.28 };
    }

    function drawDiver(c: CanvasRenderingContext2D) {
      const d = diver;
      d.x += d.spd * d.dir;
      d.wo += 0.02;
      const dy = d.y + Math.sin(d.wo) * 8;
      if (d.x < -80 * sceneScale) {
        d.x = cw + 80 * sceneScale;
        d.y = ch - (100 + Math.random() * 40) * sceneScale;
        d.spd = (0.2 + Math.random() * 0.15) * Math.max(sceneScale, 0.82);
      }
      c.save();
      c.translate(d.x, dy);
      c.scale(d.dir, 1);
      c.font = `${Math.round(30 * sceneScale)}px serif`;
      c.textAlign = "center";
      c.textBaseline = "middle";
      c.fillText("\u{1F93F}", 0, 0);
      c.restore();
    }

    function initShips() {
      ships = [];
      const types = ["\u{26F5}", "\u{1F6A2}", "\u{26F5}"];
      for (let i = 0; i < 3; i += 1) {
        const fromLeft = Math.random() > 0.5;
        ships.push({
          x: fromLeft ? -60 : cw + 60,
          y: surfaceY - 8,
          spd: (0.18 + Math.random() * 0.26) * Math.max(sceneScale, 0.82),
          dir: fromLeft ? 1 : -1,
          e: types[i],
          sz: (22 + Math.random() * 10) * sceneScale,
          wo: Math.random() * 6.28,
          delay: i * 180,
        });
      }
    }

    function drawShips(c: CanvasRenderingContext2D) {
      ships.forEach((s) => {
        if (s.delay > 0) {
          s.delay -= 1;
          return;
        }
        s.x += s.spd * s.dir;
        s.wo += 0.012;
        const sy = s.y + Math.sin(s.wo) * 2;
        if ((s.dir > 0 && s.x > cw + 80) || (s.dir < 0 && s.x < -80)) {
          s.dir *= -1;
          s.x = s.dir > 0 ? -70 : cw + 70;
          s.spd = (0.15 + Math.random() * 0.3) * Math.max(sceneScale, 0.82);
        }
        c.save();
        c.translate(s.x, sy);
        if (s.dir < 0) c.scale(-1, 1);
        c.font = `${s.sz}px serif`;
        c.textAlign = "center";
        c.textBaseline = "middle";
        c.fillText(s.e, 0, 0);
        c.restore();
      });
    }

    function initBirds() {
      birds = [];
      for (let i = 0; i < 5; i += 1) {
        const fromLeft = Math.random() > 0.5;
        const onWater = i < 2;
        birds.push({
          x: fromLeft ? -40 : cw + 40,
          y: onWater ? surfaceY - 14 : 5 + Math.random() * 25,
          spd: onWater ? 0.1 + Math.random() * 0.15 : 0.5 + Math.random() * 0.5,
          dir: fromLeft ? 1 : -1,
          onWater,
          wo: Math.random() * 6.28,
          flapPhase: Math.random() * 6.28,
        });
      }
    }

    function drawBirds(c: CanvasRenderingContext2D) {
      birds.forEach((b) => {
        b.x += b.spd * b.dir;
        b.wo += 0.015;
        b.flapPhase += 0.08;
        if ((b.dir > 0 && b.x > cw + 50) || (b.dir < 0 && b.x < -50)) {
          b.dir *= -1;
          b.x = b.dir > 0 ? -40 : cw + 40;
          if (!b.onWater) b.y = 3 + Math.random() * 20;
        }
        c.save();
        const by = b.onWater ? b.y + Math.sin(b.wo) * 1.5 : b.y + Math.sin(b.wo) * 3;
        c.translate(b.x, by);
        if (b.dir < 0) c.scale(-1, 1);
        if (b.onWater) {
          c.font = `${Math.round(14 * sceneScale)}px serif`;
          c.textAlign = "center";
          c.textBaseline = "middle";
          c.fillText("\u{1F426}", 0, 0);
        } else {
          const flap = Math.sin(b.flapPhase) * 4;
          c.strokeStyle = "rgba(50,50,50,0.6)";
          c.lineWidth = Math.max(1, 1.5 * sceneScale);
          c.lineCap = "round";
          c.beginPath();
          c.moveTo(-8 * sceneScale, flap);
          c.quadraticCurveTo(-3 * sceneScale, -2 * sceneScale + flap * 0.3, 0, 0);
          c.quadraticCurveTo(3 * sceneScale, -2 * sceneScale + flap * 0.3, 8 * sceneScale, flap);
          c.stroke();
        }
        c.restore();
      });
    }

    function drawBG(c: CanvasRenderingContext2D) {
      const sky = c.createLinearGradient(0, 0, 0, surfaceY);
      sky.addColorStop(0, "#6EC6FF");
      sky.addColorStop(1, "#B0E0FF");
      c.fillStyle = sky;
      c.fillRect(0, 0, cw, surfaceY);

      c.save();
      c.globalAlpha = 0.7;
      c.font = `${Math.round(26 * sceneScale)}px serif`;
      c.fillText("\u{2600}\u{FE0F}", cw - 50, 22);
      c.restore();

      c.save();
      c.globalAlpha = 0.4;
      c.font = `${Math.round(18 * sceneScale)}px serif`;
      c.fillText("\u{2601}\u{FE0F}", cw * 0.15 + Math.sin(t * 0.1) * 10, 16);
      c.fillText("\u{2601}\u{FE0F}", cw * 0.5 + Math.sin(t * 0.08 + 1) * 8, 12);
      c.fillText("\u{2601}\u{FE0F}", cw * 0.78 + Math.sin(t * 0.12 + 2) * 6, 18);
      c.restore();

      c.beginPath();
      c.moveTo(0, surfaceY);
      for (let x = 0; x <= cw; x += 5) {
        c.lineTo(x, surfaceY + Math.sin(x * 0.025 + t * 0.8) * 3 + Math.sin(x * 0.05 + t * 0.5) * 1.5);
      }
      c.lineTo(cw, ch);
      c.lineTo(0, ch);
      c.closePath();
      const water = c.createLinearGradient(0, surfaceY, 0, ch);
      water.addColorStop(0, "#0077B6");
      water.addColorStop(0.3, "#023E8A");
      water.addColorStop(0.65, "#03045E");
      water.addColorStop(1, "#020024");
      c.fillStyle = water;
      c.fill();

      c.save();
      c.globalAlpha = 0.04;
      for (let i = 0; i < 5; i += 1) {
        const rx = cw * (0.12 + i * 0.19);
        const sw = Math.sin(t * 0.25 + i * 0.8) * 16;
        c.beginPath();
        c.moveTo(rx - 10 + sw * 0.4, surfaceY);
        c.lineTo(rx - 35 + sw, ch * 0.7);
        c.lineTo(rx + 35 + sw, ch * 0.7);
        c.lineTo(rx + 10 + sw * 0.4, surfaceY);
        c.closePath();
        c.fillStyle = "#ADD8E6";
        c.fill();
      }
      c.restore();

      const floorY = ch - 28;
      const floor = c.createLinearGradient(0, floorY, 0, ch);
      floor.addColorStop(0, "rgba(194,178,128,.2)");
      floor.addColorStop(1, "rgba(120,100,60,.35)");
      c.fillStyle = floor;
      c.beginPath();
      c.moveTo(0, floorY);
      for (let x = 0; x <= cw; x += 25) c.lineTo(x, floorY + Math.sin(x * 0.04 + t * 0.4) * 3.5);
      c.lineTo(cw, ch);
      c.lineTo(0, ch);
      c.closePath();
      c.fill();

      for (let i = 0; i < 9; i += 1) {
        const sx = cw * 0.06 + i * (cw * 0.1);
        const sh = 30 + (i % 3) * 10;
        const sw = Math.sin(t * 0.7 + i * 1.1) * 9;
        c.save();
        c.beginPath();
        c.moveTo(sx, floorY + 2);
        c.quadraticCurveTo(sx + sw, floorY + 2 - sh * 0.55, sx + sw * 0.5, floorY + 2 - sh);
        c.strokeStyle = `rgba(34,139,34,${0.13 + Math.sin(t * 0.5 + i) * 0.03})`;
        c.lineWidth = 2.5;
        c.lineCap = "round";
        c.stroke();
        c.restore();
      }

      c.save();
      c.font = `${Math.round(14 * sceneScale)}px serif`;
      c.textAlign = "center";
      c.textBaseline = "bottom";
      [
        [cw * 0.08, "\u{1FAB8}"],
        [cw * 0.3, "\u{1FAA8}"],
        [cw * 0.52, "\u{1FAB8}"],
        [cw * 0.7, "\u{1FAA8}"],
        [cw * 0.88, "\u{1FAB8}"],
      ].forEach(([x, e]) => c.fillText(String(e), Number(x), floorY + 12));
      c.restore();
    }

    function loop() {
      ctxEl.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctxEl.clearRect(0, 0, cw, ch);
      drawBG(ctxEl);
      drawAmb(ctxEl);
      drawFish(ctxEl);
      drawSubmarine(ctxEl);
      drawDiver(ctxEl);
      drawWishBub(ctxEl);
      drawSnails(ctxEl);
      drawShips(ctxEl);
      drawBirds(ctxEl);
      t += 0.016;
      af = requestAnimationFrame(loop);
    }

    function handleMouseMove(e: MouseEvent) {
      const rect = canvasEl.getBoundingClientRect();
      const mx = ((e.clientX - rect.left) * canvasEl.width) / rect.width / dpr;
      const my = ((e.clientY - rect.top) * canvasEl.height) / rect.height / dpr;
      let hovered: any = null;
      for (let i = wishBub.length - 1; i >= 0; i -= 1) {
        const b = wishBub[i];
        const bx = b.x + Math.sin(b.wo) * b.wa;
        if (Math.hypot(mx - bx, my - b.y) <= b.r && b.op > 0.12) {
          hovered = b;
          break;
        }
      }

      if (hovered && tooltip && tooltipMsg) {
        tooltip.style.left = `${e.clientX - rect.left + 15}px`;
        tooltip.style.top = `${e.clientY - rect.top - 15}px`;
        tooltip.classList.add("visible");
        tooltipMsg.textContent = hovered.msg;
      } else if (tooltip) {
        tooltip.classList.remove("visible");
      }
    }

    function init() {
      cancelAnimationFrame(af);
      resize();
      initFish();
      initAmb();
      initSubmarine();
      initDiver();
      initShips();
      initBirds();
      syncSnails();
      loop();
    }

    canvasEl.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("resize", init);
    init();
    const syncTimer = window.setInterval(syncSnails, 7000);

    return () => {
      cancelAnimationFrame(af);
      window.clearInterval(syncTimer);
      canvasEl.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("resize", init);
    };
  }, [wishes, profilePhotoUrl]);

  return (
    <div ref={wrapperRef} className="tree-canvas-wrapper">
      <canvas ref={canvasRef} id="wishTree" width={1000} height={600} />
      <div ref={tooltipRef} className="tree-tooltip">
        <div className="tooltip-name">🫧 Ucapan</div>
        <div ref={tooltipMsgRef} className="tooltip-message" />
        <div className="tooltip-time">Nama pengirim hanya untuk admin</div>
      </div>
    </div>
  );
}
