'use client';
import { useQuery } from '@tanstack/react-query';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { api } from '@/lib/api';
import { User, Thread, PaginatedResponse } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { formatDate, timeAgo } from '@/lib/utils';
import { MessageSquare, Calendar, Star, FileText } from 'lucide-react';

export default function UserProfilePage() {
  const { username } = useParams();

  const { data: user, isLoading } = useQuery<User>({
    queryKey: ['user', username],
    queryFn: () => api.get(`/users/${username}`),
  });

  const { data: threads } = useQuery<PaginatedResponse<Thread>>({
    queryKey: ['user-threads', username],
    queryFn: () => api.get(`/users/${username}/threads`),
    enabled: !!user,
  });

  if (isLoading) {
    return <div className="h-64 bg-muted rounded animate-pulse" />;
  }

  if (!user) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">User not found</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div className="space-y-4">
        <Card>
          <CardContent className="pt-6 text-center">
            {user.avatar ? (
              <img src={user.avatar} alt={user.username} className="w-24 h-24 rounded-full mx-auto mb-4 object-cover" />
            ) : (
              <div className="w-24 h-24 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-3xl font-bold mx-auto mb-4">
                {user.username.charAt(0).toUpperCase()}
              </div>
            )}
            <h1 className="text-xl font-bold">{user.displayName || user.username}</h1>
            <p className="text-muted-foreground text-sm">@{user.username}</p>
            <Badge className="mt-2" variant="secondary">{user.role}</Badge>
            {user.bio && <p className="text-sm mt-3 text-muted-foreground">{user.bio}</p>}
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-4 space-y-3">
            <div className="flex items-center gap-2 text-sm">
              <Star className="h-4 w-4 text-yellow-500" />
              <span className="font-medium">{user.reputation}</span>
              <span className="text-muted-foreground">reputation</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <MessageSquare className="h-4 w-4 text-primary" />
              <span className="font-medium">{user.postCount}</span>
              <span className="text-muted-foreground">posts</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground">Joined {formatDate(user.createdAt)}</span>
            </div>
          </CardContent>
        </Card>

        {user.badges && user.badges.length > 0 && (
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Badges</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-wrap gap-2">
              {user.badges.map((ub) => (
                <span
                  key={ub.badge.id}
                  title={ub.badge.description}
                  className="flex items-center gap-1 text-xs px-2 py-1 rounded-full border"
                  style={{ borderColor: ub.badge.color || undefined }}
                >
                  {ub.badge.icon} {ub.badge.name}
                </span>
              ))}
            </CardContent>
          </Card>
        )}
      </div>

      <div className="md:col-span-2 space-y-4">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Recent Threads
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {!threads || threads.data.length === 0 ? (
              <p className="p-4 text-sm text-muted-foreground">No threads yet.</p>
            ) : (
              <div className="divide-y">
                {threads.data.map((t: Thread) => (
                  <div key={t.id} className="px-4 py-3">
                    <Link href={`/threads/${t.slug}`} className="text-sm font-medium hover:text-primary">
                      {t.title}
                    </Link>
                    <p className="text-xs text-muted-foreground mt-0.5">{timeAgo(t.createdAt)} · {t._count?.posts || 0} replies</p>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
