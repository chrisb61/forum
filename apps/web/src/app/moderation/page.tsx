'use client';
import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { useAuth } from '@/hooks/useAuth';
import { PaginatedResponse } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { timeAgo } from '@/lib/utils';

export default function ModerationPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const [filter, setFilter] = useState('PENDING');

  useEffect(() => {
    if (!isLoading && (!user || !['MODERATOR', 'ADMINISTRATOR'].includes(user.role))) {
      router.push('/');
    }
  }, [user, isLoading, router]);

  const { data, refetch } = useQuery<PaginatedResponse<any>>({
    queryKey: ['reports', filter],
    queryFn: () => api.get(`/reports?status=${filter}`),
    enabled: !!user && ['MODERATOR', 'ADMINISTRATOR'].includes(user.role),
  });

  const resolve = async (id: string, status: string) => {
    await api.put(`/reports/${id}/resolve`, { status });
    refetch();
  };

  if (!user) return null;

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Moderation Queue</h1>

      <div className="flex gap-2">
        {['PENDING', 'REVIEWING', 'RESOLVED', 'DISMISSED'].map((s) => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            className={`text-sm px-3 py-1 rounded-full border transition-colors ${filter === s ? 'bg-primary text-primary-foreground border-primary' : 'hover:bg-muted'}`}
          >
            {s}
          </button>
        ))}
      </div>

      <Card>
        <CardContent className="p-0">
          {!data || data.data.length === 0 ? (
            <p className="p-8 text-center text-muted-foreground">No {filter.toLowerCase()} reports.</p>
          ) : (
            <div className="divide-y">
              {data.data.map((report: any) => (
                <div key={report.id} className="p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">{report.reason}</Badge>
                        <Badge variant="secondary">{report.targetType}</Badge>
                        <span className="text-xs text-muted-foreground">{timeAgo(report.createdAt)}</span>
                      </div>
                      {report.details && (
                        <p className="text-sm text-muted-foreground">{report.details}</p>
                      )}
                      <p className="text-xs text-muted-foreground">
                        Reported by: <span className="font-medium">{report.reporter?.username}</span>
                      </p>
                    </div>
                    {report.status === 'PENDING' && (
                      <div className="flex gap-2 flex-shrink-0">
                        <Button size="sm" variant="outline" onClick={() => resolve(report.id, 'RESOLVED')}>
                          Resolve
                        </Button>
                        <Button size="sm" variant="ghost" onClick={() => resolve(report.id, 'DISMISSED')}>
                          Dismiss
                        </Button>
                      </div>
                    )}
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
