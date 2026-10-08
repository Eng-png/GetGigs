import { useRef, useState } from "react";
import { ImagePlus, Trash2 } from "lucide-react";
import SafeImage from "./SafeImage";

type Props = {
  label: string;
  value?: string;
  maxMb: number;
  minimum: { width: number; height?: number };
  recommendation: string;
  onChange: (value: string) => void;
};

export default function ImageUploader({ label, value, maxMb, minimum, recommendation, onChange }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState("");

  const accept = async (file?: File) => {
    if (!file) return;
    setError("");
    if (!/^image\/(jpeg|png|webp)$/.test(file.type)) return setError("Choose a JPG, JPEG, PNG, or WebP image.");
    if (file.size > maxMb * 1024 * 1024) return setError(`Image must be ${maxMb} MB or smaller.`);
    const dataUrl = await readAsDataUrl(file);
    const size = await readImageSize(dataUrl);
    if (size.width < minimum.width || (minimum.height && size.height < minimum.height)) {
      return setError(`Image must be at least ${minimum.width} × ${minimum.height ?? minimum.width} px.`);
    }
    onChange(await compressImage(dataUrl));
  };

  return (
    <div className="gg-upload-card">
      <div><strong>{label}</strong><p>JPG, JPEG, PNG, or WebP · max {maxMb} MB · minimum {minimum.width} × {minimum.height ?? minimum.width} px<br />{recommendation}</p></div>
      {value ? <SafeImage src={value} alt={`${label} preview`} style={{ width: "100%", height: 170, objectFit: "cover", borderRadius: 14 }} /> : <button type="button" className="gg-upload-drop" onClick={() => inputRef.current?.click()}><ImagePlus size={24}/><span>Choose an image</span></button>}
      <input ref={inputRef} hidden type="file" accept="image/jpeg,image/png,image/webp" onChange={(event) => void accept(event.target.files?.[0])}/>
      {error && <p className="gg-field-error" role="alert">{error}</p>}
      <div className="gg-upload-actions">
        <button type="button" onClick={() => inputRef.current?.click()}>{value ? "Replace photo" : "Upload photo"}</button>
        {value && <button type="button" onClick={() => onChange("")}><Trash2 size={13}/> Remove</button>}
      </div>
    </div>
  );
}

function readAsDataUrl(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

function readImageSize(src: string) {
  return new Promise<{ width: number; height: number }>((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve({ width: image.naturalWidth, height: image.naturalHeight });
    image.onerror = reject;
    image.src = src;
  });
}

async function compressImage(src: string) {
  const size = await readImageSize(src);
  const scale = Math.min(1, 1800 / Math.max(size.width, size.height));
  if (scale === 1) return src;
  return new Promise<string>((resolve) => {
    const image = new Image();
    image.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = Math.round(size.width * scale);
      canvas.height = Math.round(size.height * scale);
      canvas.getContext("2d")?.drawImage(image, 0, 0, canvas.width, canvas.height);
      resolve(canvas.toDataURL("image/jpeg", .86));
    };
    image.src = src;
  });
}
