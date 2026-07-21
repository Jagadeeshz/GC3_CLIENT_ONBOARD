"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/use-auth";
import { getRoleNavigation } from "@/lib/rbac/permissions";
import {
  LayoutDashboard,
  FileText,
  Package,
  FolderOpen,
  Receipt,
  Clock,
  Users,
  MessageSquare,
  Star,
  Building2,
  CreditCard,
  HelpCircle,
  Settings,
  Bell,
  Shield,
  LogOut,
  ChevronLeft,
  Menu,
  GitBranch,
  BarChart3,
  User,
  Wrench,
  Headphones,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { getInitials } from "@/lib/utils";

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  LayoutDashboard,
  FileText,
  Package,
  FolderOpen,
  Receipt,
  Clock,
  Users,
  MessageSquare,
  Star,
  Building2,
  CreditCard,
  HelpCircle,
  Settings,
  Bell,
  Shield,
  GitBranch,
  BarChart3,
  User,
  Contacts: Users,
  Wrench,
  Headphones,
};

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

export function Sidebar({ collapsed, onToggle }: SidebarProps) {
  const pathname = usePathname();
  const { user, signOut } = useAuth();
  const router = useRouter();

  const navItems = user ? getRoleNavigation(user.role) : [];

  const handleSignOut = async () => {
    await signOut();
    router.push("/login");
  };

  return (
    <TooltipProvider delayDuration={0}>
      <aside
        className={cn(
          "fixed left-0 top-0 z-40 flex h-screen flex-col border-r border-sidebar-border/50 glass-sidebar transition-all duration-300",
          collapsed ? "w-16" : "w-64"
        )}
      >
        {/* Subtle gradient overlay */}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-primary/[0.03] via-transparent to-transparent" />

        {/* Logo */}
        <div className="relative flex h-16 items-center justify-between border-b border-sidebar-border/50 px-4">
          {!collapsed ? (
            <Link href="/dashboard" className="flex items-center space-x-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary shadow-sm shadow-primary/20">
                <span className="text-xs font-bold text-primary-foreground">GC</span>
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-semibold text-sidebar-accent-foreground tracking-tight">GC³</span>
                <span className="text-[10px] text-sidebar-foreground -mt-0.5">Portal</span>
              </div>
            </Link>
          ) : (
            <Link href="/dashboard" className="flex items-center justify-center">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary shadow-sm shadow-primary/20">
                <span className="text-xs font-bold text-primary-foreground">GC</span>
              </div>
            </Link>
          )}
          <Button
            variant="ghost"
            size="icon"
            onClick={onToggle}
            className="h-7 w-7 text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-all duration-200"
          >
            {collapsed ? <Menu className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
          </Button>
        </div>

        {/* Navigation */}
        <ScrollArea className="relative flex-1 py-3">
          <nav className="space-y-0.5 px-2">
            {navItems.map((item) => {
              const Icon = iconMap[item.icon] || LayoutDashboard;
              const isActive = pathname === item.href || pathname.startsWith(item.href + "/");

              const link = (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "group/item relative flex items-center rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200",
                    isActive
                      ? "bg-gradient-to-r from-primary/15 to-primary/5 text-primary shadow-sm shadow-primary/5"
                      : "text-sidebar-foreground hover:bg-sidebar-accent/80 hover:text-sidebar-accent-foreground",
                    collapsed && "justify-center px-2 py-2"
                  )}
                >
                  {isActive && !collapsed && (
                    <div className="absolute left-0 top-1/2 h-5 w-[3px] -translate-y-1/2 rounded-r-full bg-primary shadow-sm shadow-primary/50" />
                  )}
                  <Icon className={cn("h-4 w-4 shrink-0 transition-all duration-200 group-hover/item:scale-110", !collapsed && "mr-3", isActive && "text-primary")} />
                  {!collapsed && <span>{item.title}</span>}
                </Link>
              );

              if (collapsed) {
                return (
                  <Tooltip key={item.href}>
                    <TooltipTrigger asChild>{link}</TooltipTrigger>
                    <TooltipContent side="right" className="glass-card">{item.title}</TooltipContent>
                  </Tooltip>
                );
              }

              return link;
            })}
          </nav>
        </ScrollArea>

        {/* User Section */}
        <div className="relative border-t border-sidebar-border/50 p-3">
          {!collapsed ? (
            <div className="flex items-center space-x-3 rounded-xl p-2.5 transition-all duration-200 hover:bg-sidebar-accent/80">
              <Avatar className="h-8 w-8 ring-2 ring-primary/20">
                <AvatarImage src={user?.avatar_url || undefined} />
                <AvatarFallback className="text-xs bg-primary/20 text-primary">
                  {getInitials(user?.full_name || "U")}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-sidebar-accent-foreground truncate">{user?.full_name}</p>
                <p className="text-xs text-sidebar-foreground capitalize truncate">
                  {user?.role?.replace("_", " ")}
                </p>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleSignOut}
                className="h-8 w-8 text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-all duration-200"
              >
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          ) : (
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleSignOut}
                  className="h-8 w-8 w-full text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                >
                  <LogOut className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="right" className="glass-card">Sign Out</TooltipContent>
            </Tooltip>
          )}
        </div>
      </aside>
    </TooltipProvider>
  );
}
