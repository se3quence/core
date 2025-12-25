"use client";

import * as React from "react";
import {
  Users,
  Settings,
  Shield,
  Activity,
  LayoutDashboard,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { Logo } from "@/components/logo";
// import { SidebarNotification } from "@/components/sidebar-notification";
import { NavMain } from "@/components/nav-main";
import { NavUser } from "@/components/nav-user";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

// Updated data with your specific links
const data = {
  user: {
    name: "Sequence3",
    email: "store@example.com",
    avatar: "",
  },
  navGroups: [
    {
      label: "Platform",
      items: [
        {
          title: "Team",
          url: "/dashboard",
          icon: Users,
        },
        {
          title: "General",
          url: "/dashboard/general",
          icon: Settings,
        },
        {
          title: "Activity",
          url: "/dashboard/activity",
          icon: Activity,
        },
        {
          title: "Security",
          url: "/dashboard/security",
          icon: Shield,
        },
      ],
    },
  ],
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              size="lg"
              asChild
            >
              <Link href="/dashboard">
                <div className="flex items-center gap-3 px-4 py-2">
                  {/* Text Information */}
                  <Logo size={26} />
                  <div className="grid flex-2 text-left text-sm leading-tight">
                    <span className="truncate font-medium text-foreground">
                      Sequence3
                    </span>
                    <span className="truncate text-xs text-muted-foreground">
                      Dashboard
                    </span>
                  </div>
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        {data.navGroups.map((group) => (
          <NavMain
            key={group.label}
            label={group.label}
            items={group.items}
          />
        ))}
      </SidebarContent>

      <SidebarFooter>
        {/* <SidebarNotification /> */}
        <NavUser user={data.user} />
      </SidebarFooter>
    </Sidebar>
  );
}
