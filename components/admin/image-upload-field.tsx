"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { CheckCircle2, ImagePlus, Loader2, X } from "lucide-react";
import { clsx } from "clsx";

/**
 * ImageUploadField — pick an image from the computer, preview it, upload it
 * to Supabase Storage via /api/admin/upload, and report the public URL.
 *
 * Props:
 *   value      — current image URL (drives the preview)
 *   onChange   — called with the new URL after a successful upload, or ""
 *                when cleared
 *   label      — field label
 *   help       — helper text under the field
 */
export function ImageUploadField({
  value,
  onChange,
  label,
  help,
}: {
  value: string;
  onChange: (url: string) => void;
  label: string;
  help?: string;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);

  const shown = preview ?? (value.trim() || null);

  function handlePick(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    setError("");
    setDone(false);
    if (!file.type.startsWith("image/")) {
      setError("Please choose an image file.");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setError("Image must be smaller than 5 MB.");
      return;
    }
    setPreview(URL.createObjectURL(file));
    void upload(file);
  }

  async function upload(file: File) {
    setUploading(true);
    try {
      const form = new FormData();
      form.append("file", file);
      const res = await fetch("/api/admin/upload", {
        method: "POST",
        credentials: "include",
        body: form,
      });
      const body = (await res.json()) as { url?: string; error?: string };
      if (!res.ok || !body.url) {
        throw new Error(body.error ?? "Upload failed.");
      }
      onChange(body.url);
      setPreview(null);
      setDone(true);
    } catch (err) {
      setPreview(null);
      setError(err instanceof Error ? err.message : "Upload failed.");
    } finally {
      setUploading(false);
    }
  }

  function clear() {
    setPreview(null);
    setDone(false);
    setError("");
    onChange("");
  }

  return (
    <div>
      <span className="mb-1.5 block text-sm font-medium text-espresso">{label}</span>
      <div className="flex items-start gap-4">
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          className={clsx(
            "relative flex h-24 w-24 shrink-0 items-center justify-center overflow-hidden rounded-xl",
            "border-2 border-dashed border-espresso/20 bg-espresso/[0.03] transition-colors",
            "hover:border-cognac/60 hover:bg-cognac/5 disabled:opacity-60"
          )}
          aria-label={shown ? "Replace image" : "Upload image from computer"}
        >
          {shown ? (
            <Image src={shown} alt="Image preview" fill className="object-cover" sizes="96px" />
          ) : (
            <ImagePlus className="h-7 w-7 text-espresso/35" aria-hidden="true" />
          )}
          {uploading ? (
            <span className="absolute inset-0 flex items-center justify-center bg-white/70">
              <Loader2 className="h-6 w-6 animate-spin text-cognac" aria-hidden="true" />
            </span>
          ) : null}
        </button>
        <div className="min-w-0 flex-1">
          <input
            ref={inputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            className="sr-only"
            onChange={handlePick}
            aria-label="Choose an image from your computer"
          />
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              disabled={uploading}
              className="inline-flex items-center justify-center rounded-full border border-espresso/20 px-4 py-2 text-sm font-medium text-espresso transition-colors hover:border-espresso/50 disabled:opacity-50"
            >
              {uploading ? "Uploading..." : shown ? "Change image" : "Choose from computer"}
            </button>
            {shown && !uploading ? (
              <button
                type="button"
                onClick={clear}
                className="inline-flex items-center gap-1 rounded-full px-3 py-2 text-sm font-medium text-[#8C2F2F] transition-colors hover:bg-[#8C2F2F]/5"
              >
                <X className="h-4 w-4" aria-hidden="true" />
                Remove
              </button>
            ) : null}
          </div>
          {help ? <p className="mt-1.5 text-xs text-espresso/50">{help}</p> : null}
          {error ? (
            <p role="alert" className="mt-1.5 text-xs font-medium text-[#8C2F2F]">
              {error}
            </p>
          ) : null}
          {done && !error ? (
            <p className="mt-1.5 inline-flex items-center gap-1 text-xs font-medium text-emerald-700">
              <CheckCircle2 className="h-3.5 w-3.5" aria-hidden="true" />
              Uploaded
            </p>
          ) : null}
        </div>
      </div>
    </div>
  );
}
