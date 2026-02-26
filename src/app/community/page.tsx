
"use client";

import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { SidebarNav } from "@/components/layout/sidebar-nav";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  ShoppingBag, 
  MapPin, 
  Phone, 
  Star, 
  Search, 
  Store, 
  ExternalLink,
  MessageSquare,
  Filter,
  Plus,
  Send,
  X
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import Image from "next/image";
import { useToast } from "@/hooks/use-toast";
import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";

const initialStores = [
  {
    id: 1,
    name: "Agropecuaria El Valle",
    location: "Actopan, Centro",
    specialty: "Fertilizantes y Control de Plagas",
    rating: 4.8,
    phone: "772-123-4567",
    image: "https://picsum.photos/seed/store1/400/200",
    open: true
  },
  {
    id: 2,
    name: "Semillas y Equipos Hidalgo",
    location: "Pachuca, Centro",
    specialty: "Semillas e Implementos",
    rating: 4.5,
    phone: "771-987-6543",
    image: "https://picsum.photos/seed/store2/400/200",
    open: true
  }
];

export default function CommunityPage() {
  const { toast } = useToast();
  const [selectedStore, setSelectedStore] = useState<any>(null);
  const [message, setMessage] = useState("");
  const [chatHistory, setChatHistory] = useState<any[]>([]);

  const openChat = (store: any) => {
    setSelectedStore(store);
    const savedChat = localStorage.getItem(`chat_${store.id}`);
    if (savedChat) {
      setChatHistory(JSON.parse(savedChat));
    } else {
      setChatHistory([{ sender: "system", text: `Hola, ¿en qué podemos ayudarte en ${store.name}?` }]);
    }
  };

  const handleSendMessage = () => {
    if (!message.trim()) return;
    const newMsg = { sender: "user", text: message };
    const updatedChat = [...chatHistory, newMsg];
    setChatHistory(updatedChat);
    localStorage.setItem(`chat_${selectedStore.id}`, JSON.stringify(updatedChat));
    setMessage("");

    // Respuesta simulada
    setTimeout(() => {
      const response = { sender: "store", text: "Gracias por tu mensaje. Un asesor te atenderá en unos minutos." };
      const withResponse = [...updatedChat, response];
      setChatHistory(withResponse);
      localStorage.setItem(`chat_${selectedStore.id}`, JSON.stringify(withResponse));
    }, 1500);
  };

  return (
    <SidebarProvider>
      <SidebarNav />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center justify-between px-6 border-b bg-white/80 backdrop-blur-md sticky top-0 z-10">
          <div className="flex items-center gap-2">
            <SidebarTrigger />
            <h1 className="text-xl font-bold">Comunidad y Comercios</h1>
          </div>
        </header>

        <main className="flex-1 p-4 md:p-8 space-y-6">
          <div className="max-w-6xl mx-auto space-y-8">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
              <div className="space-y-1">
                <h2 className="text-3xl font-bold tracking-tight">Directorio Agropecuario</h2>
                <p className="text-muted-foreground">Comunícate directamente con proveedores locales.</p>
              </div>
            </div>

            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {initialStores.map((store) => (
                <Card key={store.id} className="overflow-hidden border-none shadow-lg">
                  <div className="relative h-40 w-full overflow-hidden">
                    <Image src={store.image} alt={store.name} fill className="object-cover" />
                  </div>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg">{store.name}</CardTitle>
                    <CardDescription>{store.location}</CardDescription>
                  </CardHeader>
                  <CardFooter>
                    <Button className="w-full" onClick={() => openChat(store)}>
                      <MessageSquare className="h-4 w-4 mr-2" /> Enviar Mensaje
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          </div>
        </main>

        <Dialog open={!!selectedStore} onOpenChange={() => setSelectedStore(null)}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Store className="h-5 w-5 text-primary" />
                Chat con {selectedStore?.name}
              </DialogTitle>
            </DialogHeader>
            <div className="flex flex-col h-[400px]">
              <div className="flex-1 overflow-y-auto space-y-4 p-2 border rounded-md bg-muted/10">
                {chatHistory.map((msg, i) => (
                  <div key={i} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[80%] p-3 rounded-lg text-sm ${
                      msg.sender === 'user' ? 'bg-primary text-white' : 'bg-white border'
                    }`}>
                      {msg.text}
                    </div>
                  </div>
                ))}
              </div>
              <div className="flex gap-2 mt-4">
                <Input 
                  placeholder="Escribe tu mensaje..." 
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                />
                <Button onClick={handleSendMessage} size="icon">
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </SidebarInset>
    </SidebarProvider>
  );
}
