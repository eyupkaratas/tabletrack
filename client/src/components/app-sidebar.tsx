"use client";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarSeparator,
} from "@/components/ui/sidebar";
import { getDecodedUser, JwtPayload } from "@/utils/decodeToken";
import { LayoutGrid, LogOut, PanelLeft, UserRound } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { NotificationBell } from "./notification-bell";
import { Label } from "./ui/label";

export default function AppSidebar() {
  const router = useRouter();
  const [user, setUser] = useState<JwtPayload | null>(null);

  useEffect(() => {
    async function loadUser() {
      const data = await getDecodedUser();
      setUser(data);
    }
    loadUser();
  }, []);

  const handleLogout = async () => {
    try {
      await fetch("http://localhost:3001/auth/logout", {
        method: "POST",
        credentials: "include",
      });
    } catch (error) {
      console.error("Logout failed:", error);
    } finally {
      window.location.href = "/login";
    }
  };

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="py-4">
        <SidebarMenu>
          <SidebarMenuItem className="flex items-center gap-2 group-data-[state=collapsed]:pl-1">
            <UserRound className="w-6 h-6" />
            <Label
              suppressHydrationWarning
              className="text-sm font-bold group-data-[state=collapsed]:hidden capitalize"
            >
              {user ? user.name : "Not Logged In"}
            </Label>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarSeparator />
      <SidebarContent>
        <SidebarMenuButton
          onClick={() => router.push("/orders")}
          className="cursor-pointer"
        >
          <NotificationBell />
          <p className="group-data-[state=collapsed]:hidden">Orders</p>
        </SidebarMenuButton>
        <SidebarMenuButton
          onClick={() => router.push("/tables")}
          className="cursor-pointer"
        >
          <LayoutGrid className="w-7 h-7" strokeWidth={2} />
          <p className="group-data-[state=collapsed]:hidden">Tables</p>
        </SidebarMenuButton>
      </SidebarContent>
      <SidebarFooter className="space-y-1 py-2">
        {user?.role !== "waiter" && (
          <SidebarMenuItem>
            <SidebarMenuButton
              className="cursor-pointer"
              onClick={() => router.push("/admin")}
            >
              <PanelLeft />
              <p className="group-data-[state=collapsed]:hidden">Admin Panel</p>
            </SidebarMenuButton>
          </SidebarMenuItem>
        )}
        <SidebarMenuItem>
          <SidebarMenuButton
            className="cursor-pointer text-red-500"
            onClick={handleLogout}
          >
            <LogOut className="text-red-500" />
            <p className="group-data-[state=collapsed]:hidden text-red-500">
              Logout
            </p>
          </SidebarMenuButton>
        </SidebarMenuItem>
      </SidebarFooter>
    </Sidebar>
  );
}
