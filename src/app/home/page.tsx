"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Camera, Heart, Sparkles } from "lucide-react";
import { BirthdayInfo } from "@/components/BirthdayInfo";
import { GalleryGrid } from "@/components/gallery/GalleryGrid";
import { BottomNavigation } from "@/components/layout/BottomNavigation";
import { Shell } from "@/components/layout/Shell";
import { MusicNavControl } from "@/components/music/MusicNavControl";
import { WallOfWishes } from "@/components/wishes/WallOfWishes";
import { WishForm } from "@/components/wishes/WishForm";
import { defaultProfile, defaultSettings, sampleGallery, sampleWishes, seaFriends } from "@/constants/site";
import { listenGallery, listenProfile, listenSettings, listenWishes } from "@/lib/firestore";
import type { GalleryItem, Profile, SiteSettings, Wish } from "@/types";

export default function HomePage() {
  const [profile, setProfile] = useState<Profile>(defaultProfile);
  const [settings, setSettings] = useState<SiteSettings>(defaultSettings);
  const [gallery, setGallery] = useState<GalleryItem[]>(sampleGallery);
  const [wishes, setWishes] = useState<Wish[]>(sampleWishes);
  const [guestName, setGuestName] = useState("");
  const [isAllowed, setIsAllowed] = useState(false);

  useEffect(() => {
    const name = window.localStorage.getItem("kayla_guest_name") ?? "";
    if (!name.trim()) {
      window.location.replace("/");
      return;
    }
    setGuestName(name);
    setIsAllowed(true);

    const unsubscribers = [
      listenProfile(setProfile),
      listenSettings(setSettings),
      listenGallery(setGallery),
      listenWishes(setWishes),
    ];

    return () => unsubscribers.forEach((unsubscribe) => unsubscribe());
  }, []);

  const approvedWishes = useMemo(() => wishes.filter((wish) => wish.approved), [wishes]);

  if (!isAllowed) return null;

  return (
    <Shell>
      <div id="top" className="pb-28">
        <header className="mb-4 flex items-center justify-between gap-3">
          <Link href="/" className="flex min-w-0 items-center gap-2 font-display text-lg font-bold text-white drop-shadow">
            <span className="grid h-9 w-9 place-items-center rounded-full bg-white/20 ring-1 ring-white/30">🦈</span>
            <span className="truncate">Kayla&apos;s BD</span>
          </Link>
          <MusicNavControl musicUrl={settings.musicUrl || "/audio/baby-shark.mp3"} />
        </header>

        <section className="mb-4 overflow-hidden rounded-[30px] border border-white/40 bg-white/20 p-5 text-center shadow-glow backdrop-blur">
          <div className="mx-auto mb-3 flex h-24 w-24 items-center justify-center rounded-[30px] border-2 border-white/50 bg-white/25 text-4xl shadow-glow animate-floaty">
            🦈 🎂
          </div>
          <p className="mb-2 inline-flex rounded-full bg-ocean-yellow px-4 py-1 text-xs font-extrabold text-ocean-deep">
            Hai, {guestName || "teman Kayla"}!
          </p>
          <h1 className="font-display text-4xl font-extrabold leading-none text-white drop-shadow">
            {settings.websiteTitle}
          </h1>
          <p className="mx-auto mt-2 max-w-xs text-sm font-medium text-white/90">{profile.bio}</p>
          <div className="mt-4 flex justify-center gap-2 text-xl">
            {seaFriends.map((friend) => (
              <span key={friend} className="grid h-8 w-8 place-items-center rounded-full bg-white/20">
                {friend}
              </span>
            ))}
          </div>
        </section>

        <div className="space-y-5">
          <BirthdayInfo profile={profile} guestName={guestName} wishCount={approvedWishes.length} />

          <section className="grid grid-cols-2 gap-3">
            <a href="#gallery" className="friendly-card p-4 text-white">
              <Camera className="mb-3 text-ocean-yellow" />
              <p className="font-display text-2xl font-extrabold">{gallery.length}</p>
              <p className="text-xs font-semibold text-white/80">Momen lucu Kayla</p>
            </a>
            <a href="#wish-form" className="friendly-card p-4 text-white">
              <Heart className="mb-3 text-ocean-pink" />
              <p className="font-display text-2xl font-extrabold">{approvedWishes.length}</p>
              <p className="text-xs font-semibold text-white/80">Doa terkumpul</p>
            </a>
          </section>

          <GalleryGrid items={gallery} />
          <WishForm defaultName={guestName} enabled={settings.formsEnabled} />
          <WallOfWishes wishes={approvedWishes} />

          <footer className="pt-6 text-center">
            <div className="mx-auto mb-3 grid h-12 w-12 place-items-center rounded-full bg-white/20 text-2xl ring-1 ring-white/30">
              <Sparkles size={24} className="text-ocean-yellow" />
            </div>
            <p className="font-display text-lg font-bold text-white">Kayla&apos;s 2nd Birthday 🎂</p>
            <p className="text-xs font-medium text-white/70">Terima kasih sudah ikut merayakan hari spesial Kayla.</p>
          </footer>
        </div>
      </div>

      <a
        href="#wish-form"
        className="fixed bottom-24 right-[calc(50%-200px)] z-30 inline-flex h-12 items-center gap-2 rounded-full bg-ocean-yellow px-5 font-bold text-ocean-deep shadow-glow max-[430px]:right-4"
      >
        <Heart size={18} />
        Kirim doa
      </a>
      <BottomNavigation />
    </Shell>
  );
}