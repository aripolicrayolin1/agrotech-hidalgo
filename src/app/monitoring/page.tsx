
"use client";

import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { SidebarNav } from "@/components/layout/sidebar-nav";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  AreaChart,
  Area
} from "recharts";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { Badge } from "@/components/ui/badge";
import { Activity, Thermometer, Droplets, Calendar, RefreshCw, Wifi, WifiOff } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { initializeApp, getApps } from "firebase/app";
import { getDatabase, ref, onValue } from "firebase/database";

const firebaseConfig = {
  databaseURL: "https://studio-3066950614-ac5b0-default-rtdb.firebaseio.com",
};

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
const db = getDatabase(app);

const chartConfig = {
  temp: {
    label: "Temperatura (°C)",
    color: "hsl(var(--chart-4))",
  },
  humidity: {
    label: "Humedad (%)",
    color: "hsl(var(--chart-1))",
  },
};

interface SensorPoint {
  time: string;
  temp: number;
  humidity: number;
}

export default function MonitoringPage() {
  const [history, setHistory] = useState<SensorPoint[]>([]);
  const [isOnline, setIsOnline] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const [events, setEvents] = useState<{time: string, event: string, status: string}[]>([]);
  const lastTimeRef = useRef<string>("");

  useEffect(() => {
    const sensorsRef = ref(db, 'sensores');
    const unsubscribe = onValue(sensorsRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const now = new Date();
        const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
        
        if (timeStr === lastTimeRef.current) return;
        lastTimeRef.current = timeStr;

        // Soporte para múltiples nombres de variables (Inglés/Español)
        const rawTemp = data.temperatura ?? data.temp ?? data.temperature ?? 0;
        const rawHumidity = data.humedad_suelo ?? data.humidity ?? data.humidity_soil ?? data.humedad ?? 0;

        const newPoint = {
          time: timeStr,
          temp: Number(rawTemp),
          humidity: Math.max(0, Math.min(100, Number(rawHumidity)))
        };

        setHistory(prev => {
          const updated = [...prev, newPoint];
          return updated.slice(-20); // Guardar un poco más de historial para mejores líneas
        });

        setIsOnline(true);
        setLastUpdate(now);

        if (newPoint.temp > 35) {
          setEvents(prev => [{ 
            time: timeStr, 
            event: `Alerta: Calor extremo (${newPoint.temp.toFixed(1)}°C)`, 
            status: "Atención" 
          }, ...prev].slice(0, 5));
        }
      }
    });

    return () => unsubscribe();
  }, []);

  return (
    <SidebarProvider>
      <SidebarNav />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center justify-between px-6 border-b bg-white/80 backdrop-blur-md sticky top-0 z-10">
          <div className="flex items-center gap-2">
            <SidebarTrigger />
            <h1 className="text-xl font-bold">Monitoreo de Sensores</h1>
          </div>
          <div className="flex items-center gap-3">
             <Badge variant={isOnline ? "default" : "secondary"} className="gap-1.5 py-1 px-3">
              {isOnline ? (
                <>
                  <Wifi className="h-3.5 w-3.5 text-white animate-pulse" />
                  En Vivo
                </>
              ) : (
                <>
                  <WifiOff className="h-3.5 w-3.5" />
                  Estación Desconectada
                </>
              )}
            </Badge>
          </div>
        </header>

        <main className="flex-1 p-4 md:p-8 space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <Card className="border-none shadow-lg overflow-hidden">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Thermometer className="h-5 w-5 text-orange-500" />
                  Tendencia de Temperatura
                </CardTitle>
                <CardDescription>Lecturas en tiempo real (°C)</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px] w-full mt-4">
                  {history.length > 0 ? (
                    <ChartContainer config={chartConfig} className="h-full w-full">
                      <AreaChart data={history} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                        <defs>
                          <linearGradient id="colorTemp" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="var(--color-temp)" stopOpacity={0.3}/>
                            <stop offset="95%" stopColor="var(--color-temp)" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--muted))" />
                        <XAxis 
                          dataKey="time" 
                          axisLine={false}
                          tickLine={false}
                          tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 10 }}
                          minTickGap={30}
                        />
                        <YAxis 
                          axisLine={false}
                          tickLine={false}
                          domain={[0, 60]}
                          tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 10 }}
                        />
                        <ChartTooltip content={<ChartTooltipContent />} />
                        <Area 
                          type="monotone" 
                          dataKey="temp" 
                          stroke="var(--color-temp)" 
                          fillOpacity={1} 
                          fill="url(#colorTemp)" 
                          strokeWidth={3}
                          isAnimationActive={false}
                        />
                      </AreaChart>
                    </ChartContainer>
                  ) : (
                    <div className="h-full flex flex-col items-center justify-center text-muted-foreground bg-muted/10 rounded-lg border-2 border-dashed">
                      <RefreshCw className="h-8 w-8 animate-spin-slow opacity-20 mb-2" />
                      <p className="text-sm italic">Sincronizando con Wokwi...</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card className="border-none shadow-lg overflow-hidden">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Droplets className="h-5 w-5 text-blue-500" />
                  Humedad del Suelo
                </CardTitle>
                <CardDescription>Lecturas en tiempo real (%)</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px] w-full mt-4">
                  {history.length > 0 ? (
                    <ChartContainer config={chartConfig} className="h-full w-full">
                      <LineChart data={history} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--muted))" />
                        <XAxis 
                          dataKey="time" 
                          axisLine={false}
                          tickLine={false}
                          tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 10 }}
                          minTickGap={30}
                        />
                        <YAxis 
                          axisLine={false}
                          tickLine={false}
                          domain={[0, 100]}
                          tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 10 }}
                        />
                        <ChartTooltip content={<ChartTooltipContent />} />
                        <Line 
                          type="monotone" 
                          dataKey="humidity" 
                          stroke="var(--color-humidity)" 
                          strokeWidth={4}
                          dot={{ fill: 'var(--color-humidity)', r: 4 }}
                          activeDot={{ r: 6, strokeWidth: 0 }}
                          isAnimationActive={false}
                        />
                      </LineChart>
                    </ChartContainer>
                  ) : (
                    <div className="h-full flex flex-col items-center justify-center text-muted-foreground bg-muted/10 rounded-lg border-2 border-dashed">
                      <RefreshCw className="h-8 w-8 animate-spin-slow opacity-20 mb-2" />
                      <p className="text-sm italic">Sincronizando con Wokwi...</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          <Card className="border-none shadow-lg">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Eventos Críticos Recientes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {events.length === 0 ? (
                  <div className="py-6 text-center text-muted-foreground text-sm italic">
                    No se han detectado anomalías. El sistema funciona correctamente.
                  </div>
                ) : (
                  events.map((item, i) => (
                    <div key={i} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg border border-primary/10">
                      <div className="flex items-center gap-4">
                        <span className="text-[10px] font-bold text-muted-foreground">{item.time}</span>
                        <p className="text-sm font-medium">{item.event}</p>
                      </div>
                      <Badge variant="secondary">{item.status}</Badge>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
