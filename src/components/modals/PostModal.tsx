import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Image, Camera, Loader2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { usePosts } from "@/hooks/usePosts";
import ImageUpload from "@/components/ImageUpload";

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
    if (!content.trim() || !user) return;

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

  const getInitial = () => {
    return profile?.name?.charAt(0).toUpperCase() || user?.email?.charAt(0).toUpperCase() || "U";
  };

  const getDisplayName = () => {
    return profile?.name || "Usuário";
  };

  const getUsername = () => {
    return profile?.username ? `@${profile.username}` : "@usuario";
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="bg-card border-border max-w-sm mx-4 rounded-2xl">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="text-xl font-bold">Novo post</DialogTitle>
          </div>
        </DialogHeader>

        <div className="space-y-4 mt-2">
          {/* User info */}
          <div className="flex items-center gap-3">
            {profile?.avatar_url ? (
              <img
                src={profile.avatar_url}
                alt={getDisplayName()}
                className="w-10 h-10 rounded-full object-cover"
              />
            ) : (
              <div className="w-10 h-10 wemovelt-gradient rounded-full flex items-center justify-center font-bold text-white">
                {getInitial()}
              </div>
            )}
            <div>
              <p className="font-bold text-sm">{getDisplayName()}</p>
              <p className="text-xs text-muted-foreground">{getUsername()}</p>
            </div>
          </div>

          {/* Content */}
          <Textarea
            placeholder="O que você está pensando?"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="min-h-[120px] bg-secondary border-border rounded-xl resize-none"
          />

          {/* Image upload */}
          {showImageUpload && (
            <ImageUpload
              selectedImage={selectedImage}
              onImageSelect={setSelectedImage}
            />
          )}

          {/* Media options */}
          <div className="flex gap-2">
            <button
              onClick={() => setShowImageUpload(!showImageUpload)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-colors ${
                showImageUpload
                  ? "bg-primary/20 text-primary"
                  : "bg-secondary hover:bg-secondary/80"
              }`}
            >
              <Image size={18} className="text-primary" />
              <span className="text-sm">Foto</span>
            </button>
          </div>

          {/* Post button */}
          <Button
            onClick={handlePost}
            disabled={!content.trim() || isCreating}
            className="w-full h-12 wemovelt-gradient rounded-xl font-bold disabled:opacity-50"
          >
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
