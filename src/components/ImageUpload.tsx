import { useState, useRef } from "react";
import { Image, X, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { imageFileSchema, validateSafe } from "@/lib/validations";

interface ImageUploadProps {
  onImageSelect: (file: File | null) => void;
  selectedImage: File | null;
  className?: string;
}

const ImageUpload = ({ onImageSelect, selectedImage, className = "" }: ImageUploadProps) => {
  const [preview, setPreview] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file with Zod schema
      const result = validateSafe(imageFileSchema, {
        size: file.size,
        type: file.type,
      });

      if (!result.success) {
        const errorResult = result as { success: false; error: string };
        alert(errorResult.error);
        return;
      }

      onImageSelect(file);
      
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemove = () => {
    onImageSelect(null);
    setPreview(null);
    if (inputRef.current) {
      inputRef.current.value = "";
    }
  };

  const handleClick = () => {
    inputRef.current?.click();
  };

  return (
    <div className={className}>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
      />

      {preview ? (
        <div className="relative">
          <img
            src={preview}
            alt="Preview"
            className="w-full h-48 object-cover rounded-xl"
          />
          <button
            onClick={handleRemove}
            className="absolute top-2 right-2 p-1.5 bg-background/80 backdrop-blur-sm rounded-full hover:bg-background transition-colors"
          >
            <X size={18} className="text-foreground" />
          </button>
        </div>
      ) : (
        <button
          onClick={handleClick}
          className="w-full h-32 border-2 border-dashed border-border rounded-xl flex flex-col items-center justify-center gap-2 hover:border-primary/50 hover:bg-secondary/50 transition-colors"
        >
          <Upload size={24} className="text-muted-foreground" />
          <span className="text-sm text-muted-foreground">
            Clique para adicionar uma imagem
          </span>
        </button>
      )}
    </div>
  );
};

export default ImageUpload;
