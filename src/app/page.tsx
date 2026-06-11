"use client";

import { useEffect } from "react";
import Link from "next/link";
import { GuestGate } from "@/components/GuestGate";
import { Shell } from "@/components/layout/Shell";
import { TopBar } from "@/components/layout/TopBar";
import { initAnalytics } from "@/lib/supabase";

export default function LandingPage() {
  useEffect(() => {
    void initAnalytics();
  }, []);

  return (
    <Shell>
      <TopBar />
      <div className="flex min-h-[calc(100vh-5rem)] flex-col justify-center gap-4 py-6">
        <GuestGate />
        <Link
          href="/home"
          className="mx-auto rounded-full bg-white/10 px-5 py-3 text-sm font-bold text-ocean-aqua ring-1 ring-ocean-aqua/30"
        >
          Lewati dan lihat pesta
        </Link>
      </div>
    </Shell>
  );
}
