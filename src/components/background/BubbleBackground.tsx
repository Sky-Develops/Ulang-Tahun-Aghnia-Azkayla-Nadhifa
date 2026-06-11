"use client";

const bubbles = Array.from({ length: 50 }, (_, index) => ({
  id: index,
  left: `${(index * 37) % 100}%`,
  size: 10 + ((index * 13) % 26),
  delay: `${(index * 0.63) % 12}s`,
  duration: `${8 + ((index * 7) % 14)}s`,
}));

export function BubbleBackground() {
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
      {bubbles.map((bubble) => (
        <span
          key={bubble.id}
          className="absolute rounded-full border border-ocean-aqua/40 bg-ocean-aqua/10"
          style={{
            left: bubble.left,
            width: bubble.size,
            height: bubble.size,
            animation: `rise ${bubble.duration} linear ${bubble.delay} infinite`,
          }}
        />
      ))}
    </div>
  );
}
