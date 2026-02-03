import { useState, useRef } from "react";
import { Camera, Loader2, User } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface AvatarUploadProps {
  currentUrl?: string | null;
  onUpload: (url: string) => void;
  userId: string;
  size?: "sm" | "md" | "lg";
}

const sizeClasses = {
  sm: "w-16 h-16",
  md: "w-24 h-24",
  lg: "w-32 h-32",
};

const iconSizes = {
  sm: 24,
  md: 32,
  lg: 40,
};

const ACCEPTED_TYPES = ["image/jpeg", "image/png", "image/webp"];
const MAX_SIZE = 2 * 1024 * 1024; // 2MB

const AvatarUpload = ({ currentUrl, onUpload, userId, size = "md" }: AvatarUploadProps) => {
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!ACCEPTED_TYPES.includes(file.type)) {
      toast.error("Formato inválido. Use JPG, PNG ou WebP.");
      return;
    }

    // Validate file size
    if (file.size > MAX_SIZE) {
      toast.error("Imagem muito grande. Máximo 2MB.");
      return;
    }

    // Show preview immediately
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result as string);
    };
    reader.readAsDataURL(file);

    // Upload to storage
    setUploading(true);
    try {
      const fileExt = file.name.split(".").pop()?.toLowerCase() || "jpg";
      const filePath = `${userId}/avatar.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(filePath, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data } = supabase.storage
        .from("avatars")
        .getPublicUrl(filePath);

      // Add timestamp to bust cache
      const publicUrl = `${data.publicUrl}?t=${Date.now()}`;
      onUpload(publicUrl);
      toast.success("Foto atualizada!");
    } catch (error) {
      console.error("Upload error:", error);
      toast.error("Erro ao enviar foto. Tente novamente.");
      setPreview(null);
    } finally {
      setUploading(false);
    }
  };

  const displayUrl = preview || currentUrl;

  return (
    <div className="flex flex-col items-center gap-2">
      <button
        type="button"
        onClick={() => fileInputRef.current?.click()}
        disabled={uploading}
        className={cn(
          "relative rounded-full bg-secondary border-2 border-dashed border-border",
          "flex items-center justify-center overflow-hidden",
          "hover:border-primary transition-colors",
          "disabled:opacity-50 disabled:cursor-not-allowed",
          sizeClasses[size]
        )}
      >
        {displayUrl ? (
          <img
            src={displayUrl}
            alt="Avatar"
            className="w-full h-full object-cover"
          />
        ) : (
          <User size={iconSizes[size]} className="text-muted-foreground" />
        )}

        {/* Overlay */}
        <div
          className={cn(
            "absolute inset-0 bg-black/50 flex items-center justify-center",
            "opacity-0 hover:opacity-100 transition-opacity",
            uploading && "opacity-100"
          )}
        >
          {uploading ? (
            <Loader2 size={24} className="text-white animate-spin" />
          ) : (
            <Camera size={24} className="text-white" />
          )}
        </div>
      </button>

      <input
        ref={fileInputRef}
        type="file"
        accept={ACCEPTED_TYPES.join(",")}
        onChange={handleFileSelect}
        className="hidden"
      />

      <span className="text-xs text-muted-foreground">
        {uploading ? "Enviando..." : "Toque para alterar"}
      </span>
    </div>
  );
};

export default AvatarUpload;
