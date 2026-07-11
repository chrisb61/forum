'use client';
import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { api } from '@/lib/api';
import {
  Users, FileText, ArrowLeft, UserPlus, CheckCircle,
  XCircle, Download, AlertTriangle, Crown, LogOut,
} from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function GroupDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const router = useRouter();
  const qc = useQueryClient();
  const [inviteUsername, setInviteUsername] = useState('');
  const [inviteError, setInviteError] = useState('');
  const [inviteSuccess, setInviteSuccess] = useState('');
  const [activeTab, setActiveTab] = useState<'resources' | 'members' | 'requests'>('resources');

  const { data: group, isLoading } = useQuery<any>({
    queryKey: ['group', id],
    queryFn: () => api.get(`/groups/${id}`),
    enabled: !!user,
  });

  const { data: resources = [] } = useQuery<any[]>({
    queryKey: ['group-resources', id],
    queryFn: () => api.get(`/groups/${id}/resources`),
    enabled: !!user && !!group?.isMember,
  });

  const { data: pending = [], refetch: refetchPending } = useQuery<any[]>({
    queryKey: ['group-pending', id],
    queryFn: () => api.get(`/groups/${id}/pending`),
    enabled: !!user && !!group?.isOwner,
  });

  async function handleInvite(e: React.FormEvent) {
    e.preventDefault();
    setInviteError('');
    setInviteSuccess('');
    try {
      await api.post(`/groups/${id}/invite`, { username: inviteUsername });
      setInviteSuccess(`${inviteUsername} has been added to the group.`);
      setInviteUsername('');
      qc.invalidateQueries({ queryKey: ['group', id] });
    } catch (err: any) {
      setInviteError(err.message || 'Failed to invite user');
    }
  }

  async function handleApprove(userId: string) {
    await api.patch(`/groups/${id}/members/${userId}`, { action: 'ACTIVE' } as any);
    refetchPending();
    qc.invalidateQueries({ queryKey: ['group', id] });
  }

  async function handleReject(userId: string) {
    await api.patch(`/groups/${id}/members/${userId}`, { action: 'REJECTED' } as any);
    refetchPending();
  }

  async function handleLeave() {
    if (!user) return;
    await api.delete(`/groups/${id}/members/${user.id}`);
    router.push('/groups');
  }

  if (isLoading) return <div className="h-64 rounded-xl bg-muted animate-pulse" />;
  if (!group) return <p className="text-muted-foreground">Group not found.</p>;

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Back */}
      <Link href="/groups" className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors">
        <ArrowLeft className="h-4 w-4" />
        Back to Groups
      </Link>

      {/* Header */}
      <div className="rounded-xl border border-border bg-card p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold mb-1">{group.name}</h1>
            {group.description && (
              <p className="text-muted-foreground">{group.description}</p>
            )}
            <div className="flex items-center gap-4 mt-3 text-sm text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <Crown className="h-4 w-4 text-primary" />
                {group.owner?.displayName || group.owner?.username}
              </span>
              <span className="flex items-center gap-1.5">
                <Users className="h-4 w-4" />
                {group.members?.length ?? 0} members
              </span>
              <span className="flex items-center gap-1.5">
                <FileText className="h-4 w-4" />
                {group._count?.resources ?? 0} resources
              </span>
            </div>
          </div>
          {group.isMember && !group.isOwner && (
            <Button variant="ghost" size="sm" onClick={handleLeave} className="text-destructive hover:text-destructive">
              <LogOut className="h-4 w-4 mr-1.5" />
              Leave
            </Button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-border pb-3">
        {[
          { key: 'resources', label: 'Resources', icon: FileText },
          { key: 'members', label: 'Members', icon: Users },
          ...(group.isOwner ? [{ key: 'requests', label: `Requests${pending.length > 0 ? ` (${pending.length})` : ''}`, icon: UserPlus }] : []),
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

      {/* Resources tab */}
      {activeTab === 'resources' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              Resources shared exclusively with this group.
            </p>
            {group.isMember && (
              <Link href={`/library/upload?groupId=${id}&visibility=GROUP_ONLY`}>
                <Button size="sm" variant="outline">
                  <FileText className="h-3.5 w-3.5 mr-1.5" />
                  Share a Resource
                </Button>
              </Link>
            )}
          </div>
          {resources.length === 0 ? (
            <div className="rounded-xl border border-dashed border-border p-10 text-center">
              <FileText className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
              <p className="text-muted-foreground text-sm">No resources shared yet.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {resources.map((r: any) => (
                <div key={r.id} className="rounded-lg border border-border bg-card p-4 flex items-center gap-4">
                  <FileText className="h-5 w-5 text-muted-foreground shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{r.title}</p>
                    <p className="text-xs text-muted-foreground">
                      by {r.uploader?.displayName || r.uploader?.username} · {r._count?.downloads ?? 0} downloads
                    </p>
                    {r.hasFinancialDisclaimer && (
                      <p className="text-xs text-amber-400 flex items-center gap-1 mt-0.5">
                        <AlertTriangle className="h-3 w-3" /> Financial content disclaimer applies
                      </p>
                    )}
                  </div>
                  {(r.fileUrl || r.embedUrl) && (
                    <a href={r.fileUrl || r.embedUrl} target="_blank" rel="noopener noreferrer">
                      <Button size="sm" variant="outline">
                        <Download className="h-3.5 w-3.5 mr-1" />
                        {r.type === 'VIDEO_EMBED' ? 'Watch' : 'Download'}
                      </Button>
                    </a>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Members tab */}
      {activeTab === 'members' && (
        <div className="space-y-4">
          {/* Invite form (owner only) */}
          {group.isOwner && (
            <div className="rounded-lg border border-border p-4 space-y-3">
              <h3 className="font-medium text-sm">Invite a Member</h3>
              <form onSubmit={handleInvite} className="flex gap-2">
                <input
                  value={inviteUsername}
                  onChange={(e) => setInviteUsername(e.target.value)}
                  placeholder="Enter username"
                  className="flex-1 rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                />
                <Button type="submit" size="sm" disabled={!inviteUsername}>
                  <UserPlus className="h-3.5 w-3.5 mr-1.5" />
                  Invite
                </Button>
              </form>
              {inviteError && <p className="text-xs text-destructive">{inviteError}</p>}
              {inviteSuccess && <p className="text-xs text-green-400">{inviteSuccess}</p>}
            </div>
          )}

          {/* Member list */}
          <div className="space-y-2">
            {group.members?.map((member: any) => (
              <div key={member.user.id} className="flex items-center gap-3 rounded-lg border border-border p-3">
                <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-xs font-bold shrink-0">
                  {(member.user.displayName || member.user.username).charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm">{member.user.displayName || member.user.username}</p>
                  <p className="text-xs text-muted-foreground">@{member.user.username} · {member.user.memberType?.toLowerCase()}</p>
                </div>
                {member.user.id === group.ownerId && (
                  <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20 flex items-center gap-1">
                    <Crown className="h-3 w-3" /> Owner
                  </span>
                )}
                {group.isOwner && member.user.id !== user?.id && (
                  <Button
                    size="sm"
                    variant="ghost"
                    className="text-destructive hover:text-destructive text-xs"
                    onClick={() => api.delete(`/groups/${id}/members/${member.user.id}`).then(() => qc.invalidateQueries({ queryKey: ['group', id] }))}
                  >
                    Remove
                  </Button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Requests tab (owner only) */}
      {activeTab === 'requests' && group.isOwner && (
        <div className="space-y-3">
          {pending.length === 0 ? (
            <p className="text-center py-10 text-muted-foreground text-sm">No pending join requests.</p>
          ) : (
            pending.map((req: any) => (
              <div key={req.id} className="flex items-center gap-3 rounded-lg border border-border p-4">
                <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-xs font-bold shrink-0">
                  {(req.user.displayName || req.user.username).charAt(0).toUpperCase()}
                </div>
                <div className="flex-1">
                  <p className="font-medium text-sm">{req.user.displayName || req.user.username}</p>
                  <p className="text-xs text-muted-foreground">@{req.user.username} · {req.user.memberType?.toLowerCase()}</p>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" onClick={() => handleApprove(req.user.id)}>
                    <CheckCircle className="h-3.5 w-3.5 mr-1" />
                    Approve
                  </Button>
                  <Button size="sm" variant="ghost" className="text-destructive" onClick={() => handleReject(req.user.id)}>
                    <XCircle className="h-3.5 w-3.5 mr-1" />
                    Reject
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
