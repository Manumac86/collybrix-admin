"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { LayoutDashboard, Briefcase, Users, Moon, Sun } from "lucide-react"
import { cn } from "@/lib/utils"
import { useTheme } from "./theme-provider"

export function Sidebar() {
  const pathname = usePathname()
  const { theme, setTheme } = useTheme()

  const routes = [
    {
      label: "Dashboard",
      icon: LayoutDashboard,
      href: "/dashboard",
    },
    {
      label: "Projects",
      icon: Briefcase,
      href: "/projects",
    },
    {
      label: "Contacts",
      icon: Users,
      href: "/contacts",
    },
  ]

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark")
  }

  return (
    <aside className="w-64 border-r border-border bg-sidebar text-sidebar-foreground h-screen sticky top-0 flex flex-col">
      {/* Header with Logo */}
      <div className="p-6 border-b border-sidebar-border">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-primary-foreground font-bold">
            🐦
          </div>
          <h1 className="text-xl font-bold">Collybrix Admin</h1>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2">
        {routes.map((route) => {
          const Icon = route.icon
          const isActive = pathname === route.href
          return (
            <Link
              key={route.href}
              href={route.href}
              className={cn(
                "flex items-center gap-3 px-4 py-2 rounded-lg transition-colors",
                isActive
                  ? "bg-sidebar-primary text-sidebar-primary-foreground"
                  : "hover:bg-sidebar-accent text-sidebar-foreground",
              )}
            >
              <Icon className="w-5 h-5" />
              <span className="font-medium">{route.label}</span>
            </Link>
          )
        })}
      </nav>

      {/* Footer with Theme Toggle */}
      <div className="p-4 border-t border-sidebar-border space-y-3">
        <button
          onClick={toggleTheme}
          className={cn(
            "w-full flex items-center gap-3 px-4 py-2 rounded-lg transition-colors",
            "hover:bg-sidebar-accent text-sidebar-foreground",
          )}
          aria-label="Toggle theme"
        >
          {theme === "light" ? (
            <>
              <Moon className="w-5 h-5" />
              <span className="font-medium text-sm">Dark Mode</span>
            </>
          ) : (
            <>
              <Sun className="w-5 h-5" />
              <span className="font-medium text-sm">Light Mode</span>
            </>
          )}
        </button>
        <p className="text-xs text-sidebar-foreground/60">© 2025 Collybrix</p>
      </div>
    </aside>
  )
}
