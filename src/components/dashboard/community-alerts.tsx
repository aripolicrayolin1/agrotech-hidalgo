
"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, MapPin, Calendar, ArrowRight, Plus, AlertTriangle } from "lucide-react";
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
}

export function CommunityAlerts() {
  const { toast } = useToast();
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [isReportOpen, setIsReportOpen] = useState(false);
  const [newAlert, setNewAlert] = useState({
    region: "",
    crop: "",
    problem: ""
  });

  useEffect(() => {
    const initialAlerts = [
      {
        id: 1,
        region: "Actopan",
        crop: "Cebada",
        problem: "Tizón Foliar Detectado",
        severity: "Alta",
        distance: "12km",
        date: "Hoy, 10:30 AM"
      },
      {
        id: 2,
        region: "Pachuca",
        crop: "Tomate",
        problem: "Mosca Blanca",
        severity: "Media",
        distance: "25km",
        date: "Ayer"
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

    const alert: Alert = {
      id: Date.now(),
      region: newAlert.region,
      crop: newAlert.crop || "Varios",
      problem: newAlert.problem,
      severity: "Alta",
      distance: "Cerca de ti",
      date: "Recién reportado"
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

  const showOnMap = (alert: Alert) => {
    toast({
      title: `Localizando: ${alert.problem}`,
      description: `Brote detectado en ${alert.region}. Mantente alerta.`,
    });
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
                  onClick={() => showOnMap(alert)}
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
