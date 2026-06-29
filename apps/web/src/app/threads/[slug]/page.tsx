'use client';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { api } from '@/lib/api';
import { Thread, Post, PaginatedResponse } from '@/types';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import PostCard from '@/components/post/PostCard';
import { useAuth } from '@/hooks/useAuth';
import { Lock, Pin, Eye, MessageSquare, Bookmark, Bell } from 'lucide-react';
import { timeAgo } from '@/lib/utils';

export default function ThreadPage() {
  const { slug } = useParams();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [replyContent, setReplyContent] = useState('');
  const [posting, setPosting] = useState(false);

  const { data: thread } = useQuery<Thread>({
    queryKey: ['thread', slug],
    queryFn: () => api.get(`/threads/${slug}`),
  });

  const { data: postsData, refetch } = useQuery<PaginatedResponse<Post>>({
    queryKey: ['posts', thread?.id, page],
    queryFn: () => api.get(`/posts/thread/${thread?.id}?page=${page}&limit=20`),
    enabled: !!thread?.id,
  });

  const handleReply = async () => {
    if (!replyContent.trim() || !thread) return;
    setPosting(true);
    try {
      await api.post('/posts', { threadId: thread.id, content: replyContent });
      setReplyContent('');
      refetch();
    } finally {
      setPosting(false);
    }
  };

  const handleSubscribe = () => thread && api.post(`/threads/${thread.id}/subscribe`);
  const handleBookmark = () => thread && api.post(`/threads/${thread.id}/bookmark`);

  const isLocked = thread?.status === 'LOCKED';
  const canReply = user && !isLocked;

  return (
    <div className="space-y-4">
      {thread && (
        <>
          <div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2 flex-wrap">
              <Link href="/forums" className="hover:underline">Forums</Link>
              <span>/</span>
              {thread.forum?.category && (
                <>
                  <span>{thread.forum.category.name}</span>
                  <span>/</span>
                </>
              )}
              {thread.forum && (
                <>
                  <Link href={`/forums/${thread.forum.slug}`} className="hover:underline">{thread.forum.name}</Link>
                  <span>/</span>
                </>
              )}
              <span className="text-foreground truncate max-w-xs">{thread.title}</span>
            </div>

            <div className="flex items-start justify-between gap-4">
              <div className="flex items-center gap-2 flex-wrap">
                {thread.isPinned && <Pin className="h-4 w-4 text-primary flex-shrink-0" />}
                {isLocked && <Lock className="h-4 w-4 text-muted-foreground flex-shrink-0" />}
                <h1 className="text-2xl font-bold">{thread.title}</h1>
                {thread.type !== 'STANDARD' && (
                  <Badge>{thread.type}</Badge>
                )}
              </div>
              {user && (
                <div className="flex gap-2 flex-shrink-0">
                  <Button size="sm" variant="outline" onClick={handleBookmark} className="gap-1.5">
                    <Bookmark className="h-3.5 w-3.5" />
                    <span className="hidden sm:inline">Bookmark</span>
                  </Button>
                  <Button size="sm" variant="outline" onClick={handleSubscribe} className="gap-1.5">
                    <Bell className="h-3.5 w-3.5" />
                    <span className="hidden sm:inline">Subscribe</span>
                  </Button>
                </div>
              )}
            </div>

            <div className="flex items-center gap-4 text-sm text-muted-foreground mt-2 flex-wrap">
              <span>by <Link href={`/users/${thread.author.username}`} className="text-foreground hover:underline">{thread.author.displayName || thread.author.username}</Link></span>
              <span>{timeAgo(thread.createdAt)}</span>
              <span className="flex items-center gap-1"><Eye className="h-3.5 w-3.5" /> {thread.viewCount}</span>
              <span className="flex items-center gap-1"><MessageSquare className="h-3.5 w-3.5" /> {thread._count?.posts || 0} replies</span>
              {thread.tags?.map((tt) => (
                <Badge key={tt.tag.id} variant="outline" className="text-xs">{tt.tag.name}</Badge>
              ))}
            </div>
          </div>

          {isLocked && (
            <div className="flex items-center gap-2 p-3 bg-muted/50 rounded-md text-sm text-muted-foreground border">
              <Lock className="h-4 w-4" />
              This thread has been locked and no longer accepts new replies.
            </div>
          )}

          <Card>
            <CardContent className="p-0">
              {postsData?.data.map((post) => (
                <PostCard
                  key={post.id}
                  post={post}
                  onUpdated={() => refetch()}
                  threadLocked={isLocked}
                />
              ))}
            </CardContent>
          </Card>

          {postsData && postsData.meta.totalPages > 1 && (
            <div className="flex items-center justify-center gap-2">
              <Button variant="outline" size="sm" disabled={page === 1} onClick={() => setPage((p) => p - 1)}>
                Previous
              </Button>
              <span className="text-sm text-muted-foreground">
                Page {page} of {postsData.meta.totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                disabled={page >= postsData.meta.totalPages}
                onClick={() => setPage((p) => p + 1)}
              >
                Next
              </Button>
            </div>
          )}

          {canReply && (
            <Card>
              <CardContent className="pt-4 space-y-3">
                <h3 className="font-semibold">Post a Reply</h3>
                <Textarea
                  placeholder="Write your reply... (Markdown supported)"
                  value={replyContent}
                  onChange={(e) => setReplyContent(e.target.value)}
                  rows={5}
                />
                <div className="flex justify-end">
                  <Button onClick={handleReply} disabled={posting || !replyContent.trim()}>
                    {posting ? 'Posting...' : 'Post Reply'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {!user && (
            <Card>
              <CardContent className="pt-4 text-center py-8">
                <p className="text-muted-foreground mb-4">
                  <Link href="/login" className="text-primary hover:underline">Sign in</Link> or{' '}
                  <Link href="/register" className="text-primary hover:underline">register</Link> to post a reply.
                </p>
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  );
}
