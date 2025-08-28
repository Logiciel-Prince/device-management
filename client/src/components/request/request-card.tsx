import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Check, X, Clock, Smartphone, Tablet, Laptop } from "lucide-react";
import { type RequestWithUser } from "@shared/schema";
import { formatDistanceToNow } from "date-fns";
import { useState } from "react";

interface RequestCardProps {
  request: RequestWithUser;
  showActions?: boolean;
}

export function RequestCard({ request, showActions = false }: RequestCardProps) {
  const [showApprovalDialog, setShowApprovalDialog] = useState(false);
  const [selectedDeviceId, setSelectedDeviceId] = useState("");
  const [rejectionReason, setRejectionReason] = useState("");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: availableDevices } = useQuery({
    queryKey: ["/api/devices"],
    select: (devices) => devices?.filter(d => d.status === "available" && d.type === request.deviceType) || [],
    enabled: showApprovalDialog,
  });

  const approveMutation = useMutation({
    mutationFn: async ({ requestId, deviceId }: { requestId: string; deviceId?: string }) => {
      await apiRequest("PUT", `/api/requests/${requestId}/approve`, { deviceId });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/requests"] });
      queryClient.invalidateQueries({ queryKey: ["/api/devices"] });
      queryClient.invalidateQueries({ queryKey: ["/api/stats"] });
      toast({
        title: "Request approved",
        description: "The device request has been approved.",
      });
      setShowApprovalDialog(false);
      setSelectedDeviceId("");
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const rejectMutation = useMutation({
    mutationFn: async ({ requestId, reason }: { requestId: string; reason: string }) => {
      await apiRequest("PUT", `/api/requests/${requestId}/reject`, { reason });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/requests"] });
      queryClient.invalidateQueries({ queryKey: ["/api/stats"] });
      toast({
        title: "Request rejected",
        description: "The device request has been rejected.",
      });
      setRejectionReason("");
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const getDeviceIcon = (type: string) => {
    switch (type) {
      case "smartphone":
        return <Smartphone className="w-5 h-5" />;
      case "tablet":
        return <Tablet className="w-5 h-5" />;
      case "laptop":
        return <Laptop className="w-5 h-5" />;
      default:
        return <Smartphone className="w-5 h-5" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return (
          <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
            <Clock className="w-3 h-3 mr-1" />
            Pending
          </Badge>
        );
      case "approved":
        return (
          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
            <Check className="w-3 h-3 mr-1" />
            Approved
          </Badge>
        );
      case "rejected":
        return (
          <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
            <X className="w-3 h-3 mr-1" />
            Rejected
          </Badge>
        );
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const handleApprove = () => {
    if (availableDevices && availableDevices.length > 0) {
      setShowApprovalDialog(true);
    } else {
      approveMutation.mutate({ requestId: request.id });
    }
  };

  const handleReject = () => {
    const reason = prompt("Please provide a reason for rejection:");
    if (reason) {
      rejectMutation.mutate({ requestId: request.id, reason });
    }
  };

  return (
    <>
      <Card className="p-4 bg-muted/50">
        <CardContent className="p-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-background rounded-full flex items-center justify-center">
                {getDeviceIcon(request.deviceType)}
              </div>
              <div>
                <p className="font-medium" data-testid={`text-request-device-${request.id}`}>
                  {request.deviceType} {request.deviceModel}
                </p>
                <p className="text-sm text-muted-foreground">
                  Requested by{" "}
                  <span data-testid={`text-request-user-${request.id}`}>
                    {request.user.firstName} {request.user.lastName}
                  </span>
                  {" • "}
                  <span data-testid={`text-request-time-${request.id}`}>
                    {formatDistanceToNow(new Date(request.createdAt), { addSuffix: true })}
                  </span>
                </p>
                {request.reason && (
                  <p className="text-sm text-muted-foreground mt-1" data-testid={`text-request-reason-${request.id}`}>
                    Reason: {request.reason}
                  </p>
                )}
                {request.rejectionReason && (
                  <p className="text-sm text-red-600 mt-1" data-testid={`text-rejection-reason-${request.id}`}>
                    Rejection reason: {request.rejectionReason}
                  </p>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2">
              {getStatusBadge(request.status)}
              {showActions && request.status === "pending" && (
                <div className="flex gap-1">
                  <Button
                    size="sm"
                    variant="ghost"
                    className="text-green-600 hover:bg-green-50"
                    onClick={handleApprove}
                    disabled={approveMutation.isPending}
                    data-testid={`button-approve-${request.id}`}
                  >
                    <Check className="w-4 h-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="text-red-600 hover:bg-red-50"
                    onClick={handleReject}
                    disabled={rejectMutation.isPending}
                    data-testid={`button-reject-${request.id}`}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Approval Dialog */}
      <Dialog open={showApprovalDialog} onOpenChange={setShowApprovalDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Approve Request</DialogTitle>
            <DialogDescription>
              Select a device to assign to this request, or approve without assigning a device.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <Label>Available Devices</Label>
              <Select value={selectedDeviceId} onValueChange={setSelectedDeviceId}>
                <SelectTrigger data-testid="select-device-assignment">
                  <SelectValue placeholder="Select a device (optional)" />
                </SelectTrigger>
                <SelectContent>
                  {availableDevices?.map((device) => (
                    <SelectItem key={device.id} value={device.id}>
                      {device.name} - {device.model} ({device.serialNumber})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex justify-end gap-3">
              <Button 
                variant="outline" 
                onClick={() => setShowApprovalDialog(false)}
                data-testid="button-cancel-approval"
              >
                Cancel
              </Button>
              <Button
                onClick={() => {
                  // If no device selected but devices are available, auto-assign the first one
                  const deviceToAssign = selectedDeviceId || (availableDevices?.[0]?.id);
                  approveMutation.mutate({ 
                    requestId: request.id, 
                    deviceId: deviceToAssign 
                  });
                }}
                disabled={approveMutation.isPending}
                data-testid="button-confirm-approval"
              >
                {approveMutation.isPending ? "Approving..." : "Approve Request"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
