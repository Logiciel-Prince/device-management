import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Eye, Edit, Trash2, MoreHorizontal, Smartphone, Tablet, Laptop, RotateCcw } from "lucide-react";
import { type DeviceWithUser } from "@shared/schema";
import { formatDistanceToNow } from "date-fns";

interface DeviceTableProps {
  devices: DeviceWithUser[];
  isLoading: boolean;
}

export function DeviceTable({ devices, isLoading }: DeviceTableProps) {
  const [deleteDevice, setDeleteDevice] = useState<string | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const deleteMutation = useMutation({
    mutationFn: async (deviceId: string) => {
      await apiRequest("DELETE", `/api/devices/${deviceId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/devices"] });
      queryClient.invalidateQueries({ queryKey: ["/api/stats"] });
      toast({
        title: "Device deleted",
        description: "The device has been removed from inventory.",
      });
      setDeleteDevice(null);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const returnMutation = useMutation({
    mutationFn: async (deviceId: string) => {
      await apiRequest("PUT", `/api/devices/${deviceId}/return`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/devices"] });
      queryClient.invalidateQueries({ queryKey: ["/api/stats"] });
      toast({
        title: "Device returned",
        description: "The device is now available for assignment.",
      });
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
      case "available":
        return (
          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
            Available
          </Badge>
        );
      case "assigned":
        return (
          <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
            Assigned
          </Badge>
        );
      case "maintenance":
        return (
          <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
            Maintenance
          </Badge>
        );
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  if (isLoading) {
    return (
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Device</TableHead>
              <TableHead>Serial Number</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Assigned To</TableHead>
              <TableHead>Last Activity</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {Array.from({ length: 5 }).map((_, i) => (
              <TableRow key={i}>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <Skeleton className="w-10 h-10" />
                    <div>
                      <Skeleton className="h-4 w-32 mb-2" />
                      <Skeleton className="h-3 w-24" />
                    </div>
                  </div>
                </TableCell>
                <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                <TableCell><Skeleton className="h-6 w-16" /></TableCell>
                <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                <TableCell><Skeleton className="h-8 w-8" /></TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    );
  }

  if (devices.length === 0) {
    return (
      <div className="text-center py-12">
        <Smartphone className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
        <h3 className="text-lg font-semibold mb-2">No devices found</h3>
        <p className="text-muted-foreground" data-testid="text-no-devices">
          No devices match your current filters.
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Device</TableHead>
              <TableHead>Serial Number</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Assigned To</TableHead>
              <TableHead>Last Activity</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {devices.map((device) => (
              <TableRow key={device.id} data-testid={`row-device-${device.id}`}>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-muted rounded-lg flex items-center justify-center">
                      {getDeviceIcon(device.type)}
                    </div>
                    <div>
                      <p className="font-medium" data-testid={`text-device-name-${device.id}`}>
                        {device.name}
                      </p>
                      <p className="text-sm text-muted-foreground" data-testid={`text-device-model-${device.id}`}>
                        {device.model}
                      </p>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <span className="font-mono text-sm" data-testid={`text-device-serial-${device.id}`}>
                    {device.serialNumber}
                  </span>
                </TableCell>
                <TableCell>
                  {getStatusBadge(device.status)}
                </TableCell>
                <TableCell>
                  {device.assignedUser ? (
                    <span className="text-sm" data-testid={`text-assigned-user-${device.id}`}>
                      {device.assignedUser.firstName} {device.assignedUser.lastName}
                    </span>
                  ) : (
                    <span className="text-sm text-muted-foreground">—</span>
                  )}
                </TableCell>
                <TableCell>
                  <span className="text-sm text-muted-foreground" data-testid={`text-last-activity-${device.id}`}>
                    {device.lastActivity ? formatDistanceToNow(new Date(device.lastActivity), { addSuffix: true }) : "—"}
                  </span>
                </TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm" data-testid={`button-actions-${device.id}`}>
                        <MoreHorizontal className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem data-testid={`action-view-${device.id}`}>
                        <Eye className="w-4 h-4 mr-2" />
                        View Details
                      </DropdownMenuItem>
                      <DropdownMenuItem data-testid={`action-edit-${device.id}`}>
                        <Edit className="w-4 h-4 mr-2" />
                        Edit Device
                      </DropdownMenuItem>
                      {device.status === "assigned" && (
                        <DropdownMenuItem 
                          onClick={() => returnMutation.mutate(device.id)}
                          data-testid={`action-return-${device.id}`}
                        >
                          <RotateCcw className="w-4 h-4 mr-2" />
                          Return Device
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuItem 
                        className="text-destructive"
                        onClick={() => setDeleteDevice(device.id)}
                        data-testid={`action-delete-${device.id}`}
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        Delete Device
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      <div className="p-4 border-t border-border">
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground" data-testid="text-pagination-info">
            Showing 1 to {devices.length} of {devices.length} devices
          </p>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" disabled data-testid="button-previous-page">
              Previous
            </Button>
            <Button variant="outline" size="sm" disabled data-testid="button-next-page">
              Next
            </Button>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteDevice} onOpenChange={() => setDeleteDevice(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Device</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this device? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel data-testid="button-cancel-delete">Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteDevice && deleteMutation.mutate(deleteDevice)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              data-testid="button-confirm-delete"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
