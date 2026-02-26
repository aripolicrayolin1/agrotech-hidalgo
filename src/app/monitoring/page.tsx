
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
  Tooltip, 
  ResponsiveContainer,
  AreaChart,
  Area
} from "recharts";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { Badge } from "@/components/ui/badge";
import { Activity, Thermometer, Droplets, Calendar } from "lucide-react";

const sensorHistory = [
  { time: "00:00", temp: 18, humidity: 72 },
  { time: "04:00", temp: 16, humidity: 75 },
  { time: "08:00", temp: 20, humidity: 70 },
  { time: "12:00", temp: 26, humidity: 62 },
  { time: "16:00", temp: 28, humidity: 58 },
  { time: "20:00", temp: 22, humidity: 68 },
  { time: "23:59", temp: 19, humidity: 71 },
];

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

export default function MonitoringPage() {
  return (
    <SidebarProvider>
      <SidebarNav />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center justify-between px-6 transition-[width,height] ease-linear border-b bg-white/80 backdrop-blur-md sticky top-0 z-10">
          <div className="flex items-center gap-2">
            <SidebarTrigger />
            <h1 className="text-xl font-bold">Monitoreo de Sensores</h1>
          </div>
          <Badge variant="outline" className="gap-1 px-3 py-1">
            <Activity className="h-3 w-3 text-primary animate-pulse" />
            En Vivo
          </Badge>
        </header>

        <main className="flex-1 p-4 md:p-8 space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <Card className="border-none shadow-lg">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <Thermometer className="h-5 w-5 text-orange-500" />
                      Tendencia de Temperatura
                    </CardTitle>
                    <CardDescription>Últimas 24 horas en Actopan, Hidalgo</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="h-[300px] w-full">
                  <ChartContainer config={chartConfig}>
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={sensorHistory}>
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
                          tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                        />
                        <YAxis 
                          axisLine={false}
                          tickLine={false}
                          tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                        />
                        <ChartTooltip content={<ChartTooltipContent />} />
                        <Area 
                          type="monotone" 
                          dataKey="temp" 
                          stroke="var(--color-temp)" 
                          fillOpacity={1} 
                          fill="url(#colorTemp)" 
                          strokeWidth={2}
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </ChartContainer>
                </div>
              </CardContent>
            </Card>

            <Card className="border-none shadow-lg">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <Droplets className="h-5 w-5 text-blue-500" />
                      Humedad del Suelo
                    </CardTitle>
                    <CardDescription>Variación de humedad relativa (%)</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="h-[300px] w-full">
                  <ChartContainer config={chartConfig}>
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={sensorHistory}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--muted))" />
                        <XAxis 
                          dataKey="time" 
                          axisLine={false}
                          tickLine={false}
                          tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                        />
                        <YAxis 
                          axisLine={false}
                          tickLine={false}
                          tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                        />
                        <ChartTooltip content={<ChartTooltipContent />} />
                        <Line 
                          type="monotone" 
                          dataKey="humidity" 
                          stroke="var(--color-humidity)" 
                          strokeWidth={3}
                          dot={{ fill: 'var(--color-humidity)', r: 4 }}
                          activeDot={{ r: 6, strokeWidth: 0 }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </ChartContainer>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card className="border-none shadow-lg">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Resumen de Condiciones Críticas
              </CardTitle>
              <CardDescription>Eventos detectados por los sensores en el último período</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  { time: "14:20", event: "Pico de calor detectado (28.5°C)", status: "Atención" },
                  { time: "06:15", event: "Humedad óptima para riego alcanzada", status: "Ideal" },
                  { time: "Ayer", event: "Baja radiación UV persistente", status: "Informativo" }
                ].map((item, i) => (
                  <div key={i} className="flex items-center justify-between p-4 bg-muted/30 rounded-lg border">
                    <div className="flex items-center gap-4">
                      <span className="text-xs font-bold text-muted-foreground w-12">{item.time}</span>
                      <p className="text-sm font-medium">{item.event}</p>
                    </div>
                    <Badge variant={item.status === 'Atención' ? 'secondary' : 'outline'}>{item.status}</Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
