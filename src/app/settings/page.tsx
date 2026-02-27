
"use client";

import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { SidebarNav } from "@/components/layout/sidebar-nav";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { User, Mail, MapPin, Save, Bell, Shield, Loader2 } from "lucide-react";
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { useUser } from "@/firebase/auth/use-user";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export default function SettingsPage() {
  const { toast } = useToast();
  const { user, loading } = useUser();
  const [profile, setProfile] = useState({
    name: "",
    email: "",
    location: "Actopan, Hidalgo",
    bio: "Agricultor dedicado al cultivo de maíz y leguminosas."
  });

  useEffect(() => {
    const savedProfile = localStorage.getItem("user_profile");
    if (savedProfile) {
      const parsed = JSON.parse(savedProfile);
      setProfile(prev => ({
        ...prev,
        ...parsed
      }));
    }

    if (user) {
      setProfile(prev => ({
        ...prev,
        name: user.displayName || prev.name || "Agricultor",
        email: user.email || prev.email || ""
      }));
    }
  }, [user]);

  const handleSave = () => {
    localStorage.setItem("user_profile", JSON.stringify(profile));
    toast({
      title: "Perfil Actualizado",
      description: "Tus datos han sido guardados correctamente en el sistema local."
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <SidebarProvider>
      <SidebarNav />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center justify-between px-6 border-b bg-white/80 backdrop-blur-md sticky top-0 z-10">
          <div className="flex items-center gap-2">
            <SidebarTrigger />
            <h1 className="text-xl font-bold">Configuración de Perfil</h1>
          </div>
        </header>

        <main className="flex-1 p-4 md:p-8 space-y-6">
          <div className="max-w-2xl mx-auto space-y-6">
            <Card className="border-none shadow-lg">
              <CardHeader>
                <CardTitle>Mi Perfil</CardTitle>
                <CardDescription>Edita tu información pública para la comunidad.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-center mb-6">
                  <Avatar className="h-24 w-24 border-4 border-white shadow-lg">
                    <AvatarImage src={user?.photoURL ?? undefined} alt={profile.name} />
                    <AvatarFallback className="bg-primary/20 text-primary text-3xl">
                      {profile.name.charAt(0) || <User className="h-12 w-12" />}
                    </AvatarFallback>
                  </Avatar>
                </div>
                
                <div className="space-y-2">
                  <Label>Nombre Completo</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input 
                      className="pl-10" 
                      value={profile.name} 
                      onChange={(e) => setProfile({...profile, name: e.target.value})} 
                      placeholder="Tu nombre"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Correo Electrónico</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input 
                      className="pl-10 bg-muted/50" 
                      value={profile.email} 
                      readOnly
                      title="El correo se sincroniza con tu cuenta de Google"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Ubicación</Label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input 
                      className="pl-10" 
                      value={profile.location} 
                      onChange={(e) => setProfile({...profile, location: e.target.value})} 
                      placeholder="Ej: Actopan, Hidalgo"
                    />
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button className="w-full font-bold h-11" onClick={handleSave}>
                  <Save className="h-4 w-4 mr-2" /> Guardar Cambios
                </Button>
              </CardFooter>
            </Card>

            <div className="grid gap-4 md:grid-cols-2">
              <Card className="cursor-pointer hover:bg-muted/30 transition-colors border-none shadow-sm">
                <CardHeader className="p-4 flex flex-row items-center gap-3">
                  <div className="bg-primary/10 p-2 rounded-full">
                    <Bell className="h-4 w-4 text-primary" />
                  </div>
                  <CardTitle className="text-sm">Notificaciones</CardTitle>
                </CardHeader>
              </Card>
              <Card className="cursor-pointer hover:bg-muted/30 transition-colors border-none shadow-sm">
                <CardHeader className="p-4 flex flex-row items-center gap-3">
                  <div className="bg-primary/10 p-2 rounded-full">
                    <Shield className="h-4 w-4 text-primary" />
                  </div>
                  <CardTitle className="text-sm">Privacidad</CardTitle>
                </CardHeader>
              </Card>
            </div>
          </div>
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
