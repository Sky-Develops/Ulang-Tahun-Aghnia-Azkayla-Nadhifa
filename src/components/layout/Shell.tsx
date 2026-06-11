import { BubbleBackground } from "@/components/background/BubbleBackground";
import { FloatingFish } from "@/components/background/FloatingFish";

export function Shell({ children }: { children: React.ReactNode }) {
  return (
    <main className="relative min-h-screen overflow-hidden">
      <BubbleBackground />
      <FloatingFish />
      <div className="relative z-10 mx-auto min-h-screen w-full max-w-[430px] px-4 py-4">
        {children}
      </div>
    </main>
  );
}
