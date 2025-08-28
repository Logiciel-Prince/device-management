import { Card, CardContent } from "@/components/ui/card";
import { Smartphone, CheckCircle, Clock, Users, TrendingUp } from "lucide-react";

interface StatsCardsProps {
  stats?: {
    totalDevices: number;
    availableDevices: number;
    assignedDevices: number;
    maintenanceDevices: number;
    pendingRequests: number;
    activeUsers: number;
  };
}

export function StatsCards({ stats }: StatsCardsProps) {
  if (!stats) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <div className="h-4 bg-muted rounded w-20"></div>
                  <div className="h-8 bg-muted rounded w-12"></div>
                  <div className="h-3 bg-muted rounded w-16"></div>
                </div>
                <div className="w-12 h-12 bg-muted rounded-lg"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <Card className="hover:shadow-lg transition-shadow">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-muted-foreground text-sm">Total Devices</p>
              <p className="text-2xl font-semibold" data-testid="stat-total-devices">
                {stats.totalDevices}
              </p>
              <p className="text-sm text-green-600 flex items-center gap-1 mt-1">
                <TrendingUp className="w-3 h-3" />
                Inventory managed
              </p>
            </div>
            <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
              <Smartphone className="w-6 h-6 text-primary" />
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card className="hover:shadow-lg transition-shadow">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-muted-foreground text-sm">Available</p>
              <p className="text-2xl font-semibold" data-testid="stat-available-devices">
                {stats.availableDevices}
              </p>
              <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                {stats.totalDevices > 0 
                  ? `${Math.round((stats.availableDevices / stats.totalDevices) * 100)}% of total`
                  : "0% of total"
                }
              </p>
            </div>
            <div className="w-12 h-12 bg-green-500/10 rounded-lg flex items-center justify-center">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card className="hover:shadow-lg transition-shadow">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-muted-foreground text-sm">Pending Requests</p>
              <p className="text-2xl font-semibold" data-testid="stat-pending-requests">
                {stats.pendingRequests}
              </p>
              <p className="text-sm text-yellow-600 flex items-center gap-1 mt-1">
                <Clock className="w-3 h-3" />
                Awaiting approval
              </p>
            </div>
            <div className="w-12 h-12 bg-yellow-500/10 rounded-lg flex items-center justify-center">
              <Clock className="w-6 h-6 text-yellow-600" />
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card className="hover:shadow-lg transition-shadow">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-muted-foreground text-sm">Active Users</p>
              <p className="text-2xl font-semibold" data-testid="stat-active-users">
                {stats.activeUsers}
              </p>
              <p className="text-sm text-green-600 flex items-center gap-1 mt-1">
                <TrendingUp className="w-3 h-3" />
                Team members
              </p>
            </div>
            <div className="w-12 h-12 bg-purple-500/10 rounded-lg flex items-center justify-center">
              <Users className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
