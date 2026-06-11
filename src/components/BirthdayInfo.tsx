import type { Profile } from "@/types";
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
      <p className="text-sm font-medium text-white/80">Selamat datang di pesta kecil Kayla.</p>

      <div className="mt-4 rounded-[28px] border border-white/40 bg-white/20 p-4 shadow-glow">
        <div className="flex items-center gap-4">
          <div className="grid h-20 w-20 shrink-0 place-items-center overflow-hidden rounded-full border-4 border-ocean-yellow bg-white text-4xl">
            {profile.photoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={profile.photoUrl} alt={profile.name} className="h-full w-full object-cover" />
            ) : (
              "👶"
            )}
          </div>
          <div className="min-w-0">
            <h2 className="font-display text-2xl font-extrabold text-ocean-yellow drop-shadow">
              {profile.name} Putri ✨
            </h2>
            <p className="text-sm font-semibold">🎂 {formatBirthdayDate(profile.birthDate)}</p>
            <p className="font-bold text-ocean-yellow">🎉 {age} tahun hari ini</p>
            <p className="text-sm font-medium text-white/80">📍 {profile.city}</p>
          </div>
        </div>
        <div className="mt-4 grid grid-cols-3 gap-2 text-center text-xs font-bold">
          <span className="rounded-full bg-white/25 px-2 py-2">🦈 Baby Shark</span>
          <span className="rounded-full bg-white/25 px-2 py-2">{wishCount} doa</span>
          <span className="rounded-full bg-white/25 px-2 py-2">💃 Ceria</span>
        </div>
        <p className="mt-3 rounded-2xl bg-ocean-yellow px-3 py-2 text-center text-xs font-extrabold text-ocean-deep">
          Selamat ulang tahun ke-{age}, Kayla sayang 🎈
        </p>
      </div>
    </section>
  );
}
