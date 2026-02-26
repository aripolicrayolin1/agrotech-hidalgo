
"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Droplets, Thermometer, Sun, Wind, RefreshCw, Wifi, WifiOff } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { useState, useEffect } from "react";
import { initializeApp, getApps } from "firebase/app";
import { getDatabase, ref, onValue } from "firebase/database";
import { Badge } from "@/components/ui/badge";

// Configuración de Firebase Realtime Database proporcionada
const firebaseConfig = {
  databaseURL: "https://studio-3066950614-ac5b0-default-rtdb.firebaseio.com",
};

// Inicializar Firebase (solo una vez)
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
const db = getDatabase(app);

interface SensorData {
  label: string;
  value: number;
  unit: string;
  icon: React.ElementType;
  color: string;
  max: number;
  key: string;
}

export function SensorStats() {
  const [sensorValues, setSensorValues] = useState({
    humidity_soil: 0,
    temp: 0,
    uv: 0,
    humidity_air: 0
  });
  const [isOnline, setIsOnline] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);

  useEffect(() => {
    // Referencia a la carpeta principal 'sensores' definida en Wokwi
    const sensorsRef = ref(db, 'sensores');

    // Escuchar cambios en tiempo real
    const unsubscribe = onValue(sensorsRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        setSensorValues({
          humidity_soil: data.humedad_suelo || 0,
          temp: data.temperatura || 0,
          uv: data.uv || 0,
          humidity_air: data.humedad_aire || 0
        });
        setIsOnline(true);
        setLastUpdate(new Date());
      } else {
        setIsOnline(false);
      }
    }, (error) => {
      console.error("Error leyendo Firebase:", error);
      setIsOnline(false);
    });

    return () => unsubscribe();
  }, []);

  const sensors: SensorData[] = [
    { label: "Humedad Suelo", value: sensorValues.humidity_soil, unit: "%", icon: Droplets, color: "text-blue-500", max: 100, key: "h_soil" },
    { label: "Temperatura", value: sensorValues.temp, unit: "°C", icon: Thermometer, color: "text-orange-500", max: 50, key: "temp" },
    { label: "Radiación UV", value: sensorValues.uv, unit: " UV", icon: Sun, color: "text-yellow-500", max: 12, key: "uv" },
    { label: "Humedad Aire", value: sensorValues.humidity_air, unit: "%", icon: Wind, color: "text-teal-500", max: 100, key: "h_air" },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between px-1">
        <Badge variant={isOnline ? "default" : "secondary"} className="gap-1.5 py-1 px-3">
          {isOnline ? (
            <>
              <Wifi className="h-3.5 w-3.5 text-white animate-pulse" />
              Estación en Línea (Wokwi)
            </>
          ) : (
            <>
              <WifiOff className="h-3.5 w-3.5" />
              Estación Desconectada
            </>
          )}
        </Badge>
        <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
          <RefreshCw className={`h-3 w-3 ${isOnline ? 'animate-spin-slow' : ''}`} />
          Sincronizado: {lastUpdate ? lastUpdate.toLocaleTimeString() : "--:--:--"}
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {sensors.map((sensor) => (
          <Card key={sensor.label} className="overflow-hidden border-none shadow-md bg-white/50 backdrop-blur-sm hover:shadow-lg transition-all">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {sensor.label}
              </CardTitle>
              <sensor.icon className={`h-4 w-4 ${sensor.color} ${isOnline ? 'animate-pulse' : 'opacity-40'}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {sensor.value.toFixed(1)}
                <span className="text-sm font-normal text-muted-foreground ml-1">
                  {sensor.unit}
                </span>
              </div>
              <Progress 
                value={(sensor.value / sensor.max) * 100} 
                className="mt-3 h-1.5" 
              />
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
