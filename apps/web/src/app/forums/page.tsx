'use client';
import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { api } from '@/lib/api';
import { Category, Forum } from '@/types';
import { MessageSquare, FileText, Lock, ChevronRight } from 'lucide-react';

export default function ForumsPage() {
  const { data: categories, isLoading } = useQuery<Category[]>({
    queryKey: ['forums'],
    queryFn: () => api.get('/forums'),
  });

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-48 rounded-xl bg-muted animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold">Forums</h1>
        <p className="text-muted-foreground mt-1">Browse all discussion categories — gated to members only</p>
      </div>

      {categories?.map((category) => (
        <div key={category.id} className="rounded-xl border border-border overflow-hidden">

          {/* Category header band */}
          <div className="bg-primary/15 border-b-2 border-primary/40 px-6 py-4">
            <h2 className="text-base font-bold text-foreground tracking-wide uppercase"
                style={{ color: '#C9A96E' }}>
              {category.name}
            </h2>
            {category.description && (
              <p className="text-xs text-muted-foreground mt-0.5">{category.description}</p>
            )}
          </div>

          {/* Forum rows */}
          <div className="divide-y divide-border">
            {category.forums.map((forum: Forum, index: number) => (
              <Link
                key={forum.id}
                href={`/forums/${forum.slug}`}
                className={`flex items-center gap-4 px-6 py-4 transition-colors hover:bg-primary/5 group ${
                  index % 2 === 0 ? 'bg-card' : 'bg-muted/20'
                }`}
              >
                {/* Accent bar */}
                <div className="w-1 h-10 rounded-full bg-primary shrink-0" />

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors truncate">
                      {forum.name}
                    </h3>
                    {forum.isPrivate && (
                      <Lock className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                    )}
                  </div>
                  {forum.description && (
                    <p className="text-sm text-muted-foreground truncate mt-0.5">{forum.description}</p>
                  )}
                </div>

                <div className="flex items-center gap-5 text-sm text-muted-foreground shrink-0">
                  <span className="flex items-center gap-1.5">
                    <FileText className="h-4 w-4" />
                    <span className="font-medium">{forum.threadCount.toLocaleString()}</span>
                    <span className="hidden sm:inline">threads</span>
                  </span>
                  <span className="flex items-center gap-1.5">
                    <MessageSquare className="h-4 w-4" />
                    <span className="font-medium">{forum.postCount.toLocaleString()}</span>
                    <span className="hidden sm:inline">posts</span>
                  </span>
                  <ChevronRight className="h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              </Link>
            ))}

            {category.forums.length === 0 && (
              <p className="px-6 py-4 text-sm text-muted-foreground italic">No forums in this category yet.</p>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
