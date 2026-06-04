import { db } from '@/lib/db';
import { 
  Users, 
  Search, 
  MoreVertical, 
  Mail, 
  Calendar,
  ShieldCheck,
  Ban,
  Trash2
} from 'lucide-react';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';

export const dynamic = "force-dynamic";

export default async function UserManagementPage() {
  const users = await db.user.findMany({
    include: {
      _count: {
        select: { reports: true, chatSessions: true }
      }
    },
    orderBy: { createdAt: 'desc' }
  });

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">User Management</h1>
          <p className="text-muted-foreground">Manage accounts, monitor activity and roles.</p>
        </div>
        <Button className="gap-2">
          <Mail className="size-4" />
          Broadcast Email
        </Button>
      </div>

      {/* Filters & Search */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2.5 top-2.5 size-4 text-muted-foreground" />
          <Input placeholder="Search users by name or email..." className="pl-9" />
        </div>
        <Button variant="outline">Filter: All Users</Button>
        <Button variant="outline">Sort: Newest</Button>
      </div>

      {/* Users Table */}
      <div className="rounded-xl border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[250px]">User</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Activity</TableHead>
              <TableHead>Joined</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map((user) => (
              <TableRow key={user.id}>
                <TableCell>
                  <div className="flex flex-col">
                    <span className="font-medium">{user.name || 'Unknown User'}</span>
                    <span className="text-xs text-muted-foreground">{user.email}</span>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant={user.status === 'active' ? 'default' : 'secondary'}>
                    {user.status}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    {user.role === 'admin' && <ShieldCheck className="size-4 text-primary" />}
                    <span className="capitalize">{user.role}</span>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-4 text-xs">
                    <div className="flex flex-col">
                      <span className="font-semibold text-foreground">{user._count.reports}</span>
                      <span className="text-muted-foreground">Reports</span>
                    </div>
                    <div className="flex flex-col">
                      <span className="font-semibold text-foreground">{user._count.chatSessions}</span>
                      <span className="text-muted-foreground">Chats</span>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Calendar className="size-3" />
                    {new Date(user.createdAt).toLocaleDateString()}
                  </div>
                </TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreVertical className="size-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem className="gap-2">
                        <ShieldCheck className="size-4" /> Make Admin
                      </DropdownMenuItem>
                      <DropdownMenuItem className="gap-2 text-amber-600">
                        <Ban className="size-4" /> Disable Account
                      </DropdownMenuItem>
                      <DropdownMenuItem className="gap-2 text-destructive">
                        <Trash2 className="size-4" /> Delete User
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
            {users.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="h-32 text-center text-muted-foreground">
                  No users found in the system.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
