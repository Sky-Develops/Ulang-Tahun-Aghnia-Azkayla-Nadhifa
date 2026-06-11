"use client";

import { useEffect, useRef, useState } from "react";
import { Volume1, Volume2, VolumeX } from "lucide-react";

export function MusicNavControl({ musicUrl }: { musicUrl?: string }) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [muted, setMuted] = useState(false);
  const [volume, setVolume] = useState(0.55);
  const [playing, setPlaying] = useState(false);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !musicUrl) return;

    audio.volume = volume;
    audio.muted = muted;

    const shouldAutoplay = window.localStorage.getItem("kayla_music_autoplay") === "1";
    if (!shouldAutoplay) return;

    audio
      .play()
      .then(() => setPlaying(true))
      .catch(() => setPlaying(false));
  }, [musicUrl, muted, volume]);

  const toggleMute = async () => {
    const audio = audioRef.current;
    if (!audio || !musicUrl) return;

    if (!playing) {
      try {
        audio.volume = volume;
        await audio.play();
        setPlaying(true);
      } catch {
        return;
      }
    }

    const nextMuted = !muted;
    audio.muted = nextMuted;
    setMuted(nextMuted);
  };

  return (
    <div className="flex h-10 items-center gap-2 rounded-full bg-white/20 px-2 text-white ring-1 ring-white/30 backdrop-blur">
      <button
        type="button"
        onClick={toggleMute}
        disabled={!musicUrl}
        className="grid h-8 w-8 place-items-center rounded-full bg-ocean-yellow text-ocean-deep disabled:opacity-45"
        aria-label={muted ? "Nyalakan musik" : "Matikan musik"}
      >
        {!musicUrl || muted ? <VolumeX size={17} /> : volume < 0.45 ? <Volume1 size={17} /> : <Volume2 size={17} />}
      </button>
      <input
        aria-label="Volume musik"
        type="range"
        min="0"
        max="1"
        step="0.05"
        value={volume}
        disabled={!musicUrl}
        onChange={(event) => {
          const nextVolume = Number(event.target.value);
          setVolume(nextVolume);
          if (audioRef.current) {
            audioRef.current.volume = nextVolume;
            audioRef.current.muted = nextVolume === 0;
          }
          setMuted(nextVolume === 0);
        }}
        className="w-16 accent-ocean-yellow disabled:opacity-45"
      />
      {musicUrl ? <audio ref={audioRef} src={musicUrl} loop preload="none" /> : null}
    </div>
  );
}
