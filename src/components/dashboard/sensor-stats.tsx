
"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Droplets, Thermometer, Sun, Wind, RefreshCw, Wifi, WifiOff } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { useState, useEffect } from "react";

interface SensorValues {
  humidity_soil: number;
  temp: number;
  uv: number;
  humidity_air: number;
}

interface SensorStatsProps {
  sensorValues: SensorValues;
  isOnline: boolean;
  lastUpdate: Date | null;
}

interface SensorData {
  label: string;
  value: number;
  displayValue: number;
  unit: string;
  icon: React.ElementType;
  color: string;
  max: number;
  key: string;
}

export function SensorStats({ sensorValues, isOnline, lastUpdate }: SensorStatsProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Lógica de normalización para que coincida con la IA (Clamping 0-100)
  const sensors: SensorData[] = [
    { 
      label: "Humedad Suelo", 
      value: sensorValues.humidity_soil, 
      displayValue: Math.max(0, Math.min(100, sensorValues.humidity_soil)),
      unit: "%", 
      icon: Droplets, 
      color: "text-blue-500", 
      max: 100, 
      key: "h_soil" 
    },
    { 
      label: "Temperatura", 
      value: sensorValues.temp, 
      displayValue: sensorValues.temp,
      unit: "°C", 
      icon: Thermometer, 
      color: "text-orange-500", 
      max: 50, 
      key: "temp" 
    },
    { 
      label: "Radiación UV", 
      value: sensorValues.uv, 
      displayValue: sensorValues.uv,
      unit: " UV", 
      icon: Sun, 
      color: "text-yellow-500", 
      max: 12, 
      key: "uv" 
    },
    { 
      label: "Humedad Aire", 
      value: sensorValues.humidity_air, 
      displayValue: Math.max(0, Math.min(100, sensorValues.humidity_air)),
      unit: "%", 
      icon: Wind, 
      color: "text-teal-500", 
      max: 100, 
      key: "h_air" 
    },
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
        {mounted && (
          <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
            <RefreshCw className={`h-3 w-3 ${isOnline ? 'animate-spin-slow' : ''}`} />
            Sincronizado: {lastUpdate ? lastUpdate.toLocaleTimeString() : "--:--:--"}
          </div>
        )}
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
              <div className="text-2xl font-bold flex items-baseline gap-1">
                {sensor.displayValue.toFixed(1)}
                <span className="text-sm font-normal text-muted-foreground">
                  {sensor.unit}
                </span>
                {sensor.value > 100 && sensor.unit === "%" && (
                   <span className="text-[10px] text-orange-500 font-normal ml-auto">(Normalizado)</span>
                )}
              </div>
              <Progress 
                value={(sensor.displayValue / sensor.max) * 100} 
                className="mt-3 h-1.5" 
              />
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
