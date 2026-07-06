import { useEffect, useMemo, useRef } from "react";
import { ImagePlus, X } from "lucide-react";

interface ImageUploadFieldProps {
  label: string;
  file: File | null;
  onChange: (file: File | null) => void;
  hint?: string;
  error?: string;
}

export default function ImageUploadField({
  label,
  file,
  onChange,
  hint,
  error,
}: ImageUploadFieldProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const previewUrl = useMemo(
    () => (file ? URL.createObjectURL(file) : null),
    [file],
  );

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  return (
    <div>
      <label className="mb-1 block text-sm font-medium text-slate-700">
        {label}
      </label>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => onChange(e.target.files?.[0] ?? null)}
      />
      {previewUrl ? (
        <div
          role="button"
          onClick={() => inputRef.current?.click()}
          className="relative h-32 w-full cursor-pointer overflow-hidden rounded-lg border border-slate-300"
        >
          <img
            src={previewUrl}
            alt={label}
            className="h-full w-full object-cover"
          />
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onChange(null);
            }}
            className="absolute right-2 top-2 rounded-full bg-white/90 p-1 text-slate-600 shadow hover:text-red-500"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="flex h-32 w-full flex-col items-center justify-center gap-1 rounded-lg border-2 border-dashed border-slate-300 text-slate-400 transition-colors hover:border-indigo-400 hover:text-indigo-500"
        >
          <ImagePlus className="h-6 w-6" />
          <span className="text-xs">Click to upload</span>
        </button>
      )}
      {hint && !error && <p className="mt-1 text-xs text-slate-400">{hint}</p>}
      {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
    </div>
  );
}
