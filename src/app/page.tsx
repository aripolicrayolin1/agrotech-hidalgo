
"use client";

import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { SidebarNav } from "@/components/layout/sidebar-nav";
import { SensorStats } from "@/components/dashboard/sensor-stats";
import { AIRiskAlert } from "@/components/dashboard/ai-risk-alert";
import { CommunityAlerts } from "@/components/dashboard/community-alerts";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Activity, Bell, Info, TrendingUp } from "lucide-react";
import Image from "next/image";
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from "recharts";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";

const performanceData = [
  { month: "Ene", health: 85 },
  { month: "Feb", health: 88 },
  { month: "Mar", health: 92 },
  { month: "Abr", health: 80 },
  { month: "May", health: 85 },
  { month: "Jun", health: 90 },
];

const chartConfig = {
  health: {
    label: "Salud del Cultivo (%)",
    color: "hsl(var(--primary))",
  },
};

export default function Home() {
  return (
    <SidebarProvider>
      <SidebarNav />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center justify-between px-6 transition-[width,height] ease-linear border-b bg-white/80 backdrop-blur-md sticky top-0 z-10">
          <div className="flex items-center gap-2">
            <SidebarTrigger />
            <h1 className="text-xl font-bold">Resumen de Gestión</h1>
          </div>
          <div className="flex items-center gap-4">
            <button className="relative p-2 text-muted-foreground hover:text-primary transition-colors">
              <Bell className="h-5 w-5" />
              <span className="absolute top-1.5 right-1.5 h-2 w-2 bg-destructive rounded-full border-2 border-white"></span>
            </button>
            <div className="flex items-center gap-2 border-l pl-4">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-bold">Juan Pérez</p>
                <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Agricultor Hidalgo</p>
              </div>
              <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center border-2 border-primary/40 overflow-hidden">
                 <Image 
                   src="https://picsum.photos/seed/farmer/100/100" 
                   alt="Profile" 
                   width={32} 
                   height={32} 
                   className="object-cover"
                 />
              </div>
            </div>
          </div>
        </header>

        <main className="flex-1 space-y-8 p-4 md:p-8 pt-6">
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold tracking-tight">Monitoreo IoT</h2>
              <p className="text-sm text-muted-foreground flex items-center gap-1">
                <Activity className="h-4 w-4 text-primary animate-pulse" /> Actualizado hace 2 min
              </p>
            </div>
            <SensorStats />
          </section>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <div className="lg:col-span-2 space-y-6">
              <AIRiskAlert />
              
              <Card className="border-none shadow-md">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-primary" />
                    Historial de Rendimiento
                  </CardTitle>
                  <CardDescription>Índice de salud de cultivos por mes</CardDescription>
                </CardHeader>
                <CardContent className="h-[250px] w-full pb-6">
                  <ChartContainer config={chartConfig}>
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={performanceData}>
                        <defs>
                          <linearGradient id="colorHealth" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3}/>
                            <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--muted))" />
                        <XAxis 
                          dataKey="month" 
                          axisLine={false} 
                          tickLine={false} 
                          tick={{fill: 'hsl(var(--muted-foreground))', fontSize: 12}} 
                        />
                        <YAxis 
                          axisLine={false} 
                          tickLine={false} 
                          domain={[0, 100]}
                          tick={{fill: 'hsl(var(--muted-foreground))', fontSize: 12}}
                        />
                        <ChartTooltip content={<ChartTooltipContent />} />
                        <Area 
                          type="monotone" 
                          dataKey="health" 
                          stroke="hsl(var(--primary))" 
                          strokeWidth={3}
                          fillOpacity={1} 
                          fill="url(#colorHealth)" 
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </ChartContainer>
                </CardContent>
              </Card>
            </div>

            <div className="space-y-6">
              <CommunityAlerts />
              
              <Card className="bg-primary text-primary-foreground border-none shadow-md overflow-hidden relative group">
                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform">
                  <Info className="h-24 w-24" />
                </div>
                <CardHeader>
                  <CardTitle className="text-lg">Tip del Día</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm leading-relaxed opacity-90">
                    La rotación de cultivos de maíz con leguminosas en la zona de Hidalgo ayuda a fijar nitrógeno de forma natural, reduciendo la necesidad de fertilizantes químicos.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
