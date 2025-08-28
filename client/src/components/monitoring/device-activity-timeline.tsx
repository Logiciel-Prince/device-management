import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { 
  Shield, 
  Smartphone, 
  Clock, 
  MapPin, 
  Phone, 
  Globe, 
  AppWindow,
  Activity,
  ChevronDown,
  ChevronUp
} from "lucide-react";
import { formatDistanceToNow, format } from "date-fns";
import { useState } from "react";

interface DeviceActivityTimelineProps {
  deviceId: string;
  deviceName: string;
  userName: string;
}

export function DeviceActivityTimeline({ deviceId, deviceName, userName }: DeviceActivityTimelineProps) {
  const [expanded, setExpanded] = useState(false);
  
  const { data: activities = [], isLoading } = useQuery({
    queryKey: ["/api/devices", deviceId, "activity"],
    enabled: !!deviceId,
  });

  // Mock activities for demonstration
  const mockActivities = [
    {
      id: "1",
      deviceId,
      userId: "employee-001",
      activityType: "app_usage",
      appName: "Instagram",
      duration: "45",
      timestamp: new Date(Date.now() - 1000 * 60 * 30),
      data: JSON.stringify({ category: "social", screenTime: "45 minutes" }),
    },
    {
      id: "2",
      deviceId,
      userId: "employee-001",
      activityType: "website_visit",
      website: "youtube.com",
      duration: "20",
      timestamp: new Date(Date.now() - 1000 * 60 * 60),
      data: JSON.stringify({ category: "entertainment", title: "Tech Reviews" }),
    },
    {
      id: "3",
      deviceId,
      userId: "employee-001",
      activityType: "call",
      timestamp: new Date(Date.now() - 1000 * 60 * 90),
      data: JSON.stringify({ contact: "Client Meeting", duration: "15 minutes", type: "outgoing" }),
    },
    {
      id: "4",
      deviceId,
      userId: "employee-001",
      activityType: "app_usage",
      appName: "Slack",
      duration: "30",
      timestamp: new Date(Date.now() - 1000 * 60 * 120),
      data: JSON.stringify({ category: "productivity", messagesSent: 12 }),
    },
    {
      id: "5",
      deviceId,
      userId: "employee-001",
      activityType: "location",
      timestamp: new Date(Date.now() - 1000 * 60 * 180),
      data: JSON.stringify({ location: "Office Building", address: "123 Business St", accuracy: "10m" }),
    },
  ];

  const displayActivities = activities.length > 0 ? activities : mockActivities;
  const visibleActivities = expanded ? displayActivities : displayActivities.slice(0, 3);

  const getActivityIcon = (type: string) => {
    switch (type) {
      case "app_usage":
        return <AppWindow className="w-4 h-4 text-blue-600" />;
      case "website_visit":
        return <Globe className="w-4 h-4 text-purple-600" />;
      case "call":
        return <Phone className="w-4 h-4 text-green-600" />;
      case "location":
        return <MapPin className="w-4 h-4 text-orange-600" />;
      default:
        return <Activity className="w-4 h-4 text-gray-600" />;
    }
  };

  const getActivityDetails = (activity: any) => {
    const data = JSON.parse(activity.data || "{}");
    
    switch (activity.activityType) {
      case "app_usage":
        return `Used ${activity.appName} for ${activity.duration || "0"} minutes`;
      case "website_visit":
        return `Visited ${activity.website} for ${activity.duration || "0"} minutes`;
      case "call":
        return `${data.type === "outgoing" ? "Called" : "Received call from"} ${data.contact || "Unknown"}`;
      case "location":
        return `Located at ${data.location || "Unknown location"}`;
      default:
        return "Device activity";
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="w-5 h-5" />
            Activity Timeline
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-start gap-3 animate-pulse">
                <div className="w-8 h-8 bg-muted rounded-full" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-muted rounded w-3/4" />
                  <div className="h-3 bg-muted rounded w-1/2" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Activity className="w-5 h-5" />
          Activity Timeline
          <Badge variant="outline" className="ml-auto">
            {displayActivities.length} activities
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {displayActivities.length === 0 ? (
          <div className="text-center py-8">
            <Activity className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No activity recorded</h3>
            <p className="text-muted-foreground" data-testid="text-no-timeline-activity">
              No device activity has been recorded for this device yet.
            </p>
          </div>
        ) : (
          <>
            <div className="space-y-4">
              {visibleActivities.map((activity, index) => (
                <div 
                  key={activity.id} 
                  className="flex items-start gap-3 relative"
                  data-testid={`timeline-activity-${activity.id}`}
                >
                  {/* Timeline line */}
                  {index < visibleActivities.length - 1 && (
                    <div className="absolute left-4 top-8 bottom-0 w-px bg-border" />
                  )}
                  
                  {/* Activity icon */}
                  <div className="w-8 h-8 bg-background border-2 border-border rounded-full flex items-center justify-center z-10">
                    {getActivityIcon(activity.activityType)}
                  </div>
                  
                  {/* Activity content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <p className="text-sm font-medium" data-testid={`timeline-details-${activity.id}`}>
                          {getActivityDetails(activity)}
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant="outline" className="text-xs">
                            {activity.activityType.replace("_", " ")}
                          </Badge>
                          <span className="text-xs text-muted-foreground flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {formatDistanceToNow(new Date(activity.timestamp), { addSuffix: true })}
                          </span>
                        </div>
                      </div>
                      <span className="text-xs text-muted-foreground" data-testid={`timeline-time-${activity.id}`}>
                        {format(new Date(activity.timestamp), "h:mm a")}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            {displayActivities.length > 3 && (
              <div className="mt-6 text-center">
                <Button 
                  variant="ghost" 
                  onClick={() => setExpanded(!expanded)}
                  className="text-sm"
                  data-testid="button-toggle-timeline"
                >
                  {expanded ? (
                    <>
                      <ChevronUp className="w-4 h-4 mr-1" />
                      Show less
                    </>
                  ) : (
                    <>
                      <ChevronDown className="w-4 h-4 mr-1" />
                      Show {displayActivities.length - 3} more activities
                    </>
                  )}
                </Button>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}