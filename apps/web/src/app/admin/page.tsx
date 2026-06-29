'use client';
import { useQuery } from '@tanstack/react-query';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, MessageSquare, FileText, AlertTriangle } from 'lucide-react';
import Link from 'next/link';

interface DashboardStats {
  users: { total: number; newToday: number; activeLastWeek: number };
  content: { threads: number; posts: number; newPostsToday: number };
  moderation: { pendingReports: number };
}

export default function AdminDashboard() {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && (!user || user.role !== 'ADMINISTRATOR')) router.push('/');
  }, [user, isLoading, router]);

  const { data: stats } = useQuery<DashboardStats>({
    queryKey: ['admin-dashboard'],
    queryFn: () => api.get('/admin/dashboard'),
    enabled: user?.role === 'ADMINISTRATOR',
  });

  if (!user || user.role !== 'ADMINISTRATOR') return null;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        <nav className="flex gap-3 text-sm">
          <Link href="/admin/users" className="text-primary hover:underline">Users</Link>
          <Link href="/admin/forums" className="text-primary hover:underline">Forums</Link>
          <Link href="/admin/settings" className="text-primary hover:underline">Settings</Link>
          <Link href="/moderation" className="text-primary hover:underline">Moderation</Link>
        </nav>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <Users className="h-8 w-8 text-blue-500" />
              <div>
                <p className="text-2xl font-bold">{stats?.users.total ?? '—'}</p>
                <p className="text-xs text-muted-foreground">Total Users</p>
                {stats && <p className="text-xs text-green-600">+{stats.users.newToday} today</p>}
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <FileText className="h-8 w-8 text-purple-500" />
              <div>
                <p className="text-2xl font-bold">{stats?.content.threads ?? '—'}</p>
                <p className="text-xs text-muted-foreground">Threads</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <MessageSquare className="h-8 w-8 text-green-500" />
              <div>
                <p className="text-2xl font-bold">{stats?.content.posts ?? '—'}</p>
                <p className="text-xs text-muted-foreground">Posts</p>
                {stats && <p className="text-xs text-green-600">+{stats.content.newPostsToday} today</p>}
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <AlertTriangle className="h-8 w-8 text-red-500" />
              <div>
                <p className="text-2xl font-bold">{stats?.moderation.pendingReports ?? '—'}</p>
                <p className="text-xs text-muted-foreground">Pending Reports</p>
                {stats && stats.moderation.pendingReports > 0 && (
                  <Link href="/moderation" className="text-xs text-destructive hover:underline">Review</Link>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader><CardTitle>Quick Actions</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            <Link href="/admin/users" className="block text-sm text-primary hover:underline">→ Manage Users</Link>
            <Link href="/admin/forums" className="block text-sm text-primary hover:underline">→ Manage Forums</Link>
            <Link href="/admin/settings" className="block text-sm text-primary hover:underline">→ Site Settings</Link>
            <Link href="/moderation" className="block text-sm text-primary hover:underline">→ Review Reports</Link>
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Platform Stats</CardTitle></CardHeader>
          <CardContent className="space-y-2 text-sm text-muted-foreground">
            <p>Active users (last 7 days): <span className="text-foreground font-medium">{stats?.users.activeLastWeek ?? '—'}</span></p>
            <p>New posts today: <span className="text-foreground font-medium">{stats?.content.newPostsToday ?? '—'}</span></p>
            <p>New users today: <span className="text-foreground font-medium">{stats?.users.newToday ?? '—'}</span></p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
