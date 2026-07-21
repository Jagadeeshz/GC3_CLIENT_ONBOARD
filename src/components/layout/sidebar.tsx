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
          "fixed left-0 top-0 z-40 flex h-screen flex-col border-r bg-card transition-all duration-300",
          collapsed ? "w-16" : "w-64"
        )}
      >
        {/* Logo */}
        <div className="flex h-16 items-center justify-between border-b px-4">
          {!collapsed && (
            <Link href="/dashboard" className="flex items-center space-x-2">
              <span className="text-lg font-bold">GC³</span>
              <span className="text-sm text-muted-foreground">Portal</span>
            </Link>
          )}
          <Button
            variant="ghost"
            size="icon"
            onClick={onToggle}
            className="h-8 w-8"
          >
            {collapsed ? <Menu className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
          </Button>
        </div>

        {/* Navigation */}
        <ScrollArea className="flex-1 py-2">
          <nav className="space-y-1 px-2">
            {navItems.map((item) => {
              const Icon = iconMap[item.icon] || LayoutDashboard;
              const isActive = pathname === item.href || pathname.startsWith(item.href + "/");

              const link = (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center rounded-md px-3 py-2 text-sm font-medium transition-colors",
                    isActive
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
                    collapsed && "justify-center px-2"
                  )}
                >
                  <Icon className={cn("h-4 w-4", !collapsed && "mr-3")} />
                  {!collapsed && <span>{item.title}</span>}
                </Link>
              );

              if (collapsed) {
                return (
                  <Tooltip key={item.href}>
                    <TooltipTrigger asChild>{link}</TooltipTrigger>
                    <TooltipContent side="right">{item.title}</TooltipContent>
                  </Tooltip>
                );
              }

              return link;
            })}
          </nav>
        </ScrollArea>

        {/* User Section */}
        <div className="border-t p-3">
          {!collapsed ? (
            <div className="flex items-center space-x-3">
              <Avatar className="h-8 w-8">
                <AvatarImage src={user?.avatar_url || undefined} />
                <AvatarFallback className="text-xs">
                  {getInitials(user?.full_name || "U")}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{user?.full_name}</p>
                <p className="text-xs text-muted-foreground capitalize truncate">
                  {user?.role?.replace("_", " ")}
                </p>
              </div>
              <Button variant="ghost" size="icon" onClick={handleSignOut} className="h-8 w-8">
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          ) : (
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" onClick={handleSignOut} className="h-8 w-8">
                  <LogOut className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="right">Sign Out</TooltipContent>
            </Tooltip>
          )}
        </div>
      </aside>
    </TooltipProvider>
  );
}
