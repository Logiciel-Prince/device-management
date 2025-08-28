import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { insertRequestSchema, type InsertRequest, type Device } from "@shared/schema";
import { z } from "zod";
import { useState } from "react";

const formSchema = insertRequestSchema.omit({ userId: true });

interface RequestFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function RequestForm({ open, onOpenChange }: RequestFormProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedDeviceType, setSelectedDeviceType] = useState("");

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      deviceType: "",
      deviceModel: "",
      reason: "",
    },
  });

  // Fetch available devices based on selected type
  const { data: availableDevices } = useQuery({
    queryKey: ["/api/devices/available", selectedDeviceType],
    queryFn: async () => {
      const response = await fetch(`/api/devices/available?type=${selectedDeviceType}`);
      if (!response.ok) {
        throw new Error('Failed to fetch available devices');
      }
      return response.json();
    },
    enabled: !!selectedDeviceType,
  });

  const mutation = useMutation({
    mutationFn: async (data: z.infer<typeof formSchema>) => {
      await apiRequest("POST", "/api/requests", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/requests"] });
      queryClient.invalidateQueries({ queryKey: ["/api/stats"] });
      toast({
        title: "Request submitted",
        description: "Your device request has been submitted for approval.",
      });
      form.reset();
      onOpenChange(false);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: z.infer<typeof formSchema>) => {
    mutation.mutate(data);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Request Device</DialogTitle>
          <DialogDescription>
            Select an available device to request. Your request will be reviewed by an administrator.
          </DialogDescription>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="deviceType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Device Type</FormLabel>
                  <Select onValueChange={(value) => {
                    field.onChange(value);
                    setSelectedDeviceType(value);
                    form.setValue("deviceModel", ""); // Reset device selection when type changes
                  }} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger data-testid="select-request-device-type">
                        <SelectValue placeholder="Select device type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="smartphone">Smartphone</SelectItem>
                      <SelectItem value="tablet">Tablet</SelectItem>
                      <SelectItem value="laptop">Laptop</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {selectedDeviceType && (
              <FormField
                control={form.control}
                name="deviceModel"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Available Devices</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value || ""}>
                      <FormControl>
                        <SelectTrigger data-testid="select-available-device">
                          <SelectValue placeholder="Select an available device" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {availableDevices?.length === 0 ? (
                          <SelectItem value="" disabled>
                            No available devices of this type
                          </SelectItem>
                        ) : (
                          availableDevices?.map((device: Device) => (
                            <SelectItem key={device.id} value={device.model || device.name}>
                              {device.name} - {device.model}
                            </SelectItem>
                          ))
                        )}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            <FormField
              control={form.control}
              name="reason"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Reason for Request (Optional)</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Please explain why you need this device..."
                      className="min-h-[100px]"
                      {...field}
                      value={field.value || ""}
                      data-testid="textarea-request-reason"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end gap-3 pt-4">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => onOpenChange(false)}
                data-testid="button-cancel-request"
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={mutation.isPending}
                data-testid="button-submit-request"
              >
                {mutation.isPending ? "Submitting..." : "Submit Request"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
