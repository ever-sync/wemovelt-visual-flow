import { useState } from "react";
import { useEquipment, Equipment } from "@/hooks/useEquipment";
import { Check, Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";

export interface SelectedExercise {
  equipment_id: string;
  name: string;
  sets: number;
  reps: string;
  rest_seconds: number;
}

interface ExerciseSelectorProps {
  selectedExercises: SelectedExercise[];
  onSelect: (exercises: SelectedExercise[]) => void;
}

const ExerciseSelector = ({ selectedExercises, onSelect }: ExerciseSelectorProps) => {
  const { equipment, isLoading, categories } = useEquipment();
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const filteredEquipment = equipment.filter((eq) => {
    const matchesSearch = eq.name.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = !selectedCategory || eq.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const isSelected = (equipmentId: string) => 
    selectedExercises.some(ex => ex.equipment_id === equipmentId);

  const toggleExercise = (eq: Equipment) => {
    if (isSelected(eq.id)) {
      onSelect(selectedExercises.filter(ex => ex.equipment_id !== eq.id));
    } else {
      onSelect([
        ...selectedExercises,
        {
          equipment_id: eq.id,
          name: eq.name,
          sets: 3,
          reps: "12",
          rest_seconds: 60,
        },
      ]);
    }
  };

  const updateExercise = (equipmentId: string, field: keyof SelectedExercise, value: string | number) => {
    onSelect(
      selectedExercises.map(ex => 
        ex.equipment_id === equipmentId 
          ? { ...ex, [field]: value } 
          : ex
      )
    );
  };

  if (isLoading) {
    return (
      <div className="min-w-0 space-y-3">
        <Skeleton className="h-10 w-full" />
        <div className="grid grid-cols-1 gap-2">
          {[1, 2, 3, 4].map(i => (
            <Skeleton key={i} className="h-20" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="min-w-0 space-y-4">
      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
        <Input
          placeholder="Buscar exercício..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-10 bg-secondary border-0 rounded-xl"
        />
      </div>

      {/* Category Filter */}
      <div className="flex min-w-0 gap-2 overflow-x-auto pb-2 scrollbar-hide">
        <button
          onClick={() => setSelectedCategory(null)}
          className={`shrink-0 px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${
            !selectedCategory ? "wemovelt-gradient" : "bg-secondary hover:bg-secondary/80"
          }`}
        >
          Todos
        </button>
        {categories.map((category) => (
          <button
            key={category}
            onClick={() => setSelectedCategory(category)}
            className={`shrink-0 px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap capitalize transition-colors ${
              selectedCategory === category ? "wemovelt-gradient" : "bg-secondary hover:bg-secondary/80"
            }`}
          >
            {category}
          </button>
        ))}
      </div>

      {/* Equipment Grid */}
      <div className="grid max-h-[30dvh] grid-cols-1 gap-2 overflow-y-auto pr-1 scrollbar-hide">
        {filteredEquipment.map((eq) => (
          <button
            key={eq.id}
            onClick={() => toggleExercise(eq)}
            className={`w-full min-w-0 rounded-xl p-3 text-left transition-all ${
              isSelected(eq.id)
                ? "bg-primary/20 border-2 border-primary"
                : "bg-secondary hover:bg-secondary/80"
            }`}
          >
            <div className="flex items-start justify-between">
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm truncate">{eq.name}</p>
                <p className="text-xs text-muted-foreground truncate">
                  {eq.muscles?.join(", ") || ""}
                </p>
              </div>
              {isSelected(eq.id) && (
                <Check size={16} className="text-primary flex-shrink-0 ml-1" />
              )}
            </div>
          </button>
        ))}
      </div>

      {/* Selected Exercises Config */}
      {selectedExercises.length > 0 && (
        <div className="min-w-0 space-y-2 border-t border-border pt-4">
          <h4 className="font-bold text-sm">Exercícios selecionados ({selectedExercises.length})</h4>
          <div className="max-h-[32dvh] space-y-2 overflow-y-auto pr-1 sm:max-h-[34dvh]">
            {selectedExercises.map((ex, index) => (
              <div key={ex.equipment_id} className="min-w-0 rounded-xl bg-secondary p-3">
              <div className="flex items-center justify-between mb-2">
                <span className="min-w-0 pr-2 text-sm font-medium">
                  <span className="block truncate">{index + 1}. {ex.name}</span>
                </span>
                <button
                  onClick={() => toggleExercise({ id: ex.equipment_id } as Equipment)}
                  className="text-muted-foreground hover:text-destructive transition-colors"
                >
                  <X size={16} />
                </button>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs text-muted-foreground">Séries</label>
                  <Input
                    type="number"
                    value={ex.sets}
                    onChange={(e) => updateExercise(ex.equipment_id, "sets", parseInt(e.target.value) || 3)}
                    className="h-8 text-center bg-background border-0 rounded-lg"
                    min={1}
                    max={10}
                  />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground">Reps</label>
                  <Input
                    value={ex.reps}
                    onChange={(e) => updateExercise(ex.equipment_id, "reps", e.target.value)}
                    className="h-8 text-center bg-background border-0 rounded-lg"
                  />
                </div>
                <div className="col-span-2">
                  <label className="text-xs text-muted-foreground">Descanso</label>
                  <Input
                    type="number"
                    value={ex.rest_seconds}
                    onChange={(e) => updateExercise(ex.equipment_id, "rest_seconds", parseInt(e.target.value) || 60)}
                    className="h-8 text-center bg-background border-0 rounded-lg"
                    min={15}
                    max={300}
                    step={15}
                  />
                </div>
              </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ExerciseSelector;
