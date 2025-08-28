import { useQuery } from "@tanstack/react-query";
import { Sidebar } from "@/components/layout/sidebar";
import { TopBar } from "@/components/layout/topbar";
import { RequestCard } from "@/components/request/request-card";
import { RequestForm } from "@/components/request/request-form";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus } from "lucide-react";
import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";

export default function Requests() {
  const [showRequestForm, setShowRequestForm] = useState(false);
  const { user } = useAuth();

  const { data: requests, isLoading } = useQuery({
    queryKey: ["/api/requests"],
  });

  const pendingRequests = requests?.filter(r => r.status === "pending") || [];
  const approvedRequests = requests?.filter(r => r.status === "approved") || [];
  const rejectedRequests = requests?.filter(r => r.status === "rejected") || [];

  const isEmployee = user?.role === "employee";

  return (
    <div className="flex h-screen bg-background">
      <Sidebar />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <TopBar 
          title="Device Requests" 
          subtitle={isEmployee ? "Your device requests" : "Manage employee requests"}
          action={
            isEmployee ? (
              <Button onClick={() => setShowRequestForm(true)} data-testid="button-new-request">
                <Plus className="w-4 h-4 mr-2" />
                New Request
              </Button>
            ) : undefined
          }
        />
        
        <main className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Pending</p>
                    <p className="text-2xl font-semibold" data-testid="text-pending-count">
                      {pendingRequests.length}
                    </p>
                  </div>
                  <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
                    Pending
                  </Badge>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Approved</p>
                    <p className="text-2xl font-semibold" data-testid="text-approved-count">
                      {approvedRequests.length}
                    </p>
                  </div>
                  <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                    Approved
                  </Badge>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Rejected</p>
                    <p className="text-2xl font-semibold" data-testid="text-rejected-count">
                      {rejectedRequests.length}
                    </p>
                  </div>
                  <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
                    Rejected
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Requests by Status */}
          <div className="grid gap-6">
            {/* Pending Requests */}
            {(!isEmployee || pendingRequests.length > 0) && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    Pending Requests
                    <Badge variant="outline">{pendingRequests.length}</Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {pendingRequests.length === 0 ? (
                    <p className="text-muted-foreground text-center py-8" data-testid="text-no-pending">
                      No pending requests
                    </p>
                  ) : (
                    pendingRequests.map((request) => (
                      <RequestCard key={request.id} request={request} showActions={!isEmployee} />
                    ))
                  )}
                </CardContent>
              </Card>
            )}

            {/* Recent Approved/Rejected */}
            {(approvedRequests.length > 0 || rejectedRequests.length > 0) && (
              <Card>
                <CardHeader>
                  <CardTitle>Recent Activity</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {[...approvedRequests, ...rejectedRequests]
                    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
                    .slice(0, 5)
                    .map((request) => (
                      <RequestCard key={request.id} request={request} />
                    ))}
                </CardContent>
              </Card>
            )}
          </div>
        </main>
      </div>

      {showRequestForm && (
        <RequestForm 
          open={showRequestForm} 
          onOpenChange={setShowRequestForm} 
        />
      )}
    </div>
  );
}
