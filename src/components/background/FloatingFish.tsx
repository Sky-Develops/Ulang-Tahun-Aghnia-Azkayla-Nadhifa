"use client";

function FishOrange({ size }: { size: number }) {
  return (
    <svg viewBox="0 0 100 60" width={size} height={size} xmlns="http://www.w3.org/2000/svg">
      <polygon points="18,30 0,12 0,48" fill="#FF8C00" />
      <ellipse cx="55" cy="30" rx="38" ry="22" fill="#FF6B35" />
      <ellipse cx="55" cy="18" rx="16" ry="9" fill="#FF8C55" />
      <ellipse cx="55" cy="42" rx="12" ry="7" fill="#FF8C55" />
      <circle cx="80" cy="24" r="5" fill="white" />
      <circle cx="81" cy="24" r="3" fill="#1a1a2e" />
      <circle cx="82" cy="23" r="1" fill="white" />
      <path d="M 40 30 Q 55 20 70 30 Q 55 40 40 30" fill="#FF4500" opacity="0.4" />
    </svg>
  );
}

function FishBlue({ size }: { size: number }) {
  return (
    <svg viewBox="0 0 100 60" width={size} height={size} xmlns="http://www.w3.org/2000/svg">
      <polygon points="18,30 0,12 0,48" fill="#0077B6" />
      <ellipse cx="55" cy="30" rx="38" ry="22" fill="#00B4D8" />
      <ellipse cx="55" cy="18" rx="16" ry="9" fill="#48CAE4" />
      <ellipse cx="55" cy="42" rx="12" ry="7" fill="#48CAE4" />
      <circle cx="80" cy="24" r="5" fill="white" />
      <circle cx="81" cy="24" r="3" fill="#1a1a2e" />
      <circle cx="82" cy="23" r="1" fill="white" />
      <path d="M 40 30 Q 55 20 70 30 Q 55 40 40 30" fill="#0077B6" opacity="0.4" />
    </svg>
  );
}

function FishYellow({ size }: { size: number }) {
  return (
    <svg viewBox="0 0 100 60" width={size} height={size} xmlns="http://www.w3.org/2000/svg">
      <polygon points="18,30 0,12 0,48" fill="#F9A825" />
      <ellipse cx="55" cy="30" rx="38" ry="22" fill="#FFD600" />
      <ellipse cx="55" cy="18" rx="16" ry="9" fill="#FFEE58" />
      <ellipse cx="55" cy="42" rx="12" ry="7" fill="#FFEE58" />
      <circle cx="80" cy="24" r="5" fill="white" />
      <circle cx="81" cy="24" r="3" fill="#1a1a2e" />
      <circle cx="82" cy="23" r="1" fill="white" />
      <path d="M 40 30 Q 55 20 70 30 Q 55 40 40 30" fill="#F9A825" opacity="0.4" />
      <line x1="42" y1="22" x2="42" y2="38" stroke="#F9A825" strokeWidth="1.5" opacity="0.5" />
      <line x1="52" y1="18" x2="52" y2="42" stroke="#F9A825" strokeWidth="1.5" opacity="0.5" />
      <line x1="62" y1="20" x2="62" y2="40" stroke="#F9A825" strokeWidth="1.5" opacity="0.5" />
    </svg>
  );
}

function FishPink({ size }: { size: number }) {
  return (
    <svg viewBox="0 0 100 60" width={size} height={size} xmlns="http://www.w3.org/2000/svg">
      <polygon points="18,30 0,12 0,48" fill="#E91E8C" />
      <ellipse cx="55" cy="30" rx="38" ry="22" fill="#FF4DB8" />
      <ellipse cx="55" cy="18" rx="16" ry="9" fill="#FF80CC" />
      <ellipse cx="55" cy="42" rx="12" ry="7" fill="#FF80CC" />
      <circle cx="80" cy="24" r="5" fill="white" />
      <circle cx="81" cy="24" r="3" fill="#1a1a2e" />
      <circle cx="82" cy="23" r="1" fill="white" />
      <path d="M 40 30 Q 55 20 70 30 Q 55 40 40 30" fill="#E91E8C" opacity="0.4" />
    </svg>
  );
}

const fishData = [
  {
    Component: FishOrange,
    top: "13%",
    delay: "0s",
    duration: "22s",
    direction: "left",
    size: 58,
  },
  {
    Component: FishBlue,
    top: "30%",
    delay: "2s",
    duration: "26s",
    direction: "right",
    size: 50,
  },
  {
    Component: FishYellow,
    top: "55%",
    delay: "5s",
    duration: "30s",
    direction: "left",
    size: 64,
  },
  {
    Component: FishPink,
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
      {fishData.map((item, index) => {
        const { Component } = item;
        return (
          <span
            key={index}
            className="absolute"
            style={{
              top: item.top,
              width: item.size,
              height: item.size,
              animation: `${item.direction === "left" ? "swim-left" : "swim-right"} ${item.duration} linear ${item.delay} infinite`,
              opacity: 0.75,
              filter: "drop-shadow(0 4px 8px rgba(0,0,0,0.2))",
              willChange: "transform",
            }}
          >
            <span
              style={{
                display: "block",
                animation: `gentle-drift 4s ease-in-out ${item.delay} infinite`,
                // Flip ikan yang berenang ke kanan agar hadap kanan
                transform: item.direction === "right" ? "scaleX(-1)" : "scaleX(1)",
                willChange: "transform",
              }}
            >
              <Component size={item.size} />
            </span>
          </span>
        );
      })}
    </div>
  );
}