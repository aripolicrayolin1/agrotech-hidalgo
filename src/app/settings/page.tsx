
"use client";

import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { SidebarNav } from "@/components/layout/sidebar-nav";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { User, MapPin, Save, Bell, Shield, Loader2, Phone, MessageSquare, Send, Smartphone, CheckCircle2 } from "lucide-react";
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { useUser } from "@/firebase/auth/use-user";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Switch } from "@/components/ui/switch";
import { sendTestNotification } from "@/app/actions/notifications";
import { Badge } from "@/components/ui/badge";

export default function SettingsPage() {
  const { toast } = useToast();
  const { user, loading: userLoading } = useUser();
  const [isSaving, setIsSaving] = useState(false);
  const [isSendingTest, setIsSendingTest] = useState(false);
  const [showPhonePreview, setShowPhonePreview] = useState(false);

  const [profile, setProfile] = useState({
    name: "",
    email: "",
    location: "Actopan, Hidalgo",
    phone: ""
  });

  const [notifications, setNotifications] = useState({
    email: true,
    sms: false,
    push: true
  });

  useEffect(() => {
    const savedProfile = localStorage.getItem("user_profile");
    if (savedProfile) {
      setProfile(JSON.parse(savedProfile));
    } else if (user) {
      setProfile(prev => ({
        ...prev,
        name: user.displayName || "",
        email: user.email || ""
      }));
    }
  }, [user]);

  const handleSave = async () => {
    setIsSaving(true);
    localStorage.setItem("user_profile", JSON.stringify(profile));
    await new Promise(r => setTimeout(r, 800));
    setIsSaving(false);
    toast({
      title: "Configuración Guardada",
      description: "Tus preferencias han sido actualizadas correctamente."
    });
  };

  const handleSendTest = async (type: 'sms' | 'email' | 'push') => {
    if (type === 'push') {
      if (!("Notification" in window)) {
        toast({ title: "Error", description: "Tu navegador no soporta notificaciones.", variant: "destructive" });
        return;
      }

      const permission = await Notification.requestPermission();
      if (permission === "granted") {
        new Notification("AgroTech Hidalgo", {
          body: "⚠️ Alerta de Riesgo: Se detectó alta humedad en tu parcela. Revisa el diagnóstico.",
          icon: "/favicon.ico"
        });
        toast({ title: "Notificación Enviada", description: "Revisa tu centro de notificaciones de la computadora." });
      } else {
        toast({ title: "Permiso Denegado", description: "Debes permitir las notificaciones en el navegador.", variant: "destructive" });
      }
      return;
    }

    const target = type === 'email' ? profile.email : profile.phone;
    
    if (!target) {
      toast({
        title: "Dato faltante",
        description: `Ingresa un ${type === 'email' ? 'correo' : 'teléfono'} para la prueba.`,
        variant: "destructive"
      });
      return;
    }

    setIsSendingTest(true);
    if (type === 'sms') setShowPhonePreview(true);

    try {
      const result = await sendTestNotification(type as 'sms' | 'email', target, profile.name);
      toast({
        title: "Lógica de Envío Activada",
        description: `${result.message}. Para el Hackathon, se muestra la simulación visual.`
      });
    } catch (error) {
      toast({ title: "Error", description: "Falla en la conexión de red.", variant: "destructive" });
    } finally {
      setIsSendingTest(false);
    }
  };

  if (userLoading) {
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
            <h1 className="text-xl font-bold">Ajustes del Sistema</h1>
          </div>
        </header>

        <main className="flex-1 p-4 md:p-8 space-y-6">
          <div className="max-w-5xl mx-auto grid gap-6 lg:grid-cols-3">
            <div className="lg:col-span-2 space-y-6">
              <Card className="border-none shadow-lg">
                <CardHeader>
                  <CardTitle>Mi Perfil de Agricultor</CardTitle>
                  <CardDescription>Datos vinculados a tu cuenta de Hidalgo.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-center mb-6">
                    <Avatar className="h-24 w-24 border-4 border-white shadow-xl">
                      <AvatarImage src={user?.photoURL ?? undefined} alt={profile.name} />
                      <AvatarFallback className="bg-primary/20 text-primary text-3xl">
                        {profile.name.charAt(0) || <User className="h-12 w-12" />}
                      </AvatarFallback>
                    </Avatar>
                  </div>
                  
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Nombre Completo</Label>
                      <Input value={profile.name} onChange={(e) => setProfile({...profile, name: e.target.value})} />
                    </div>
                    <div className="space-y-2">
                      <Label>Teléfono Celular (SMS)</Label>
                      <Input placeholder="+52 771 000 0000" value={profile.phone} onChange={(e) => setProfile({...profile, phone: e.target.value})} />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-none shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Bell className="h-5 w-5 text-primary" /> Canales de Alerta
                  </CardTitle>
                  <CardDescription>Activa cómo quieres ser notificado en emergencias.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex items-center justify-between p-4 bg-muted/20 rounded-xl">
                    <div className="space-y-1">
                      <Label className="text-base flex items-center gap-2">
                        <Smartphone className="h-4 w-4 text-primary" /> Push del Navegador
                      </Label>
                      <p className="text-[10px] text-muted-foreground">Ideal para la demo del Hackathon (Gratis y Real).</p>
                    </div>
                    <Button size="sm" onClick={() => handleSendTest('push')}>Probar Real</Button>
                  </div>

                  <div className="flex items-center justify-between border-t pt-4">
                    <div className="space-y-1">
                      <Label className="text-base">SMS Crítico (Twilio Simulado)</Label>
                      <p className="text-[10px] text-muted-foreground">Aviso instantáneo al móvil.</p>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <Switch checked={notifications.sms} onCheckedChange={(v) => setNotifications({...notifications, sms: v})} />
                      <Button variant="link" size="sm" className="h-auto p-0 text-[10px]" onClick={() => handleSendTest('sms')}>Ver Simulación SMS</Button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between border-t pt-4">
                    <div className="space-y-1">
                      <Label className="text-base text-muted-foreground">Correo Electrónico</Label>
                    </div>
                    <Switch checked={notifications.email} onCheckedChange={(v) => setNotifications({...notifications, email: v})} />
                  </div>
                </CardContent>
                <CardFooter className="bg-primary/5 p-4 justify-end">
                   <Button onClick={handleSave} disabled={isSaving}>
                     {isSaving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
                     Guardar Todo
                   </Button>
                </CardFooter>
              </Card>
            </div>

            <div className="space-y-6">
              <div className="sticky top-24">
                <h3 className="text-sm font-bold uppercase text-muted-foreground mb-4 flex items-center gap-2">
                  <Smartphone className="h-4 w-4" /> Demo: Vista Previa
                </h3>
                
                <div className="relative w-full aspect-[9/19] max-w-[280px] mx-auto bg-black rounded-[2.5rem] border-8 border-slate-800 shadow-2xl overflow-hidden p-1">
                   <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1/3 h-6 bg-slate-800 rounded-b-xl z-20"></div>
                   
                   <div className="w-full h-full bg-slate-100 rounded-[1.8rem] overflow-hidden relative flex flex-col">
                      <div className="h-6 bg-slate-200 w-full"></div>
                      <div className="p-4 flex-1">
                         {showPhonePreview ? (
                           <div className="space-y-2 animate-in slide-in-from-top-4 duration-500">
                             <div className="bg-white p-3 rounded-2xl shadow-sm border text-[10px]">
                                <p className="font-bold text-primary mb-1">AgroTech Hidalgo</p>
                                <p className="text-slate-600 leading-tight">
                                  ⚠️ ¡ATENCIÓN! Se reportó un brote de Gusano Cogollero a 5km de tu finca en Actopan. Toma medidas preventivas.
                                </p>
                             </div>
                             <div className="flex justify-end">
                                <Badge variant="secondary" className="text-[8px]">Hace un momento</Badge>
                             </div>
                           </div>
                         ) : (
                           <div className="h-full flex items-center justify-center text-center p-6">
                             <p className="text-[10px] text-slate-400 italic">Pulsa "Ver Simulación SMS" para ver cómo llega la alerta aquí.</p>
                           </div>
                         )}
                      </div>
                      <div className="h-10 bg-slate-200/50 w-full mt-auto flex items-center justify-around px-4">
                         <div className="h-4 w-4 rounded-full bg-slate-300"></div>
                         <div className="h-4 w-4 rounded-md bg-slate-300"></div>
                         <div className="h-4 w-4 rounded-full bg-slate-300"></div>
                      </div>
                   </div>
                </div>
                
                <p className="text-[10px] text-center text-muted-foreground mt-4 leading-tight">
                  Este simulador permite mostrar al jurado de Praxis el flujo completo de bioseguridad sin depender de hardware físico.
                </p>
              </div>
            </div>
          </div>
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
