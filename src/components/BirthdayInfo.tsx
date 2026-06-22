import type { Profile } from "@/types";
import Image from "next/image";
import { calculateAge, formatBirthdayDate } from "@/lib/utils";

export function BirthdayInfo({
  profile,
  guestName,
  wishCount,
}: {
  profile: Profile;
  guestName: string;
  wishCount: number;
}) {
  const age = calculateAge(profile.birthDate) || profile.age;

  return (
    <section id="profile" className="friendly-card p-4 text-white">
      <p className="font-display text-2xl font-extrabold">Hai, {guestName || "teman Kayla"}! 👋</p>
      <p className="text-sm font-medium text-white/80">Selamat datang di pesta kecil Aghnia.</p>

      <div className="mt-4 rounded-[28px] border border-white/40 bg-white/20 p-4 shadow-glow">
        <div className="flex items-center gap-4">
          <div className="grid h-20 w-20 shrink-0 place-items-center overflow-hidden rounded-full border-4 border-ocean-yellow bg-white text-4xl">
            {profile.photoUrl ? (
              <Image src={profile.photoUrl} alt={profile.name} width={80} height={80} className="h-full w-full object-cover" />
            ) : (
              "👶"
            )}
          </div>
          <div className="min-w-0">
            <h2 className="font-display text-2xl font-extrabold text-ocean-yellow drop-shadow">
              {profile.name} ✨
            </h2>
            <p className="text-sm font-semibold">🎂 {formatBirthdayDate(profile.displayDate || profile.birthDate)}</p>
            <p className="font-bold text-ocean-yellow">🎉 {age} tahun hari ini</p>
            <p className="text-sm font-medium text-white/80">📍 {profile.city}</p>
          </div>
        </div>
        <p className="mt-4 rounded-2xl border border-white/30 bg-white/20 px-3 py-2 text-center text-sm font-semibold italic text-white">
          💬 &ldquo;Doa dari kalian yang aku tunggu..&rdquo;
        </p>
      </div>
    </section>
  );
}

