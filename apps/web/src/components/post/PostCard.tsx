'use client';
import { useState } from 'react';
import Link from 'next/link';
import { Post, ReactionType } from '@/types';
import { useAuth } from '@/hooks/useAuth';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import PostContent from './PostContent';
import { timeAgo } from '@/lib/utils';
import { ThumbsUp, Lightbulb, Laugh, HelpCircle, Edit2, Trash2, Flag } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

const REACTIONS: { type: ReactionType; icon: any; label: string }[] = [
  { type: 'LIKE', icon: ThumbsUp, label: 'Like' },
  { type: 'HELPFUL', icon: HelpCircle, label: 'Helpful' },
  { type: 'INSIGHTFUL', icon: Lightbulb, label: 'Insightful' },
  { type: 'FUNNY', icon: Laugh, label: 'Funny' },
];

interface Props {
  post: Post;
  onUpdated?: () => void;
  threadLocked?: boolean;
}

export default function PostCard({ post, onUpdated, threadLocked }: Props) {
  const { user } = useAuth();
  const [editing, setEditing] = useState(false);
  const [editContent, setEditContent] = useState(post.content);
  const [saving, setSaving] = useState(false);

  const canEdit = user && (user.id === post.authorId || user.role === 'MODERATOR' || user.role === 'ADMINISTRATOR');
  const canDelete = canEdit;

  const handleReact = async (type: ReactionType) => {
    if (!user) return;
    await api.post(`/reactions/posts/${post.id}`, { type });
    onUpdated?.();
  };

  const handleEdit = async () => {
    if (!editContent.trim()) return;
    setSaving(true);
    try {
      await api.put(`/posts/${post.id}`, { content: editContent });
      setEditing(false);
      onUpdated?.();
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Delete this post?')) return;
    await api.delete(`/posts/${post.id}`);
    onUpdated?.();
  };

  const reactionCounts = post.reactions?.reduce(
    (acc, r) => ({ ...acc, [r.type]: (acc[r.type] || 0) + 1 }),
    {} as Record<string, number>,
  ) ?? {};

  return (
    <div className="flex gap-4 py-4 border-b last:border-b-0">
      <div className="flex-shrink-0 w-24 text-center hidden sm:block">
        <Link href={`/users/${post.author.username}`}>
          {post.author.avatar ? (
            <img src={post.author.avatar} alt={post.author.username} className="w-12 h-12 rounded-full mx-auto mb-1 object-cover" />
          ) : (
            <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-lg font-bold mx-auto mb-1">
              {post.author.username.charAt(0).toUpperCase()}
            </div>
          )}
          <p className="text-xs font-medium truncate">{post.author.displayName || post.author.username}</p>
        </Link>
        <div className="mt-1 space-y-0.5">
          <Badge variant="secondary" className="text-[10px] px-1">{post.author.role}</Badge>
          <p className="text-[10px] text-muted-foreground">{post.author.postCount} posts</p>
          <p className="text-[10px] text-muted-foreground">⭐ {post.author.reputation}</p>
        </div>
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-2 text-xs text-muted-foreground">
          <Link href={`/users/${post.author.username}`} className="sm:hidden font-medium text-foreground hover:underline">
            {post.author.displayName || post.author.username}
          </Link>
          <span>{timeAgo(post.createdAt)}</span>
          {post.isEdited && <span className="italic">(edited)</span>}
        </div>

        {editing ? (
          <div className="space-y-2">
            <Textarea value={editContent} onChange={(e) => setEditContent(e.target.value)} rows={6} />
            <div className="flex gap-2">
              <Button size="sm" onClick={handleEdit} disabled={saving}>Save</Button>
              <Button size="sm" variant="outline" onClick={() => setEditing(false)}>Cancel</Button>
            </div>
          </div>
        ) : (
          <PostContent content={post.content} />
        )}

        <div className="flex items-center gap-2 mt-3 flex-wrap">
          {REACTIONS.map(({ type, icon: Icon, label }) => (
            <button
              key={type}
              onClick={() => handleReact(type)}
              disabled={!user}
              className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors px-2 py-1 rounded border hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed"
              title={user ? label : 'Login to react'}
            >
              <Icon className="h-3.5 w-3.5" />
              {reactionCounts[type] ? <span>{reactionCounts[type]}</span> : null}
            </button>
          ))}

          <div className="ml-auto flex items-center gap-1">
            {canEdit && !editing && (
              <Button size="sm" variant="ghost" onClick={() => setEditing(true)}>
                <Edit2 className="h-3.5 w-3.5" />
              </Button>
            )}
            {canDelete && (
              <Button size="sm" variant="ghost" onClick={handleDelete} className="text-destructive hover:text-destructive">
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            )}
            {user && (
              <Button size="sm" variant="ghost">
                <Flag className="h-3.5 w-3.5" />
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
