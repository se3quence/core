"use client";

import React from "react";
import { DashboardSidebar } from "@/components/sidebar-03/app-sidebar";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { SiteHeader } from "@/components/site-header";
import { Card } from "@/components/ui/card";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider
      style={
        {
          "--sidebar-width": "16rem",
          "--sidebar-width-icon": "3rem",
        } as React.CSSProperties
      }
    >
      {/* 1. The Sidebar Component */}
      <DashboardSidebar />

      {/* 2. The Main Content Area */}
      <SidebarInset>
        {/* Page Content */}
        <div className="flex flex-col h-full p-2">
          <Card className="flex flex-1 flex-col py-0 gap-0 overflow-hidden">
            {/* Site Header */}
            <SiteHeader />
            <div className="flex flex-1 flex-col gap-4 p-4 md:p-6 overflow-auto">
              {children}
            </div>
          </Card>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
