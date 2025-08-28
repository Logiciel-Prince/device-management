import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Sidebar } from "@/components/layout/sidebar";
import { TopBar } from "@/components/layout/topbar";
import { DeviceTable } from "@/components/device/device-table";
import { AddDeviceModal } from "@/components/device/add-device-modal";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus } from "lucide-react";

export default function Devices() {
  const [showAddDevice, setShowAddDevice] = useState(false);
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");

  const { data: devices, isLoading } = useQuery({
    queryKey: ["/api/devices"],
  });

  const filteredDevices = devices?.filter(device => {
    const statusMatch = statusFilter === "all" || device.status === statusFilter;
    const typeMatch = typeFilter === "all" || device.type === typeFilter;
    return statusMatch && typeMatch;
  }) || [];

  return (
    <div className="flex h-screen bg-background">
      <Sidebar />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <TopBar 
          title="Device Inventory" 
          subtitle="Manage all devices and their assignments"
          action={
            <Button onClick={() => setShowAddDevice(true)} data-testid="button-add-device">
              <Plus className="w-4 h-4 mr-2" />
              Add Device
            </Button>
          }
        />
        
        <main className="flex-1 overflow-y-auto p-6">
          <div className="bg-card rounded-lg border border-border">
            <div className="p-6 border-b border-border">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h3 className="text-lg font-semibold">Device Inventory</h3>
                  <p className="text-sm text-muted-foreground">
                    Manage all devices and their assignments
                  </p>
                </div>
                
                {/* Filters */}
                <div className="flex items-center gap-2">
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-40" data-testid="select-status-filter">
                      <SelectValue placeholder="All Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="available">Available</SelectItem>
                      <SelectItem value="assigned">Assigned</SelectItem>
                      <SelectItem value="maintenance">Maintenance</SelectItem>
                    </SelectContent>
                  </Select>
                  
                  <Select value={typeFilter} onValueChange={setTypeFilter}>
                    <SelectTrigger className="w-40" data-testid="select-type-filter">
                      <SelectValue placeholder="All Types" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Types</SelectItem>
                      <SelectItem value="smartphone">iPhone</SelectItem>
                      <SelectItem value="tablet">iPad</SelectItem>
                      <SelectItem value="laptop">MacBook</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
            
            <DeviceTable devices={filteredDevices} isLoading={isLoading} />
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
