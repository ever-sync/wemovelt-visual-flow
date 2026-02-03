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
  });
  const [cepStatus, setCepStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [geocodeStatus, setGeocodeStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errors, setErrors] = useState<Record<string, string>>({});

  const geocodeAddress = async (address: string): Promise<{ lat: number; lng: number } | null> => {
    setGeocodeStatus("loading");
    try {
      const { data, error } = await supabase.functions.invoke("geocode-address", {
        body: { address },
      });

      if (error) {
        console.error("Geocoding error:", error);
        setGeocodeStatus("error");
        toast({
          title: "Erro ao obter coordenadas",
          description: "Não foi possível geocodificar o endereço.",
          variant: "destructive",
        });
        return null;
      }

      if (data.error) {
        console.error("Geocoding API error:", data.error);
        setGeocodeStatus("error");
        toast({
          title: "Endereço não encontrado",
          description: data.error,
          variant: "destructive",
        });
        return null;
      }

      setGeocodeStatus("success");
      return { lat: data.lat, lng: data.lng };
    } catch (err) {
      console.error("Geocoding exception:", err);
      setGeocodeStatus("error");
      toast({
        title: "Erro de conexão",
        description: "Não foi possível conectar ao serviço de geocodificação.",
        variant: "destructive",
      });
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

    // Geocode the address to get coordinates
    const coordinates = await geocodeAddress(fullAddress);
    
    if (!coordinates) {
      // Geocoding failed, don't proceed
      return;
    }

    const data = {
      name: formData.name,
      address: fullAddress,
      lat: coordinates.lat,
      lng: coordinates.lng,
      radius: parseInt(formData.radius) || 50,
      image_url: null,
      ...(gym?.id && { id: gym.id }),
    };

    onSubmit(data);
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
              className={errors.street ? "border-destructive" : ""}
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
              className={errors.neighborhood ? "border-destructive" : ""}
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
                className={errors.city ? "border-destructive" : ""}
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
                className={errors.state ? "border-destructive" : ""}
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
