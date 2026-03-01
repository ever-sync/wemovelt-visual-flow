import { useState, useEffect } from "react";
import { logger } from "@/lib/logger";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Loader2, Search, CheckCircle2, AlertCircle, MapPin } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { gymFormSchema } from "@/lib/validations";
import { supabase } from "@/integrations/supabase/client";

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

interface ViaCepResponse {
  cep: string;
  logradouro: string;
  bairro: string;
  localidade: string;
  uf: string;
  erro?: boolean;
}

const formatCep = (value: string): string => {
  const digits = value.replace(/\D/g, "");
  if (digits.length <= 5) return digits;
  return `${digits.slice(0, 5)}-${digits.slice(5, 8)}`;
};

const parseAddressFromString = (address: string | null | undefined) => {
  if (!address) return { street: "", number: "", neighborhood: "", city: "", state: "", cep: "" };
  
  // Try to parse: "Rua das Flores, 123 - Centro, São Paulo - SP, 01310-100"
  const cepMatch = address.match(/(\d{5}-?\d{3})$/);
  const cep = cepMatch ? cepMatch[1] : "";
  
  const parts = address.replace(/,?\s*\d{5}-?\d{3}$/, "").split(" - ");
  
  if (parts.length >= 3) {
    const streetParts = parts[0].split(", ");
    return {
      street: streetParts[0] || "",
      number: streetParts[1] || "",
      neighborhood: parts[1] || "",
      city: parts[2]?.split(" - ")[0] || "",
      state: parts[2]?.split(" - ")[1] || "",
      cep,
    };
  }
  
  return { street: address, number: "", neighborhood: "", city: "", state: "", cep: "" };
};

const GymForm = ({
  open,
  onOpenChange,
  gym,
  onSubmit,
  isLoading,
}: GymFormProps) => {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    name: "",
    cep: "",
    street: "",
    number: "",
    neighborhood: "",
    city: "",
    state: "",
    radius: "50",
    lat: "",
    lng: "",
  });
  const [cepStatus, setCepStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [geocodeStatus, setGeocodeStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [fieldsHighlighted, setFieldsHighlighted] = useState(false);

  const geocodeAddress = async (address: string): Promise<{ lat: number; lng: number } | null> => {
    setGeocodeStatus("loading");
    try {
      const { data, error } = await supabase.functions.invoke("geocode-address", {
        body: { address },
      });

      if (error || data?.error) {
        logger.warn("Geocoding failed (non-blocking):", error || data?.error);
        setGeocodeStatus("error");
        return null;
      }

      setGeocodeStatus("success");
      return { lat: data.lat, lng: data.lng };
    } catch (err) {
      logger.warn("Geocoding exception (non-blocking):", err);
      setGeocodeStatus("error");
      return null;
    }
  };

  useEffect(() => {
    if (gym) {
      const parsed = parseAddressFromString(gym.address);
      setFormData({
        name: gym.name || "",
        cep: parsed.cep,
        street: parsed.street,
        number: parsed.number,
        neighborhood: parsed.neighborhood,
        city: parsed.city,
        state: parsed.state,
        radius: gym.radius?.toString() || "50",
        lat: gym.lat?.toString() || "",
        lng: gym.lng?.toString() || "",
      });
      if (parsed.cep) setCepStatus("success");
    } else {
      setFormData({
        name: "",
        cep: "",
        street: "",
        number: "",
        neighborhood: "",
        city: "",
        state: "",
        radius: "50",
        lat: "",
        lng: "",
      });
      setCepStatus("idle");
    }
    setErrors({});
  }, [gym, open]);

  const fetchAddressByCep = async (cep: string) => {
    const cleanCep = cep.replace(/\D/g, "");
    if (cleanCep.length !== 8) {
      setCepStatus("idle");
      return;
    }

    setCepStatus("loading");
    try {
      const response = await fetch(`https://viacep.com.br/ws/${cleanCep}/json/`);
      const data: ViaCepResponse = await response.json();

      if (data.erro) {
        setCepStatus("error");
        toast({
          title: "CEP não encontrado",
          description: "Verifique o CEP digitado e tente novamente.",
          variant: "destructive",
        });
        return;
      }

      setFormData((prev) => ({
        ...prev,
        street: data.logradouro || "",
        neighborhood: data.bairro || "",
        city: data.localidade || "",
        state: data.uf || "",
      }));
      setCepStatus("success");
      setFieldsHighlighted(true);
      setTimeout(() => setFieldsHighlighted(false), 2000);
      setErrors((prev) => {
        const { cep, street, neighborhood, city, state, ...rest } = prev;
        return rest;
      });
    } catch (error) {
      setCepStatus("error");
      toast({
        title: "Erro ao buscar CEP",
        description: "Não foi possível conectar ao serviço. Tente novamente.",
        variant: "destructive",
      });
    }
  };

  const handleCepChange = (value: string) => {
    const formatted = formatCep(value);
    setFormData((prev) => ({ ...prev, cep: formatted }));
    
    if (formatted.replace(/\D/g, "").length === 8) {
      fetchAddressByCep(formatted);
    } else {
      setCepStatus("idle");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const validationData = {
        ...formData,
        radius: parseInt(formData.radius) || 50,
      };

      const result = gymFormSchema.safeParse(validationData);

      if (!result.success) {
        const fieldErrors: Record<string, string> = {};
        result.error.errors.forEach((err) => {
          if (err.path[0]) {
            fieldErrors[err.path[0].toString()] = err.message;
          }
        });
        setErrors(fieldErrors);
        return;
      }

      // Build full address for GPS navigation
      const streetPart = formData.number
        ? `${formData.street}, ${formData.number}`
        : formData.street;
      const fullAddress = `${streetPart} - ${formData.neighborhood}, ${formData.city} - ${formData.state}, ${formData.cep}`;

      // Use manual coordinates if provided, otherwise try geocoding
      const manualLat = formData.lat ? parseFloat(formData.lat) : null;
      const manualLng = formData.lng ? parseFloat(formData.lng) : null;

      let coordinates: { lat: number; lng: number } | null =
        manualLat !== null && manualLng !== null && !isNaN(manualLat) && !isNaN(manualLng)
          ? { lat: manualLat, lng: manualLng }
          : null;

      if (!coordinates) {
        try {
          coordinates = await geocodeAddress(fullAddress);
        } catch {
          // Geocoding failed silently — coordinates remain null
        }
      }

      const data = {
        name: formData.name,
        address: fullAddress,
        lat: coordinates?.lat ?? null,
        lng: coordinates?.lng ?? null,
        radius: parseInt(formData.radius) || 50,
        image_url: null,
        ...(gym?.id && { id: gym.id }),
      };

      if (!coordinates) {
        toast({
          title: "Salvo sem coordenadas GPS",
          description: "A geocodificação falhou. Configure as coordenadas manualmente nos campos Lat/Lng.",
        });
      }

      onSubmit(data);
    } catch (err) {
      console.error("Erro ao salvar academia:", err);
      toast({
        title: "Erro ao salvar",
        description: "Ocorreu um erro inesperado. Tente novamente.",
        variant: "destructive",
      });
    }
  };

  const getCepIcon = () => {
    switch (cepStatus) {
      case "loading":
        return <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />;
      case "success":
        return <CheckCircle2 className="w-4 h-4 text-primary" />;
      case "error":
        return <AlertCircle className="w-4 h-4 text-destructive" />;
      default:
        return <Search className="w-4 h-4 text-muted-foreground" />;
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
              className={errors.name ? "border-destructive" : ""}
            />
            {errors.name && <p className="text-sm text-destructive">{errors.name}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="cep">CEP *</Label>
            <div className="relative">
              <Input
                id="cep"
                value={formData.cep}
                onChange={(e) => handleCepChange(e.target.value)}
                placeholder="00000-000"
                maxLength={9}
                className={`pr-10 ${errors.cep ? "border-destructive" : ""}`}
              />
              <div className="absolute right-3 top-1/2 -translate-y-1/2">
                {getCepIcon()}
              </div>
            </div>
            {errors.cep && <p className="text-sm text-destructive">{errors.cep}</p>}
            <p className="text-xs text-muted-foreground">
              Digite o CEP para preencher o endereço automaticamente
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="street">Rua</Label>
            <Input
              id="street"
              value={formData.street}
              onChange={(e) => setFormData({ ...formData, street: e.target.value })}
              placeholder="Preenchido automaticamente"
              disabled={cepStatus === "loading"}
              className={`transition-colors duration-300 ${errors.street ? "border-destructive" : ""} ${fieldsHighlighted ? "bg-primary/5 border-primary/30" : ""}`}
            />
            {errors.street && <p className="text-sm text-destructive">{errors.street}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="number">Número</Label>
            <Input
              id="number"
              value={formData.number}
              onChange={(e) => setFormData({ ...formData, number: e.target.value })}
              placeholder="Ex: 123"
              className={errors.number ? "border-destructive" : ""}
            />
            {errors.number && <p className="text-sm text-destructive">{errors.number}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="neighborhood">Bairro</Label>
            <Input
              id="neighborhood"
              value={formData.neighborhood}
              onChange={(e) => setFormData({ ...formData, neighborhood: e.target.value })}
              placeholder="Preenchido automaticamente"
              disabled={cepStatus === "loading"}
              className={`transition-colors duration-300 ${errors.neighborhood ? "border-destructive" : ""} ${fieldsHighlighted ? "bg-primary/5 border-primary/30" : ""}`}
            />
            {errors.neighborhood && <p className="text-sm text-destructive">{errors.neighborhood}</p>}
          </div>

          <div className="grid grid-cols-3 gap-2">
            <div className="col-span-2 space-y-2">
              <Label htmlFor="city">Cidade</Label>
              <Input
                id="city"
                value={formData.city}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                placeholder="Cidade"
                disabled={cepStatus === "loading"}
                className={`transition-colors duration-300 ${errors.city ? "border-destructive" : ""} ${fieldsHighlighted ? "bg-primary/5 border-primary/30" : ""}`}
              />
              {errors.city && <p className="text-sm text-destructive">{errors.city}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="state">UF</Label>
              <Input
                id="state"
                value={formData.state}
                onChange={(e) => setFormData({ ...formData, state: e.target.value.toUpperCase() })}
                placeholder="SP"
                maxLength={2}
                disabled={cepStatus === "loading"}
                className={`transition-colors duration-300 ${errors.state ? "border-destructive" : ""} ${fieldsHighlighted ? "bg-primary/5 border-primary/30" : ""}`}
              />
              {errors.state && <p className="text-sm text-destructive">{errors.state}</p>}
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
              className={errors.radius ? "border-destructive" : ""}
            />
            {errors.radius && <p className="text-sm text-destructive">{errors.radius}</p>}
            <p className="text-xs text-muted-foreground">
              Distância máxima para permitir check-in por GPS
            </p>
          </div>

          <div className="space-y-2">
            <Label className="flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5" />
              Coordenadas GPS (opcional)
            </Label>
            <p className="text-xs text-muted-foreground">
              Preencha manualmente se a geocodificação automática falhar. Use o{" "}
              <a href="https://www.google.com/maps" target="_blank" rel="noopener noreferrer" className="underline">
                Google Maps
              </a>{" "}
              para obter as coordenadas (clique direito no local → copie lat/lng).
            </p>
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <Label htmlFor="lat" className="text-xs text-muted-foreground">Latitude</Label>
                <Input
                  id="lat"
                  value={formData.lat}
                  onChange={(e) => setFormData({ ...formData, lat: e.target.value })}
                  placeholder="-23.5505"
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="lng" className="text-xs text-muted-foreground">Longitude</Label>
                <Input
                  id="lng"
                  value={formData.lng}
                  onChange={(e) => setFormData({ ...formData, lng: e.target.value })}
                  placeholder="-46.6333"
                />
              </div>
            </div>
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
            <Button type="submit" className="flex-1" disabled={isLoading || geocodeStatus === "loading"}>
              {isLoading || geocodeStatus === "loading" ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  {geocodeStatus === "loading" ? "Obtendo coordenadas..." : "Salvando..."}
                </>
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
