'use client';
import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { useAuth } from '@/hooks/useAuth';
import { User, PaginatedResponse } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { formatDate } from '@/lib/utils';
import Link from 'next/link';

export default function AdminUsersPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);

  useEffect(() => {
    if (!isLoading && (!user || user.role !== 'ADMINISTRATOR')) router.push('/');
  }, [user, isLoading, router]);

  const { data, refetch } = useQuery<PaginatedResponse<any>>({
    queryKey: ['admin-users', page, search],
    queryFn: () => api.get(`/admin/users?page=${page}&limit=25${search ? `&search=${search}` : ''}`),
    enabled: user?.role === 'ADMINISTRATOR',
  });

  const handleRoleChange = async (userId: string, role: string) => {
    await api.put(`/admin/users/${userId}/role`, { role });
    refetch();
  };

  if (!user || user.role !== 'ADMINISTRATOR') return null;

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <Link href="/admin" className="text-muted-foreground text-sm hover:underline">← Admin</Link>
        <h1 className="text-2xl font-bold">Manage Users</h1>
      </div>

      <div className="flex gap-2">
        <Input
          placeholder="Search users..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-sm"
        />
        <Button onClick={() => { setPage(1); refetch(); }}>Search</Button>
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b bg-muted/50">
                <tr>
                  <th className="text-left p-3">User</th>
                  <th className="text-left p-3">Email</th>
                  <th className="text-left p-3">Role</th>
                  <th className="text-left p-3">Posts</th>
                  <th className="text-left p-3">Status</th>
                  <th className="text-left p-3">Joined</th>
                  <th className="text-left p-3">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {data?.data.map((u: any) => (
                  <tr key={u.id} className="hover:bg-muted/30">
                    <td className="p-3 font-medium">
                      <Link href={`/users/${u.username}`} className="hover:underline">
                        {u.username}
                      </Link>
                    </td>
                    <td className="p-3 text-muted-foreground">{u.email}</td>
                    <td className="p-3">
                      <Badge variant="secondary">{u.role}</Badge>
                    </td>
                    <td className="p-3">{u.postCount}</td>
                    <td className="p-3">
                      {u.isBanned && <Badge variant="destructive">Banned</Badge>}
                      {u.isSuspended && <Badge variant="outline">Suspended</Badge>}
                      {!u.isBanned && !u.isSuspended && <Badge variant="outline" className="text-green-600">Active</Badge>}
                    </td>
                    <td className="p-3 text-muted-foreground">{formatDate(u.createdAt)}</td>
                    <td className="p-3">
                      <select
                        value={u.role}
                        onChange={(e) => handleRoleChange(u.id, e.target.value)}
                        className="text-xs border rounded px-1 py-0.5 bg-background"
                        disabled={u.id === user.id}
                      >
                        {['MEMBER', 'TRUSTED_MEMBER', 'MODERATOR', 'ADMINISTRATOR'].map((r) => (
                          <option key={r} value={r}>{r}</option>
                        ))}
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {data && data.meta.totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <Button variant="outline" size="sm" disabled={page === 1} onClick={() => setPage(p => p - 1)}>Previous</Button>
          <span className="text-sm text-muted-foreground">Page {page} of {data.meta.totalPages}</span>
          <Button variant="outline" size="sm" disabled={page >= data.meta.totalPages} onClick={() => setPage(p => p + 1)}>Next</Button>
        </div>
      )}
    </div>
  );
}
