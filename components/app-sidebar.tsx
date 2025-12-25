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
import useSWR from "swr";
import { User } from "@/lib/db/schema";

const fetcher = (url: string) => fetch(url).then((res) => res.json());
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

// Navigation groups data
const navGroups = [
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
];

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { data: user } = useSWR<User>("/api/user", fetcher);

  // Default user data if not loaded
  const userData = {
    name: user?.name || "User",
    email: user?.email || "",
    avatar: user?.profilePictureUrl || "",
  };

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
        {navGroups.map((group) => (
          <NavMain
            key={group.label}
            label={group.label}
            items={group.items}
          />
        ))}
      </SidebarContent>

      <SidebarFooter>
        {/* <SidebarNotification /> */}
        <NavUser user={userData} />
      </SidebarFooter>
    </Sidebar>
  );
}
