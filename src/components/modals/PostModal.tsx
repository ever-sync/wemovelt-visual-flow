import { useState } from "react";
import { Image, Loader2, Sparkles } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import BrandLockup from "@/components/brand/BrandLockup";
import ImageUpload from "@/components/ImageUpload";
import { useAuth } from "@/contexts/AuthContext";
import { usePosts } from "@/hooks/usePosts";
import { postContentSchema, validateSafe } from "@/lib/validations";
import { toast } from "sonner";

interface PostModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const PostModal = ({ open, onOpenChange }: PostModalProps) => {
  const { user, profile } = useAuth();
  const { createPost, isCreating } = usePosts();
  const [content, setContent] = useState("");
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [showImageUpload, setShowImageUpload] = useState(false);

  const handlePost = async () => {
    const result = validateSafe(postContentSchema, content.trim());
    if (!result.success) {
      const errorResult = result as { success: false; error: string };
      toast.error(errorResult.error);
      return;
    }

    if (!user) {
      return;
    }

    try {
      await createPost({ content: content.trim(), imageFile: selectedImage });
      setContent("");
      setSelectedImage(null);
      setShowImageUpload(false);
      onOpenChange(false);
    } catch (error) {
      console.error("Error creating post:", error);
    }
  };

  const handleClose = (isOpen: boolean) => {
    if (!isOpen) {
      setContent("");
      setSelectedImage(null);
      setShowImageUpload(false);
    }
    onOpenChange(isOpen);
  };

  const displayName = profile?.name || "Usuario";
  const username = profile?.username ? `@${profile.username}` : "@usuario";

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="app-panel max-w-sm rounded-[1.9rem] border-white/10 bg-card/95 p-0 [&>button]:right-4 [&>button]:top-4 [&>button]:rounded-full [&>button]:border [&>button]:border-white/10 [&>button]:bg-white/[0.05]">
        <DialogHeader className="px-6 pt-6">
          <div className="rounded-[1.6rem] border border-white/8 bg-[radial-gradient(circle_at_top_left,rgba(255,102,0,0.16),transparent_56%),linear-gradient(180deg,rgba(255,255,255,0.04),rgba(255,255,255,0.02))] p-4">
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-3">
                <BrandLockup compact iconClassName="h-9 w-9" kickerClassName="text-[0.58rem]" titleClassName="text-sm" />
                <div>
                  <DialogTitle className="text-left text-[1.6rem] font-bold tracking-[-0.06em]">
                    Compartilhe seu movimento
                  </DialogTitle>
                  <p className="mt-2 text-sm leading-6 text-muted-foreground">
                    Poste uma atualizacao rapida, com contexto visual e um texto direto.
                  </p>
                </div>
              </div>
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/12 text-primary">
                <Sparkles size={18} />
              </div>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-4 px-6 pb-6">
          <div className="app-panel-soft flex items-center gap-3 rounded-[1.4rem] p-4">
            {profile?.avatar_url ? (
              <img src={profile.avatar_url} alt={displayName} className="h-11 w-11 rounded-full object-cover" />
            ) : (
              <div className="orange-glow flex h-11 w-11 items-center justify-center rounded-full wemovelt-gradient text-sm font-bold text-primary-foreground">
                {displayName.charAt(0).toUpperCase() || "U"}
              </div>
            )}
            <div>
              <p className="text-sm font-semibold">{displayName}</p>
              <p className="text-xs text-muted-foreground">{username}</p>
            </div>
          </div>

          <Textarea
            placeholder="O que voce quer compartilhar hoje?"
            value={content}
            onChange={(event) => setContent(event.target.value)}
            className="min-h-[132px] rounded-[1.35rem] border-white/10 bg-white/[0.03] px-4 py-3 text-base leading-6 md:text-sm"
          />

          {showImageUpload && (
            <div className="rounded-[1.4rem] border border-white/8 bg-white/[0.02] p-3">
              <ImageUpload selectedImage={selectedImage} onImageSelect={setSelectedImage} />
            </div>
          )}

          <button
            onClick={() => setShowImageUpload((current) => !current)}
            className={`flex w-full items-center justify-between rounded-[1.25rem] border px-4 py-3 text-left transition-colors ${
              showImageUpload
                ? "border-primary/30 bg-primary/10 text-primary"
                : "border-white/8 bg-white/[0.03] text-foreground hover:border-primary/20"
            }`}
          >
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-black/20">
                <Image size={18} />
              </div>
              <div>
                <p className="text-sm font-semibold">Adicionar foto</p>
                <p className="text-xs text-muted-foreground">Opcional, para dar mais contexto ao post.</p>
              </div>
            </div>
          </button>

          <Button onClick={handlePost} disabled={!content.trim() || isCreating} className="h-12 w-full rounded-full font-semibold">
            {isCreating ? (
              <>
                <Loader2 size={18} className="mr-2 animate-spin" />
                Publicando...
              </>
            ) : (
              "Publicar"
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PostModal;
