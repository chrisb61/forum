'use client';
import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { api } from '@/lib/api';
import { Forum, Thread, PaginatedResponse } from '@/types';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Pin, Lock, MessageSquare, Eye, Plus } from 'lucide-react';
import { timeAgo } from '@/lib/utils';
import { useAuth } from '@/hooks/useAuth';
import { useState } from 'react';

export default function ForumPage() {
  const { slug } = useParams();
  const { user } = useAuth();
  const [page, setPage] = useState(1);

  const { data: forum } = useQuery<Forum>({
    queryKey: ['forum', slug],
    queryFn: () => api.get(`/forums/${slug}`),
  });

  const { data: threadsData, isLoading } = useQuery<PaginatedResponse<Thread>>({
    queryKey: ['threads', forum?.id, page],
    queryFn: () => api.get(`/threads/forum/${forum?.id}?page=${page}&limit=25`),
    enabled: !!forum?.id,
  });

  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
            <Link href="/forums" className="hover:underline">Forums</Link>
            <span>/</span>
            <span>{forum?.name}</span>
          </div>
          <h1 className="text-3xl font-bold">{forum?.name}</h1>
          {forum?.description && (
            <p className="text-muted-foreground mt-1">{forum.description}</p>
          )}
        </div>
        {user && (
          <Link href={`/threads/new?forum=${forum?.id}`}>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              New Thread
            </Button>
          </Link>
        )}
      </div>

      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-6 space-y-3">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="h-16 bg-muted rounded animate-pulse" />
              ))}
            </div>
          ) : threadsData?.data.length === 0 ? (
            <div className="p-12 text-center text-muted-foreground">
              <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-30" />
              <p>No threads yet. Be the first to start a discussion!</p>
            </div>
          ) : (
            <div className="divide-y">
              {threadsData?.data.map((thread) => (
                <div key={thread.id} className="flex items-start gap-4 px-4 py-3 hover:bg-muted/30 transition-colors">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      {thread.isPinned && <Pin className="h-3.5 w-3.5 text-primary flex-shrink-0" />}
                      {thread.status === 'LOCKED' && <Lock className="h-3.5 w-3.5 text-muted-foreground flex-shrink-0" />}
                      <Link
                        href={`/threads/${thread.slug}`}
                        className="font-medium hover:text-primary transition-colors truncate"
                      >
                        {thread.title}
                      </Link>
                      {thread.type !== 'STANDARD' && (
                        <Badge variant="secondary" className="text-xs">{thread.type}</Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-3 text-xs text-muted-foreground mt-1">
                      <span>by <Link href={`/users/${thread.author.username}`} className="hover:underline">{thread.author.displayName || thread.author.username}</Link></span>
                      <span>{timeAgo(thread.createdAt)}</span>
                      {thread.tags?.map((tt) => (
                        <Badge key={tt.tag.id} variant="outline" className="text-xs">{tt.tag.name}</Badge>
                      ))}
                    </div>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground flex-shrink-0">
                    <span className="flex items-center gap-1">
                      <MessageSquare className="h-3.5 w-3.5" />
                      {thread._count?.posts || 0}
                    </span>
                    <span className="flex items-center gap-1">
                      <Eye className="h-3.5 w-3.5" />
                      {thread.viewCount}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {threadsData && threadsData.meta.totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <Button variant="outline" size="sm" disabled={page === 1} onClick={() => setPage((p) => p - 1)}>
            Previous
          </Button>
          <span className="text-sm text-muted-foreground">
            Page {page} of {threadsData.meta.totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            disabled={page >= threadsData.meta.totalPages}
            onClick={() => setPage((p) => p + 1)}
          >
            Next
          </Button>
        </div>
      )}
    </div>
  );
}
