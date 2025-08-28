import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Bell, Menu, Search, User } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/useAuth";
import { useState } from "react";
import { ProfileModal } from "@/components/profile/profile-modal";

interface TopBarProps {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
}

export function TopBar({ title, subtitle, action }: TopBarProps) {
  const { user } = useAuth();
  const [showProfile, setShowProfile] = useState(false);
  
  const { data: requests } = useQuery({
    queryKey: ["/api/requests"],
  });

  const pendingCount = requests?.filter(r => r.status === "pending").length || 0;

  return (
    <header className="bg-card border-b border-border p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" className="md:hidden" data-testid="button-mobile-menu">
            <Menu className="w-4 h-4" />
          </Button>
          <div>
            <h2 className="text-xl font-semibold" data-testid="text-page-title">{title}</h2>
            {subtitle && (
              <p className="text-sm text-muted-foreground" data-testid="text-page-subtitle">
                {subtitle}
              </p>
            )}
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          {/* Search */}
          <div className="relative hidden sm:block">
            <Input
              type="text"
              placeholder="Search devices, users..."
              className="pl-10 w-64"
              data-testid="input-search"
            />
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
          </div>
          
          {/* Profile Button */}
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => setShowProfile(true)}
            data-testid="button-profile"
          >
            <User className="w-5 h-5" />
          </Button>
          
          {/* Notifications */}
          <Button variant="ghost" size="sm" className="relative" data-testid="button-notifications">
            <Bell className="w-5 h-5" />
            {pendingCount > 0 && (
              <Badge 
                variant="destructive" 
                className="absolute -top-1 -right-1 w-5 h-5 text-xs flex items-center justify-center p-0"
              >
                {pendingCount}
              </Badge>
            )}
          </Button>
          
          {/* Action Button */}
          {action}
        </div>
      </div>
      
      <ProfileModal 
        open={showProfile} 
        onOpenChange={setShowProfile}
        user={user}
      />
    </header>
  );
}
