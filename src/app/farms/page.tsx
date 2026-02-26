
"use client";

import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { SidebarNav } from "@/components/layout/sidebar-nav";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Plus, 
  MapPin, 
  Leaf, 
  Droplets, 
  Thermometer, 
  ArrowRight,
  MoreVertical,
  Activity
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";
import Link from "next/link";

const userFarms = [
  {
    id: 1,
    name: "Rancho El Jilguero",
    location: "Actopan, Hidalgo",
    crop: "Maíz",
    area: "5 Hectáreas",
    status: "Saludable",
    lastUpdate: "Hace 10 min",
    humidity: "68%",
    temp: "24°C"
  },
  {
    id: 2,
    name: "Parcela Las Flores",
    location: "Ixmiquilpan, Hidalgo",
    crop: "Frijol",
    area: "3 Hectáreas",
    status: "Riesgo Moderado",
    lastUpdate: "Hace 1 hora",
    humidity: "42%",
    temp: "28°C"
  },
  {
    id: 3,
    name: "Invernadero Real",
    location: "Pachuca de Soto",
    crop: "Tomate",
    area: "0.5 Hectáreas",
    status: "Atención Urgente",
    lastUpdate: "Hace 2 min",
    humidity: "85%",
    temp: "22°C"
  }
];

export default function FarmsPage() {
  const { toast } = useToast();

  const handleAction = (title: string, farmName: string) => {
    toast({
      title: title,
      description: `Acción realizada para ${farmName}. Funcionalidad completa en desarrollo.`,
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
          <Button size="sm" onClick={() => handleAction("Nueva Finca", "el sistema")}>
            <Plus className="mr-2 h-4 w-4" /> Añadir Finca
          </Button>
        </header>

        <main className="flex-1 p-4 md:p-8 space-y-6">
          <div className="max-w-6xl mx-auto space-y-8">
            <div className="space-y-1">
              <h2 className="text-3xl font-bold tracking-tight">Gestión de Terrenos</h2>
              <p className="text-muted-foreground">Administra y monitorea el estado de tus cultivos en la región de Hidalgo.</p>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {userFarms.map((farm) => (
                <Card key={farm.id} className="border-none shadow-lg hover:shadow-xl transition-all relative overflow-hidden group">
                  <div className={`absolute top-0 left-0 w-1 h-full ${
                    farm.status === 'Saludable' ? 'bg-primary' : 
                    farm.status === 'Riesgo Moderado' ? 'bg-accent' : 'bg-destructive'
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
                          <DropdownMenuItem onClick={() => handleAction("Editar", farm.name)}>Editar detalles</DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleAction("Sensores", farm.name)}>Configurar sensores</DropdownMenuItem>
                          <DropdownMenuItem className="text-destructive" onClick={() => handleAction("Eliminar", farm.name)}>Eliminar finca</DropdownMenuItem>
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
                      <Badge 
                        variant={farm.status === 'Saludable' ? 'default' : farm.status === 'Riesgo Moderado' ? 'secondary' : 'destructive'}
                        className="text-[10px] uppercase"
                      >
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
                      Ultima actualización: {farm.lastUpdate}
                    </div>
                  </CardContent>

                  <CardFooter className="pt-0">
                    <Link href="/monitoring" className="w-full">
                      <Button variant="outline" className="w-full group-hover:bg-primary group-hover:text-primary-foreground transition-all">
                        Ver Monitoreo <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                      </Button>
                    </Link>
                  </CardFooter>
                </Card>
              ))}

              <button 
                className="border-2 border-dashed border-muted-foreground/20 rounded-lg p-12 flex flex-col items-center justify-center gap-4 hover:bg-muted/10 transition-colors group h-full min-h-[300px]"
                onClick={() => handleAction("Añadir Nueva Finca", "tu cuenta")}
              >
                <div className="bg-primary/10 p-4 rounded-full group-hover:scale-110 transition-transform">
                  <Plus className="h-8 w-8 text-primary" />
                </div>
                <div className="text-center">
                  <p className="font-bold">Nueva Parcela o Finca</p>
                  <p className="text-sm text-muted-foreground">Registra un nuevo terreno para monitorear</p>
                </div>
              </button>
            </div>
          </div>
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
