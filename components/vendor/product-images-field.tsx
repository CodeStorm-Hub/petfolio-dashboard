"use client";

import { useRef, useState } from "react";
import { Loader2, Upload, X } from "lucide-react";
import Image from "next/image";

import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

export function ProductImagesField({
  shopId,
  value,
  onChange,
}: {
  shopId: string;
  value: string[];
  onChange: (urls: string[]) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  async function handleFiles(files: FileList) {
    setUploading(true);
    const supabase = createClient();
    const uploaded: string[] = [];

    for (const file of Array.from(files)) {
      const ext = file.name.split(".").pop();
      const path = `${shopId}/${crypto.randomUUID()}.${ext}`;
      const { error } = await supabase.storage
        .from("marketplace-images")
        .upload(path, file);

      if (!error) {
        const { data } = supabase.storage
          .from("marketplace-images")
          .getPublicUrl(path);
        uploaded.push(data.publicUrl);
      }
    }

    onChange([...value, ...uploaded]);
    setUploading(false);
  }

  return (
    <div className="space-y-2">
      <Label>Images</Label>
      <div className="flex flex-wrap gap-2">
        {value.map((url) => (
          <div key={url} className="relative">
            <Image src={url} alt="" width={64} height={64} unoptimized className="size-16 rounded-md border object-cover" />
            <button
              type="button"
              onClick={() => onChange(value.filter((u) => u !== url))}
              className="absolute -right-2 -top-2 rounded-full bg-destructive p-0.5 text-destructive-foreground"
            >
              <X className="size-3" />
            </button>
          </div>
        ))}
        <Button
          type="button"
          variant="outline"
          size="icon"
          disabled={uploading}
          onClick={() => inputRef.current?.click()}
        >
          {uploading ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <Upload className="size-4" />
          )}
        </Button>
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={(event) => {
            if (event.target.files?.length) handleFiles(event.target.files);
          }}
        />
      </div>
    </div>
  );
}
