"use client";

import { useRef, useState } from "react";
import { Pause, Play, Volume2, VolumeX } from "lucide-react";

export function MusicPlayer({ musicUrl }: { musicUrl?: string }) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [playing, setPlaying] = useState(false);
  const [muted, setMuted] = useState(false);

  const toggle = async () => {
    if (!audioRef.current || !musicUrl) return;
    if (playing) {
      audioRef.current.pause();
      setPlaying(false);
      return;
    }
    await audioRef.current.play();
    setPlaying(true);
  };

  return (
    <section id="music" className="ocean-panel rounded-3xl p-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="font-display text-lg font-bold text-ocean-yellow">🦈 Kayla's 2nd Birthday 🎂</p>
          <p className="text-xs text-white/70">Baby Shark doo doo doo...</p>
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={toggle}
            className="grid h-11 w-11 place-items-center rounded-full bg-ocean-yellow text-white"
            aria-label={playing ? "Pause music" : "Play music"}
          >
            {playing ? <Pause size={20} /> : <Play size={20} />}
          </button>
          <button
            type="button"
            onClick={() => {
              setMuted((value) => !value);
              if (audioRef.current) audioRef.current.muted = !muted;
            }}
            className="grid h-11 w-11 place-items-center rounded-full bg-white/10 text-white ring-1 ring-white/15"
            aria-label={muted ? "Unmute music" : "Mute music"}
          >
            {muted ? <VolumeX size={20} /> : <Volume2 size={20} />}
          </button>
        </div>
      </div>
      {musicUrl ? <audio ref={audioRef} src={musicUrl} loop preload="none" /> : null}
    </section>
  );
}
