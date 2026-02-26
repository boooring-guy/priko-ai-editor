"use client";

import { Camera, User, X } from "lucide-react";
import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface AvatarUploadProps {
  onFileSelect: (file: File | null) => void;
  className?: string;
}

export const AvatarUpload = ({
  onFileSelect,
  className,
}: AvatarUploadProps) => {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    if (file) {
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
      onFileSelect(file);
    }
  };

  const handleRemove = () => {
    setPreviewUrl(null);
    onFileSelect(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div className={cn("flex flex-col items-center gap-4", className)}>
      <div className="relative group">
        <div className="size-24 rounded-full border-2 border-dashed border-muted-foreground/25 flex items-center justify-center overflow-hidden bg-muted/50">
          {previewUrl ? (
            <img
              src={previewUrl}
              alt="Preview"
              className="size-full object-cover"
            />
          ) : (
            <User className="size-10 text-muted-foreground/50" />
          )}
        </div>

        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/20 rounded-full">
          <Button
            type="button"
            variant="secondary"
            size="icon"
            className="size-8 rounded-full"
            onClick={() => fileInputRef.current?.click()}
          >
            <Camera className="size-4" />
          </Button>
        </div>

        {previewUrl && (
          <Button
            type="button"
            variant="destructive"
            size="icon"
            className="absolute -top-1 -right-1 size-6 rounded-full"
            onClick={handleRemove}
          >
            <X className="size-3" />
          </Button>
        )}
      </div>

      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/*"
        className="hidden"
      />

      <p className="text-xs text-muted-foreground">
        Click to upload profile picture
      </p>
    </div>
  );
};
