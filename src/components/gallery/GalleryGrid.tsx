"use client";

import { Camera, PlayCircle } from "lucide-react";
import { PhotoProvider, PhotoView } from "react-photo-view";
import type { GalleryItem } from "@/types";

const tileColors = [
  "bg-ocean-yellow text-ocean-deep",
  "bg-ocean-aqua text-ocean-deep",
  "bg-ocean-pink text-white",
  "bg-ocean-coral text-white",
  "bg-ocean-green text-ocean-deep",
  "bg-ocean-orange text-white",
];

export function GalleryGrid({ items }: { items: GalleryItem[] }) {
  return (
    <section id="gallery" className="space-y-3">
      <div>
        <h2 className="border-l-4 border-ocean-yellow pl-3 font-display text-2xl font-extrabold text-white">
          Galeri momen Kayla 📸
        </h2>
        <p className="pl-4 text-xs font-medium text-white/75">Tap foto untuk lihat lebih besar.</p>
      </div>
      <PhotoProvider>
        <div className="friendly-card grid grid-cols-3 gap-3 p-3">
          {items.map((item, index) => {
            const Icon = item.type === "photo" ? Camera : PlayCircle;
            const isGif = item.type === "video" && item.url;

            const mediaContent = item.url ? (
              <div className="relative h-full w-full">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={item.url}
                  alt={item.title}
                  className="h-full w-full object-cover"
                />
                {isGif && (
                  <div className="absolute bottom-1 right-1 flex items-center gap-1 rounded-full bg-black/60 px-2 py-0.5">
                    <PlayCircle size={10} className="text-white" />
                    <span className="text-[9px] font-extrabold text-white">GIF</span>
                  </div>
                )}
              </div>
            ) : (
              <div className="grid place-items-center gap-1 px-2">
                <Icon size={24} />
                <p className="text-[10px] font-extrabold leading-tight">{item.title}</p>
              </div>
            );

            const tile = (
              <div
                className={`${tileColors[index % tileColors.length]} grid aspect-square place-items-center overflow-hidden rounded-2xl text-center shadow-lg`}
              >
                {mediaContent}
              </div>
            );

            // Hanya foto dengan URL yang bisa dibuka fullscreen
            return item.type === "photo" && item.url ? (
              <PhotoView key={item.id} src={item.url}>
                <button type="button" className="block w-full">
                  {tile}
                </button>
              </PhotoView>
            ) : (
              <div key={item.id}>{tile}</div>
            );
          })}
        </div>
      </PhotoProvider>
    </section>
  );
}
