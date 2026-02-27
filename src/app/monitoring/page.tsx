
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
  Area,
  ResponsiveContainer
} from "recharts";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Activity, 
  Thermometer, 
  Droplets, 
  Calendar, 
  RefreshCw, 
  Wifi, 
  WifiOff, 
  TrendingUp, 
  Download,
  Clock,
  CalendarDays
} from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { initializeApp, getApps } from "firebase/app";
import { getDatabase, ref, onValue } from "firebase/database";
import { Button } from "@/components/ui/button";

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

// Datos simulados para historial de horas (Hoy)
const hourlyData = [
  { time: "00:00", temp: 18, humidity: 85 },
  { time: "04:00", temp: 16, humidity: 90 },
  { time: "08:00", temp: 22, humidity: 75 },
  { time: "12:00", temp: 28, humidity: 60 },
  { time: "16:00", temp: 30, humidity: 55 },
  { time: "20:00", temp: 24, humidity: 70 },
];

// Datos simulados para historial de días (Semana)
const weeklyData = [
  { time: "Lun", temp: 24, humidity: 65 },
  { time: "Mar", temp: 26, humidity: 60 },
  { time: "Mie", temp: 22, humidity: 80 },
  { time: "Jue", temp: 25, humidity: 70 },
  { time: "Vie", temp: 29, humidity: 50 },
  { time: "Sab", temp: 27, humidity: 55 },
  { time: "Dom", temp: 23, humidity: 75 },
];

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

        // Soporte robusto para variables
        const rawTemp = data.temperatura ?? data.temp ?? data.temperature ?? 0;
        const rawHumidity = data.humedad_suelo ?? data.humidity ?? data.humidity_soil ?? data.humedad ?? 0;

        const newPoint = {
          time: timeStr,
          temp: Number(rawTemp),
          humidity: Math.max(0, Math.min(100, Number(rawHumidity)))
        };

        setHistory(prev => {
          const updated = [...prev, newPoint];
          return updated.slice(-15);
        });

        setIsOnline(true);
        setLastUpdate(now);

        if (newPoint.temp > 35) {
          setEvents(prev => [{ 
            time: timeStr, 
            event: `Alerta: Calor extremo detectado (${newPoint.temp.toFixed(1)}°C)`, 
            status: "Crítico" 
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
            <h1 className="text-xl font-bold">Analítica de Sensores</h1>
          </div>
          <div className="flex items-center gap-3">
             <Button variant="outline" size="sm" className="hidden md:flex">
               <Download className="h-4 w-4 mr-2" /> Exportar Reporte
             </Button>
             <Badge variant={isOnline ? "default" : "secondary"} className="gap-1.5 py-1 px-3">
              {isOnline ? (
                <>
                  <Wifi className="h-3.5 w-3.5 text-white animate-pulse" />
                  En Vivo (Hidalgo)
                </>
              ) : (
                <>
                  <WifiOff className="h-3.5 w-3.5" />
                  Desconectado
                </>
              )}
            </Badge>
          </div>
        </header>

        <main className="flex-1 p-4 md:p-8 space-y-8">
          <Tabs defaultValue="live" className="w-full">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
              <div className="space-y-1">
                <h2 className="text-2xl font-bold">Historial de Cultivo</h2>
                <p className="text-muted-foreground text-sm">Visualiza el comportamiento climático de tu finca en diferentes periodos.</p>
              </div>
              <TabsList className="grid grid-cols-3 w-full md:w-[400px]">
                <TabsTrigger value="live" className="gap-2">
                  <Activity className="h-3.5 w-3.5" /> Vivo
                </TabsTrigger>
                <TabsTrigger value="today" className="gap-2">
                  <Clock className="h-3.5 w-3.5" /> Hoy
                </TabsTrigger>
                <TabsTrigger value="week" className="gap-2">
                  <CalendarDays className="h-3.5 w-3.5" /> Semana
                </TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="live" className="space-y-6">
              <div className="grid gap-6 md:grid-cols-2">
                <ChartCard 
                  title="Temperatura en Vivo" 
                  description="Lecturas instantáneas desde Wokwi" 
                  data={history} 
                  dataKey="temp" 
                  color="var(--color-temp)" 
                  unit="°C"
                  type="area"
                  domain={[0, 60]}
                />
                <ChartCard 
                  title="Humedad en Vivo" 
                  description="Lecturas instantáneas desde Wokwi" 
                  data={history} 
                  dataKey="humidity" 
                  color="var(--color-humidity)" 
                  unit="%"
                  type="line"
                  domain={[0, 100]}
                />
              </div>
            </TabsContent>

            <TabsContent value="today" className="space-y-6">
              <div className="grid gap-6 md:grid-cols-2">
                <ChartCard 
                  title="Tendencia de Hoy" 
                  description="Comportamiento por horas" 
                  data={hourlyData} 
                  dataKey="temp" 
                  color="var(--color-temp)" 
                  unit="°C"
                  type="area"
                  domain={[0, 45]}
                />
                <ChartCard 
                  title="Humedad de Hoy" 
                  description="Variación de humedad por horas" 
                  data={hourlyData} 
                  dataKey="humidity" 
                  color="var(--color-humidity)" 
                  unit="%"
                  type="line"
                  domain={[0, 100]}
                />
              </div>
            </TabsContent>

            <TabsContent value="week" className="space-y-6">
              <div className="grid gap-6 md:grid-cols-2">
                <ChartCard 
                  title="Reporte Semanal" 
                  description="Promedios diarios de la semana" 
                  data={weeklyData} 
                  dataKey="temp" 
                  color="var(--color-temp)" 
                  unit="°C"
                  type="area"
                  domain={[0, 45]}
                />
                <ChartCard 
                  title="Humedad Semanal" 
                  description="Promedios de hidratación del suelo" 
                  data={weeklyData} 
                  dataKey="humidity" 
                  color="var(--color-humidity)" 
                  unit="%"
                  type="line"
                  domain={[0, 100]}
                />
              </div>
            </TabsContent>
          </Tabs>

          <Card className="border-none shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-lg flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-primary" />
                Eventos Significativos
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {events.length === 0 ? (
                  <div className="py-8 text-center text-muted-foreground text-sm italic bg-muted/20 rounded-lg border-2 border-dashed">
                    No se han registrado anomalías climáticas hoy.
                  </div>
                ) : (
                  events.map((item, i) => (
                    <div key={i} className="flex items-center justify-between p-3 bg-white rounded-lg border border-primary/10 shadow-sm animate-in fade-in slide-in-from-bottom-2 duration-300">
                      <div className="flex items-center gap-4">
                        <Badge variant="outline" className="font-mono text-[10px]">{item.time}</Badge>
                        <p className="text-sm font-medium">{item.event}</p>
                      </div>
                      <Badge variant="destructive" className="uppercase text-[9px]">{item.status}</Badge>
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

function ChartCard({ title, description, data, dataKey, color, unit, type, domain }: any) {
  return (
    <Card className="border-none shadow-lg overflow-hidden group">
      <CardHeader className="pb-0">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg group-hover:text-primary transition-colors">{title}</CardTitle>
            <CardDescription>{description}</CardDescription>
          </div>
          <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
            {dataKey === 'temp' ? <Thermometer className="h-4 w-4 text-orange-500" /> : <Droplets className="h-4 w-4 text-blue-500" />}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-[250px] w-full mt-6">
          {data.length > 0 ? (
            <ChartContainer config={chartConfig} className="h-full w-full aspect-auto">
              <ResponsiveContainer width="100%" height="100%">
                {type === 'area' ? (
                  <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id={`color-${dataKey}`} x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={color} stopOpacity={0.3}/>
                        <stop offset="95%" stopColor={color} stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--muted))" />
                    <XAxis 
                      dataKey="time" 
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 10 }}
                    />
                    <YAxis 
                      axisLine={false}
                      tickLine={false}
                      domain={domain}
                      tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 10 }}
                    />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Area 
                      type="monotone" 
                      dataKey={dataKey} 
                      stroke={color} 
                      fillOpacity={1} 
                      fill={`url(#color-${dataKey})`} 
                      strokeWidth={3}
                      isAnimationActive={false}
                    />
                  </AreaChart>
                ) : (
                  <LineChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--muted))" />
                    <XAxis 
                      dataKey="time" 
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 10 }}
                    />
                    <YAxis 
                      axisLine={false}
                      tickLine={false}
                      domain={domain}
                      tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 10 }}
                    />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Line 
                      type="monotone" 
                      dataKey={dataKey} 
                      stroke={color} 
                      strokeWidth={4}
                      dot={{ fill: color, r: 4 }}
                      activeDot={{ r: 6, strokeWidth: 0 }}
                      isAnimationActive={false}
                    />
                  </LineChart>
                )}
              </ResponsiveContainer>
            </ChartContainer>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-muted-foreground bg-muted/10 rounded-lg border-2 border-dashed">
              <RefreshCw className="h-8 w-8 animate-spin-slow opacity-20 mb-2" />
              <p className="text-sm italic">Esperando señal de Wokwi...</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
