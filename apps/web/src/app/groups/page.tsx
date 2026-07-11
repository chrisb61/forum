'use client';
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { api } from '@/lib/api';
import { Users, Plus, Lock, Globe, FileText, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function GroupsPage() {
  const { user } = useAuth();
  const [showCreate, setShowCreate] = useState(false);

  const { data: discoverable = [], refetch: refetchDiscoverable } = useQuery<any[]>({
    queryKey: ['groups-discoverable'],
    queryFn: () => api.get('/groups'),
  });

  const { data: myGroups = [], refetch: refetchMine } = useQuery<any[]>({
    queryKey: ['groups-mine'],
    queryFn: () => api.get('/groups/mine'),
    enabled: !!user,
  });

  const myGroupIds = new Set(myGroups.map((g: any) => g.id));

  async function handleJoin(groupId: string) {
    await api.post(`/groups/${groupId}/join`, {});
    refetchDiscoverable();
    refetchMine();
  }

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Users className="h-6 w-6 text-primary" />
            <h1 className="text-3xl font-bold">Groups & Cohorts</h1>
          </div>
          <p className="text-muted-foreground">
            Join or create private groups to share resources and collaborate with
            specific members — cohorts, training programmes, fundraising teams, and more.
          </p>
        </div>
        {user && user.memberType !== 'STUDENT' && (
          <Button onClick={() => setShowCreate(!showCreate)} className="shrink-0">
            <Plus className="h-4 w-4 mr-2" />
            Create Group
          </Button>
        )}
      </div>

      {/* Student notice */}
      {user?.memberType === 'STUDENT' && (
        <div className="rounded-lg border border-primary/20 bg-primary/5 px-5 py-4 text-sm text-muted-foreground">
          <strong className="text-foreground">Students can join groups</strong> but cannot create them.
          Upgrade your membership to Professional to unlock group creation and other advanced features.
        </div>
      )}

      {/* Create form */}
      {showCreate && user && (
        <CreateGroupForm
          onSuccess={() => { setShowCreate(false); refetchDiscoverable(); refetchMine(); }}
          onCancel={() => setShowCreate(false)}
        />
      )}

      {/* My Groups */}
      {user && myGroups.length > 0 && (
        <div className="space-y-3">
          <h2 className="font-bold text-lg">My Groups</h2>
          <div className="grid sm:grid-cols-2 gap-4">
            {myGroups.map((group: any) => (
              <GroupCard key={group.id} group={group} isMember={true} isOwner={group.ownerId === user.id} />
            ))}
          </div>
        </div>
      )}

      {/* Discoverable groups */}
      <div className="space-y-3">
        <h2 className="font-bold text-lg">Discover Groups</h2>
        {discoverable.length === 0 ? (
          <div className="rounded-xl border border-dashed border-border p-12 text-center">
            <Users className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
            <p className="text-muted-foreground">No groups yet. Be the first to create one.</p>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 gap-4">
            {discoverable.map((group: any) => (
              <GroupCard
                key={group.id}
                group={group}
                isMember={myGroupIds.has(group.id)}
                isOwner={group.ownerId === user?.id}
                onJoin={user && !myGroupIds.has(group.id) ? () => handleJoin(group.id) : undefined}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function GroupCard({ group, isMember, isOwner, onJoin }: {
  group: any;
  isMember: boolean;
  isOwner: boolean;
  onJoin?: () => void;
}) {
  return (
    <div className="rounded-xl border border-border bg-card hover:border-primary/30 transition-colors p-5 space-y-3">
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2">
          {group.isDiscoverable
            ? <Globe className="h-4 w-4 text-muted-foreground shrink-0" />
            : <Lock className="h-4 w-4 text-muted-foreground shrink-0" />
          }
          <h3 className="font-semibold text-foreground">{group.name}</h3>
        </div>
        {isOwner && (
          <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20">Owner</span>
        )}
        {isMember && !isOwner && (
          <span className="text-xs px-2 py-0.5 rounded-full bg-muted text-muted-foreground border border-border flex items-center gap-1">
            <CheckCircle className="h-3 w-3" /> Member
          </span>
        )}
      </div>

      {group.description && (
        <p className="text-sm text-muted-foreground line-clamp-2">{group.description}</p>
      )}

      <div className="flex items-center gap-4 text-xs text-muted-foreground">
        <span className="flex items-center gap-1">
          <Users className="h-3.5 w-3.5" />
          {group._count?.members ?? 0} members
        </span>
        <span className="flex items-center gap-1">
          <FileText className="h-3.5 w-3.5" />
          {group._count?.resources ?? 0} resources
        </span>
        <span className="ml-auto">
          by {group.owner?.displayName || group.owner?.username}
        </span>
      </div>

      <div className="flex gap-2 pt-1">
        {isMember ? (
          <Link href={`/groups/${group.id}`} className="w-full">
            <Button size="sm" variant="outline" className="w-full">Open Group</Button>
          </Link>
        ) : onJoin ? (
          <Button size="sm" onClick={onJoin} className="w-full">Request to Join</Button>
        ) : null}
      </div>
    </div>
  );
}

function CreateGroupForm({ onSuccess, onCancel }: { onSuccess: () => void; onCancel: () => void }) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [isDiscoverable, setIsDiscoverable] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    try {
      await api.post('/groups', { name, description, isDiscoverable });
      onSuccess();
    } catch (err: any) {
      setError(err.message || 'Failed to create group');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="rounded-xl border border-primary/30 bg-primary/5 p-6 space-y-4">
      <h3 className="font-semibold text-lg">Create a New Group</h3>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-1.5">
          <label className="text-sm font-medium">Group Name *</label>
          <input
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. TCFD Cohort 2026, ESG Leaders Programme"
            className="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
          />
        </div>
        <div className="space-y-1.5">
          <label className="text-sm font-medium">Description</label>
          <textarea
            rows={2}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="What is this group for?"
            className="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none"
          />
        </div>
        <label className="flex items-center gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={isDiscoverable}
            onChange={(e) => setIsDiscoverable(e.target.checked)}
            className="accent-primary"
          />
          <span className="text-sm text-muted-foreground">
            Make this group discoverable — other members can find and request to join
          </span>
        </label>
        {error && <p className="text-sm text-destructive">{error}</p>}
        <div className="flex gap-3">
          <Button type="submit" disabled={submitting}>
            {submitting ? 'Creating…' : 'Create Group'}
          </Button>
          <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>
        </div>
      </form>
    </div>
  );
}
