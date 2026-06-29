'use client';
import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Category, Forum } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/hooks/useAuth';

export default function NewThreadPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useAuth();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [forumId, setForumId] = useState(searchParams.get('forum') || '');
  const [tags, setTags] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const { data: categories } = useQuery<Category[]>({
    queryKey: ['forums'],
    queryFn: () => api.get('/forums'),
  });

  if (!user) {
    return (
      <Card className="max-w-lg mx-auto">
        <CardContent className="pt-6 text-center py-12">
          <p>You must be signed in to create a thread.</p>
        </CardContent>
      </Card>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!forumId || !title.trim() || !content.trim()) return;
    setSubmitting(true);
    setError('');
    try {
      const tagList = tags.split(',').map((t) => t.trim().toLowerCase()).filter(Boolean);
      const thread = await api.post<{ slug: string }>('/threads', {
        forumId,
        title: title.trim(),
        content: content.trim(),
        tags: tagList.length ? tagList : undefined,
      });
      router.push(`/threads/${thread.slug}`);
    } catch (err: any) {
      setError(err.message || 'Failed to create thread');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Card className="max-w-3xl mx-auto">
      <CardHeader>
        <CardTitle>Create New Thread</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="forum">Forum</Label>
            <select
              id="forum"
              value={forumId}
              onChange={(e) => setForumId(e.target.value)}
              required
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <option value="">Select a forum...</option>
              {categories?.map((cat) =>
                cat.forums.map((forum: Forum) => (
                  <option key={forum.id} value={forum.id}>
                    {cat.name} → {forum.name}
                  </option>
                )),
              )}
            </select>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Thread title..."
              required
              minLength={3}
              maxLength={200}
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="content">Content</Label>
            <Textarea
              id="content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Write your post... (Markdown supported)"
              required
              rows={10}
            />
            <p className="text-xs text-muted-foreground">Supports Markdown: **bold**, *italic*, `code`, etc.</p>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="tags">Tags (optional)</Label>
            <Input
              id="tags"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              placeholder="Comma-separated tags: help, question, general"
            />
          </div>

          {error && <p className="text-sm text-destructive">{error}</p>}

          <div className="flex gap-3 justify-end">
            <Button type="button" variant="outline" onClick={() => router.back()}>
              Cancel
            </Button>
            <Button type="submit" disabled={submitting}>
              {submitting ? 'Creating...' : 'Create Thread'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
