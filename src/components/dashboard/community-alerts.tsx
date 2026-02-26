
"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, MapPin, Calendar, ArrowRight, Plus, AlertTriangle, X, Info, Store } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
  DialogFooter
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface Alert {
  id: number;
  region: string;
  crop: string;
  problem: string;
  severity: string;
  distance: string;
  date: string;
  lat: number;
  lng: number;
}

export function CommunityAlerts() {
  const { toast } = useToast();
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [isReportOpen, setIsReportOpen] = useState(false);
  const [isMapOpen, setIsMapOpen] = useState(false);
  const [selectedAlert, setSelectedAlert] = useState<Alert | null>(null);
  const [newAlert, setNewAlert] = useState({
    region: "",
    crop: "",
    problem: ""
  });

  useEffect(() => {
    const initialAlerts: Alert[] = [
      {
        id: 1,
        region: "Actopan",
        crop: "Cebada",
        problem: "Tizón Foliar Detectado",
        severity: "Alta",
        distance: "12km",
        date: "Hoy, 10:30 AM",
        lat: 20.2687,
        lng: -98.9413
      },
      {
        id: 2,
        region: "Pachuca",
        crop: "Tomate",
        problem: "Mosca Blanca",
        severity: "Media",
        distance: "25km",
        date: "Ayer",
        lat: 20.1011,
        lng: -98.7591
      },
      {
        id: 3,
        region: "Ixmiquilpan",
        crop: "Maíz",
        problem: "Gusano Cogollero",
        severity: "Alta",
        distance: "40km",
        date: "Hace 2 días",
        lat: 20.4831,
        lng: -99.2192
      }
    ];
    const saved = localStorage.getItem("community_alerts");
    setAlerts(saved ? JSON.parse(saved) : initialAlerts);
  }, []);

  const handleReport = () => {
    if (!newAlert.region || !newAlert.problem) {
      toast({
        title: "Error",
        description: "Completa la ubicación y el problema.",
        variant: "destructive"
      });
      return;
    }

    // Coordenadas aproximadas para nuevos reportes en Hidalgo
    const alert: Alert = {
      id: Date.now(),
      region: newAlert.region,
      crop: newAlert.crop || "Varios",
      problem: newAlert.problem,
      severity: "Alta",
      distance: "Cerca de ti",
      date: "Recién reportado",
      lat: 20.1 + (Math.random() * 0.4),
      lng: -98.8 - (Math.random() * 0.4)
    };

    const updated = [alert, ...alerts];
    setAlerts(updated);
    localStorage.setItem("community_alerts", JSON.stringify(updated));
    setIsReportOpen(false);
    setNewAlert({ region: "", crop: "", problem: "" });
    
    toast({
      title: "Alerta Enviada",
      description: "La comunidad ha sido notificada de tu reporte."
    });
  };

  const openMap = (alert: Alert) => {
    setSelectedAlert(alert);
    setIsMapOpen(true);
  };

  return (
    <Card className="border-none shadow-md overflow-hidden flex flex-col h-full">
      <CardHeader className="bg-primary text-primary-foreground py-4">
        <CardTitle className="text-lg flex items-center gap-2">
          <Users className="h-5 w-5" />
          Red Comunitaria Hidalgo
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0 flex-1 overflow-auto">
        <div className="divide-y">
          {alerts.map((alert) => (
            <div key={alert.id} className="p-4 hover:bg-muted/30 transition-colors group">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
                  <MapPin className="h-3 w-3" />
                  {alert.region} • {alert.distance}
                </div>
                <Badge variant={alert.severity === 'Alta' ? 'destructive' : 'secondary'} className="text-[10px] px-1.5 py-0 h-4">
                  {alert.severity}
                </Badge>
              </div>
              <h4 className="font-bold text-sm group-hover:text-primary transition-colors">
                {alert.problem}
              </h4>
              <p className="text-xs text-muted-foreground mb-3">Cultivo: {alert.crop}</p>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
                  <Calendar className="h-3 w-3" />
                  {alert.date}
                </div>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="h-7 text-xs px-2 gap-1 group-hover:translate-x-1 transition-transform"
                  onClick={() => openMap(alert)}
                >
                  Ver mapa <ArrowRight className="h-3 w-3" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
      <div className="p-4 bg-muted/20 border-t">
        <Button className="w-full font-semibold shadow-sm" size="sm" onClick={() => setIsReportOpen(true)}>
          <Plus className="h-4 w-4 mr-2" /> Reportar Brote Local
        </Button>
      </div>

      {/* Mapa Real de Google Maps */}
      <Dialog open={isMapOpen} onOpenChange={setIsMapOpen}>
        <DialogContent className="sm:max-w-3xl p-0 overflow-hidden border-none bg-background">
          <DialogHeader className="p-6 pb-2">
            <DialogTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5 text-primary" />
              Ubicación del Brote: {selectedAlert?.region}, Hidalgo
            </DialogTitle>
            <DialogDescription>
              Visualización geográfica real del reporte comunitario.
            </DialogDescription>
          </DialogHeader>
          
          <div className="relative h-[450px] w-full bg-muted">
            {selectedAlert && (
              <iframe
                width="100%"
                height="100%"
                style={{ border: 0 }}
                loading="lazy"
                allowFullScreen
                src={`https://www.google.com/maps?q=${selectedAlert.lat},${selectedAlert.lng}&z=13&output=embed`}
              />
            )}
            
            {/* Overlay de información rápida sobre el mapa */}
            {selectedAlert && (
              <div className="absolute bottom-4 left-4 right-4 bg-white/95 backdrop-blur-sm rounded-xl shadow-2xl border border-primary/20 p-4 animate-in slide-in-from-bottom-4 duration-300 z-10">
                <div className="flex justify-between items-start mb-2">
                   <div>
                     <Badge variant={selectedAlert.severity === 'Alta' ? 'destructive' : 'secondary'} className="mb-1">
                       {selectedAlert.severity} Riesgo
                     </Badge>
                     <h4 className="font-bold text-lg text-foreground">{selectedAlert.problem}</h4>
                   </div>
                   <Button variant="ghost" size="icon" onClick={() => setIsMapOpen(false)}>
                     <X className="h-4 w-4" />
                   </Button>
                </div>
                <div className="grid grid-cols-2 gap-4 text-sm">
                   <div className="flex items-center gap-2 text-muted-foreground">
                     <MapPin className="h-4 w-4 text-primary" />
                     <span>{selectedAlert.region}</span>
                   </div>
                   <div className="flex items-center gap-2 text-muted-foreground">
                     <Calendar className="h-4 w-4 text-primary" />
                     <span>{selectedAlert.date}</span>
                   </div>
                   <div className="col-span-2 p-2 bg-primary/5 rounded border border-primary/10 flex items-center gap-2">
                     <Info className="h-4 w-4 text-primary" />
                     <span className="text-xs">Cultivo afectado: <span className="font-bold text-foreground">{selectedAlert.crop}</span></span>
                   </div>
                </div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={isReportOpen} onOpenChange={setIsReportOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-destructive" />
              Reportar Problema en Campo
            </DialogTitle>
            <DialogDescription>
              Avisar a otros agricultores de la región sobre plagas o enfermedades.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>¿Qué detectaste?</Label>
              <Input 
                placeholder="Ej: Mancha de asfalto, Gusano cogollero..." 
                value={newAlert.problem}
                onChange={(e) => setNewAlert({...newAlert, problem: e.target.value})}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Municipio</Label>
                <Input 
                  placeholder="Ej: Actopan" 
                  value={newAlert.region}
                  onChange={(e) => setNewAlert({...newAlert, region: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <Label>Cultivo</Label>
                <Input 
                  placeholder="Ej: Maíz" 
                  value={newAlert.crop}
                  onChange={(e) => setNewAlert({...newAlert, crop: e.target.value})}
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsReportOpen(false)}>Cancelar</Button>
            <Button variant="destructive" onClick={handleReport}>Enviar Alerta Regional</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
