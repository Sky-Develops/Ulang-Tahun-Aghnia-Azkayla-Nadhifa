"use client";

import { Camera, Heart, Home, Sparkles, UserRound } from "lucide-react";

const links = [
  { href: "#top", label: "Home", icon: Home },
  { href: "#gallery", label: "Galeri", icon: Camera },
  { href: "#wish-form", label: "Doa", icon: Heart },
  { href: "#wishes", label: "Bubble", icon: Sparkles },
  { href: "#profile", label: "Kayla", icon: UserRound },
];

export function BottomNavigation() {
  return (
    <nav className="safe-bottom fixed inset-x-0 bottom-0 z-30 mx-auto max-w-[430px] px-4">
      <div className="grid grid-cols-5 rounded-t-3xl border border-white/40 bg-white/25 px-2 py-2 shadow-glow backdrop-blur">
        {links.map((item) => {
          const Icon = item.icon;
          return (
            <a
              key={item.href}
              href={item.href}
              className="flex flex-col items-center gap-1 rounded-2xl px-1 py-2 text-[10px] font-bold text-white transition hover:bg-white/20"
            >
              <Icon size={18} />
              {item.label}
            </a>
          );
        })}
      </div>
    </nav>
  );
}
