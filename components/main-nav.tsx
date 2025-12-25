"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import {
  LayoutDashboard,
  CreditCard,
  Home,
} from "lucide-react"

const navigationItems = [
  {
    title: "Home",
    href: "/",
    icon: Home,
  },
  {
    title: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    title: "Pricing",
    href: "/pricing",
    icon: CreditCard,
  },
]

export function MainNav() {
  const pathname = usePathname()

  return (
    <nav className="flex items-center gap-1">
      {navigationItems.map((item) => {
        const Icon = item.icon
        const isActive = pathname === item.href || 
          (item.href !== "/" && pathname?.startsWith(item.href))
        
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "inline-flex items-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors",
              "focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring",
              "disabled:pointer-events-none disabled:opacity-50",
              "hover:bg-accent hover:text-accent-foreground",
              "h-9 px-4 py-2",
              isActive && "bg-accent text-accent-foreground"
            )}
          >
            {Icon && <Icon className="h-4 w-4" />}
            <span>{item.title}</span>
          </Link>
        )
      })}
    </nav>
  )
}

