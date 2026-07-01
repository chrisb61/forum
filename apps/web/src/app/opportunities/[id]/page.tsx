'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Link from 'next/link';
import { MapPin, Clock, Users, ArrowLeft, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';

const API = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000';

const TYPE_LABELS: Record<string, string> = {
  NED: 'Non-Executive Director', CHAIR: 'Chair', ADVISORY_BOARD: 'Advisory Board',
  COMMITTEE: 'Committee', TRUSTEE: 'Trustee', FRACTIONAL_EXECUTIVE: 'Fractional Executive',
  INVESTOR: 'Investor', MENTOR: 'Mentor',
};

export default function OpportunityDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { user, token } = useAuth();
  const qc = useQueryClient();
  const router = useRouter();
  const [message, setMessage] = useState('');
  const [showMessageBox, setShowMessageBox] = useState(false);

  const { data: opp, isLoading } = useQuery({
    queryKey: ['opportunity', id],
    queryFn: async () => {
      const headers: any = {};
      if (token) headers['Authorization'] = `Bearer ${token}`;
      const res = await fetch(`${API}/api/v1/opportunities/${id}`, { headers });
      return res.json();
    },
  });

  const expressMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch(`${API}/api/v1/opportunities/${id}/express-interest`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ message }),
      });
      if (!res.ok) throw new Error();
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['opportunity', id] }); setShowMessageBox(false); setMessage(''); },
  });

  const withdrawMutation = useMutation({
    mutationFn: async () => {
      await fetch(`${API}/api/v1/opportunities/${id}/express-interest`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['opportunity', id] }),
  });

  if (isLoading) return <div className="max-w-3xl mx-auto px-4 py-10 animate-pulse"><div className="h-64 bg-card rounded-xl border border-border" /></div>;
  if (!opp || opp.statusCode === 404) return <div className="max-w-3xl mx-auto px-4 py-20 text-center text-muted-foreground">Opportunity not found.</div>;

  const isOwner = user?.id === opp.postedBy?.id;
  const canExpress = user && !isOwner;

  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      <button onClick={() => router.back()} className="flex items-center gap-2 text-muted-foreground hover:text-foreground text-sm mb-6 transition-colors">
        <ArrowLeft className="h-4 w-4" /> Back to opportunities
      </button>

      <div className="bg-card border border-border rounded-xl p-8">
        {/* Type badge */}
        <div className="flex items-center gap-3 mb-4 flex-wrap">
          <span className="text-xs font-semibold px-3 py-1 rounded-full bg-primary/20 text-primary border border-primary/30">
            {TYPE_LABELS[opp.type] ?? opp.type}
          </span>
          <span className={`text-xs px-2 py-0.5 rounded-full border ${opp.status === 'OPEN' ? 'border-green-700 text-green-400' : 'border-muted text-muted-foreground'}`}>
            {opp.status}
          </span>
        </div>

        <h1 className="text-2xl font-bold text-foreground mb-1">{opp.title}</h1>
        <p className="text-primary font-medium mb-6">
          {opp.isAnonymous ? 'Organisation withheld' : opp.organisation}
        </p>

        {/* Meta */}
        <div className="flex flex-wrap gap-5 text-sm text-muted-foreground mb-8 pb-8 border-b border-border">
          {opp.location && <span className="flex items-center gap-1.5"><MapPin className="h-4 w-4" />{opp.location}</span>}
          {opp.timeCommitment && <span className="flex items-center gap-1.5"><Clock className="h-4 w-4" />{opp.timeCommitment}</span>}
          {opp.remuneration && <span className="flex items-center gap-1.5">💷 {opp.remuneration}</span>}
          {opp.closingDate && <span className="flex items-center gap-1.5">📅 Closes {new Date(opp.closingDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}</span>}
          <span className="flex items-center gap-1.5"><Users className="h-4 w-4" />{opp._count?.expressions ?? 0} expressions of interest</span>
        </div>

        {/* Sectors */}
        {opp.sectors?.length > 0 && (
          <div className="mb-6">
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Sectors</h3>
            <div className="flex flex-wrap gap-2">
              {opp.sectors.map((s: string) => (
                <span key={s} className="text-xs px-2.5 py-1 rounded bg-muted text-muted-foreground">{s}</span>
              ))}
            </div>
          </div>
        )}

        {/* Description */}
        <div className="mb-6">
          <h3 className="text-sm font-semibold text-foreground mb-3">About this role</h3>
          <p className="text-muted-foreground text-sm leading-relaxed whitespace-pre-wrap">{opp.description}</p>
        </div>

        {opp.requirements && (
          <div className="mb-8">
            <h3 className="text-sm font-semibold text-foreground mb-3">Requirements</h3>
            <p className="text-muted-foreground text-sm leading-relaxed whitespace-pre-wrap">{opp.requirements}</p>
          </div>
        )}

        {/* Posted by */}
        {!opp.isAnonymous && opp.postedBy && (
          <div className="flex items-center gap-3 pt-6 border-t border-border mb-8">
            <div className="h-9 w-9 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold text-sm">
              {(opp.postedBy.displayName ?? opp.postedBy.username)?.[0]?.toUpperCase()}
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Posted by</p>
              <Link href={`/users/${opp.postedBy.username}`} className="text-sm font-medium text-foreground hover:text-primary transition-colors">
                {opp.postedBy.displayName ?? opp.postedBy.username}
              </Link>
            </div>
          </div>
        )}

        {/* Actions */}
        {canExpress && opp.status === 'OPEN' && (
          <div>
            {opp.hasExpressed ? (
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2 text-green-400 text-sm"><CheckCircle className="h-4 w-4" /> You have expressed interest</div>
                <button onClick={() => withdrawMutation.mutate()} className="text-xs text-muted-foreground hover:text-foreground underline">Withdraw</button>
              </div>
            ) : showMessageBox ? (
              <div className="space-y-3">
                <textarea
                  rows={3}
                  placeholder="Optional: introduce yourself or explain why you are a good fit..."
                  value={message}
                  onChange={e => setMessage(e.target.value)}
                  className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary resize-none"
                />
                <div className="flex gap-3">
                  <Button onClick={() => expressMutation.mutate()} disabled={expressMutation.isPending} className="bg-primary text-primary-foreground hover:bg-primary/90">
                    {expressMutation.isPending ? 'Sending…' : 'Express Interest'}
                  </Button>
                  <Button variant="outline" onClick={() => setShowMessageBox(false)}>Cancel</Button>
                </div>
              </div>
            ) : (
              <Button onClick={() => setShowMessageBox(true)} className="bg-primary text-primary-foreground hover:bg-primary/90">
                Express Interest
              </Button>
            )}
          </div>
        )}

        {isOwner && (
          <div className="pt-4 border-t border-border">
            <Link href={`/opportunities/${id}/expressions`}>
              <Button variant="outline" className="gap-2"><Users className="h-4 w-4" /> View Expressions of Interest ({opp._count?.expressions ?? 0})</Button>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
