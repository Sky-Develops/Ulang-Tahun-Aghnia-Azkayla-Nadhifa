"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowRight, MapPin, RefreshCw, UserRound, UsersRound } from "lucide-react";
import { createGuest } from "@/lib/firestore";

// Unlocks audio playback policy and sets the autoplay flag
const unlockAudio = () => {
  window.localStorage.setItem("kayla_music_autoplay", "1");
  const AudioCtx = (window as any).AudioContext || (window as any).webkitAudioContext;
  if (AudioCtx) {
    const ctx = new AudioCtx();
    ctx.resume().then(() => ctx.close()).catch(() => {});
  }
};

const STORAGE_KEYS = {
  name: "kayla_guest_name",
  city: "kayla_guest_city",
  relation: "kayla_guest_relation",
  registered: "kayla_registered",
};

function getSavedGuest() {
  if (typeof window === "undefined") return null;
  const registered = window.localStorage.getItem(STORAGE_KEYS.registered);
  if (registered !== "1") return null;
  return {
    name: window.localStorage.getItem(STORAGE_KEYS.name) ?? "",
    city: window.localStorage.getItem(STORAGE_KEYS.city) ?? "",
    relation: window.localStorage.getItem(STORAGE_KEYS.relation) ?? "",
  };
}

function saveGuest(name: string, city: string, relation: string) {
  window.localStorage.setItem(STORAGE_KEYS.name, name);
  window.localStorage.setItem(STORAGE_KEYS.city, city);
  window.localStorage.setItem(STORAGE_KEYS.relation, relation);
  window.localStorage.setItem(STORAGE_KEYS.registered, "1");
  window.localStorage.setItem("kayla_music_autoplay", "1");
}

export function GuestGate() {
  const saved = getSavedGuest();
  const [showChangeForm, setShowChangeForm] = useState(false);
  const [name, setName] = useState(saved?.name ?? "");
  const [city, setCity] = useState(saved?.city ?? "");
  const [relation, setRelation] = useState(saved?.relation ?? "");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  if (saved && !showChangeForm) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        className="friendly-card space-y-4 p-5 text-center text-white"
      >
        <div className="mx-auto grid h-20 w-20 place-items-center rounded-full bg-ocean-yellow text-4xl text-white shadow-glow">
          {"🎂"}
        </div>
        <p className="text-lg font-bold">{"🦈 🐠 🫧 🌊"}</p>
        <h1 className="font-display text-4xl font-extrabold leading-none text-white drop-shadow">
          Pesta Kayla
          <span className="block text-2xl text-ocean-yellow">ulang tahun ke-2</span>
        </h1>
        <div className="rounded-2xl bg-white/10 p-3 text-sm">
          <p className="font-bold text-ocean-yellow">{"Selamat datang kembali! 👋"}</p>
          <p className="mt-1 text-white/80">
            Hai <span className="font-bold text-white">{saved.name}</span>!
          </p>
        </div>
        <a
          href="/home"
          className="flex h-14 w-full items-center justify-center gap-2 rounded-full bg-ocean-yellow font-display text-lg font-extrabold text-white shadow-glow"
          onClick={() => {
            unlockAudio();
          }}
        >
          Masuk ke pesta
          <ArrowRight size={18} />
        </a>
        <button
          type="button"
          onClick={() => setShowChangeForm(true)}
          className="flex w-full items-center justify-center gap-1.5 text-xs font-medium text-white/50 hover:text-white/80"
        >
          <RefreshCw size={12} />
          Bukan {saved.name}? Ganti identitas
        </button>
      </motion.div>
    );
  }

  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");

    if (!name.trim() || !city.trim() || !relation.trim()) {
      setError("Isi dulu ya, supaya Kayla tahu siapa yang datang.");
      return;
    }

    const lastRegStr = window.localStorage.getItem("kayla_last_reg_time");
    if (lastRegStr) {
      const lastReg = parseInt(lastRegStr, 10);
      if (Date.now() - lastReg < 30000) {
        setError("Tunggu sebentar sebelum mengirim data lagi ya! 😊");
        return;
      }
    }

    setLoading(true);
    saveGuest(name.trim(), city.trim(), relation.trim());
    window.localStorage.setItem("kayla_last_reg_time", Date.now().toString());

    try {
      await Promise.race([
        createGuest({ name: name.trim(), city: city.trim(), relation: relation.trim() }),
        new Promise((_, reject) => {
          window.setTimeout(() => reject(new Error("Timeout")), 8000);
        }),
      ]);
    } catch {
      // Tetap lanjut meski DB gagal
    } finally {
      // Unlock audio before navigation to ensure autoplay works later
      unlockAudio();
      window.location.href = "/home";
    }
  };

  return (
    <motion.form
      onSubmit={submit}
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      className="friendly-card space-y-4 p-5 text-white"
    >
      <div className="text-center">
        <div className="mx-auto mb-3 grid h-20 w-20 place-items-center rounded-full bg-ocean-yellow text-4xl text-white shadow-glow">
          {"🎂"}
        </div>
        <p className="text-lg font-bold">{"🦈 🐠 🫧 🌊"}</p>
        <h1 className="font-display text-4xl font-extrabold leading-none text-white drop-shadow">
          Pesta Kayla
          <span className="block text-2xl text-ocean-yellow">ulang tahun ke-2</span>
        </h1>
        <p className="mt-2 text-sm font-medium text-white/80">
          {showChangeForm ? "Masukkan data kamu yang baru." : "Masuk dulu, lalu musik dan pesta lautnya mulai."}
        </p>
      </div>

      <div className="h-1 rounded-full bg-gradient-to-r from-ocean-yellow via-ocean-coral to-ocean-aqua" />

      <label className="block">
        <span className="mb-1 flex items-center gap-2 text-sm font-bold text-ocean-yellow">
          <UserRound size={16} />
          Nama kamu
        </span>
        <input
          value={name}
          onChange={(event) => setName(event.target.value)}
          placeholder="Contoh: Mama Yola"
          className="h-14 w-full rounded-2xl border border-white/40 bg-white/20 px-4 text-white outline-none placeholder:text-white/60 focus:border-ocean-yellow"
        />
      </label>

      <label className="block">
        <span className="mb-1 flex items-center gap-2 text-sm font-bold text-ocean-yellow">
          <MapPin size={16} />
          Kota atau alamat
        </span>
        <input
          value={city}
          onChange={(event) => setCity(event.target.value)}
          placeholder="Contoh: Surabaya"
          className="h-14 w-full rounded-2xl border border-white/40 bg-white/20 px-4 text-white outline-none placeholder:text-white/60 focus:border-ocean-yellow"
        />
      </label>

      <label className="block">
        <span className="mb-1 flex items-center gap-2 text-sm font-bold text-ocean-yellow">
          <UsersRound size={16} />
          Hubungan dengan Kayla
        </span>
        <input
          value={relation}
          onChange={(event) => setRelation(event.target.value)}
          placeholder="Contoh: Tante, Om, teman mama"
          className="h-14 w-full rounded-2xl border border-white/40 bg-white/20 px-4 text-white outline-none placeholder:text-white/60 focus:border-ocean-yellow"
        />
      </label>

      {error ? <p className="rounded-2xl bg-ocean-coral/25 p-3 text-sm font-semibold text-white">{error}</p> : null}

      <button
        type="submit"
        disabled={loading}
        className="flex h-14 w-full items-center justify-center gap-2 rounded-full bg-ocean-yellow font-display text-lg font-extrabold text-white shadow-glow disabled:opacity-60"
      >
        {loading ? "Menyimpan..." : "Masuk ke pesta"}
        <ArrowRight size={18} />
      </button>

      <p className="text-center text-xs font-medium text-white/70">{"Kayla 2nd Birthday · 2026"}</p>
    </motion.form>
  );
}
