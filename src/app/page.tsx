"use client";

import { useEffect } from "react";
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
      </div>
    </Shell>
  );
}