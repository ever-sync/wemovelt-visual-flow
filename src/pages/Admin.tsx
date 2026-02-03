import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, Dumbbell, Building2 } from "lucide-react";
import AdminEquipmentTab from "@/components/admin/AdminEquipmentTab";
import AdminGymsTab from "@/components/admin/AdminGymsTab";

const Admin = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-2xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate("/home")}
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-xl font-bold">WEMOVELT Admin</h1>
            <p className="text-sm text-muted-foreground">
              Gerenciamento do sistema
            </p>
          </div>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="equipment" className="space-y-4">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="equipment" className="flex items-center gap-2">
              <Dumbbell className="w-4 h-4" />
              Equipamentos
            </TabsTrigger>
            <TabsTrigger value="gyms" className="flex items-center gap-2">
              <Building2 className="w-4 h-4" />
              Academias
            </TabsTrigger>
          </TabsList>

          <TabsContent value="equipment">
            <AdminEquipmentTab />
          </TabsContent>

          <TabsContent value="gyms">
            <AdminGymsTab />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Admin;
