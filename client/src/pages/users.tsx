import { Sidebar } from "@/components/layout/sidebar";
import { TopBar } from "@/components/layout/topbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Settings, UserPlus } from "lucide-react";

export default function Users() {
  return (
    <div className="flex h-screen bg-background">
      <Sidebar />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <TopBar 
          title="User Management" 
          subtitle="Manage user accounts and permissions"
          action={
            <Button data-testid="button-add-user">
              <UserPlus className="w-4 h-4 mr-2" />
              Add User
            </Button>
          }
        />
        
        <main className="flex-1 overflow-y-auto p-6">
          <Card>
            <CardHeader>
              <CardTitle>Coming Soon</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <Settings className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">User Management</h3>
                <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                  User management features are currently in development. 
                  This will include user roles, permissions, and account settings.
                </p>
                <div className="space-y-4">
                  <div className="flex items-center justify-center gap-4 p-4 bg-muted/50 rounded-lg">
                    <Avatar>
                      <AvatarFallback>AU</AvatarFallback>
                    </Avatar>
                    <div className="text-left">
                      <p className="font-medium">Admin User</p>
                      <p className="text-sm text-muted-foreground">admin@example.com</p>
                    </div>
                    <Badge>Admin</Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </main>
      </div>
    </div>
  );
}
