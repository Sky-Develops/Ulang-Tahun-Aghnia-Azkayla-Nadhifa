"use client";

const fish = [
  {
    src: "/assets/fish/pixabay-orange-fish.png",
    alt: "Ikan oranye berenang",
    top: "13%",
    delay: "0s",
    duration: "22s",
    direction: "left",
    size: 58,
  },
  {
    src: "/assets/fish/pixabay-orange-fish.png",
    alt: "Ikan kecil berenang",
    top: "30%",
    delay: "2s",
    duration: "26s",
    direction: "right",
    size: 50,
  },
  {
    src: "/assets/fish/pixabay-orange-fish.png",
    alt: "Ikan laut berenang",
    top: "55%",
    delay: "5s",
    duration: "30s",
    direction: "left",
    size: 64,
  },
  {
    src: "/assets/fish/pixabay-orange-fish.png",
    alt: "Ikan hias berenang",
    top: "76%",
    delay: "7s",
    duration: "28s",
    direction: "right",
    size: 54,
  },
];

export function FloatingFish() {
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
      {fish.map((item, index) => (
        <span
          key={`${item.src}-${index}`}
          className="absolute"
          style={{
            top: item.top,
            width: item.size,
            height: item.size,
            animation: `${item.direction === "left" ? "swim-left" : "swim-right"} ${item.duration} linear ${item.delay} infinite`,
          }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={item.src}
            alt={item.alt}
            className="h-full w-full object-contain opacity-70 drop-shadow-lg"
            style={{ animation: `gentle-drift 4s ease-in-out ${item.delay} infinite` }}
          />
        </span>
      ))}
    </div>
  );
}
