import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { insertUserSchema } from "@shared/schema";
import { z } from "zod";
import { User, LogOut, Camera, Upload } from "lucide-react";
import { useEffect, useRef, useState } from "react";

const profileSchema = insertUserSchema.pick({
  firstName: true,
  lastName: true,
  email: true,
});

type ProfileData = z.infer<typeof profileSchema>;

interface ProfileModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user?: any;
}

export function ProfileModal({ open, onOpenChange, user }: ProfileModalProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [profileImagePreview, setProfileImagePreview] = useState<string | null>(null);

  const form = useForm<ProfileData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      firstName: user?.firstName || "",
      lastName: user?.lastName || "",
      email: user?.email || "",
    },
  });

  // Reset form when user data changes
  useEffect(() => {
    if (user) {
      form.reset({
        firstName: user.firstName || "",
        lastName: user.lastName || "",
        email: user.email || "",
      });
    }
  }, [user, form]);

  const mutation = useMutation({
    mutationFn: async (data: ProfileData) => {
      await apiRequest("PUT", `/api/users/${user?.id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      toast({
        title: "Profile updated",
        description: "Your profile has been successfully updated.",
      });
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

  const handleImageUpload = async (file: File) => {
    if (file) {
      // Create FormData for file upload
      const formData = new FormData();
      formData.append('profileImage', file);
      
      try {
        const response = await fetch(`/api/users/${user?.id}/profile-image`, {
          method: 'POST',
          body: formData,
        });
        
        if (response.ok) {
          const result = await response.json();
          queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
          toast({
            title: "Profile picture updated",
            description: "Your profile picture has been successfully updated.",
          });
          setProfileImagePreview(null);
        } else {
          throw new Error('Failed to upload image');
        }
      } catch (error) {
        toast({
          title: "Upload failed",
          description: "Failed to upload profile picture. Please try again.",
          variant: "destructive",
        });
      }
    }
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        toast({
          title: "Invalid file type",
          description: "Please select an image file.",
          variant: "destructive",
        });
        return;
      }
      
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: "File too large",
          description: "Please select an image smaller than 5MB.",
          variant: "destructive",
        });
        return;
      }
      
      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setProfileImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
      
      // Upload immediately
      handleImageUpload(file);
    }
  };

  const onSubmit = (data: ProfileData) => {
    mutation.mutate(data);
  };

  const handleLogout = async () => {
      try {
          // Clear React Query cache first
          queryClient.clear();

          // Then make logout request
          await fetch("/api/logout", {
              method: "POST",
              credentials: "include",
          });

          // Redirect to login page
          window.location.href = "/login";
      } catch (error) {
          // Fallback to GET request
          window.location.href = "/api/logout";
      }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Profile Settings</DialogTitle>
          <DialogDescription>
            Update your profile information and manage your account.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Profile Picture */}
          <div className="flex flex-col items-center justify-center space-y-4">
            <div className="relative group">
              <Avatar className="w-20 h-20">
                <AvatarImage src={profileImagePreview || user?.profileImageUrl} />
                <AvatarFallback className="text-lg bg-primary/10">
                  {user?.firstName?.[0]?.toUpperCase()}{user?.lastName?.[0]?.toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <Button
                type="button"
                size="sm"
                variant="secondary"
                className="absolute inset-0 w-full h-full rounded-full opacity-0 group-hover:opacity-90 transition-opacity flex items-center justify-center"
                onClick={() => fileInputRef.current?.click()}
                data-testid="button-upload-profile-image"
              >
                <Camera className="w-6 h-6" />
              </Button>
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => fileInputRef.current?.click()}
              data-testid="button-change-profile-picture"
            >
              <Upload className="w-4 h-4 mr-2" />
              Change Picture
            </Button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFileSelect}
              data-testid="input-profile-image"
            />
          </div>

          {/* Profile Form */}
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="firstName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>First Name</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="First name" 
                          {...field} 
                          data-testid="input-first-name"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="lastName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Last Name</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="Last name" 
                          {...field} 
                          data-testid="input-last-name"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input 
                        type="email" 
                        placeholder="Email address" 
                        {...field} 
                        data-testid="input-email"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Role Display */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Role</label>
                <div className="p-3 bg-muted rounded-md">
                  <p className="text-sm capitalize">{user?.role}</p>
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <Button 
                  type="submit" 
                  disabled={mutation.isPending}
                  className="flex-1"
                  data-testid="button-save-profile"
                >
                  <User className="w-4 h-4 mr-2" />
                  {mutation.isPending ? "Saving..." : "Save Changes"}
                </Button>
                
                <Button 
                  type="button"
                  variant="outline"
                  onClick={handleLogout}
                  data-testid="button-logout-profile"
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  Sign Out
                </Button>
              </div>
            </form>
          </Form>
        </div>
      </DialogContent>
    </Dialog>
  );
}