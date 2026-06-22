"use client";

import { useState } from "react";
import { KeyRound } from "lucide-react";
import { Shell } from "@/components/layout/Shell";
import { TopBar } from "@/components/layout/TopBar";
import { supabase } from "@/lib/supabase";

export default function LoginPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const loginWithGoogle = async () => {
    try {
      setLoading(true);
      setError("");
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/auth/callback?next=/dashboard`,
        },
      });
      if (error) throw error;
    } catch (err: any) {
      setError(err.message || "Failed to login with Google");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Shell>
      <TopBar title="Admin Panel" showAdmin={false} />
      <div className="flex min-h-[calc(100vh-5rem)] items-center">
        <div className="ocean-panel w-full space-y-4 rounded-3xl p-5 text-center">
          <div className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-ocean-yellow text-white">
            <KeyRound size={30} />
          </div>
          <div>
            <h1 className="font-display text-2xl font-extrabold">Admin Access</h1>
            <p className="text-sm text-white/65">Hanya admin yang bisa mengakses halaman ini.</p>
          </div>
          {error ? <p className="rounded-2xl bg-ocean-coral/20 p-3 text-sm">{error}</p> : null}
          <button
            onClick={loginWithGoogle}
            disabled={loading}
            className="flex h-14 w-full items-center justify-center gap-2 rounded-full bg-gradient-to-r from-ocean-turquoise to-ocean-mid font-display text-lg font-extrabold text-white shadow-glow disabled:opacity-50"
          >
            {loading ? "Menghubungkan..." : "🦈 Login with Google"}
          </button>
        </div>
      </div>
    </Shell>
  );
}
