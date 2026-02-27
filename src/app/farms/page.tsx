
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
  MoreVertical,
  Activity,
  Trash2,
  Loader2
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
import { useState, useMemo } from "react";
import Link from "next/link";
import { useFirestore, useUser, useCollection } from "@/firebase";
import { collection, doc, setDoc, deleteDoc, serverTimestamp } from "firebase/firestore";
import { errorEmitter } from "@/firebase/error-emitter";
import { FirestorePermissionError } from "@/firebase/errors";
import { useTranslation } from "@/hooks/use-translation";

export default function FarmsPage() {
  const { toast } = useToast();
  const { t } = useTranslation();
  const db = useFirestore();
  const { user } = useUser();
  
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [newFarm, setNewFarm] = useState({
    name: "",
    location: "",
    crop: "",
    area: ""
  });

  const farmsCollectionRef = useMemo(() => {
    if (!db || !user) return null;
    return collection(db, "users", user.uid, "farms");
  }, [db, user]);

  const { data: farms, loading: farmsLoading } = useCollection(farmsCollectionRef);

  const handleAddFarm = () => {
    if (!db || !user || !farmsCollectionRef) return;
    if (!newFarm.name || !newFarm.location || !newFarm.crop) {
      toast({
        title: "Error",
        description: "Por favor completa los campos principales.",
        variant: "destructive"
      });
      return;
    }

    const farmId = Math.random().toString(36).substr(2, 9);
    const farmDocRef = doc(farmsCollectionRef, farmId);
    
    const farmData = {
      name: newFarm.name,
      location: newFarm.location,
      crop: newFarm.crop,
      area: newFarm.area || "No especificada",
      userId: user.uid,
      status: "Saludable",
      lastUpdate: "Recién añadido",
      humidity: "0%",
      temp: "0°C",
      createdAt: serverTimestamp()
    };

    setDoc(farmDocRef, farmData)
      .catch(async (error) => {
        const permissionError = new FirestorePermissionError({
          path: farmDocRef.path,
          operation: 'write',
          requestResourceData: farmData,
        });
        errorEmitter.emit('permission-error', permissionError);
      });

    setIsAddDialogOpen(false);
    setNewFarm({ name: "", location: "", crop: "", area: "" });
    toast({
      title: "Finca Registrada",
      description: `${newFarm.name} ha sido añadida a la nube.`
    });
  };

  const handleDeleteFarm = (id: string) => {
    if (!farmsCollectionRef) return;
    const farmDocRef = doc(farmsCollectionRef, id);
    
    deleteDoc(farmDocRef)
      .catch(async (error) => {
        const permissionError = new FirestorePermissionError({
          path: farmDocRef.path,
          operation: 'delete',
        });
        errorEmitter.emit('permission-error', permissionError);
      });

    toast({
      title: "Finca Eliminada",
      description: "El registro ha sido borrado de la nube.",
    });
  };

  return (
    <SidebarProvider>
      <SidebarNav />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center justify-between px-6 border-b bg-white/80 backdrop-blur-md sticky top-0 z-10">
          <div className="flex items-center gap-2">
            <SidebarTrigger />
            <h1 className="text-xl font-bold">{t('my_farms')}</h1>
          </div>
          <Button size="sm" onClick={() => setIsAddDialogOpen(true)} disabled={!user}>
            <Plus className="mr-2 h-4 w-4" /> {t('add_farm')}
          </Button>
        </header>

        <main className="flex-1 p-4 md:p-8 space-y-6">
          <div className="max-w-6xl mx-auto space-y-8">
            <div className="space-y-1">
              <h2 className="text-3xl font-bold tracking-tight">{t('land_management')}</h2>
              <p className="text-muted-foreground">{t('farms_desc')}</p>
            </div>

            {farmsLoading ? (
              <div className="flex flex-col items-center justify-center py-20 gap-4">
                <Loader2 className="h-10 w-10 animate-spin text-primary" />
                <p className="text-muted-foreground font-medium">{t('sync_firebase')}</p>
              </div>
            ) : (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {farms.map((farm: any) => (
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
                          {farm.status === 'Saludable' ? t('healthy') : farm.status}
                        </Badge>
                      </div>

                      <div className="grid grid-cols-2 gap-4 pt-2">
                        <div className="bg-muted/30 p-3 rounded-lg flex items-center gap-3">
                          <Droplets className="h-5 w-5 text-blue-500" />
                          <div>
                            <p className="text-[10px] text-muted-foreground uppercase font-bold">{t('soil_humidity')}</p>
                            <p className="text-sm font-bold">{farm.humidity}</p>
                          </div>
                        </div>
                        <div className="bg-muted/30 p-3 rounded-lg flex items-center gap-3">
                          <Thermometer className="h-5 w-5 text-orange-500" />
                          <div>
                            <p className="text-[10px] text-muted-foreground uppercase font-bold">{t('air_temp')}</p>
                            <p className="text-sm font-bold">{farm.temp}</p>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
                        <Activity className="h-3 w-3 text-primary" />
                        {t('last_update_label')}: {farm.lastUpdate}
                      </div>
                    </CardContent>

                    <CardFooter className="pt-0">
                      <Link href="/monitoring" className="w-full">
                        <Button variant="outline" className="w-full">{t('view_monitoring')}</Button>
                      </Link>
                    </CardFooter>
                  </Card>
                ))}

                <button 
                  className="border-2 border-dashed border-muted-foreground/20 rounded-lg p-12 flex flex-col items-center justify-center gap-4 hover:bg-muted/10 transition-colors group"
                  onClick={() => setIsAddDialogOpen(true)}
                  disabled={!user}
                >
                  <Plus className="h-8 w-8 text-primary group-hover:scale-110 transition-transform" />
                  <div className="text-center">
                    <p className="font-bold">{t('new_farm_btn')}</p>
                    {!user && <p className="text-[10px] text-destructive">{t('inicia_sesion_anadir')}</p>}
                  </div>
                </button>
              </div>
            )}
          </div>
        </main>

        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{t('add_new_farm_title')}</DialogTitle>
              <DialogDescription>{t('add_new_farm_desc')}</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="name">{t('farm_name_label')}</Label>
                <Input 
                  id="name" 
                  placeholder="Ej: Rancho El Amanecer" 
                  value={newFarm.name}
                  onChange={(e) => setNewFarm({...newFarm, name: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="location">{t('location_label')}</Label>
                <Input 
                  id="location" 
                  placeholder="Ej: Actopan, Hidalgo" 
                  value={newFarm.location}
                  onChange={(e) => setNewFarm({...newFarm, location: e.target.value})}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="crop">{t('main_crop_label')}</Label>
                  <Input 
                    id="crop" 
                    placeholder="Ej: Maíz" 
                    value={newFarm.crop}
                    onChange={(e) => setNewFarm({...newFarm, crop: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="area">{t('area_label')}</Label>
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
              <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>{t('cancel')}</Button>
              <Button onClick={handleAddFarm}>{t('save_farm')}</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </SidebarInset>
    </SidebarProvider>
  );
}
