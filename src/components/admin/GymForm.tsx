import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Loader2 } from "lucide-react";

interface Gym {
  id: string;
  name: string;
  address?: string | null;
  lat?: number | null;
  lng?: number | null;
  radius?: number | null;
  image_url?: string | null;
}

interface GymFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  gym?: Gym | null;
  onSubmit: (data: Omit<Gym, "id"> & { id?: string }) => void;
  isLoading?: boolean;
}

const GymForm = ({
  open,
  onOpenChange,
  gym,
  onSubmit,
  isLoading,
}: GymFormProps) => {
  const [formData, setFormData] = useState({
    name: "",
    address: "",
    lat: "",
    lng: "",
    radius: "50",
    image_url: "",
  });

  useEffect(() => {
    if (gym) {
      setFormData({
        name: gym.name || "",
        address: gym.address || "",
        lat: gym.lat?.toString() || "",
        lng: gym.lng?.toString() || "",
        radius: gym.radius?.toString() || "50",
        image_url: gym.image_url || "",
      });
    } else {
      setFormData({
        name: "",
        address: "",
        lat: "",
        lng: "",
        radius: "50",
        image_url: "",
      });
    }
  }, [gym, open]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const data = {
      name: formData.name,
      address: formData.address || null,
      lat: formData.lat ? parseFloat(formData.lat) : null,
      lng: formData.lng ? parseFloat(formData.lng) : null,
      radius: formData.radius ? parseInt(formData.radius) : 50,
      image_url: formData.image_url || null,
      ...(gym?.id && { id: gym.id }),
    };
    
    onSubmit(data);
  };

  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setFormData({
            ...formData,
            lat: position.coords.latitude.toFixed(6),
            lng: position.coords.longitude.toFixed(6),
          });
        },
        (error) => {
          console.error("Error getting location:", error);
        }
      );
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {gym ? "Editar Academia" : "Nova Academia"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nome *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Ex: Praça da Liberdade"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="address">Endereço</Label>
            <Input
              id="address"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              placeholder="Ex: Rua das Flores, 123 - Centro"
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>Localização GPS</Label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={getCurrentLocation}
              >
                Usar minha localização
              </Button>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label htmlFor="lat" className="text-xs text-muted-foreground">
                  Latitude
                </Label>
                <Input
                  id="lat"
                  type="number"
                  step="any"
                  value={formData.lat}
                  onChange={(e) => setFormData({ ...formData, lat: e.target.value })}
                  placeholder="-23.550520"
                />
              </div>
              <div>
                <Label htmlFor="lng" className="text-xs text-muted-foreground">
                  Longitude
                </Label>
                <Input
                  id="lng"
                  type="number"
                  step="any"
                  value={formData.lng}
                  onChange={(e) => setFormData({ ...formData, lng: e.target.value })}
                  placeholder="-46.633308"
                />
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="radius">Raio de Check-in (metros)</Label>
            <Input
              id="radius"
              type="number"
              min="10"
              max="500"
              value={formData.radius}
              onChange={(e) => setFormData({ ...formData, radius: e.target.value })}
              placeholder="50"
            />
            <p className="text-xs text-muted-foreground">
              Distância máxima para permitir check-in por GPS
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="image_url">URL da Imagem</Label>
            <Input
              id="image_url"
              type="url"
              value={formData.image_url}
              onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
              placeholder="https://exemplo.com/imagem.jpg"
            />
          </div>

          <div className="flex gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              className="flex-1"
              onClick={() => onOpenChange(false)}
            >
              Cancelar
            </Button>
            <Button type="submit" className="flex-1" disabled={isLoading}>
              {isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : gym ? (
                "Salvar"
              ) : (
                "Criar"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default GymForm;
