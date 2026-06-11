"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowRight, MapPin, UserRound, UsersRound } from "lucide-react";
import { createGuest } from "@/lib/firestore";

export function GuestGate() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [city, setCity] = useState("");
  const [relation, setRelation] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");

    if (!name.trim() || !city.trim() || !relation.trim()) {
      setError("Isi dulu ya, supaya Kayla tahu siapa yang datang.");
      return;
    }

    setLoading(true);
    if (typeof window !== "undefined") {
      window.localStorage.setItem("kayla_guest_name", name.trim());
      window.localStorage.setItem("kayla_music_autoplay", "1");
    }

    try {
      await Promise.race([
        createGuest({
          name: name.trim(),
          city: city.trim(),
          relation: relation.trim(),
        }),
        new Promise((_, reject) => {
          window.setTimeout(() => reject(new Error("Supabase timeout")), 8000);
        }),
      ]);
      router.push("/home");
    } catch (err) {
      router.push("/home");
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
        <div className="mx-auto mb-3 grid h-20 w-20 place-items-center rounded-full bg-ocean-yellow text-4xl text-ocean-deep shadow-glow">
          🎂
        </div>
        <p className="text-lg font-bold">🦈 🐠 🫧 🌊</p>
        <h1 className="font-display text-4xl font-extrabold leading-none text-white drop-shadow">
          Pesta Kayla
          <span className="block text-2xl text-ocean-yellow">ulang tahun ke-2</span>
        </h1>
        <p className="mt-2 text-sm font-medium text-white/80">Masuk dulu, lalu musik dan pesta lautnya mulai.</p>
      </div>

      <div className="h-1 rounded-full bg-gradient-to-r from-ocean-yellow via-ocean-pink to-ocean-aqua" />

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
        className="flex h-14 w-full items-center justify-center gap-2 rounded-full bg-ocean-yellow font-display text-lg font-extrabold text-ocean-deep shadow-glow disabled:opacity-60"
      >
        {loading ? "Membuka pesta..." : "Masuk ke pesta"}
        <ArrowRight size={18} />
      </button>

      <p className="text-center text-xs font-medium text-white/70">Kayla 2nd Birthday · 2026</p>
    </motion.form>
  );
}
