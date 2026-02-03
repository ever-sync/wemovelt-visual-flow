import { Play } from "lucide-react";
import { useState } from "react";

interface VideoPlayerProps {
  videoUrl?: string | null;
  imageUrl?: string | null;
  title?: string;
}

const VideoPlayer = ({ videoUrl, imageUrl, title }: VideoPlayerProps) => {
  const [showVideo, setShowVideo] = useState(false);

  // Convert YouTube URL to embed format
  const getEmbedUrl = (url: string) => {
    if (url.includes("embed")) return url;
    if (url.includes("watch?v=")) {
      return url.replace("watch?v=", "embed/");
    }
    if (url.includes("youtu.be/")) {
      const videoId = url.split("youtu.be/")[1]?.split("?")[0];
      return `https://www.youtube.com/embed/${videoId}`;
    }
    return url;
  };

  if (!videoUrl) {
    return (
      <div className="relative aspect-video bg-secondary rounded-xl overflow-hidden">
        {imageUrl ? (
          <img 
            src={imageUrl} 
            alt={title || "Equipamento"}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Play size={48} className="text-muted-foreground" />
          </div>
        )}
        <div className="absolute bottom-4 left-4 right-4">
          <div className="bg-background/80 backdrop-blur-sm rounded-xl p-3">
            <p className="text-xs text-muted-foreground">Vídeo não disponível</p>
            <p className="font-bold">{title}</p>
          </div>
        </div>
      </div>
    );
  }

  if (!showVideo) {
    return (
      <div 
        className="relative aspect-video bg-secondary rounded-xl overflow-hidden cursor-pointer group"
        onClick={() => setShowVideo(true)}
      >
        {imageUrl ? (
          <img 
            src={imageUrl} 
            alt={title || "Equipamento"}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-secondary" />
        )}
        <div className="absolute inset-0 bg-background/50 flex items-center justify-center group-hover:bg-background/40 transition-colors">
          <button className="w-16 h-16 wemovelt-gradient rounded-full flex items-center justify-center hover:scale-110 transition-transform">
            <Play size={32} className="ml-1" />
          </button>
        </div>
        <div className="absolute bottom-4 left-4 right-4">
          <div className="bg-background/80 backdrop-blur-sm rounded-xl p-3">
            <p className="text-xs text-muted-foreground">Clique para ver o vídeo</p>
            <p className="font-bold">{title}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="aspect-video rounded-xl overflow-hidden">
      <iframe
        src={getEmbedUrl(videoUrl)}
        title={title || "Vídeo demonstrativo"}
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
        className="w-full h-full"
      />
    </div>
  );
};

export default VideoPlayer;
