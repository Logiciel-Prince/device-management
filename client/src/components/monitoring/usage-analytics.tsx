import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  BarChart3, 
  Clock, 
  Smartphone, 
  TrendingUp,
  AppWindow,
  Globe,
  Phone,
  MapPin
} from "lucide-react";

interface UsageAnalyticsProps {
  deviceId?: string;
  userId?: string;
  timeRange?: "today" | "week" | "month";
}

export function UsageAnalytics({ deviceId, userId, timeRange = "today" }: UsageAnalyticsProps) {
  const { data: activities = [] } = useQuery({
    queryKey: deviceId 
      ? ["/api/devices", deviceId, "activity"] 
      : ["/api/users", userId, "activity"],
    enabled: !!(deviceId || userId),
  });

  // Mock analytics data for demonstration
  const mockAnalytics = {
    totalScreenTime: "6h 45m",
    mostUsedApp: "Slack",
    productivityScore: 78,
    activitiesByType: {
      app_usage: 45,
      website_visit: 23,
      call: 12,
      location: 8,
    },
    hourlyUsage: [
      { hour: "9 AM", usage: 45 },
      { hour: "10 AM", usage: 65 },
      { hour: "11 AM", usage: 78 },
      { hour: "12 PM", usage: 34 },
      { hour: "1 PM", usage: 23 },
      { hour: "2 PM", usage: 67 },
      { hour: "3 PM", usage: 89 },
      { hour: "4 PM", usage: 56 },
    ],
    topApps: [
      { name: "Slack", usage: "2h 15m", category: "productivity", percentage: 85 },
      { name: "Instagram", usage: "1h 30m", category: "social", percentage: 60 },
      { name: "Safari", usage: "1h 45m", category: "web", percentage: 70 },
      { name: "Teams", usage: "45m", category: "productivity", percentage: 30 },
    ],
    websites: [
      { url: "github.com", visits: 15, duration: "45m" },
      { url: "youtube.com", visits: 8, duration: "20m" },
      { url: "stackoverflow.com", visits: 12, duration: "35m" },
      { url: "linkedin.com", visits: 5, duration: "15m" },
    ],
  };

  const getActivityTypeLabel = (type: string) => {
    switch (type) {
      case "app_usage":
        return "App Usage";
      case "website_visit":
        return "Web Browsing";
      case "call":
        return "Phone Calls";
      case "location":
        return "Location Updates";
      default:
        return type;
    }
  };

  const getActivityTypeIcon = (type: string) => {
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
        return <BarChart3 className="w-4 h-4" />;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "productivity":
        return "text-green-600 bg-green-50 dark:bg-green-950/20";
      case "social":
        return "text-blue-600 bg-blue-50 dark:bg-blue-950/20";
      case "web":
        return "text-purple-600 bg-purple-50 dark:bg-purple-950/20";
      case "entertainment":
        return "text-orange-600 bg-orange-50 dark:bg-orange-950/20";
      default:
        return "text-gray-600 bg-gray-50 dark:bg-gray-950/20";
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Screen Time Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="w-5 h-5" />
            Screen Time Summary
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
            <div>
              <p className="text-sm text-muted-foreground">Total Screen Time</p>
              <p className="text-2xl font-semibold" data-testid="text-total-screen-time">
                {mockAnalytics.totalScreenTime}
              </p>
            </div>
            <div className="w-12 h-12 bg-blue-500/10 rounded-lg flex items-center justify-center">
              <Smartphone className="w-6 h-6 text-blue-600" />
            </div>
          </div>
          
          <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
            <div>
              <p className="text-sm text-muted-foreground">Most Used App</p>
              <p className="text-lg font-semibold" data-testid="text-most-used-app">
                {mockAnalytics.mostUsedApp}
              </p>
            </div>
            <Badge className="bg-green-500 text-white">Top App</Badge>
          </div>
          
          <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
            <div>
              <p className="text-sm text-muted-foreground">Productivity Score</p>
              <p className="text-lg font-semibold" data-testid="text-productivity-score">
                {mockAnalytics.productivityScore}%
              </p>
            </div>
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-green-600" />
              <span className="text-sm text-green-600">+5%</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Activity Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5" />
            Activity Breakdown
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {Object.entries(mockAnalytics.activitiesByType).map(([type, count]) => (
            <div key={type} className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {getActivityTypeIcon(type)}
                <span className="font-medium">{getActivityTypeLabel(type)}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold" data-testid={`count-${type}`}>
                  {count}
                </span>
                <div className="w-20">
                  <Progress value={(count / 100) * 100} className="h-2" />
                </div>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Top Applications */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AppWindow className="w-5 h-5" />
            Top Applications
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {mockAnalytics.topApps.map((app, index) => (
            <div key={app.name} className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
                  <span className="text-xs font-semibold">{index + 1}</span>
                </div>
                <div>
                  <p className="font-medium" data-testid={`app-name-${index}`}>{app.name}</p>
                  <div className="flex items-center gap-2">
                    <Badge 
                      variant="outline" 
                      className={`text-xs ${getCategoryColor(app.category)}`}
                    >
                      {app.category}
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      {app.usage}
                    </span>
                  </div>
                </div>
              </div>
              <div className="w-20">
                <Progress value={app.percentage} className="h-2" />
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Website Activity */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="w-5 h-5" />
            Website Activity
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {mockAnalytics.websites.map((site, index) => (
            <div key={site.url} className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-purple-500/10 rounded-lg flex items-center justify-center">
                  <Globe className="w-4 h-4 text-purple-600" />
                </div>
                <div>
                  <p className="font-medium text-sm" data-testid={`website-url-${index}`}>
                    {site.url}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {site.visits} visits • {site.duration}
                  </p>
                </div>
              </div>
              <Badge variant="outline" className="text-xs">
                {site.visits}
              </Badge>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}