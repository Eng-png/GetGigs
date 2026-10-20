import { useEffect, useRef, useState } from "react";
import { ImagePlus, Trash2 } from "lucide-react";
import SafeImage from "./SafeImage";

type Props = {
  label: string;
  value?: string;
  maxMb: number;
  minimum?: { width: number; height?: number };
  recommendation: string;
  onChange: (value: string) => void;
  aspectRatio?: number;
};

export default function ImageUploader({ label, value, maxMb, minimum, recommendation, onChange, aspectRatio = 1 }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState("");
  const [source, setSource] = useState("");
  const [zoom, setZoom] = useState(1);
  const [position, setPosition] = useState({ x: 50, y: 50 });

  const accept = async (file?: File) => {
    if (!file) return;
    setError("");
    if (!/^image\/(jpeg|png|webp)$/.test(file.type)) return setError("Choose a JPG, JPEG, PNG, or WebP image.");
    if (file.size > maxMb * 1024 * 1024) return setError(`Image must be ${maxMb} MB or smaller.`);
    try {
      setSource(await prepareImageSource(file, maxMb, minimum));
      setZoom(1);
      setPosition({ x: 50, y: 50 });
    } catch (error) {
      setError(error instanceof Error ? error.message : "Could not read this image.");
    }
  };

  return (
    <div className="gg-upload-card">
      <div><strong>{label}</strong><p>JPG, JPEG, PNG, or WebP · max {maxMb} MB · any image dimensions<br />{recommendation}</p></div>
      {value ? <SafeImage src={value} alt={`${label} preview`} style={{ width: "100%", height: 170, objectFit: "cover", borderRadius: 14 }} /> : <button type="button" className="gg-upload-drop" onClick={() => inputRef.current?.click()}><ImagePlus size={24}/><span>Choose an image</span></button>}
      <input ref={inputRef} hidden type="file" accept="image/jpeg,image/png,image/webp" onChange={(event) => void accept(event.target.files?.[0])}/>
      {error && <p className="gg-field-error" role="alert">{error}</p>}
      <div className="gg-upload-actions">
        <button type="button" onClick={() => inputRef.current?.click()}>{value ? "Replace photo" : "Upload photo"}</button>
        {value && <button type="button" onClick={() => onChange("")}><Trash2 size={13}/> Remove</button>}
      </div>
      {source && <div className="gg-image-cropper" role="dialog" aria-label={`Adjust ${label}`}>
        <strong>Adjust your image</strong>
        <p>Move the frame and zoom until the important part fits.</p>
        <div className="gg-image-crop-frame" style={{ aspectRatio }}>
          <img src={source} alt="Crop preview" style={{ width: `${zoom * 100}%`, height: `${zoom * 100}%`, objectFit: "cover", objectPosition: `${position.x}% ${position.y}%` }} />
        </div>
        <label>Zoom <input type="range" min="1" max="3" step=".01" value={zoom} onChange={(event) => setZoom(Number(event.target.value))} /></label>
        <label>Horizontal <input type="range" min="0" max="100" value={position.x} onChange={(event) => setPosition({ ...position, x: Number(event.target.value) })} /></label>
        <label>Vertical <input type="range" min="0" max="100" value={position.y} onChange={(event) => setPosition({ ...position, y: Number(event.target.value) })} /></label>
        <div className="gg-upload-actions"><button type="button" onClick={() => setSource("")}>Cancel</button><button type="button" onClick={() => void saveCrop(source, zoom, position, aspectRatio).then(onChange).then(() => setSource(""))}>Use this crop</button></div>
      </div>}
    </div>
  );
}

export async function prepareImageFile(file: File, maxMb: number, minimum?: { width: number; height?: number }) {
  return prepareImageSource(file, maxMb, minimum).then((source) => saveCrop(source, 1, { x: 50, y: 50 }, 1));
}

async function prepareImageSource(file: File, maxMb: number, minimum?: { width: number; height?: number }) {
  if (!/^image\/(jpeg|png|webp)$/.test(file.type)) throw new Error("Choose a JPG, JPEG, PNG, or WebP image.");
  if (file.size > maxMb * 1024 * 1024) throw new Error(`Image must be ${maxMb} MB or smaller.`);
  const dataUrl = await readAsDataUrl(file);
  const size = await readImageSize(dataUrl);
  if (minimum && (size.width < minimum.width || (minimum.height && size.height < minimum.height))) {
    throw new Error(`Image must be at least ${minimum.width} × ${minimum.height ?? minimum.width} px.`);
  }
  return dataUrl;
}

async function saveCrop(src: string, zoom: number, position: { x: number; y: number }, aspectRatio: number) {
  const size = await readImageSize(src);
  const image = await loadImage(src);
  const outputWidth = 900;
  const outputHeight = Math.round(outputWidth / aspectRatio);
  const cropWidth = Math.min(size.width, size.height * aspectRatio) / zoom;
  const cropHeight = cropWidth / aspectRatio;
  const left = Math.max(0, Math.min(size.width - cropWidth, (size.width - cropWidth) * position.x / 100));
  const top = Math.max(0, Math.min(size.height - cropHeight, (size.height - cropHeight) * position.y / 100));
  const canvas = document.createElement("canvas");
  canvas.width = outputWidth;
  canvas.height = outputHeight;
  canvas.getContext("2d")?.drawImage(image, left, top, cropWidth, cropHeight, 0, 0, outputWidth, outputHeight);
  return canvas.toDataURL("image/jpeg", .82);
}

function loadImage(src: string) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = reject;
    image.src = src;
  });
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
