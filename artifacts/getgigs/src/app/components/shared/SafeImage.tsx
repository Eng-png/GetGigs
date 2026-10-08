import { useEffect, useState } from "react";
import { Image as ImageIcon } from "lucide-react";

export default function SafeImage({ src, alt, className, style }: { src?: string; alt: string; className?: string; style?: React.CSSProperties }) {
  const [failed, setFailed] = useState(!src);
  useEffect(() => setFailed(!src), [src]);

  if (failed) {
    return (
      <div className={className} style={{ ...style, display: "grid", placeItems: "center", background: "linear-gradient(135deg,#ded9cd,#f4efe5)", color: "#827b70" }} role="img" aria-label={`${alt} placeholder`}>
        <span style={{ display: "grid", justifyItems: "center", gap: 7, fontSize: 10 }}><ImageIcon size={24} /><span>Image unavailable</span></span>
      </div>
    );
  }

  return <img src={src} alt={alt} className={className} style={style} onError={() => setFailed(true)} />;
}
