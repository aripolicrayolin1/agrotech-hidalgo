
"use client";

import { 
  LayoutDashboard, 
  Activity, 
  Camera, 
  Users, 
  Settings, 
  LogOut,
  Leaf,
  LogIn,
  User
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useUser } from "@/firebase/auth/use-user";
import { auth } from "@/firebase/config";
import { signOut } from "firebase/auth";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const navItems = [
  { title: "Dashboard", icon: LayoutDashboard, href: "/" },
  { title: "Monitoreo", icon: Activity, href: "/monitoring" },
  { title: "Diagnóstico IA", icon: Camera, href: "/diagnosis" },
  { title: "Comunidad", icon: Users, href: "/community" },
  { title: "Fincas", icon: Leaf, href: "/farms" },
];

export function SidebarNav() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, loading } = useUser();

  const handleSignOut = async () => {
    await signOut(auth);
    router.push("/login");
  };

  return (
    <Sidebar variant="inset" collapsible="icon">
      <SidebarHeader className="h-16 flex items-center justify-center border-b px-6">
        <div className="flex items-center gap-2 group-data-[collapsible=icon]:hidden">
          <div className="bg-primary rounded-lg p-1.5">
            <Leaf className="h-6 w-6 text-white" />
          </div>
          <span className="font-bold text-xl tracking-tight text-primary">Agro<span className="text-foreground">Tech</span></span>
        </div>
        <div className="hidden group-data-[collapsible=icon]:flex bg-primary rounded-lg p-1">
          <Leaf className="h-5 w-5 text-white" />
        </div>
      </SidebarHeader>
      <SidebarContent className="py-4">
        {user && !loading && (
          <div className="px-4 py-2 group-data-[collapsible=icon]:hidden">
            <div className="flex items-center gap-3 p-2 bg-primary/5 rounded-xl border border-primary/10">
              <Avatar className="h-8 w-8 border-2 border-primary/20">
                <AvatarImage src={user.photoURL || ""} alt={user.displayName || ""} />
                <AvatarFallback className="bg-primary/20 text-primary">
                  {user.displayName?.charAt(0) || user.email?.charAt(0) || <User className="h-4 w-4" />}
                </AvatarFallback>
              </Avatar>
              <div className="flex flex-col min-w-0">
                <p className="text-xs font-bold truncate">{user.displayName || "Agricultor"}</p>
                <p className="text-[10px] text-muted-foreground truncate">{user.email}</p>
              </div>
            </div>
          </div>
        )}
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton 
                    asChild 
                    isActive={pathname === item.href}
                    tooltip={item.title}
                  >
                    <Link href={item.href}>
                      <item.icon className="h-5 w-5" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="border-t p-4">
        <SidebarMenu>
          {!user && !loading ? (
            <SidebarMenuItem>
              <SidebarMenuButton asChild tooltip="Entrar">
                <Link href="/login">
                  <LogIn className="h-5 w-5" />
                  <span>Iniciar Sesión</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ) : (
            <>
              <SidebarMenuItem>
                <SidebarMenuButton asChild tooltip="Ajustes">
                  <Link href="/settings">
                    <Settings className="h-5 w-5" />
                    <span>Configuración</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton tooltip="Cerrar Sesión" onClick={handleSignOut}>
                  <LogOut className="h-5 w-5" />
                  <span>Salir</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </>
          )}
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
