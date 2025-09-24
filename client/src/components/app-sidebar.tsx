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
import { getDecodedUser } from "@/utils/decodeToken";
import { LayoutGrid, UserRound } from "lucide-react";
import { NotificationBell } from "./notification-bell";
import { Label } from "./ui/label";

export default function AppSidebar() {
  const user = getDecodedUser();
  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="py-4">
        <SidebarMenu>
          <SidebarMenuItem className="flex items-center gap-2">
            <UserRound className="w-6 h-6" />
            <Label
              suppressHydrationWarning
              className="text-sm font-bold group-data-[state=collapsed]:hidden "
            >
              {user ? `${user.name}` : "Not Logged In"}
            </Label>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarSeparator />
      <SidebarContent>
        <SidebarMenuButton className="cursor-pointer">
          <LayoutGrid className="w-7 h-7" strokeWidth={2} />
          <p className="group-data-[state=collapsed]:hidden">Tables</p>
        </SidebarMenuButton>
        <SidebarMenuButton className="cursor-pointer">
          <NotificationBell />
          <p className="group-data-[state=collapsed]:hidden">Orders</p>
        </SidebarMenuButton>
      </SidebarContent>
      <SidebarFooter />
    </Sidebar>
  );
}
