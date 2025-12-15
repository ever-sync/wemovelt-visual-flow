import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Image, Camera, X } from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

interface PostModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const PostModal = ({ open, onOpenChange }: PostModalProps) => {
  const { toast } = useToast();
  const [content, setContent] = useState("");

  const handlePost = () => {
    if (content.trim()) {
      toast({
        title: "Post publicado! 🎉",
        description: "Seu post foi compartilhado com a comunidade.",
        duration: 3000,
      });
      setContent("");
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-card border-border max-w-sm mx-4 rounded-2xl">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="text-xl font-bold">Novo post</DialogTitle>
          </div>
        </DialogHeader>

        <div className="space-y-4 mt-2">
          {/* User info */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 wemovelt-gradient rounded-full flex items-center justify-center font-bold">
              U
            </div>
            <div>
              <p className="font-bold text-sm">Usuário</p>
              <p className="text-xs text-muted-foreground">@usuario</p>
            </div>
          </div>

          {/* Content */}
          <Textarea
            placeholder="O que você está pensando?"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="min-h-[120px] bg-secondary border-border rounded-xl resize-none"
          />

          {/* Media options */}
          <div className="flex gap-2">
            <button className="flex items-center gap-2 px-4 py-2 bg-secondary rounded-xl hover:bg-secondary/80 transition-colors">
              <Image size={18} className="text-primary" />
              <span className="text-sm">Foto</span>
            </button>
            <button className="flex items-center gap-2 px-4 py-2 bg-secondary rounded-xl hover:bg-secondary/80 transition-colors">
              <Camera size={18} className="text-primary" />
              <span className="text-sm">Câmera</span>
            </button>
          </div>

          {/* Post button */}
          <Button
            onClick={handlePost}
            disabled={!content.trim()}
            className="w-full h-12 wemovelt-gradient rounded-xl font-bold disabled:opacity-50"
          >
            Publicar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PostModal;
