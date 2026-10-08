type Props = { label: string; size?: "full" | "thumb" | "screen" };

const SIZES = {
  full: { w: 402, h: 874, radius: 25, title: 14, sub: 8 },
  thumb: { w: 202, h: 439, radius: 13, title: 10, sub: 6 },
  screen: { w: 402, h: 874, radius: 25, title: 14, sub: 8 },
};

export function PhonePlaceholder({ label, size = "full" }: Props) {
  const s = SIZES[size];
  return (
    <div
      style={{
        width: s.w,
        height: s.h,
        borderRadius: s.radius,
        background: "#fff",
      }}
      className="flex flex-col items-center justify-center shrink-0"
    >
      <div
        style={{
          fontFamily: "Inter, sans-serif",
          fontWeight: 500,
          fontSize: s.title,
          color: "#C0C0C0",
          lineHeight: 1.2,
        }}
      >
        {label}
      </div>
      <div
        style={{
          fontFamily: "'Geist Mono', ui-monospace, monospace",
          fontWeight: 400,
          fontSize: s.sub,
          color: "#D8D8D8",
          marginTop: 6,
        }}
      >
        Prototype screens not yet defined
      </div>
    </div>
  );
}
