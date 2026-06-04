import { clsx } from "clsx";

interface MarqueeProps {
  items: { label: string; emoji: string; color: string }[];
  reverse?: boolean;
  speed?: "slow" | "normal" | "fast";
  className?: string;
}

const speedMap = {
  slow:   "animate-[marquee_40s_linear_infinite]",
  normal: "animate-[marquee_25s_linear_infinite]",
  fast:   "animate-[marquee_15s_linear_infinite]",
};

export default function Marquee({ items, reverse = false, speed = "normal", className }: MarqueeProps) {
  const doubled = [...items, ...items, ...items];

  return (
    <div className={clsx("overflow-hidden select-none", className)}>
      <div
        className={clsx(
          "flex gap-4 w-max",
          speedMap[speed],
          reverse && "[animation-direction:reverse]"
        )}
        style={{ willChange: "transform" }}
      >
        {doubled.map((item, i) => (
          <div
            key={i}
            className={clsx(
              "flex items-center gap-3 glass rounded-2xl px-5 py-3 border border-white/5 flex-shrink-0",
              "hover:border-accent/30 transition-colors duration-200 cursor-default"
            )}
          >
            <span className="text-2xl">{item.emoji}</span>
            <span className={clsx("text-sm font-semibold tracking-wide", item.color)}>
              {item.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
