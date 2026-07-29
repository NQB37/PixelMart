"use client";

import { useEffect, useMemo, useRef } from "react";
import { ImagePlus, X } from "lucide-react";

import { cn } from "../utils/cn";
import { Label } from "./label";

interface ImageDropzoneProps {
  label: string;
  file: File | null;
  onChange: (file: File | null) => void;
  hint?: string;
  error?: string;
  className?: string;
}

export function ImageDropzone({
  label,
  file,
  onChange,
  hint,
  error,
  className,
}: ImageDropzoneProps) {
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
    <div className={className}>
      <Label className='mb-1.5 block'>{label}</Label>
      <input
        ref={inputRef}
        type='file'
        accept='image/*'
        className='hidden'
        onChange={(e) => onChange(e.target.files?.[0] ?? null)}
      />
      {previewUrl ? (
        <div
          role='button'
          onClick={() => inputRef.current?.click()}
          className='relative h-32 w-full cursor-pointer overflow-hidden rounded-md border border-input'
        >
          <img
            src={previewUrl}
            alt={label}
            className='h-full w-full object-contain'
          />
          <button
            type='button'
            onClick={(e) => {
              e.stopPropagation();
              onChange(null);
            }}
            className='absolute right-2 top-2 rounded-full bg-card/90 p-1 text-muted-foreground shadow hover:text-destructive'
          >
            <X className='h-4 w-4' />
          </button>
        </div>
      ) : (
        <button
          type='button'
          onClick={() => inputRef.current?.click()}
          className={cn(
            "flex h-32 w-full flex-col items-center justify-center gap-1 rounded-md border-2 border-dashed border-input text-muted-foreground transition-colors hover:border-primary/60 hover:text-primary",
            error && "border-destructive/50",
          )}
        >
          <ImagePlus className='h-6 w-6' strokeWidth={1.5} />
          <span className='text-xs'>Click to upload</span>
        </button>
      )}
      {hint && !error && (
        <p className='mt-1 text-xs text-muted-foreground'>{hint}</p>
      )}
      {error && (
        <p className='mt-1 text-sm font-medium text-destructive'>{error}</p>
      )}
    </div>
  );
}
