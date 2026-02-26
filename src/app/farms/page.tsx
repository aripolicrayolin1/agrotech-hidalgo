
"use client";

import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { SidebarNav } from "@/components/layout/sidebar-nav";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Plus, 
  MapPin, 
  Leaf, 
  Droplets, 
  Thermometer, 
  ArrowRight,
  MoreVertical,
  Activity,
  Trash2,
  X
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { useState, useEffect } from "react";
import Link from "next/link";

interface Farm {
  id: string;
  name: string;
  location: string;
  crop: string;
  area: string;
  status: string;
  lastUpdate: string;
  humidity: string;
  temp: string;
}

export default function FarmsPage() {
  const { toast } = useToast();
  const [farms, setFarms] = useState<Farm[]>([]);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [newFarm, setNewFarm] = useState({
    name: "",
    location: "",
    crop: "",
    area: ""
  });

  // Cargar fincas al iniciar
  useEffect(() => {
    const savedFarms = localStorage.getItem("guardian_farms");
    if (savedFarms) {
      setFarms(JSON.parse(savedFarms));
    } else {
      const initialFarms = [
        {
          id: "1",
          name: "Rancho El Jilguero",
          location: "Actopan, Hidalgo",
          crop: "Maíz",
          area: "5 Hectáreas",
          status: "Saludable",
          lastUpdate: "Ahora",
          humidity: "68%",
          temp: "24°C"
        }
      ];
      setFarms(initialFarms);
      localStorage.setItem("guardian_farms", JSON.stringify(initialFarms));
    }
  }, []);

  const saveFarms = (updatedFarms: Farm[]) => {
    setFarms(updatedFarms);
    localStorage.setItem("guardian_farms", JSON.stringify(updatedFarms));
  };

  const handleAddFarm = () => {
    if (!newFarm.name || !newFarm.location || !newFarm.crop) {
      toast({
        title: "Error",
        description: "Por favor completa los campos principales.",
        variant: "destructive"
      });
      return;
    }

    const farmToAdd: Farm = {
      id: Math.random().toString(36).substr(2, 9),
      name: newFarm.name,
      location: newFarm.location,
      crop: newFarm.crop,
      area: newFarm.area || "No especificada",
      status: "Saludable",
      lastUpdate: "Recién añadido",
      humidity: "0%",
      temp: "0°C"
    };

    saveFarms([...farms, farmToAdd]);
    setIsAddDialogOpen(false);
    setNewFarm({ name: "", location: "", crop: "", area: "" });
    toast({
      title: "Finca Registrada",
      description: `${newFarm.name} ha sido añadida correctamente.`
    });
  };

  const handleDeleteFarm = (id: string) => {
    const updatedFarms = farms.filter(f => f.id !== id);
    saveFarms(updatedFarms);
    toast({
      title: "Finca Eliminada",
      description: "El registro ha sido borrado.",
    });
  };

  return (
    <SidebarProvider>
      <SidebarNav />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center justify-between px-6 transition-[width,height] ease-linear border-b bg-white/80 backdrop-blur-md sticky top-0 z-10">
          <div className="flex items-center gap-2">
            <SidebarTrigger />
            <h1 className="text-xl font-bold">Mis Fincas</h1>
          </div>
          <Button size="sm" onClick={() => setIsAddDialogOpen(true)}>
            <Plus className="mr-2 h-4 w-4" /> Añadir Finca
          </Button>
        </header>

        <main className="flex-1 p-4 md:p-8 space-y-6">
          <div className="max-w-6xl mx-auto space-y-8">
            <div className="space-y-1">
              <h2 className="text-3xl font-bold tracking-tight">Gestión de Terrenos</h2>
              <p className="text-muted-foreground">Administra tus cultivos en tiempo real.</p>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {farms.map((farm) => (
                <Card key={farm.id} className="border-none shadow-lg hover:shadow-xl transition-all relative overflow-hidden group">
                  <div className={`absolute top-0 left-0 w-1 h-full ${
                    farm.status === 'Saludable' ? 'bg-primary' : 'bg-destructive'
                  }`} />
                  
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-xl group-hover:text-primary transition-colors">{farm.name}</CardTitle>
                        <CardDescription className="flex items-center gap-1 mt-1">
                          <MapPin className="h-3 w-3" /> {farm.location}
                        </CardDescription>
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem className="text-destructive" onClick={() => handleDeleteFarm(farm.id)}>
                            <Trash2 className="mr-2 h-4 w-4" /> Eliminar finca
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </CardHeader>
                  
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary" className="gap-1">
                          <Leaf className="h-3 w-3" /> {farm.crop}
                        </Badge>
                        <span className="text-xs text-muted-foreground">{farm.area}</span>
                      </div>
                      <Badge variant={farm.status === 'Saludable' ? 'default' : 'destructive'} className="text-[10px] uppercase">
                        {farm.status}
                      </Badge>
                    </div>

                    <div className="grid grid-cols-2 gap-4 pt-2">
                      <div className="bg-muted/30 p-3 rounded-lg flex items-center gap-3">
                        <Droplets className="h-5 w-5 text-blue-500" />
                        <div>
                          <p className="text-[10px] text-muted-foreground uppercase font-bold">Humedad</p>
                          <p className="text-sm font-bold">{farm.humidity}</p>
                        </div>
                      </div>
                      <div className="bg-muted/30 p-3 rounded-lg flex items-center gap-3">
                        <Thermometer className="h-5 w-5 text-orange-500" />
                        <div>
                          <p className="text-[10px] text-muted-foreground uppercase font-bold">Temp.</p>
                          <p className="text-sm font-bold">{farm.temp}</p>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
                      <Activity className="h-3 w-3 text-primary" />
                      Actualización: {farm.lastUpdate}
                    </div>
                  </CardContent>

                  <CardFooter className="pt-0">
                    <Link href="/monitoring" className="w-full">
                      <Button variant="outline" className="w-full">Ver Monitoreo</Button>
                    </Link>
                  </CardFooter>
                </Card>
              ))}

              <button 
                className="border-2 border-dashed border-muted-foreground/20 rounded-lg p-12 flex flex-col items-center justify-center gap-4 hover:bg-muted/10 transition-colors group"
                onClick={() => setIsAddDialogOpen(true)}
              >
                <Plus className="h-8 w-8 text-primary group-hover:scale-110 transition-transform" />
                <div className="text-center">
                  <p className="font-bold">Nueva Finca</p>
                </div>
              </button>
            </div>
          </div>
        </main>

        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Añadir Nueva Finca</DialogTitle>
              <DialogDescription>Registra los datos básicos de tu terreno.</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nombre de la Finca</Label>
                <Input 
                  id="name" 
                  placeholder="Ej: Rancho El Amanecer" 
                  value={newFarm.name}
                  onChange={(e) => setNewFarm({...newFarm, name: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="location">Ubicación (Municipio)</Label>
                <Input 
                  id="location" 
                  placeholder="Ej: Actopan, Hidalgo" 
                  value={newFarm.location}
                  onChange={(e) => setNewFarm({...newFarm, location: e.target.value})}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="crop">Cultivo Principal</Label>
                  <Input 
                    id="crop" 
                    placeholder="Ej: Maíz" 
                    value={newFarm.crop}
                    onChange={(e) => setNewFarm({...newFarm, crop: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="area">Área (Hectáreas)</Label>
                  <Input 
                    id="area" 
                    placeholder="Ej: 2.5" 
                    value={newFarm.area}
                    onChange={(e) => setNewFarm({...newFarm, area: e.target.value})}
                  />
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>Cancelar</Button>
              <Button onClick={handleAddFarm}>Guardar Finca</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </SidebarInset>
    </SidebarProvider>
  );
}
