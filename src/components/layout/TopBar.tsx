import Link from "next/link";
import { Home } from "lucide-react";

export function TopBar({ title = "Kayla's BD", showAdmin = true }: { title?: string; showAdmin?: boolean }) {
  return (
    <header className="mb-4 flex items-center justify-between">
      <Link href="/" className="flex items-center gap-2 font-display text-lg font-bold text-white drop-shadow">
        <span>🦈</span>
        <span>{title}</span>
      </Link>
      {showAdmin ? (
        <span className="rounded-full bg-white/20 px-4 py-2 text-xs font-bold text-white ring-1 ring-white/30">
          Pesta Laut
        </span>
      ) : (
        <Link
          href="/home"
          className="inline-flex h-10 items-center gap-1 rounded-full bg-white/20 px-4 text-sm font-bold text-white ring-1 ring-white/30"
        >
          <Home size={16} />
          Home
        </Link>
      )}
    </header>
  );
}
