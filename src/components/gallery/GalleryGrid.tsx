"use client";

import { useState, useRef } from "react";
import { Camera, PlayCircle, X } from "lucide-react";
import Image from "next/image";
import type { GalleryItem } from "@/types";

const tileColors = [
  "bg-ocean-yellow text-white",
  "bg-ocean-aqua text-ocean-deep",
  "bg-ocean-yellow text-white",
  "bg-ocean-coral text-white",
  "bg-ocean-green text-ocean-deep",
  "bg-ocean-orange text-white",
];

function GifThumbnail({ url, title }: { url: string; title: string }) {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  if (hasError) {
    return (
      <div className="grid h-full w-full place-items-center">
        <PlayCircle size={24} />
      </div>
    );
  }

  return (
    <div className="relative h-full w-full">
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-white/40 border-t-transparent" />
        </div>
      )}
      <img 
        src={url} 
        alt={title}
        loading="lazy"
        decoding="async"
        className={`h-full w-full object-cover transition-opacity duration-300 ${isLoading ? 'opacity-0' : 'opacity-100'}`}
        style={{ display: 'block', width: '100%', height: '100%', minHeight: '100%', minWidth: '100%' }}
        onLoad={() => setIsLoading(false)}
        onError={() => {
          setIsLoading(false);
          setHasError(true);
        }}
      />
    </div>
  );
}

export function GalleryGrid({ items }: { items: GalleryItem[] }) {
  const [activeMedia, setActiveMedia] = useState<{ url: string; type: GalleryItem["type"] } | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  const handleClose = () => {
    if (videoRef.current) {
      videoRef.current.pause();
      videoRef.current.removeAttribute("src");
      videoRef.current.load();
    }
    setActiveMedia(null);
  };

  const isVideoFormat = (url: string) => {
    const clean = url.split("?")[0].toLowerCase();
    return clean.endsWith(".mp4") || clean.endsWith(".webm");
  };

  return (
    <section id="gallery" className="space-y-3">
      <div>
        <h2 className="border-l-4 border-ocean-yellow pl-3 font-display text-2xl font-extrabold text-white">
          Galeri momen Kayla 📸
        </h2>
        <p className="pl-4 text-xs font-medium text-white/75">Tap foto untuk lihat lebih besar.</p>
      </div>
      <div className="friendly-card grid grid-cols-3 gap-3 p-3">
          {items.map((item, index) => {
            const Icon = item.type === "photo" ? Camera : PlayCircle;
            const actualIsVideo = item.url ? isVideoFormat(item.url) : false;
            
            console.log('Gallery item:', item.url, 'isVideo:', actualIsVideo, 'isGif:', item.url?.toLowerCase().includes('.gif'));

            const url = item.url || "";
            const urlLower = url.toLowerCase().split("?")[0];
            const isGif = url.toLowerCase().includes(".gif");
            const isVideo = urlLower.endsWith(".mp4") || urlLower.endsWith(".webm");
            
            const mediaContent = item.url ? (
              <div className="relative h-full w-full">
                {isVideo ? (
                  <video src={item.url} className="absolute inset-0 h-full w-full object-cover pointer-events-none" muted loop playsInline autoPlay />
                ) : (
                  <div className="absolute inset-0 h-full w-full pointer-events-none">
                    {isGif ? (
                      <GifThumbnail url={item.url} title={item.title} />
                    ) : (
                      <Image src={item.url} alt={item.title} fill sizes="(max-width: 768px) 33vw, 20vw" className="object-cover" />
                    )}
                  </div>
                )}
                {item.type === "video" && (
                  <div className="absolute bottom-1 right-1 flex items-center gap-1 rounded-full bg-black/60 px-2 py-0.5 pointer-events-none">
                    <PlayCircle size={10} className="text-white" />
                    <span className="text-[9px] font-extrabold text-white">VIDEO</span>
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
              <div className={`${tileColors[index % tileColors.length]} grid aspect-square place-items-center overflow-hidden rounded-2xl text-center shadow-lg`}>
                {mediaContent}
              </div>
            );

            return item.url ? (
              <button key={item.id} type="button" className="block w-full h-full text-left" onClick={() => setActiveMedia({ url: item.url, type: item.type })}>{tile}</button>
            ) : (
              <div key={item.id}>{tile}</div>
            );
          })}
        </div>

      {activeMedia && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[rgba(0,0,0,0.85)] p-4" onClick={handleClose}>
          <div 
            className="relative flex max-w-[90vw] max-h-[85vh] items-center justify-center rounded-[20px] border-4 border-ocean-yellow bg-black shadow-[0_0_20px_rgba(255,215,0,0.4)] overflow-hidden" 
            onClick={(e) => e.stopPropagation()}
          >
            <button 
              type="button" 
              className="absolute right-3 top-3 z-10 grid h-8 w-8 place-items-center rounded-full bg-white text-ocean-yellow shadow-md hover:bg-white/90 transition-colors" 
              onClick={handleClose}
            >
              <X size={20} className="stroke-[3]" />
            </button>
            {isVideoFormat(activeMedia.url) ? (
              <video 
                ref={videoRef}
                src={activeMedia.url} 
                className="max-h-[85vh] max-w-[90vw] rounded-[16px] object-contain" 
                autoPlay 
                playsInline 
              />
            ) : (
              <img 
                src={activeMedia.url} 
                alt="" 
                className="max-h-[85vh] max-w-[90vw] rounded-[16px] object-contain" 
              />
            )}
          </div>
        </div>
      )}
    </section>
  );
}
