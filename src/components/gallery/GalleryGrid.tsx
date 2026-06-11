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
        <p className="pl-4 text-xs font-medium text-white/75">Tap foto atau video untuk lihat lebih besar.</p>
      </div>
      <PhotoProvider>
        <div className="friendly-card grid grid-cols-3 gap-3 p-3">
          {items.map((item, index) => {
            const Icon = item.type === "photo" ? Camera : PlayCircle;
            const content = (
              <div
                className={`${tileColors[index % tileColors.length]} grid aspect-square place-items-center overflow-hidden rounded-2xl text-center shadow-lg`}
              >
                {item.url ? (
                  item.type === "photo" ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={item.url} alt={item.title} className="h-full w-full object-cover" />
                  ) : (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={item.url} alt={item.title} className="h-full w-full object-cover" />
                  )
                ) : (
                  <div className="grid place-items-center gap-1 px-2">
                    <Icon size={24} />
                    <p className="text-[10px] font-extrabold leading-tight">{item.title}</p>
                  </div>
                )}
              </div>
            );

            return item.type === "photo" && item.url ? (
              <PhotoView key={item.id} src={item.url}>
                <button type="button" className="block w-full">
                  {content}
                </button>
              </PhotoView>
            ) : (
              <div key={item.id}>{content}</div>
            );
          })}
        </div>
      </PhotoProvider>
    </section>
  );
}
