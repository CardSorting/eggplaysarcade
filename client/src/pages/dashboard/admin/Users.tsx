import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { getQueryFn, apiRequest, queryClient } from "@/lib/queryClient";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/hooks/use-toast";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import {
  Search,
  Filter,
  MoreVertical,
  UserCog,
  Shield,
  UserX,
  Eye,
  Mail,
  Ban,
  CheckCircle,
  AlertTriangle,
  Calendar,
  User,
  Gamepad,
  Star
} from "lucide-react";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { format } from "date-fns";
import { UserRole } from "@/lib/types";

// Get user role badge
const getUserRoleBadge = (role: UserRole) => {
  switch (role) {
    case UserRole.ADMIN:
      return <Badge className="bg-red-500">Admin</Badge>;
    case UserRole.GAME_DEVELOPER:
      return <Badge className="bg-blue-500">Developer</Badge>;
    case UserRole.PLAYER:
      return <Badge className="bg-green-500">Player</Badge>;
    default:
      return <Badge variant="outline">Unknown</Badge>;
  }
};

// User details dialog
const UserDetailsDialog = ({
  open,
  onOpenChange,
  user,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: any;
}) => {
  if (!user) return null;

  // Format date
  const formatDate = (date: string | Date) => {
    return format(new Date(date), 'PPpp');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>User Details</DialogTitle>
          <DialogDescription>
            Detailed information about this user
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
          <div className="md:col-span-2 space-y-6">
            <div className="flex gap-4">
              <div className="h-20 w-20 bg-primary/10 rounded-full flex items-center justify-center">
                {user.avatarUrl ? (
                  <img
                    src={user.avatarUrl}
                    alt={user.username}
                    className="h-full w-full rounded-full object-cover"
                  />
                ) : (
                  <User className="h-10 w-10 text-primary" />
                )}
              </div>
              <div>
                <h2 className="text-xl font-bold">{user.username}</h2>
                <p className="text-sm text-muted-foreground">{user.email}</p>
                <div className="mt-2">{getUserRoleBadge(user.role)}</div>
              </div>
            </div>

            <Separator />

            {user.bio && (
              <div>
                <h3 className="text-lg font-semibold mb-2">Bio</h3>
                <p className="text-muted-foreground whitespace-pre-line">
                  {user.bio}
                </p>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div>
                <h3 className="text-lg font-semibold mb-2">Account Details</h3>
                <div className="space-y-2">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">User ID</p>
                    <p>{user.id}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Registered</p>
                    <p>{formatDate(user.createdAt)}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Last Login</p>
                    <p>{user.lastLoginAt ? formatDate(user.lastLoginAt) : 'Never'}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Account Status</p>
                    <p className="flex items-center gap-1">
                      {user.isBanned ? (
                        <>
                          <Ban className="h-4 w-4 text-red-500" />
                          <span className="text-red-500">Banned</span>
                        </>
                      ) : (
                        <>
                          <CheckCircle className="h-4 w-4 text-green-500" />
                          <span className="text-green-500">Active</span>
                        </>
                      )}
                    </p>
                  </div>
                </div>
              </div>

              <div>
                {user.role === UserRole.GAME_DEVELOPER && (
                  <div>
                    <h3 className="text-lg font-semibold mb-2">Developer Stats</h3>
                    <div className="space-y-2">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Total Games</p>
                        <p className="flex items-center gap-1">
                          <Gamepad className="h-4 w-4" />
                          {user.stats?.totalGames || 0}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Published Games</p>
                        <p>{user.stats?.publishedGames || 0}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Total Plays</p>
                        <p>{user.stats?.totalPlays?.toLocaleString() || 0}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Average Rating</p>
                        <p className="flex items-center gap-1">
                          <Star className="h-4 w-4 text-yellow-400" />
                          {user.stats?.averageRating?.toFixed(1) || 0}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {user.role === UserRole.PLAYER && (
                  <div>
                    <h3 className="text-lg font-semibold mb-2">Player Stats</h3>
                    <div className="space-y-2">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Games Played</p>
                        <p>{user.stats?.gamesPlayed || 0}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Total Play Time</p>
                        <p>{user.stats?.totalPlayTime || '0 minutes'}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Reviews Written</p>
                        <p>{user.stats?.reviewsWritten || 0}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Favorite Category</p>
                        <p>{user.stats?.favoriteCategory || 'None'}</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {user.role === UserRole.GAME_DEVELOPER && user.games?.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold mb-2">Games</h3>
                <div className="space-y-2">
                  {user.games.map((game: any) => (
                    <div key={game.id} className="flex items-center gap-2 p-2 border rounded-md">
                      <img
                        src={game.thumbnailUrl || "https://via.placeholder.com/40"}
                        alt={game.title}
                        className="h-10 w-10 rounded object-cover"
                      />
                      <div className="flex-1">
                        <p className="font-medium">{game.title}</p>
                        <p className="text-xs text-muted-foreground">
                          {game.players?.toLocaleString() || 0} plays | {game.rating || 0} rating
                        </p>
                      </div>
                      <Badge>{game.status}</Badge>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Account Management</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {user.role !== UserRole.ADMIN && (
                  <div className="flex flex-col gap-2">
                    <Label 
                      htmlFor="user-role"
                      className="text-sm font-medium"
                    >
                      User Role
                    </Label>
                    <Select defaultValue={user.role}>
                      <SelectTrigger id="user-role">
                        <SelectValue placeholder="Select role" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value={UserRole.PLAYER}>Player</SelectItem>
                        <SelectItem value={UserRole.GAME_DEVELOPER}>Game Developer</SelectItem>
                        <SelectItem value={UserRole.ADMIN}>Admin</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label 
                      htmlFor="user-active"
                      className="text-sm font-medium"
                    >
                      Account Status
                    </Label>
                    <p className="text-xs text-muted-foreground">
                      {user.isBanned ? 'User is banned from the platform' : 'User can use the platform'}
                    </p>
                  </div>
                  <Switch
                    id="user-active"
                    checked={!user.isBanned}
                  />
                </div>

                <Separator />

                <div className="flex flex-col gap-2">
                  <Button variant="outline" className="justify-start">
                    <Mail className="mr-2 h-4 w-4" />
                    Send Email
                  </Button>
                  <Button variant="outline" className="justify-start">
                    <Ban className="mr-2 h-4 w-4 text-red-500" />
                    Ban User
                  </Button>
                  <Button variant="outline" className="justify-start text-red-500">
                    <UserX className="mr-2 h-4 w-4" />
                    Delete Account
                  </Button>
                </div>
              </CardContent>
            </Card>

            {user.flags?.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Account Flags</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {user.flags.map((flag: any) => (
                      <div key={flag.id} className="p-2 border rounded-md">
                        <div className="flex items-center gap-2">
                          <AlertTriangle className={`h-4 w-4 ${flag.severity === 'high' ? 'text-red-500' : flag.severity === 'medium' ? 'text-yellow-500' : 'text-blue-500'}`} />
                          <p className="font-medium">{flag.type}</p>
                        </div>
                        <p className="text-sm mt-1">{flag.description}</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {formatDate(flag.createdAt)}
                        </p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

// Edit user role dialog
const EditUserRoleDialog = ({
  open,
  onOpenChange,
  user,
  onSave,
  isLoading
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: any;
  onSave: (userId: number, role: UserRole) => void;
  isLoading: boolean;
}) => {
  const [selectedRole, setSelectedRole] = useState<UserRole | null>(null);

  if (!user) return null;

  return (
    <Dialog 
      open={open} 
      onOpenChange={(newOpen) => {
        // Reset selected role when dialog closes
        if (!newOpen) {
          setSelectedRole(null);
        }
        onOpenChange(newOpen);
      }}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Change User Role</DialogTitle>
          <DialogDescription>
            Update the role for user {user.username}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="flex items-center space-x-4">
            <div className="h-10 w-10 bg-primary/10 rounded-full flex items-center justify-center">
              {user.avatarUrl ? (
                <img
                  src={user.avatarUrl}
                  alt={user.username}
                  className="h-full w-full rounded-full object-cover"
                />
              ) : (
                <User className="h-5 w-5 text-primary" />
              )}
            </div>
            <div>
              <p className="font-medium">{user.username}</p>
              <p className="text-sm text-muted-foreground">Current role: {user.role}</p>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="role">New Role</Label>
            <Select
              value={selectedRole || user.role}
              onValueChange={(value) => setSelectedRole(value as UserRole)}
            >
              <SelectTrigger id="role">
                <SelectValue placeholder="Select role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={UserRole.PLAYER}>Player</SelectItem>
                <SelectItem value={UserRole.GAME_DEVELOPER}>Game Developer</SelectItem>
                <SelectItem value={UserRole.ADMIN}>Admin</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <DialogFooter>
          <Button 
            variant="outline" 
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
          <Button
            onClick={() => onSave(user.id, selectedRole || user.role)}
            disabled={isLoading || !selectedRole || selectedRole === user.role}
          >
            Save Changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

const UsersManagementPage = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState<UserRole | "">("");
  const [statusFilter, setStatusFilter] = useState<"active" | "banned" | "">("");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [isUserDetailsOpen, setIsUserDetailsOpen] = useState(false);
  const [isEditRoleOpen, setIsEditRoleOpen] = useState(false);
  const pageSize = 10;

  // Fetch users
  const { data, isLoading } = useQuery({
    queryKey: ['/api/admin/users', currentPage, pageSize, roleFilter, statusFilter, searchQuery],
    queryFn: getQueryFn({ on401: "throw" })
  });

  // Change role mutation
  const changeRoleMutation = useMutation({
    mutationFn: async ({ userId, role }: { userId: number, role: UserRole }) => {
      const res = await apiRequest('PATCH', `/api/admin/users/${userId}/role`, { role });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/users'] });
      toast({
        title: "Role updated",
        description: "The user's role has been updated successfully.",
      });
      setIsEditRoleOpen(false);
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to update role",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  // Ban user mutation
  const banUserMutation = useMutation({
    mutationFn: async ({ userId, isBanned }: { userId: number, isBanned: boolean }) => {
      const res = await apiRequest('PATCH', `/api/admin/users/${userId}/status`, { isBanned });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/users'] });
      toast({
        title: "User status updated",
        description: "The user's status has been updated successfully.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to update status",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  // Delete user mutation
  const deleteUserMutation = useMutation({
    mutationFn: async (userId: number) => {
      await apiRequest('DELETE', `/api/admin/users/${userId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/users'] });
      toast({
        title: "User deleted",
        description: "The user has been deleted successfully.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to delete user",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  // Handle role change
  const handleRoleChange = (userId: number, role: UserRole) => {
    changeRoleMutation.mutate({ userId, role });
  };

  // Handle ban user
  const handleToggleBan = (userId: number, currentStatus: boolean) => {
    banUserMutation.mutate({ userId, isBanned: !currentStatus });
  };

  // Handle delete user
  const handleDeleteUser = (userId: number) => {
    if (window.confirm("Are you sure you want to delete this user? This action cannot be undone.")) {
      deleteUserMutation.mutate(userId);
    }
  };

  // Handle opening user details
  const handleOpenUserDetails = (user: any) => {
    setSelectedUser(user);
    setIsUserDetailsOpen(true);
  };

  // Handle opening edit role dialog
  const handleOpenEditRole = (user: any) => {
    setSelectedUser(user);
    setIsEditRoleOpen(true);
  };

  // Mock data for demo
  const mockUsers = [
    {
      id: 1,
      username: "adminuser",
      email: "admin@example.com",
      role: UserRole.ADMIN,
      avatarUrl: null,
      createdAt: new Date(2023, 0, 15),
      lastLoginAt: new Date(2023, 4, 25),
      isBanned: false,
      bio: "Platform administrator",
    },
    {
      id: 2,
      username: "gamedev1",
      email: "gamedev1@example.com",
      role: UserRole.GAME_DEVELOPER,
      avatarUrl: null,
      createdAt: new Date(2023, 1, 20),
      lastLoginAt: new Date(2023, 4, 24),
      isBanned: false,
      bio: "Indie game developer specializing in puzzle games",
      stats: {
        totalGames: 5,
        publishedGames: 3,
        totalPlays: 15240,
        averageRating: 4.2
      },
      games: [
        {
          id: 101,
          title: "Block Puzzle",
          thumbnailUrl: null,
          status: "published",
          players: 8450,
          rating: 4.5
        },
        {
          id: 102,
          title: "Word Master",
          thumbnailUrl: null,
          status: "published",
          players: 4200,
          rating: 4.2
        },
        {
          id: 103,
          title: "Memory Challenge",
          thumbnailUrl: null,
          status: "published",
          players: 2590,
          rating: 3.9
        }
      ]
    },
    {
      id: 3,
      username: "gamedev2",
      email: "gamedev2@example.com",
      role: UserRole.GAME_DEVELOPER,
      avatarUrl: null,
      createdAt: new Date(2023, 2, 5),
      lastLoginAt: new Date(2023, 4, 23),
      isBanned: false,
      bio: "Game developer focused on action games",
      stats: {
        totalGames: 2,
        publishedGames: 2,
        totalPlays: 9820,
        averageRating: 4.0
      },
      games: [
        {
          id: 104,
          title: "Space Shooter",
          thumbnailUrl: null,
          status: "published",
          players: 6250,
          rating: 4.1
        },
        {
          id: 105,
          title: "Zombie Survival",
          thumbnailUrl: null,
          status: "published",
          players: 3570,
          rating: 3.9
        }
      ]
    },
    {
      id: 4,
      username: "player1",
      email: "player1@example.com",
      role: UserRole.PLAYER,
      avatarUrl: null,
      createdAt: new Date(2023, 1, 10),
      lastLoginAt: new Date(2023, 4, 25),
      isBanned: false,
      stats: {
        gamesPlayed: 15,
        totalPlayTime: "14 hours",
        reviewsWritten: 8,
        favoriteCategory: "Puzzle"
      }
    },
    {
      id: 5,
      username: "player2",
      email: "player2@example.com",
      role: UserRole.PLAYER,
      avatarUrl: null,
      createdAt: new Date(2023, 2, 18),
      lastLoginAt: new Date(2023, 4, 24),
      isBanned: true,
      flags: [
        {
          id: "f1",
          type: "Inappropriate Behavior",
          description: "Posting inappropriate comments in game reviews",
          severity: "high",
          createdAt: new Date(2023, 4, 20)
        }
      ],
      stats: {
        gamesPlayed: 7,
        totalPlayTime: "5 hours",
        reviewsWritten: 3,
        favoriteCategory: "Action"
      }
    }
  ];

  // Mock pagination data
  const mockPagination = {
    totalUsers: 42,
    totalPages: 5,
    currentPage: currentPage,
    hasNextPage: currentPage < 5,
    hasPreviousPage: currentPage > 1
  };

  // Use real data when available, otherwise use mock data
  const users = data?.users || mockUsers;
  const pagination = data?.pagination || mockPagination;

  return (
    <DashboardLayout activeTab="admin-users">
      <div className="flex flex-col gap-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">User Management</h1>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>All Users</CardTitle>
            <CardDescription>
              Manage users and their permissions
            </CardDescription>
            <div className="mt-4 flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search users..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-8"
                />
              </div>
              <div className="flex flex-wrap gap-2">
                <Select value={roleFilter} onValueChange={setRoleFilter as any}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Filter by role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All Roles</SelectItem>
                    <SelectItem value={UserRole.ADMIN}>Admins</SelectItem>
                    <SelectItem value={UserRole.GAME_DEVELOPER}>Game Developers</SelectItem>
                    <SelectItem value={UserRole.PLAYER}>Players</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={statusFilter} onValueChange={setStatusFilter as any}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All Statuses</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="banned">Banned</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Registered</TableHead>
                    <TableHead>Last Login</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell className="font-medium">
                        <div className="flex items-center space-x-3">
                          <div className="h-8 w-8 bg-primary/10 rounded-full flex items-center justify-center">
                            {user.avatarUrl ? (
                              <img
                                src={user.avatarUrl}
                                alt={user.username}
                                className="h-full w-full rounded-full object-cover"
                              />
                            ) : (
                              <User className="h-4 w-4 text-primary" />
                            )}
                          </div>
                          <div>
                            <div className="font-medium">{user.username}</div>
                            <div className="text-xs text-muted-foreground">{user.email}</div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>{getUserRoleBadge(user.role)}</TableCell>
                      <TableCell>
                        {user.isBanned ? (
                          <Badge variant="destructive">Banned</Badge>
                        ) : (
                          <Badge variant="outline" className="bg-green-500 text-white">Active</Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        {format(new Date(user.createdAt), 'MMM d, yyyy')}
                      </TableCell>
                      <TableCell>
                        {user.lastLoginAt
                          ? format(new Date(user.lastLoginAt), 'MMM d, yyyy')
                          : 'Never'
                        }
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                              <span className="sr-only">Open menu</span>
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleOpenUserDetails(user)}>
                              <Eye className="mr-2 h-4 w-4" />
                              View Details
                            </DropdownMenuItem>
                            
                            {user.role !== UserRole.ADMIN && (
                              <DropdownMenuItem onClick={() => handleOpenEditRole(user)}>
                                <UserCog className="mr-2 h-4 w-4" />
                                Edit Role
                              </DropdownMenuItem>
                            )}
                            
                            <DropdownMenuItem 
                              onClick={() => handleToggleBan(user.id, user.isBanned)}
                              className={user.isBanned ? "text-green-500" : "text-red-500"}
                            >
                              {user.isBanned ? (
                                <>
                                  <CheckCircle className="mr-2 h-4 w-4" />
                                  Unban User
                                </>
                              ) : (
                                <>
                                  <Ban className="mr-2 h-4 w-4" />
                                  Ban User
                                </>
                              )}
                            </DropdownMenuItem>
                            
                            <DropdownMenuSeparator />
                            
                            <DropdownMenuItem 
                              onClick={() => handleDeleteUser(user.id)}
                              className="text-red-500"
                            >
                              <UserX className="mr-2 h-4 w-4" />
                              Delete User
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}

            <div className="mt-6 flex justify-between items-center">
              <div className="text-sm text-muted-foreground">
                Showing {(currentPage - 1) * pageSize + 1}-
                {Math.min(currentPage * pageSize, pagination.totalUsers)} of {pagination.totalUsers} users
              </div>
              
              <Pagination>
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious
                      href="#"
                      onClick={(e) => {
                        e.preventDefault();
                        if (pagination.hasPreviousPage) {
                          setCurrentPage(currentPage - 1);
                        }
                      }}
                      className={!pagination.hasPreviousPage ? 'pointer-events-none opacity-50' : ''}
                    />
                  </PaginationItem>
                  
                  {Array.from({ length: pagination.totalPages }).map((_, i) => (
                    <PaginationItem key={i} className={`hidden md:inline-block ${
                      Math.abs(i + 1 - currentPage) > 2 && i + 1 !== 1 && i + 1 !== pagination.totalPages
                        ? 'hidden md:hidden'
                        : ''
                    }`}>
                      {Math.abs(i + 1 - currentPage) > 2 && i + 1 !== 1 && i + 1 !== pagination.totalPages ? (
                        i + 1 === 2 || i + 1 === pagination.totalPages - 1 ? (
                          <PaginationEllipsis />
                        ) : null
                      ) : (
                        <PaginationLink
                          href="#"
                          onClick={(e) => {
                            e.preventDefault();
                            setCurrentPage(i + 1);
                          }}
                          isActive={currentPage === i + 1}
                        >
                          {i + 1}
                        </PaginationLink>
                      )}
                    </PaginationItem>
                  ))}
                  
                  <PaginationItem>
                    <PaginationNext
                      href="#"
                      onClick={(e) => {
                        e.preventDefault();
                        if (pagination.hasNextPage) {
                          setCurrentPage(currentPage + 1);
                        }
                      }}
                      className={!pagination.hasNextPage ? 'pointer-events-none opacity-50' : ''}
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* User details dialog */}
      <UserDetailsDialog
        open={isUserDetailsOpen}
        onOpenChange={setIsUserDetailsOpen}
        user={selectedUser}
      />
      
      {/* Edit user role dialog */}
      <EditUserRoleDialog
        open={isEditRoleOpen}
        onOpenChange={setIsEditRoleOpen}
        user={selectedUser}
        onSave={handleRoleChange}
        isLoading={changeRoleMutation.isPending}
      />
    </DashboardLayout>
  );
};

export default UsersManagementPage;