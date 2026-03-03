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
import { useEquipment } from "@/hooks/useEquipment";
import { useAdminEquipment } from "@/hooks/useAdminEquipment";
import EquipmentForm from "./EquipmentForm";
import { Plus, Pencil, Trash2, Dumbbell, Video, MapPin } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

interface Equipment {
  id: string;
  name: string;
  description?: string | null;
  video_url?: string | null;
  category?: string | null;
  difficulty?: string | null;
  gym_id?: string | null;
  muscles?: string[] | null;
  image_url?: string | null;
  specifications?: string[] | null;
  usage_instructions?: string | null;
  primary_function?: string | null;
}

const AdminEquipmentTab = () => {
  const { equipment, isLoading } = useEquipment();
  const { createEquipment, updateEquipment, deleteEquipment } = useAdminEquipment();
  
  const [formOpen, setFormOpen] = useState(false);
  const [editingEquipment, setEditingEquipment] = useState<Equipment | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const handleCreate = () => {
    setEditingEquipment(null);
    setFormOpen(true);
  };

  const handleEdit = (eq: Equipment) => {
    setEditingEquipment(eq);
    setFormOpen(true);
  };

  const handleSubmit = (data: Omit<Equipment, "id"> & { id?: string }) => {
    if (data.id) {
      updateEquipment.mutate(data as Equipment, {
        onSuccess: () => setFormOpen(false),
      });
    } else {
      createEquipment.mutate(data, {
        onSuccess: () => setFormOpen(false),
      });
    }
  };

  const handleDelete = () => {
    if (deleteId) {
      deleteEquipment.mutate(deleteId, {
        onSuccess: () => setDeleteId(null),
      });
    }
  };

  const getDifficultyColor = (difficulty?: string | null) => {
    switch (difficulty) {
      case "beginner":
        return "bg-green-500/20 text-green-400";
      case "intermediate":
        return "bg-yellow-500/20 text-yellow-400";
      case "advanced":
        return "bg-red-500/20 text-red-400";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  const getDifficultyLabel = (difficulty?: string | null) => {
    switch (difficulty) {
      case "beginner":
        return "Iniciante";
      case "intermediate":
        return "Intermediário";
      case "advanced":
        return "Avançado";
      default:
        return difficulty;
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
          {equipment?.length || 0} equipamentos cadastrados
        </p>
        <Button onClick={handleCreate} size="sm">
          <Plus className="w-4 h-4 mr-1" />
          Novo
        </Button>
      </div>

      {equipment?.length === 0 ? (
        <Card className="bg-card/50">
          <CardContent className="py-8 text-center">
            <Dumbbell className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
            <p className="text-muted-foreground">
              Nenhum equipamento cadastrado
            </p>
            <Button onClick={handleCreate} className="mt-4" variant="outline">
              Adicionar primeiro equipamento
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {equipment?.map((eq) => (
            <Card key={eq.id} className="bg-card/50">
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-medium truncate">{eq.name}</h3>
                      {eq.video_url && (
                        <Video className="w-4 h-4 text-primary shrink-0" />
                      )}
                      {eq.gym_id && (
                        <MapPin className="w-4 h-4 text-green-500 shrink-0" />
                      )}
                    </div>
                    
                    {eq.description && (
                      <p className="text-sm text-muted-foreground line-clamp-1 mb-2">
                        {eq.description}
                      </p>
                    )}
                    
                    <div className="flex flex-wrap gap-1">
                      {eq.category && (
                        <Badge variant="secondary" className="text-xs">
                          {eq.category}
                        </Badge>
                      )}
                      {eq.difficulty && (
                        <Badge className={`text-xs ${getDifficultyColor(eq.difficulty)}`}>
                          {getDifficultyLabel(eq.difficulty)}
                        </Badge>
                      )}
                    </div>
                  </div>

                  <div className="flex gap-1 shrink-0">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleEdit(eq)}
                    >
                      <Pencil className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setDeleteId(eq.id)}
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

      <EquipmentForm
        open={formOpen}
        onOpenChange={setFormOpen}
        equipment={editingEquipment}
        onSubmit={handleSubmit}
        isLoading={createEquipment.isPending || updateEquipment.isPending}
      />

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir equipamento?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação não pode ser desfeita. O equipamento será removido permanentemente.
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

export default AdminEquipmentTab;
