import { cn } from "@/lib/utils";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  LayoutDashboard, 
  Smartphone, 
  ClipboardList, 
  Users, 
  BarChart3, 
  Settings,
  LogOut,
  Shield
} from "lucide-react";
import { useQuery, useQueryClient } from "@tanstack/react-query";

interface SidebarProps {
    className?: string;
}

export function Sidebar({ className }: SidebarProps) {
    const [location, setLocation] = useLocation();
    const { user } = useAuth();
    const queryClient = useQueryClient();

    const { data: stats } = useQuery({
        queryKey: ["/api/stats"],
    });

    const { data: requests } = useQuery({
        queryKey: ["/api/requests"],
    });

    const pendingCount =
        requests?.filter((r) => r.status === "pending").length || 0;

    const navigation = [
        {
            name: "Dashboard",
            href:
                user?.role === "admin"
                    ? "/admin/dashboard"
                    : "/employee/dashboard",
            icon: LayoutDashboard,
            current:
                location === "/admin/dashboard" ||
                location === "/employee/dashboard" ||
                location === "/",
        },
        ...(user?.role === "admin"
            ? [
                  {
                      name: "Devices",
                      href: "/devices",
                      icon: Smartphone,
                      current: location === "/devices",
                      badge: stats?.totalDevices,
                  },
                  {
                      name: "Users",
                      href: "/users",
                      icon: Users,
                      current: location === "/users",
                  },
                  {
                      name: "Monitoring",
                      href: "/monitoring",
                      icon: Shield,
                      current: location === "/monitoring",
                  },
              ]
            : []),
        {
            name: "Requests",
            href: "/requests",
            icon: ClipboardList,
            current: location === "/requests",
            badge: pendingCount > 0 ? pendingCount : undefined,
            badgeVariant: "destructive" as const,
        },
    ];

    const filteredNavigation = navigation;

    return (
        <div
            className={cn(
                "w-64 bg-card border-r border-border flex flex-col",
                className
            )}
        >
            {/* Logo */}
            <div className="p-6 border-b border-border">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                        <Smartphone className="w-4 h-4 text-primary-foreground" />
                    </div>
                    <div>
                        <h1 className="font-semibold text-lg">DeviceFlow</h1>
                        <p className="text-xs text-muted-foreground">
                            {user?.role === "admin"
                                ? "Admin Dashboard"
                                : "Employee Portal"}
                        </p>
                    </div>
                </div>
            </div>

            {/* Navigation */}
            <nav className="flex-1 p-4 space-y-2">
                {filteredNavigation.map((item) => {
                    const Icon = item.icon;
                    return (
                        <button
                            key={item.name}
                            onClick={() => setLocation(item.href)}
                            className={cn(
                                "w-full flex items-center gap-3 px-3 py-2 rounded-md text-left transition-colors",
                                item.current
                                    ? "bg-primary text-primary-foreground"
                                    : "hover:bg-accent hover:text-accent-foreground"
                            )}
                            data-testid={`nav-${item.name.toLowerCase()}`}
                        >
                            <Icon className="w-5 h-5" />
                            <span className="flex-1">{item.name}</span>
                            {item.badge && (
                                <Badge
                                    variant={item.badgeVariant || "secondary"}
                                    className="text-xs px-2 py-1"
                                >
                                    {item.badge}
                                </Badge>
                            )}
                        </button>
                    );
                })}
            </nav>

            {/* User Profile */}
            <div className="p-4 border-t border-border">
                <div className="flex items-center gap-3 mb-3">
                    <Avatar className="w-10 h-10">
                        <AvatarImage src={user?.profileImageUrl} />
                        <AvatarFallback className="bg-primary/10">
                            {user?.firstName?.[0]?.toUpperCase()}
                            {user?.lastName?.[0]?.toUpperCase()}
                        </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                        <p
                            className="text-sm font-medium truncate"
                            data-testid="text-user-name"
                        >
                            {user?.firstName} {user?.lastName}
                        </p>
                        <p className="text-xs text-muted-foreground capitalize">
                            {user?.role}
                        </p>
                    </div>
                </div>
                <Button
                    variant="ghost"
                    size="sm"
                    className="w-full justify-start gap-2"
                    onClick={async () => {
                        try {
                            // Clear React Query cache first
                            queryClient.clear();

                            // Then make logout request
                            await fetch("/api/logout", {
                                method: "POST",
                                credentials: "include",
                            });

                            // Redirect to login page
                            window.location.href = "/login";
                        } catch (error) {
                            // Fallback to GET request
                            window.location.href = "/api/logout";
                        }
                    }}
                    data-testid="button-logout"
                >
                    <LogOut className="w-4 h-4" />
                    Sign Out
                </Button>
            </div>
        </div>
    );
}
