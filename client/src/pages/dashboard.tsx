import { useQuery } from "@tanstack/react-query";
import { Sidebar } from "@/components/layout/sidebar";
import { TopBar } from "@/components/layout/topbar";
import { StatsCards } from "@/components/stats/stats-cards";
import { RequestCard } from "@/components/request/request-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Slack, Mail, Plus, Upload, BarChart, Users } from "lucide-react";
import { useState } from "react";
import { AddDeviceModal } from "@/components/device/add-device-modal";

export default function Dashboard() {
  const [showAddDevice, setShowAddDevice] = useState(false);

  const { data: stats } = useQuery({
    queryKey: ["/api/stats"],
  });

  const { data: requests } = useQuery({
    queryKey: ["/api/requests"],
  });

  const recentRequests = requests?.slice(0, 3) || [];
  const utilization = stats ? Math.round((stats.assignedDevices / stats.totalDevices) * 100) : 0;

  return (
    <div className="flex h-screen bg-background">
      <Sidebar />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <TopBar title="Dashboard" subtitle="Manage your device inventory" />
        
        <main className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Stats Overview */}
          <StatsCards stats={stats} />

          {/* Quick Actions & Recent Activity */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Recent Requests */}
            <div className="lg:col-span-2">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle>Recent Requests</CardTitle>
                  <Button variant="ghost" size="sm" data-testid="link-view-all-requests">
                    View all
                  </Button>
                </CardHeader>
                <CardContent className="space-y-4">
                  {recentRequests.length === 0 ? (
                    <p className="text-muted-foreground text-center py-8" data-testid="text-no-requests">
                      No recent requests
                    </p>
                  ) : (
                    recentRequests.map((request) => (
                      <RequestCard key={request.id} request={request} />
                    ))
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Quick Stats & Actions */}
            <div className="space-y-6">
              {/* Device Status */}
              <Card>
                <CardHeader>
                  <CardTitle>Device Status</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                      <span className="text-sm">Available</span>
                    </div>
                    <span className="text-sm font-medium" data-testid="text-available-count">
                      {stats?.availableDevices || 0}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-primary rounded-full"></div>
                      <span className="text-sm">Assigned</span>
                    </div>
                    <span className="text-sm font-medium" data-testid="text-assigned-count">
                      {stats?.assignedDevices || 0}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                      <span className="text-sm">Maintenance</span>
                    </div>
                    <span className="text-sm font-medium" data-testid="text-maintenance-count">
                      {stats?.maintenanceDevices || 0}
                    </span>
                  </div>
                  
                  {/* Progress Bar */}
                  <div className="mt-4">
                    <div className="flex justify-between text-xs text-muted-foreground mb-1">
                      <span>Utilization</span>
                      <span data-testid="text-utilization-percentage">{utilization}%</span>
                    </div>
                    <Progress value={utilization} className="h-2" />
                  </div>
                </CardContent>
              </Card>

              {/* Integrations */}
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle>Integrations</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-purple-600 rounded flex items-center justify-center">
                        <Slack className="w-4 h-4 text-white" />
                      </div>
                      <div>
                        <p className="text-sm font-medium">Slack</p>
                        <p className="text-xs text-muted-foreground">Notifications active</p>
                      </div>
                    </div>
                    <span className="w-2 h-2 bg-green-500 rounded-full" data-testid="status-slack-active"></span>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-muted rounded flex items-center justify-center">
                        <Mail className="w-4 h-4 text-muted-foreground" />
                      </div>
                      <div>
                        <p className="text-sm font-medium">Email</p>
                        <p className="text-xs text-muted-foreground">Setup required</p>
                      </div>
                    </div>
                    <span className="w-2 h-2 bg-muted rounded-full" data-testid="status-email-inactive"></span>
                  </div>
                </CardContent>
              </Card>

              {/* Quick Actions */}
              <Card>
                <CardHeader>
                  <CardTitle>Quick Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <Button 
                    variant="ghost" 
                    className="w-full justify-start gap-3" 
                    onClick={() => setShowAddDevice(true)}
                    data-testid="button-add-device"
                  >
                    <Plus className="w-4 h-4" />
                    Add New Device
                  </Button>
                  <Button variant="ghost" className="w-full justify-start gap-3" data-testid="button-bulk-import">
                    <Upload className="w-4 h-4" />
                    Bulk Import
                  </Button>
                  <Button variant="ghost" className="w-full justify-start gap-3" data-testid="button-generate-report">
                    <BarChart className="w-4 h-4" />
                    Generate Report
                  </Button>
                  <Button variant="ghost" className="w-full justify-start gap-3" data-testid="button-manage-users">
                    <Users className="w-4 h-4" />
                    Manage Users
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </main>
      </div>

      <AddDeviceModal 
        open={showAddDevice} 
        onOpenChange={setShowAddDevice} 
      />
    </div>
  );
}
