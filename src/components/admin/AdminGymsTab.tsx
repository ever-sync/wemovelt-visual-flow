import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useGyms } from "@/hooks/useGyms";
import { useAdminGyms } from "@/hooks/useAdminGyms";
import GymForm from "./GymForm";
import { Plus, Pencil, Trash2, MapPin, Building2 } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

interface Gym {
  id: string;
  name: string;
  address?: string | null;
  lat?: number | null;
  lng?: number | null;
  radius?: number | null;
  image_url?: string | null;
  equipment_count?: number | null;
}

const AdminGymsTab = () => {
  const { gyms, isLoading } = useGyms();
  const { createGym, updateGym, deleteGym } = useAdminGyms();
  
  const [formOpen, setFormOpen] = useState(false);
  const [editingGym, setEditingGym] = useState<Gym | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const handleCreate = () => {
    setEditingGym(null);
    setFormOpen(true);
  };

  const handleEdit = (gym: Gym) => {
    setEditingGym(gym);
    setFormOpen(true);
  };

  const handleSubmit = (data: Omit<Gym, "id"> & { id?: string }) => {
    if (data.id) {
      updateGym.mutate(data as Gym, {
        onSuccess: () => setFormOpen(false),
      });
    } else {
      createGym.mutate(data, {
        onSuccess: () => setFormOpen(false),
      });
    }
  };

  const handleDelete = () => {
    if (deleteId) {
      deleteGym.mutate(deleteId, {
        onSuccess: () => setDeleteId(null),
      });
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-24 w-full" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <p className="text-sm text-muted-foreground">
          {gyms?.length || 0} academias cadastradas
        </p>
        <Button onClick={handleCreate} size="sm">
          <Plus className="w-4 h-4 mr-1" />
          Nova
        </Button>
      </div>

      {gyms?.length === 0 ? (
        <Card className="bg-card/50">
          <CardContent className="py-8 text-center">
            <Building2 className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
            <p className="text-muted-foreground">
              Nenhuma academia cadastrada
            </p>
            <Button onClick={handleCreate} className="mt-4" variant="outline">
              Adicionar primeira academia
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {gyms?.map((gym) => (
            <Card key={gym.id} className="bg-card/50">
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-medium truncate">{gym.name}</h3>
                      {gym.lat && gym.lng && (
                        <MapPin className="w-4 h-4 text-green-500 shrink-0" />
                      )}
                    </div>
                    
                    {gym.address && (
                      <p className="text-sm text-muted-foreground line-clamp-1 mb-2">
                        {gym.address}
                      </p>
                    )}
                    
                    <div className="flex flex-wrap gap-1">
                      {gym.radius && (
                        <Badge variant="secondary" className="text-xs">
                          Raio: {gym.radius}m
                        </Badge>
                      )}
                      {gym.equipment_count !== null && gym.equipment_count > 0 && (
                        <Badge variant="outline" className="text-xs">
                          {gym.equipment_count} equipamentos
                        </Badge>
                      )}
                      {gym.lat && gym.lng && (
                        <Badge variant="outline" className="text-xs">
                          GPS configurado
                        </Badge>
                      )}
                    </div>
                  </div>

                  <div className="flex gap-1 shrink-0">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleEdit(gym)}
                    >
                      <Pencil className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setDeleteId(gym.id)}
                    >
                      <Trash2 className="w-4 h-4 text-destructive" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <GymForm
        open={formOpen}
        onOpenChange={setFormOpen}
        gym={editingGym}
        onSubmit={handleSubmit}
        isLoading={createGym.isPending || updateGym.isPending}
      />

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir academia?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação não pode ser desfeita. A academia e seus vínculos serão removidos permanentemente.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default AdminGymsTab;
