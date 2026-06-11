"use client";

import { useState } from "react";
import Confetti from "react-confetti";
import { Send } from "lucide-react";
import { createWish } from "@/lib/firestore";

export function WishForm({ defaultName = "", enabled = true }: { defaultName?: string; enabled?: boolean }) {
  const [name, setName] = useState(defaultName);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [confetti, setConfetti] = useState(false);
  const [notice, setNotice] = useState("");
  const [thanksPopup, setThanksPopup] = useState(false);

  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!enabled) return;

    if (!name.trim() || !message.trim()) {
      setNotice("Isi nama dan doanya dulu ya.");
      return;
    }

    setLoading(true);
    setNotice("");
    try {
      await createWish({ name: name.trim(), message: message.trim() });
      setMessage("");
      setConfetti(true);
      setThanksPopup(true);
      window.setTimeout(() => setConfetti(false), 5000);
      window.setTimeout(() => setThanksPopup(false), 5000);
    } catch (error) {
      setNotice("Doa belum terkirim. Cek koneksi atau policy Supabase.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section id="wish-form" className="relative">
      {confetti ? <Confetti recycle={false} numberOfPieces={260} /> : null}
      {thanksPopup ? (
        <div className="wish-thanks-overlay" aria-live="polite" aria-label="Terima kasih sudah mengirim ucapan">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/assets/notif-ucapan.webp" alt="Terima kasih sudah memeriahkan acara Kayla" className="wish-thanks-image" />
        </div>
      ) : null}
      <form onSubmit={submit} className="friendly-card space-y-3 p-4 text-white">
        <div>
          <h2 className="border-l-4 border-ocean-yellow pl-3 font-display text-2xl font-extrabold">
            Kirim doa manis 💌
          </h2>
          <p className="pl-4 text-xs font-medium text-white/75">Nama pengirim disimpan untuk admin, tapi tidak tampil di publik.</p>
        </div>
        <label className="block">
          <span className="mb-1 block text-sm font-bold text-ocean-yellow">Nama kamu</span>
          <input
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="Contoh: Tante Rani"
            disabled={!enabled}
            className="h-14 w-full rounded-2xl border border-white/40 bg-white/20 px-4 text-white outline-none placeholder:text-white/60 focus:border-ocean-yellow disabled:opacity-50"
          />
        </label>
        <label className="block">
          <span className="mb-1 block text-sm font-bold text-ocean-yellow">Doa untuk Kayla</span>
          <textarea
            value={message}
            onChange={(event) => setMessage(event.target.value)}
            placeholder="Tulis doa atau ucapan singkat untuk Kayla..."
            disabled={!enabled}
            rows={4}
            className="w-full resize-none rounded-2xl border border-white/40 bg-white/20 px-4 py-3 text-white outline-none placeholder:text-white/60 focus:border-ocean-yellow disabled:opacity-50"
          />
        </label>
        {notice ? <p className="rounded-2xl bg-white/20 px-3 py-2 text-sm font-medium">{notice}</p> : null}
        <button
          type="submit"
          disabled={loading || !enabled}
          className="flex h-14 w-full items-center justify-center gap-2 rounded-full bg-gradient-to-r from-ocean-pink to-ocean-coral font-display text-lg font-extrabold text-white shadow-glow disabled:opacity-60"
        >
          <Send size={18} />
          {loading ? "Mengirim..." : "Kirim doa"}
        </button>
      </form>
    </section>
  );
}
