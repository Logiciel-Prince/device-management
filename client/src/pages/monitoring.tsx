import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Sidebar } from "@/components/layout/sidebar";
import { TopBar } from "@/components/layout/topbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DeviceActivityTimeline } from "@/components/monitoring/device-activity-timeline";
import { UsageAnalytics } from "@/components/monitoring/usage-analytics";
import { 
  Shield, 
  Smartphone, 
  Clock, 
  MapPin, 
  Phone, 
  Globe, 
  AppWindow,
  Eye,
  BarChart3,
  Filter,
  Activity,
  TrendingUp
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";

export default function Monitoring() {
  const [selectedDevice, setSelectedDevice] = useState("all");
  const [activityFilter, setActivityFilter] = useState("all");

  const { data: devices } = useQuery({
    queryKey: ["/api/devices"],
  });

  const { data: activities } = useQuery({
    queryKey: ["/api/devices", selectedDevice, "activity"],
    enabled: selectedDevice !== "all",
  });

  // Mock data for demonstration when no specific device is selected
  const mockActivities = [
    {
      id: "1",
      deviceId: "device-1",
      userId: "employee-001",
      activityType: "app_usage",
      appName: "Instagram",
      duration: "45",
      timestamp: new Date(Date.now() - 1000 * 60 * 30),
      data: JSON.stringify({ category: "social", screenTime: "45 minutes" }),
    },
    {
      id: "2",
      deviceId: "device-1",
      userId: "employee-001",
      activityType: "website_visit",
      website: "youtube.com",
      duration: "20",
      timestamp: new Date(Date.now() - 1000 * 60 * 60),
      data: JSON.stringify({ category: "entertainment", title: "Tech Reviews" }),
    },
    {
      id: "3",
      deviceId: "device-1",
      userId: "employee-001",
      activityType: "call",
      timestamp: new Date(Date.now() - 1000 * 60 * 90),
      data: JSON.stringify({ contact: "Client Meeting", duration: "15 minutes", type: "outgoing" }),
    },
    {
      id: "4",
      deviceId: "device-1",
      userId: "employee-001",
      activityType: "app_usage",
      appName: "Slack",
      duration: "30",
      timestamp: new Date(Date.now() - 1000 * 60 * 120),
      data: JSON.stringify({ category: "productivity", messagesSent: 12 }),
    },
    {
      id: "5",
      deviceId: "device-1",
      userId: "employee-001",
      activityType: "location",
      timestamp: new Date(Date.now() - 1000 * 60 * 180),
      data: JSON.stringify({ location: "Office Building", address: "123 Business St", accuracy: "10m" }),
    },
  ];

  const displayActivities = activities || mockActivities;
  const assignedDevices = devices?.filter(d => d.status === "assigned") || [];

  const getActivityIcon = (type: string) => {
    switch (type) {
      case "app_usage":
        return <AppWindow className="w-4 h-4" />;
      case "website_visit":
        return <Globe className="w-4 h-4" />;
      case "call":
        return <Phone className="w-4 h-4" />;
      case "location":
        return <MapPin className="w-4 h-4" />;
      default:
        return <Shield className="w-4 h-4" />;
    }
  };

  const getActivityBadge = (type: string) => {
    const colors = {
      app_usage: "bg-blue-50 text-blue-700 border-blue-200",
      website_visit: "bg-purple-50 text-purple-700 border-purple-200",
      call: "bg-green-50 text-green-700 border-green-200",
      location: "bg-orange-50 text-orange-700 border-orange-200",
    };
    
    return (
      <Badge variant="outline" className={colors[type as keyof typeof colors] || "bg-gray-50 text-gray-700 border-gray-200"}>
        {getActivityIcon(type)}
        <span className="ml-1 capitalize">{type.replace("_", " ")}</span>
      </Badge>
    );
  };

  const parseActivityData = (data: string) => {
    try {
      return JSON.parse(data || "{}");
    } catch {
      return {};
    }
  };

  const getActivityDetails = (activity: any) => {
    const data = parseActivityData(activity.data);
    
    switch (activity.activityType) {
      case "app_usage":
        return `${activity.appName} • ${activity.duration || "0"} min`;
      case "website_visit":
        return `${activity.website} • ${activity.duration || "0"} min`;
      case "call":
        return `${data.contact || "Unknown"} • ${data.duration || "Unknown duration"}`;
      case "location":
        return `${data.location || "Unknown location"} • ${data.address || ""}`;
      default:
        return "Activity details";
    }
  };

  return (
    <div className="flex h-screen bg-background">
      <Sidebar />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <TopBar 
          title="Device Monitoring" 
          subtitle="Parental controls and activity tracking for all devices"
        />
        
        <main className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Overview Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-muted-foreground text-sm">Monitored Devices</p>
                    <p className="text-2xl font-semibold" data-testid="stat-monitored-devices">
                      {assignedDevices.length}
                    </p>
                    <p className="text-sm text-blue-600 flex items-center gap-1 mt-1">
                      <Shield className="w-3 h-3" />
                      Active monitoring
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-blue-500/10 rounded-lg flex items-center justify-center">
                    <Shield className="w-6 h-6 text-blue-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-muted-foreground text-sm">App Activities</p>
                    <p className="text-2xl font-semibold" data-testid="stat-app-activities">
                      {displayActivities.filter(a => a.activityType === "app_usage").length}
                    </p>
                    <p className="text-sm text-purple-600 flex items-center gap-1 mt-1">
                      <AppWindow className="w-3 h-3" />
                      Last 24 hours
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-purple-500/10 rounded-lg flex items-center justify-center">
                    <AppWindow className="w-6 h-6 text-purple-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-muted-foreground text-sm">Location Checks</p>
                    <p className="text-2xl font-semibold" data-testid="stat-location-checks">
                      {displayActivities.filter(a => a.activityType === "location").length}
                    </p>
                    <p className="text-sm text-orange-600 flex items-center gap-1 mt-1">
                      <MapPin className="w-3 h-3" />
                      GPS tracking
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-orange-500/10 rounded-lg flex items-center justify-center">
                    <MapPin className="w-6 h-6 text-orange-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-muted-foreground text-sm">Call Logs</p>
                    <p className="text-2xl font-semibold" data-testid="stat-call-logs">
                      {displayActivities.filter(a => a.activityType === "call").length}
                    </p>
                    <p className="text-sm text-green-600 flex items-center gap-1 mt-1">
                      <Phone className="w-3 h-3" />
                      Communication
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-green-500/10 rounded-lg flex items-center justify-center">
                    <Phone className="w-6 h-6 text-green-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Monitoring Tabs */}
          <Tabs defaultValue="activity" className="space-y-6">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="activity" data-testid="tab-activity">
                <Eye className="w-4 h-4 mr-2" />
                Real-time Activity
              </TabsTrigger>
              <TabsTrigger value="timeline" data-testid="tab-timeline">
                <Activity className="w-4 h-4 mr-2" />
                Device Timeline
              </TabsTrigger>
              <TabsTrigger value="analytics" data-testid="tab-analytics">
                <BarChart3 className="w-4 h-4 mr-2" />
                Usage Analytics
              </TabsTrigger>
              <TabsTrigger value="controls" data-testid="tab-controls">
                <Shield className="w-4 h-4 mr-2" />
                Monitoring Controls
              </TabsTrigger>
            </TabsList>

            {/* Real-time Activity Tab */}
            <TabsContent value="activity" className="space-y-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Eye className="w-5 h-5" />
                    Real-time Activity Monitor
                  </CardTitle>
                  <div className="flex items-center gap-2">
                    <Select value={selectedDevice} onValueChange={setSelectedDevice}>
                      <SelectTrigger className="w-48" data-testid="select-device-filter">
                        <SelectValue placeholder="All Devices" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Devices</SelectItem>
                        {assignedDevices.map((device) => (
                          <SelectItem key={device.id} value={device.id}>
                            {device.name} - {device.assignedUser?.firstName} {device.assignedUser?.lastName}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    
                    <Select value={activityFilter} onValueChange={setActivityFilter}>
                      <SelectTrigger className="w-40" data-testid="select-activity-filter">
                        <SelectValue placeholder="All Activities" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Activities</SelectItem>
                        <SelectItem value="app_usage">App Usage</SelectItem>
                        <SelectItem value="website_visit">Web Browsing</SelectItem>
                        <SelectItem value="call">Calls</SelectItem>
                        <SelectItem value="location">Location</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardHeader>
                <CardContent>
                  {displayActivities.length === 0 ? (
                    <div className="text-center py-12">
                      <Shield className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
                      <h3 className="text-lg font-semibold mb-2">No activity data</h3>
                      <p className="text-muted-foreground" data-testid="text-no-activity">
                        No device activity has been recorded yet.
                      </p>
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Activity</TableHead>
                            <TableHead>Device & User</TableHead>
                            <TableHead>Details</TableHead>
                            <TableHead>Time</TableHead>
                            <TableHead>Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {displayActivities
                            .filter(activity => activityFilter === "all" || activity.activityType === activityFilter)
                            .map((activity) => (
                            <TableRow key={activity.id} data-testid={`row-activity-${activity.id}`}>
                              <TableCell>
                                <div className="flex items-center gap-3">
                                  {getActivityBadge(activity.activityType)}
                                </div>
                              </TableCell>
                              <TableCell>
                                <div className="flex items-center gap-3">
                                  <Avatar className="w-8 h-8">
                                    <AvatarFallback className="text-xs">
                                      <Smartphone className="w-4 h-4" />
                                    </AvatarFallback>
                                  </Avatar>
                                  <div>
                                    <p className="font-medium text-sm" data-testid={`text-device-${activity.id}`}>
                                      iPhone 13 Pro
                                    </p>
                                    <p className="text-xs text-muted-foreground">
                                      John Doe
                                    </p>
                                  </div>
                                </div>
                              </TableCell>
                              <TableCell>
                                <span className="text-sm" data-testid={`text-details-${activity.id}`}>
                                  {getActivityDetails(activity)}
                                </span>
                              </TableCell>
                              <TableCell>
                                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                                  <Clock className="w-3 h-3" />
                                  <span data-testid={`text-time-${activity.id}`}>
                                    {formatDistanceToNow(new Date(activity.timestamp), { addSuffix: true })}
                                  </span>
                                </div>
                              </TableCell>
                              <TableCell>
                                <Button variant="ghost" size="sm" data-testid={`button-view-${activity.id}`}>
                                  <Eye className="w-4 h-4" />
                                </Button>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Device Timeline Tab */}
            <TabsContent value="timeline" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {assignedDevices.length > 0 ? assignedDevices.slice(0, 2).map((device) => (
                  <DeviceActivityTimeline
                    key={device.id}
                    deviceId={device.id}
                    deviceName={device.name}
                    userName={`${device.assignedUser?.firstName} ${device.assignedUser?.lastName}`}
                  />
                )) : (
                  <div className="col-span-2">
                    <Card>
                      <CardContent className="p-12 text-center">
                        <Activity className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
                        <h3 className="text-lg font-semibold mb-2">No devices to monitor</h3>
                        <p className="text-muted-foreground">
                          No devices are currently assigned to users for monitoring.
                        </p>
                      </CardContent>
                    </Card>
                  </div>
                )}
              </div>
            </TabsContent>

            {/* Usage Analytics Tab */}
            <TabsContent value="analytics" className="space-y-6">
              <UsageAnalytics 
                deviceId={selectedDevice !== "all" ? selectedDevice : undefined}
                timeRange="today"
              />
            </TabsContent>

            {/* Monitoring Controls Tab */}
            <TabsContent value="controls" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <BarChart3 className="w-5 h-5" />
                      Activity Summary
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
                        <div className="flex items-center gap-3">
                          <AppWindow className="w-5 h-5 text-blue-600" />
                          <span className="font-medium">App Usage</span>
                        </div>
                        <span className="text-sm font-semibold" data-testid="summary-app-usage">
                          {displayActivities.filter(a => a.activityType === "app_usage").length} activities
                        </span>
                      </div>
                      
                      <div className="flex items-center justify-between p-3 bg-purple-50 dark:bg-purple-950/20 rounded-lg">
                        <div className="flex items-center gap-3">
                          <Globe className="w-5 h-5 text-purple-600" />
                          <span className="font-medium">Web Browsing</span>
                        </div>
                        <span className="text-sm font-semibold" data-testid="summary-web-browsing">
                          {displayActivities.filter(a => a.activityType === "website_visit").length} visits
                        </span>
                      </div>
                      
                      <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-950/20 rounded-lg">
                        <div className="flex items-center gap-3">
                          <Phone className="w-5 h-5 text-green-600" />
                          <span className="font-medium">Phone Calls</span>
                        </div>
                        <span className="text-sm font-semibold" data-testid="summary-phone-calls">
                          {displayActivities.filter(a => a.activityType === "call").length} calls
                        </span>
                      </div>
                      
                      <div className="flex items-center justify-between p-3 bg-orange-50 dark:bg-orange-950/20 rounded-lg">
                        <div className="flex items-center gap-3">
                          <MapPin className="w-5 h-5 text-orange-600" />
                          <span className="font-medium">Location Updates</span>
                        </div>
                        <span className="text-sm font-semibold" data-testid="summary-location-updates">
                          {displayActivities.filter(a => a.activityType === "location").length} updates
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Shield className="w-5 h-5" />
                      Monitoring Controls
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                      <div>
                        <p className="font-medium">Real-time Tracking</p>
                        <p className="text-sm text-muted-foreground">Monitor device activity in real-time</p>
                      </div>
                      <Badge className="bg-green-500 text-white">Active</Badge>
                    </div>
                    
                    <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                      <div>
                        <p className="font-medium">App Usage Monitoring</p>
                        <p className="text-sm text-muted-foreground">Track application usage and screen time</p>
                      </div>
                      <Badge className="bg-green-500 text-white">Enabled</Badge>
                    </div>
                    
                    <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                      <div>
                        <p className="font-medium">Location Services</p>
                        <p className="text-sm text-muted-foreground">GPS location tracking and geofencing</p>
                      </div>
                      <Badge className="bg-green-500 text-white">Active</Badge>
                    </div>
                    
                    <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                      <div>
                        <p className="font-medium">Communication Logs</p>
                        <p className="text-sm text-muted-foreground">Call and message activity logging</p>
                      </div>
                      <Badge className="bg-green-500 text-white">Enabled</Badge>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </main>
      </div>
    </div>
  );
}