'use client';
import { useState, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Thread, PaginatedResponse } from '@/types';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { timeAgo } from '@/lib/utils';
import { Search, MessageSquare, Eye } from 'lucide-react';

function SearchResults() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [query, setQuery] = useState(searchParams.get('q') || '');
  const q = searchParams.get('q') || '';
  const type = searchParams.get('type') || 'threads';

  const { data, isLoading } = useQuery<PaginatedResponse<Thread>>({
    queryKey: ['search', q, type],
    queryFn: () => api.get(`/search?q=${encodeURIComponent(q)}&type=${type}`),
    enabled: q.length > 0,
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) router.push(`/search?q=${encodeURIComponent(query.trim())}&type=${type}`);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-4">Search</h1>
        <form onSubmit={handleSearch} className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search threads, posts, users..."
              className="pl-9"
            />
          </div>
          <Button type="submit">Search</Button>
        </form>
      </div>

      {q && (
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Search type:</span>
          {['threads', 'posts', 'users'].map((t) => (
            <button
              key={t}
              onClick={() => router.push(`/search?q=${encodeURIComponent(q)}&type=${t}`)}
              className={`text-sm px-3 py-1 rounded-full border transition-colors ${type === t ? 'bg-primary text-primary-foreground border-primary' : 'hover:bg-muted'}`}
            >
              {t}
            </button>
          ))}
        </div>
      )}

      {q && isLoading && (
        <div className="space-y-3">
          {[1,2,3].map((i) => <div key={i} className="h-20 bg-muted rounded animate-pulse" />)}
        </div>
      )}

      {data && (
        <div className="space-y-3">
          <p className="text-sm text-muted-foreground">{data.meta.total} results for &quot;{q}&quot;</p>
          {data.data.length === 0 ? (
            <Card><CardContent className="pt-6 text-center py-12 text-muted-foreground">No results found.</CardContent></Card>
          ) : (
            <Card>
              <CardContent className="p-0">
                {(data.data as Thread[]).map((thread) => (
                  <div key={thread.id} className="p-4 border-b last:border-b-0 hover:bg-muted/30">
                    <Link href={`/threads/${thread.slug}`} className="font-medium hover:text-primary">
                      {thread.title}
                    </Link>
                    <div className="flex items-center gap-3 text-xs text-muted-foreground mt-1">
                      <span>by {thread.author?.username}</span>
                      <span>{timeAgo(thread.createdAt)}</span>
                      {thread.forum && (
                        <Link href={`/forums/${thread.forum.slug}`} className="hover:underline">
                          {thread.forum.name}
                        </Link>
                      )}
                      {thread.tags?.map((tt) => (
                        <Badge key={tt.tag.id} variant="outline" className="text-xs">{tt.tag.name}</Badge>
                      ))}
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={<div className="h-96 bg-muted rounded animate-pulse" />}>
      <SearchResults />
    </Suspense>
  );
}
