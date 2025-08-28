import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Sidebar } from "@/components/layout/sidebar";
import { TopBar } from "@/components/layout/topbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { UserEditModal } from "@/components/users/user-edit-modal";
import { Settings, UserPlus, Edit, Users as UsersIcon } from "lucide-react";
import { type User } from "@shared/schema";

export default function Users() {
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [editModalOpen, setEditModalOpen] = useState(false);

  const { data: users, isLoading, error } = useQuery<User[]>({
    queryKey: ["/api/users"],
  });

  const handleEditUser = (user: User) => {
    setSelectedUser(user);
    setEditModalOpen(true);
  };

  const getRoleBadgeColor = (role: string) => {
    return role === "admin" ? "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300" : 
           "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300";
  };

  const getInitials = (firstName?: string, lastName?: string) => {
    return `${firstName?.charAt(0) || ''}${lastName?.charAt(0) || ''}`.toUpperCase() || 'U';
  };

  if (isLoading) {
    return (
      <div className="flex h-screen bg-background">
        <Sidebar />
        <div className="flex-1 flex flex-col overflow-hidden">
          <TopBar title="User Management" subtitle="Manage user accounts and permissions" />
          <main className="flex-1 overflow-y-auto p-6">
            <div className="text-center py-12">
              <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
              <p className="text-muted-foreground">Loading users...</p>
            </div>
          </main>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-screen bg-background">
        <Sidebar />
        <div className="flex-1 flex flex-col overflow-hidden">
          <TopBar title="User Management" subtitle="Manage user accounts and permissions" />
          <main className="flex-1 overflow-y-auto p-6">
            <Card>
              <CardContent className="text-center py-12">
                <Settings className="w-16 h-16 mx-auto text-destructive mb-4" />
                <h3 className="text-lg font-semibold mb-2">Error Loading Users</h3>
                <p className="text-muted-foreground">
                  Unable to load user data. Please try again later.
                </p>
              </CardContent>
            </Card>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-background">
      <Sidebar />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <TopBar 
          title="User Management" 
          subtitle="Manage user accounts and permissions"
          action={
            <Button data-testid="button-add-user" disabled>
              <UserPlus className="w-4 h-4 mr-2" />
              Add User
            </Button>
          }
        />
        
        <main className="flex-1 overflow-y-auto p-6">
          {users && users.length > 0 ? (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <UsersIcon className="w-5 h-5" />
                  All Users ({users.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>User</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Joined</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {users.map((user: User) => (
                      <TableRow key={user.id} data-testid={`row-user-${user.id}`}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <Avatar className="w-8 h-8">
                              {user.profileImageUrl ? (
                                <AvatarImage src={user.profileImageUrl} alt={user.firstName || 'User'} />
                              ) : null}
                              <AvatarFallback className="text-xs">
                                {getInitials(user.firstName, user.lastName)}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-medium text-sm" data-testid={`text-username-${user.id}`}>
                                {user.firstName || ''} {user.lastName || ''}
                              </p>
                              <p className="text-xs text-muted-foreground">ID: {user.id}</p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell data-testid={`text-email-${user.id}`}>
                          {user.email}
                        </TableCell>
                        <TableCell>
                          <Badge 
                            className={getRoleBadgeColor(user.role)}
                            data-testid={`badge-role-${user.id}`}
                          >
                            {user.role === "admin" ? "Administrator" : "Employee"}
                          </Badge>
                        </TableCell>
                        <TableCell data-testid={`text-joined-${user.id}`}>
                          {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEditUser(user)}
                            data-testid={`button-edit-user-${user.id}`}
                          >
                            <Edit className="w-4 h-4 mr-2" />
                            Edit
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="text-center py-12">
                <UsersIcon className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Users Found</h3>
                <p className="text-muted-foreground">
                  No users are currently registered in the system.
                </p>
              </CardContent>
            </Card>
          )}
        </main>
      </div>

      <UserEditModal
        user={selectedUser}
        open={editModalOpen}
        onOpenChange={setEditModalOpen}
      />
    </div>
  );
}
