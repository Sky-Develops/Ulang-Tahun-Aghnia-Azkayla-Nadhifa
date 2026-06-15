"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import type { User } from "@supabase/supabase-js";
import { ImagePlus, KeyRound, LogOut, Save, Trash2, Upload, Video, Wand2 } from "lucide-react";
import { Shell } from "@/components/layout/Shell";
import { TopBar } from "@/components/layout/TopBar";
import {
  createGalleryItem,
  deleteGalleryItem,
  deleteWish,
  listenGallery,
  listenGuests,
  listenProfile,
  listenSettings,
  listenWishes,
  saveProfile,
  saveSettings,
  updateWish,
} from "@/lib/firestore";
import { uploadGalleryFile, uploadProfilePhoto } from "@/lib/storage";
import { supabase } from "@/lib/supabase";
import { defaultProfile, defaultSettings, sampleGallery, sampleWishes } from "@/constants/site";
import type { GalleryItem, GalleryType, Guest, Profile, SiteSettings, Wish } from "@/types";

const ADMIN_EMAIL = process.env.NEXT_PUBLIC_ADMIN_EMAIL ?? "";

export default function AdminPage() {
  const [user, setUser] = useState<User | null>(null);
  const [password, setPassword] = useState("");
  const [authMessage, setAuthMessage] = useState("");

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      const nextUser = data.user;
      if (nextUser?.email === ADMIN_EMAIL) setUser(nextUser);
    });

    const { data } = supabase.auth.onAuthStateChange((_event, session) => {
      const nextUser = session?.user ?? null;
      if (nextUser && nextUser.email !== ADMIN_EMAIL) {
        setAuthMessage("Akun ini bukan admin website.");
        supabase.auth.signOut();
        setUser(null);
        return;
      }
      setUser(nextUser);
    });

    return () => data.subscription.unsubscribe();
  }, []);

  const login = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setAuthMessage("");
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: ADMIN_EMAIL,
        password,
      });
      if (error) throw error;
    } catch (error) {
      setAuthMessage("Login gagal. Pastikan akun admin sudah dibuat di Supabase Authentication.");
    }
  };

  if (!user) {
    return (
      <Shell>
        <TopBar title="Admin Panel" showAdmin={false} />
        <div className="flex min-h-[calc(100vh-5rem)] items-center">
          <form onSubmit={login} className="ocean-panel w-full space-y-4 rounded-3xl p-5 text-center">
            <div className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-ocean-yellow text-ocean-deep">
              <KeyRound size={30} />
            </div>
            <div>
              <h1 className="font-display text-2xl font-extrabold">Admin Access</h1>
              <p className="text-sm text-white/65">Hanya admin yang bisa mengakses halaman ini.</p>
            </div>
            <input
              type="email"
              value={ADMIN_EMAIL}
              readOnly
              className="h-12 w-full rounded-2xl border border-ocean-aqua/30 bg-white/10 px-4 py-3 text-white/70 outline-none"
            />
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="Password Admin"
              className="h-12 w-full rounded-2xl border border-ocean-aqua/30 bg-white/10 px-4 py-3 text-white outline-none placeholder:text-white/45 focus:border-ocean-yellow"
            />
            {authMessage ? <p className="rounded-2xl bg-ocean-coral/20 p-3 text-sm">{authMessage}</p> : null}
            <button className="h-14 w-full rounded-full bg-gradient-to-r from-ocean-turquoise to-ocean-mid font-display text-lg font-extrabold text-white shadow-glow">
              🦈 Login Admin
            </button>
          </form>
        </div>
      </Shell>
    );
  }

  return <AdminDashboard />;
}

function AdminDashboard() {
  const [profile, setProfile] = useState<Profile>(defaultProfile);
  const [settings, setSettings] = useState<SiteSettings>(defaultSettings);
  const [gallery, setGallery] = useState<GalleryItem[]>(sampleGallery);
  const [wishes, setWishes] = useState<Wish[]>(sampleWishes);
  const [guests, setGuests] = useState<Guest[]>([]);
  const [profileUploadProgress, setProfileUploadProgress] = useState(0);
  const [galleryUploadProgress, setGalleryUploadProgress] = useState(0);
  const [notice, setNotice] = useState("");

  useEffect(() => {
    if (!notice || profileUploadProgress || galleryUploadProgress) return;
    const timer = window.setTimeout(() => setNotice(""), 5000);
    return () => window.clearTimeout(timer);
  }, [notice, profileUploadProgress, galleryUploadProgress]);

  useEffect(() => {
    const unsubscribers = [
      listenProfile(setProfile),
      listenSettings(setSettings),
      listenGallery(setGallery),
      listenWishes(setWishes, true),
      listenGuests(setGuests),
    ];
    return () => unsubscribers.forEach((unsubscribe) => unsubscribe());
  }, []);

  const approvedCount = useMemo(() => wishes.filter((wish) => wish.approved).length, [wishes]);

  const submitProfile = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    await saveProfile(profile);
    setNotice("Profile berhasil disimpan.");
  };

  const uploadProfile = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setProfileUploadProgress(1);
    setNotice("Mengoptimalkan foto profile ke WebP...");
    try {
      const photoUrl = await uploadProfilePhoto(file, setProfileUploadProgress);
      const nextProfile = { ...profile, photoUrl };
      setProfile(nextProfile);
      await saveProfile(nextProfile);
      setNotice("Foto profile berhasil diupload dan dikonversi ke WebP.");
    } catch (error) {
      setNotice("Upload foto profile gagal. Pastikan file berupa PNG, JPG, atau JPEG dan policy Storage Supabase sudah benar.");
    } finally {
      event.target.value = "";
      setProfileUploadProgress(0);
    }
  };

  const submitSettings = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    await saveSettings(settings);
    setNotice("Pengaturan website berhasil disimpan.");
  };

  const upload = async (event: React.ChangeEvent<HTMLInputElement>, type: GalleryType) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setGalleryUploadProgress(1);
    setNotice(type === "photo" ? "Mengoptimalkan foto ke WebP..." : "Mengonversi video ke GIF...");
    try {
      const url = await uploadGalleryFile(file, type, setGalleryUploadProgress);
      await createGalleryItem({
        type,
        url,
        title: file.name.replace(/\.[^.]+$/, ""),
        order: gallery.length,
      });
      setNotice(type === "photo" ? "Foto berhasil diupload sebagai WebP." : "Video berhasil dikonversi dan diupload sebagai GIF.");
    } catch (error) {
      setNotice("Upload gagal. Cek format file dan policy Storage Supabase.");
    } finally {
      event.target.value = "";
      setGalleryUploadProgress(0);
    }
  };

  return (
    <Shell>
      <div className="pb-10">
        <header className="mb-4 flex items-center justify-between">
          <Link href="/home" className="rounded-full bg-ocean-aqua/15 px-4 py-2 text-sm font-bold text-ocean-aqua ring-1 ring-ocean-aqua/30">
            ← Kembali
          </Link>
          <h1 className="font-display text-lg font-bold">⚙️ Admin Panel</h1>
          <button
            onClick={() => supabase.auth.signOut()}
            className="grid h-10 w-10 place-items-center rounded-full bg-ocean-coral/25 text-ocean-coral ring-1 ring-ocean-coral/40"
            aria-label="Logout"
          >
            <LogOut size={18} />
          </button>
        </header>

        <div className="space-y-4">
          <section className="grid grid-cols-3 gap-3">
            <Stat icon="📸" value={gallery.length} label="Foto/Video" />
            <Stat icon="💌" value={wishes.length} label="Ucapan" />
            <Stat icon="👥" value={guests.length} label="Tamu" />
          </section>

          {notice ? (
            <div className="fixed left-4 right-4 top-4 z-50 mx-auto max-w-[420px] rounded-2xl border border-ocean-aqua/40 bg-ocean-deep/95 px-4 py-3 text-sm font-semibold text-white shadow-glow backdrop-blur">
              {notice}
            </div>
          ) : null}

          <form onSubmit={submitProfile} className="ocean-panel space-y-3 rounded-3xl p-4">
            <h2 className="font-display text-xl font-bold text-ocean-yellow">🌟 Kelola Profile</h2>
            <AdminInput label="Nama" value={profile.name} onChange={(value) => setProfile({ ...profile, name: value })} />
            <AdminInput label="Tanggal Lahir" type="date" value={profile.birthDate} onChange={(value) => setProfile({ ...profile, birthDate: value })} />
            <AdminInput label="Kota" value={profile.city} onChange={(value) => setProfile({ ...profile, city: value })} />
            <AdminInput label="Bio" value={profile.bio} onChange={(value) => setProfile({ ...profile, bio: value })} />
            {profile.photoUrl ? (
              <div className="flex items-center gap-3 rounded-2xl bg-white/10 p-3">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={profile.photoUrl} alt={profile.name} className="h-14 w-14 rounded-2xl object-cover" />
                <p className="text-xs font-semibold text-white/70">Foto profile aktif sudah dioptimalkan ke WebP.</p>
              </div>
            ) : null}
            <label className="flex h-12 cursor-pointer items-center justify-center gap-2 rounded-2xl bg-ocean-mid font-bold text-white">
              <Upload size={16} />
              <ImagePlus size={18} />
              <span className="text-sm">Upload Foto Profile</span>
              <input type="file" accept="image/png,image/jpeg,image/jpg,image/webp" className="hidden" onChange={uploadProfile} />
            </label>
            {profileUploadProgress ? <div className="h-3 overflow-hidden rounded-full bg-white/10"><div className="h-full bg-ocean-yellow" style={{ width: `${profileUploadProgress}%` }} /></div> : null}
            <button className="flex h-12 w-full items-center justify-center gap-2 rounded-full bg-ocean-green font-bold text-ocean-deep">
              <Save size={18} />
              Simpan Profile
            </button>
          </form>

          <section className="ocean-panel space-y-3 rounded-3xl p-4">
            <h2 className="font-display text-xl font-bold text-ocean-yellow">🖼️ Kelola Album & Galeri</h2>
            <div className="grid grid-cols-2 gap-3">
              <UploadButton type="photo" label="+ Upload Foto" icon={<ImagePlus size={18} />} onChange={upload} />
              <UploadButton type="video" label="+ Upload Video" icon={<Video size={18} />} onChange={upload} />
            </div>
            {galleryUploadProgress ? <div className="h-3 overflow-hidden rounded-full bg-white/10"><div className="h-full bg-ocean-yellow" style={{ width: `${galleryUploadProgress}%` }} /></div> : null}
            <div className="max-h-56 space-y-2 overflow-y-auto">
              {gallery.map((item) => (
                <div key={item.id} className="flex items-center justify-between rounded-2xl bg-white/10 px-3 py-2 text-sm">
                  <span className="truncate">{item.type === "photo" ? "📷" : "🎥"} {item.title}</span>
                  <button onClick={() => deleteGalleryItem(item.id)} className="text-ocean-coral" aria-label={`Hapus ${item.title}`}>
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
            </div>
          </section>

          <section className="ocean-panel space-y-3 rounded-3xl p-4">
            <h2 className="font-display text-xl font-bold text-ocean-yellow">💌 Kelola Ucapan</h2>
            <div className="grid grid-cols-2 gap-2">
              <p className="rounded-2xl bg-ocean-mid/45 p-3 text-center text-sm font-bold">{approvedCount} Disetujui</p>
              <p className="rounded-2xl bg-ocean-orange/20 p-3 text-center text-sm font-bold">{wishes.length - approvedCount} Pending</p>
            </div>
            <div className="max-h-80 space-y-2 overflow-y-auto">
              {wishes.map((wish) => (
                <article key={wish.id} className="rounded-2xl bg-white/10 p-3 text-sm">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="font-bold text-ocean-aqua">{wish.name ?? "Tamu"}</p>
                      <p className="text-white/75">{wish.message}</p>
                    </div>
                    <button onClick={() => deleteWish(wish.id)} className="text-ocean-coral" aria-label={`Hapus ucapan ${wish.name ?? "Tamu"}`}>
                      <Trash2 size={16} />
                    </button>
                  </div>
                  <div className="mt-3 grid grid-cols-2 gap-2">
                    <button
                      onClick={() => updateWish(wish.id, { approved: !wish.approved })}
                      className="rounded-full bg-ocean-green/25 px-3 py-2 text-xs font-bold"
                    >
                      {wish.approved ? "Sembunyikan" : "Approve"}
                    </button>
                    <button
                      onClick={() => updateWish(wish.id, { pinned: !wish.pinned })}
                      className="rounded-full bg-ocean-yellow/20 px-3 py-2 text-xs font-bold text-ocean-yellow"
                    >
                      {wish.pinned ? "Unpin" : "Pin"}
                    </button>
                  </div>
                </article>
              ))}
            </div>
          </section>

          <form onSubmit={submitSettings} className="ocean-panel space-y-3 rounded-3xl p-4">
            <h2 className="font-display text-xl font-bold text-ocean-yellow">🌐 Pengaturan Website</h2>
            <AdminInput label="Judul Website" value={settings.websiteTitle} onChange={(value) => setSettings({ ...settings, websiteTitle: value })} />
            <AdminInput label="Background Music URL" value={settings.musicUrl} onChange={(value) => setSettings({ ...settings, musicUrl: value })} />
            <label className="flex items-center justify-between rounded-2xl bg-white/10 px-3 py-3 text-sm">
              <span>Aktifkan Form Ucapan</span>
              <input
                type="checkbox"
                checked={settings.formsEnabled}
                onChange={(event) => setSettings({ ...settings, formsEnabled: event.target.checked })}
                className="h-5 w-5 accent-ocean-yellow"
              />
            </label>
            <button className="flex h-12 w-full items-center justify-center gap-2 rounded-full bg-ocean-mid font-bold text-white">
              <Wand2 size={18} />
              Simpan Pengaturan
            </button>
          </form>
        </div>
      </div>
    </Shell>
  );
}

function Stat({ icon, value, label }: { icon: string; value: number; label: string }) {
  return (
    <div className="ocean-panel rounded-2xl p-3 text-center">
      <p className="text-xl">{icon}</p>
      <p className="font-display text-2xl font-extrabold text-ocean-yellow">{value}</p>
      <p className="text-[10px] text-white/65">{label}</p>
    </div>
  );
}

function AdminInput({
  label,
  value,
  onChange,
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
}) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-bold text-ocean-aqua">{label}</span>
      <input
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="h-11 w-full rounded-2xl border border-ocean-aqua/25 bg-white/10 px-3 text-sm text-white outline-none focus:border-ocean-yellow"
      />
    </label>
  );
}

function UploadButton({
  type,
  label,
  icon,
  onChange,
}: {
  type: GalleryType;
  label: string;
  icon: React.ReactNode;
  onChange: (event: React.ChangeEvent<HTMLInputElement>, type: GalleryType) => void;
}) {
  return (
    <label className="flex h-12 cursor-pointer items-center justify-center gap-2 rounded-2xl bg-ocean-mid font-bold text-white">
      <Upload size={16} />
      {icon}
      <span className="text-sm">{label}</span>
      <input type="file" accept={type === "photo" ? "image/*" : "video/*"} className="hidden" onChange={(event) => onChange(event, type)} />
    </label>
  );
}
