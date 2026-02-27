"use client";

import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { SidebarNav } from "@/components/layout/sidebar-nav";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Camera, 
  Upload, 
  CheckCircle2, 
  AlertTriangle, 
  Loader2, 
  X, 
  RefreshCcw, 
  ShoppingBag, 
  Leaf, 
  MapPin,
  Info,
  ArrowRight,
  MessageSquare,
  Share2,
  Clock
} from "lucide-react";
import { useState } from "react";
import { diagnoseCropDisease, type CropDiagnosisOutput } from "@/ai/flows/crop-disease-photo-diagnosis-flow";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Link from "next/link";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";

export default function DiagnosisPage() {
  const { toast } = useToast();
  const router = useRouter();
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [diagnosis, setDiagnosis] = useState<CropDiagnosisOutput | null>(null);
  const [loading, setLoading] = useState(false);
  const [description, setDescription] = useState("");
  const [lastAttemptTime, setLastAttemptTime] = useState<string | null>(null);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSelectedImage(reader.result as string);
        setDiagnosis(null);
      };
      reader.readAsDataURL(file);
    }
  };

  const startDiagnosis = async () => {
    if (!selectedImage) return;
    setLoading(true);
    const now = new Date().toLocaleTimeString();
    setLastAttemptTime(now);

    try {
      const result = await diagnoseCropDisease({
        photoDataUri: selectedImage,
        description: description
      });
      setDiagnosis(result);
      
      if (result.diagnosis.isWaiting) {
        toast({
          title: "Límite de Google Alcanzado",
          description: "Tus 3 llaves están en pausa. Espera 15 segundos y presiona el botón de nuevo.",
          variant: "destructive"
        });
      } else {
        toast({
          title: "Análisis Completado",
          description: "La IA ha procesado la imagen correctamente.",
        });
      }
    } catch (error) {
      console.error("Diagnosis failed", error);
      toast({
        title: "Error de Conexión",
        description: "No se pudo conectar con el servicio de IA. Reintenta en un momento.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    setSelectedImage(null);
    setDiagnosis(null);
    setDescription("");
    setLastAttemptTime(null);
  };

  return (
    <SidebarProvider>
      <SidebarNav />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center justify-between px-6 border-b bg-white/80 backdrop-blur-md sticky top-0 z-10">
          <div className="flex items-center gap-2">
            <SidebarTrigger />
            <h1 className="text-xl font-bold">Diagnóstico IA</h1>
          </div>
        </header>

        <main className="flex-1 p-4 md:p-8 space-y-6">
          <div className="max-w-5xl mx-auto space-y-6">
            {!diagnosis || diagnosis.diagnosis.isWaiting ? (
              <Card className={`border-none shadow-xl transition-all ${diagnosis?.diagnosis.isWaiting ? 'ring-2 ring-orange-500' : ''}`}>
                <CardHeader>
                  <CardTitle className="text-2xl flex items-center gap-2">
                    {diagnosis?.diagnosis.isWaiting && <Clock className="h-6 w-6 text-orange-500 animate-pulse" />}
                    {diagnosis?.diagnosis.isWaiting ? "Modo de Espera Activo" : "Identificador de Cultivos"}
                  </CardTitle>
                  <CardDescription>
                    {diagnosis?.diagnosis.isWaiting 
                      ? "Google ha pausado tus 3 llaves temporalmente. No cierres esta pestaña."
                      : "Sube una foto de tu cultivo para un diagnóstico instantáneo."}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {diagnosis?.diagnosis.isWaiting && (
                    <div className="p-4 bg-orange-50 border border-orange-200 rounded-lg text-sm text-orange-800 space-y-2">
                       <p className="font-bold flex items-center gap-2">
                         <AlertTriangle className="h-4 w-4" /> 
                         Estado de tus llaves: Agotadas temporalmente.
                       </p>
                       <ul className="list-disc pl-5 space-y-1">
                         <li>Último intento: {lastAttemptTime}</li>
                         <li>Siguiente paso: Espera a que el contador de Google se limpie (aprox. 15s).</li>
                         <li>Tus datos y foto siguen guardados aquí abajo.</li>
                       </ul>
                    </div>
                  )}

                  {!selectedImage ? (
                    <div className="border-2 border-dashed border-muted-foreground/20 rounded-xl aspect-video flex flex-col items-center justify-center p-12 bg-muted/10 group hover:bg-muted/20 transition-all cursor-pointer relative overflow-hidden">
                      <Input 
                        type="file" 
                        accept="image/*" 
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" 
                        onChange={handleImageChange}
                      />
                      <div className="bg-primary/10 p-4 rounded-full mb-4 group-hover:scale-110 transition-transform">
                        <Camera className="h-10 w-10 text-primary" />
                      </div>
                      <p className="font-bold text-lg">Subir o Tomar Foto</p>
                    </div>
                  ) : (
                    <div className="relative aspect-video rounded-xl overflow-hidden group shadow-inner bg-black">
                       <Image src={selectedImage} alt="Preview" fill className="object-contain" />
                       <Button variant="destructive" size="icon" className="absolute top-4 right-4 h-8 w-8 rounded-full z-20" onClick={reset}>
                         <X className="h-4 w-4" />
                       </Button>
                    </div>
                  )}

                  <div className="space-y-2">
                    <Label htmlFor="symptoms">Describe los síntomas</Label>
                    <Input 
                      id="symptoms" 
                      placeholder="Ej: manchas amarillas..." 
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                    />
                  </div>
                </CardContent>
                <CardFooter>
                  <Button 
                    className={`w-full h-12 text-lg font-bold shadow-lg ${diagnosis?.diagnosis.isWaiting ? 'bg-orange-600 hover:bg-orange-700' : ''}`}
                    disabled={!selectedImage || loading}
                    onClick={startDiagnosis}
                  >
                    {loading ? (
                      <>
                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                        Probando tus 3 llaves...
                      </>
                    ) : (
                      <>
                        <RefreshCcw className="mr-2 h-5 w-5" />
                        {diagnosis?.diagnosis.isWaiting ? "Reintentar Ahora" : "Iniciar Análisis IA"}
                      </>
                    )}
                  </Button>
                </CardFooter>
              </Card>
            ) : (
              <div className="grid gap-6 lg:grid-cols-3">
                <Card className="lg:col-span-1 border-none shadow-lg overflow-hidden h-fit">
                   <div className="relative aspect-square">
                      <Image src={selectedImage!} alt="Preview" fill className="object-cover" />
                   </div>
                   <CardContent className="p-4 bg-muted/50">
                     <Button variant="outline" size="sm" className="w-full" onClick={reset}>
                       <RefreshCcw className="h-3 w-3 mr-2" /> Nueva Consulta
                     </Button>
                   </CardContent>
                </Card>

                <div className="lg:col-span-2 space-y-6">
                  <Card className="border-none shadow-lg animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <CardHeader className="flex flex-row items-start justify-between">
                      <div>
                        <CardTitle className="text-2xl flex items-center gap-2">
                          <CheckCircle2 className="text-primary h-7 w-7" />
                          Análisis Exitoso
                        </CardTitle>
                        <CardDescription>
                          Diagnóstico generado tras rotación de llaves.
                        </CardDescription>
                      </div>
                      <Badge variant="default">Confianza: {diagnosis.diagnosis.confidence}</Badge>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div className="p-4 rounded-xl border bg-primary/5 border-primary/20">
                         <p className="text-xl font-bold text-primary">
                           {diagnosis.diagnosis.identifiedProblem}
                         </p>
                         <Badge variant="outline" className="mt-2">Severidad: {diagnosis.diagnosis.severity}</Badge>
                      </div>

                      <Tabs defaultValue="actions" className="w-full">
                        <TabsList className="grid w-full grid-cols-3">
                          <TabsTrigger value="actions">Acciones</TabsTrigger>
                          <TabsTrigger value="commercial">Comprar</TabsTrigger>
                          <TabsTrigger value="homemade">Casero</TabsTrigger>
                        </TabsList>
                        <TabsContent value="actions" className="mt-4 space-y-4">
                          <ul className="space-y-2">
                            {diagnosis.diagnosis.recommendedActions.map((action, idx) => (
                              <li key={idx} className="flex items-start gap-3 text-sm p-3 bg-white rounded-lg border shadow-sm">
                                <CheckCircle2 className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                                {action}
                              </li>
                            ))}
                          </ul>
                        </TabsContent>
                        <TabsContent value="commercial" className="mt-4 space-y-4">
                          {diagnosis.diagnosis.commercialProducts.map((product, idx) => (
                            <div key={idx} className="p-4 bg-white rounded-xl border shadow-sm">
                              <h5 className="font-bold text-primary">{product.name}</h5>
                              <p className="text-sm text-muted-foreground">{product.description}</p>
                            </div>
                          ))}
                        </TabsContent>
                        <TabsContent value="homemade" className="mt-4 space-y-4">
                          {diagnosis.diagnosis.homeMadeRemedies.map((remedy, idx) => (
                            <div key={idx} className="p-4 bg-green-50 rounded-xl border border-green-200 shadow-sm">
                              <h5 className="font-bold text-green-800">{remedy.name}</h5>
                              <p className="text-sm text-green-900">{remedy.instructions}</p>
                            </div>
                          ))}
                        </TabsContent>
                      </Tabs>
                    </CardContent>
                  </Card>
                </div>
              </div>
            )}
          </div>
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
