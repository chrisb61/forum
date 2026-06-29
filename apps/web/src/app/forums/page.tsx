'use client';
import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { api } from '@/lib/api';
import { Category, Forum } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MessageSquare, FileText, Lock } from 'lucide-react';

export default function ForumsPage() {
  const { data: categories, isLoading } = useQuery<Category[]>({
    queryKey: ['forums'],
    queryFn: () => api.get('/forums'),
  });

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2].map((i) => (
          <div key={i} className="h-48 rounded-lg bg-muted animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Forums</h1>
        <p className="text-muted-foreground mt-1">Browse all discussion categories</p>
      </div>

      {categories?.map((category) => (
        <Card key={category.id}>
          <CardHeader className="pb-2">
            <CardTitle className="text-xl">{category.name}</CardTitle>
            {category.description && (
              <p className="text-sm text-muted-foreground">{category.description}</p>
            )}
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y">
              {category.forums.map((forum: Forum) => (
                <Link
                  key={forum.id}
                  href={`/forums/${forum.slug}`}
                  className="flex items-center gap-4 px-6 py-4 hover:bg-muted/50 transition-colors"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold truncate">{forum.name}</h3>
                      {forum.isPrivate && (
                        <Lock className="h-3.5 w-3.5 text-muted-foreground flex-shrink-0" />
                      )}
                    </div>
                    {forum.description && (
                      <p className="text-sm text-muted-foreground truncate">{forum.description}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-6 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1.5">
                      <FileText className="h-4 w-4" />
                      <span>{forum.threadCount.toLocaleString()}</span>
                      <span className="hidden sm:inline">threads</span>
                    </span>
                    <span className="flex items-center gap-1.5">
                      <MessageSquare className="h-4 w-4" />
                      <span>{forum.postCount.toLocaleString()}</span>
                      <span className="hidden sm:inline">posts</span>
                    </span>
                  </div>
                </Link>
              ))}
              {category.forums.length === 0 && (
                <p className="px-6 py-4 text-sm text-muted-foreground">No forums in this category.</p>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
