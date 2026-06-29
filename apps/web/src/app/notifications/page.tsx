'use client';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import Link from 'next/link';
import { api } from '@/lib/api';
import { Notification, PaginatedResponse } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { timeAgo } from '@/lib/utils';
import { Bell, CheckCheck } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function NotificationsPage() {
  const { user, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!authLoading && !user) router.push('/login');
  }, [user, authLoading, router]);

  const { data, refetch } = useQuery<PaginatedResponse<Notification>>({
    queryKey: ['notifications'],
    queryFn: () => api.get('/notifications'),
    enabled: !!user,
  });

  const markAllRead = async () => {
    await api.put('/notifications/read-all');
    refetch();
  };

  const markRead = async (id: string) => {
    await api.put(`/notifications/${id}/read`);
    refetch();
  };

  const getNotifText = (n: Notification) => {
    switch (n.type) {
      case 'THREAD_REPLY': return 'Someone replied to a thread you subscribed to';
      case 'MENTION': return 'You were mentioned in a post';
      case 'DIRECT_MESSAGE': return 'You received a direct message';
      case 'BADGE_AWARDED': return 'You earned a new badge';
      default: return 'New notification';
    }
  };

  if (!user) return null;

  return (
    <div className="max-w-2xl mx-auto space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Notifications</h1>
        {data && data.data.some((n) => !n.readAt) && (
          <Button variant="outline" size="sm" onClick={markAllRead} className="gap-2">
            <CheckCheck className="h-4 w-4" />
            Mark all read
          </Button>
        )}
      </div>

      <Card>
        <CardContent className="p-0">
          {!data || data.data.length === 0 ? (
            <div className="p-12 text-center text-muted-foreground">
              <Bell className="h-12 w-12 mx-auto mb-4 opacity-30" />
              <p>No notifications yet</p>
            </div>
          ) : (
            <div className="divide-y">
              {data.data.map((n) => (
                <div
                  key={n.id}
                  className={`flex items-start gap-3 p-4 cursor-pointer hover:bg-muted/50 transition-colors ${!n.readAt ? 'bg-primary/5' : ''}`}
                  onClick={() => !n.readAt && markRead(n.id)}
                >
                  {!n.readAt && (
                    <div className="w-2 h-2 rounded-full bg-primary mt-2 flex-shrink-0" />
                  )}
                  <div className={!n.readAt ? '' : 'pl-5'}>
                    <p className="text-sm">{getNotifText(n)}</p>
                    {n.payload?.threadSlug && (
                      <Link href={`/threads/${n.payload.threadSlug}`} className="text-xs text-primary hover:underline" onClick={(e) => e.stopPropagation()}>
                        View thread
                      </Link>
                    )}
                    <p className="text-xs text-muted-foreground mt-1">{timeAgo(n.createdAt)}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
