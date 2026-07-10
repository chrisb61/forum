'use client';
import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { useAuth } from '@/hooks/useAuth';
import { PaginatedResponse } from '@/types';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { timeAgo } from '@/lib/utils';
import { AlertTriangle, FileText, GraduationCap } from 'lucide-react';

export default function ModerationPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const [filter, setFilter] = useState('PENDING');
  const [activeTab, setActiveTab] = useState<'reports' | 'library' | 'courses'>('reports');

  useEffect(() => {
    if (!isLoading && (!user || !['MODERATOR', 'ADMINISTRATOR'].includes(user.role))) {
      router.push('/');
    }
  }, [user, isLoading, router]);

  const { data, refetch } = useQuery<PaginatedResponse<any>>({
    queryKey: ['reports', filter],
    queryFn: () => api.get(`/reports?status=${filter}`),
    enabled: !!user && activeTab === 'reports',
  });

  const { data: pendingResources = [], refetch: refetchResources } = useQuery<any[]>({
    queryKey: ['library-pending'],
    queryFn: () => api.get('/library/pending'),
    enabled: !!user && activeTab === 'library',
  });

  const { data: pendingCourses = [], refetch: refetchCourses } = useQuery<any[]>({
    queryKey: ['courses-pending'],
    queryFn: () => api.get('/courses/pending'),
    enabled: !!user && activeTab === 'courses',
  });

  const resolve = async (id: string, status: string) => {
    await api.put(`/reports/${id}/resolve`, { status });
    refetch();
  };

  const moderateResource = async (id: string, action: string, note?: string) => {
    const token = localStorage.getItem('token');
    await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'}/library/${id}/moderate`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ action, note }),
    });
    refetchResources();
  };

  const moderateCourse = async (id: string, action: string, commissionUrl?: string) => {
    const token = localStorage.getItem('token');
    await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'}/courses/${id}/moderate`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ action, commissionUrl }),
    });
    refetchCourses();
  };

  if (!user) return null;

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Moderation Queue</h1>

      {/* Tab switcher */}
      <div className="flex gap-2 border-b border-border pb-3">
        {[
          { key: 'reports', label: 'Reports', icon: AlertTriangle },
          { key: 'library', label: 'Library', icon: FileText },
          { key: 'courses', label: 'Courses', icon: GraduationCap },
        ].map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            onClick={() => setActiveTab(key as any)}
            className={`flex items-center gap-1.5 text-sm px-4 py-2 rounded-md transition-colors ${
              activeTab === key ? 'bg-primary text-primary-foreground' : 'hover:bg-muted text-muted-foreground'
            }`}
          >
            <Icon className="h-3.5 w-3.5" />
            {label}
          </button>
        ))}
      </div>

      {/* Library queue */}
      {activeTab === 'library' && (
        <div className="space-y-3">
          {pendingResources.length === 0 ? (
            <p className="text-center py-10 text-muted-foreground">No pending library submissions.</p>
          ) : (
            pendingResources.map((r: any) => (
              <div key={r.id} className="rounded-xl border border-border bg-card p-5 space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-semibold">{r.title}</h3>
                      <Badge variant="outline">{r.type}</Badge>
                      {r.financialFlagged && (
                        <Badge className="bg-amber-500/20 text-amber-400 border-amber-500/30">
                          <AlertTriangle className="h-3 w-3 mr-1" /> Financial
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">{r.description}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      by {r.uploader?.username} ({r.uploader?.memberType}) · {timeAgo(r.createdAt)}
                    </p>
                    {r.fileUrl && (
                      <a href={`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'}${r.fileUrl}`}
                        target="_blank" rel="noopener noreferrer"
                        className="text-xs text-primary hover:underline mt-1 inline-block">
                        View file ↗
                      </a>
                    )}
                    {r.embedUrl && (
                      <a href={r.embedUrl} target="_blank" rel="noopener noreferrer"
                        className="text-xs text-primary hover:underline mt-1 inline-block">
                        View video ↗
                      </a>
                    )}
                  </div>
                  <div className="flex gap-2 shrink-0">
                    <Button size="sm" onClick={() => moderateResource(r.id, 'APPROVED')}>Approve</Button>
                    <Button size="sm" variant="outline" onClick={() => moderateResource(r.id, 'FLAGGED', 'Requires further review')}>Flag</Button>
                    <Button size="sm" variant="ghost" className="text-destructive" onClick={() => moderateResource(r.id, 'REJECTED')}>Reject</Button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Courses queue */}
      {activeTab === 'courses' && (
        <div className="space-y-3">
          {pendingCourses.length === 0 ? (
            <p className="text-center py-10 text-muted-foreground">No pending course listings.</p>
          ) : (
            pendingCourses.map((c: any) => (
              <div key={c.id} className="rounded-xl border border-border bg-card p-5 space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="font-semibold">{c.title}</h3>
                    <p className="text-sm text-primary/80">{c.providerName}</p>
                    <p className="text-sm text-muted-foreground mt-1">{c.description}</p>
                    <div className="flex gap-3 mt-2 text-xs text-muted-foreground flex-wrap">
                      <span>{c.deliveryMode}</span>
                      {c.price && <span>{c.price}</span>}
                      {c.isExternalProvider && <Badge variant="outline">External provider</Badge>}
                      <span>by {c.provider?.username}</span>
                    </div>
                    {c.externalUrl && (
                      <a href={c.externalUrl} target="_blank" rel="noopener noreferrer"
                        className="text-xs text-primary hover:underline mt-1 inline-block">
                        Visit course URL ↗
                      </a>
                    )}
                  </div>
                  <div className="flex gap-2 shrink-0">
                    <Button size="sm" onClick={() => moderateCourse(c.id, 'APPROVED')}>Approve</Button>
                    <Button size="sm" variant="ghost" className="text-destructive" onClick={() => moderateCourse(c.id, 'REJECTED')}>Reject</Button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Reports queue (existing) */}
      {activeTab === 'reports' && (
        <div className="space-y-4">
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
      )}
    </div>
  );
}
