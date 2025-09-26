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
import { LayoutGrid, UserRound } from "lucide-react";
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

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="py-4">
        <SidebarMenu>
          <SidebarMenuItem className="flex items-center gap-2 group-data-[state=collapsed]:pl-1">
            <UserRound className="w-6 h-6" />
            <Label
              suppressHydrationWarning
              className="text-sm font-bold group-data-[state=collapsed]:hidden"
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
      <SidebarFooter />
    </Sidebar>
  );
}
