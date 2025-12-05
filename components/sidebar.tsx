"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Briefcase,
  Users,
  Moon,
  Sun,
  Calculator,
  Sparkles,
  Kanban,
} from "lucide-react";
import { UserButton } from "@clerk/nextjs";
import { useTheme } from "./theme-provider";
import { Logo } from "./logo";
import { Button } from "./ui/button";
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
import { Separator } from "@/components/ui/separator";

export function AppSidebar() {
  const pathname = usePathname();
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

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
      label: "Project Management",
      icon: Kanban,
      href: "/project-management",
    },
    {
      label: "Estimations",
      icon: Calculator,
      href: "/project-estimation",
    },
    {
      label: "Contacts",
      icon: Users,
      href: "/contacts",
    },
    {
      label: "Marketing",
      icon: Sparkles,
      href: "/marketing/website-launch-plan",
    },
  ];

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <Sidebar variant="floating">
      {/* Header with Logo */}
      <SidebarHeader className="border-b border-sidebar-border p-6">
        <div className="flex items-center gap-2">
          <Logo size={48} />
          <h4 className="font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary">
            Collybrix Tools
          </h4>
        </div>
      </SidebarHeader>

      {/* Navigation */}
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {routes.map((route) => {
                const Icon = route.icon;
                const isActive =
                  pathname === route.href ||
                  pathname?.startsWith(route.href + "/");
                return (
                  <SidebarMenuItem key={route.href}>
                    <SidebarMenuButton
                      asChild
                      isActive={isActive}
                      className="data-[active=true]:bg-primary/40 data-[active=true]:text-foreground hover:bg-primary/10"
                    >
                      <Link href={route.href}>
                        <Icon className="w-5 h-5" />
                        <span>{route.label}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      {/* Footer with User Profile and Theme Toggle */}
      <SidebarFooter className="p-4 border-t border-sidebar-border">
        <div className="space-y-2">
          {/* User Profile */}
          <div className="flex items-center gap-3 px-2 py-2">
            <UserButton
              appearance={{
                elements: {
                  avatarBox: "w-10 h-10",
                },
              }}
            />
            <span className="text-sm font-medium text-sidebar-foreground">
              My Account
            </span>
          </div>

          <Separator className="bg-sidebar-border" />

          {/* Theme Toggle */}
          <Button
            variant="ghost"
            onClick={toggleTheme}
            className="w-full justify-start gap-3"
            aria-label="Toggle theme"
          >
            {!mounted ? (
              // Render a neutral placeholder during SSR to avoid hydration mismatch
              <>
                <div className="w-5 h-5" />
                <span className="text-sm">Theme</span>
              </>
            ) : theme === "light" ? (
              <>
                <Moon className="w-5 h-5" />
                <span className="text-sm">Dark Mode</span>
              </>
            ) : (
              <>
                <Sun className="w-5 h-5" />
                <span className="text-sm">Light Mode</span>
              </>
            )}
          </Button>

          <Separator className="bg-sidebar-border" />

          <p className="text-xs text-sidebar-foreground/60 text-center pt-1">
            © 2025 Collybrix
          </p>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
