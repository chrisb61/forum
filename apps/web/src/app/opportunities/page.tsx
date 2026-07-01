'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { Briefcase, MapPin, Clock, Users, Plus, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/hooks/useAuth';

const API = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000';

const TYPE_LABELS: Record<string, string> = {
  NED: 'Non-Executive Director',
  CHAIR: 'Chair',
  ADVISORY_BOARD: 'Advisory Board',
  COMMITTEE: 'Committee',
  TRUSTEE: 'Trustee',
  FRACTIONAL_EXECUTIVE: 'Fractional Executive',
  INVESTOR: 'Investor',
  MENTOR: 'Mentor',
};

const TYPE_COLORS: Record<string, string> = {
  NED: 'bg-teal-900/40 text-teal-300 border-teal-700',
  CHAIR: 'bg-purple-900/40 text-purple-300 border-purple-700',
  ADVISORY_BOARD: 'bg-blue-900/40 text-blue-300 border-blue-700',
  COMMITTEE: 'bg-green-900/40 text-green-300 border-green-700',
  TRUSTEE: 'bg-orange-900/40 text-orange-300 border-orange-700',
  FRACTIONAL_EXECUTIVE: 'bg-pink-900/40 text-pink-300 border-pink-700',
  INVESTOR: 'bg-yellow-900/40 text-yellow-300 border-yellow-700',
  MENTOR: 'bg-indigo-900/40 text-indigo-300 border-indigo-700',
};

export default function OpportunitiesPage() {
  const { user } = useAuth();
  const [typeFilter, setTypeFilter] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['opportunities', typeFilter],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (typeFilter) params.set('type', typeFilter);
      const res = await fetch(`${API}/api/v1/opportunities?${params}`);
      return res.json();
    },
  });

  return (
    <div className="max-w-5xl mx-auto px-4 py-10">
      {/* Header */}
      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">Board Opportunities</h1>
          <p className="text-muted-foreground">NED, Chair, Advisory and Executive roles posted by members</p>
        </div>
        {user && (
          <Link href="/opportunities/new">
            <Button className="bg-primary text-primary-foreground hover:bg-primary/90 gap-2">
              <Plus className="h-4 w-4" /> Post Opportunity
            </Button>
          </Link>
        )}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2 mb-8">
        <button
          onClick={() => setTypeFilter('')}
          className={`px-3 py-1.5 rounded-full text-sm border transition-colors ${!typeFilter ? 'bg-primary text-primary-foreground border-primary' : 'border-border text-muted-foreground hover:border-primary/50'}`}
        >
          All Types
        </button>
        {Object.entries(TYPE_LABELS).map(([key, label]) => (
          <button
            key={key}
            onClick={() => setTypeFilter(typeFilter === key ? '' : key)}
            className={`px-3 py-1.5 rounded-full text-sm border transition-colors ${typeFilter === key ? 'bg-primary text-primary-foreground border-primary' : 'border-border text-muted-foreground hover:border-primary/50'}`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* List */}
      {isLoading ? (
        <div className="space-y-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-40 rounded-xl bg-card animate-pulse border border-border" />
          ))}
        </div>
      ) : data?.items?.length === 0 ? (
        <div className="text-center py-20 text-muted-foreground">
          <Briefcase className="h-12 w-12 mx-auto mb-4 opacity-30" />
          <p className="text-lg">No opportunities posted yet</p>
          {user && <p className="text-sm mt-2">Be the first to post one</p>}
        </div>
      ) : (
        <div className="space-y-4">
          {data?.items?.map((opp: any) => (
            <Link key={opp.id} href={`/opportunities/${opp.id}`}>
              <div className="group bg-card border border-border hover:border-primary/50 rounded-xl p-6 transition-all cursor-pointer">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-2 flex-wrap">
                      <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${TYPE_COLORS[opp.type] ?? 'bg-muted text-muted-foreground border-border'}`}>
                        {TYPE_LABELS[opp.type] ?? opp.type}
                      </span>
                      {opp.sectors?.slice(0, 2).map((s: string) => (
                        <span key={s} className="text-xs px-2 py-0.5 rounded bg-muted text-muted-foreground">{s}</span>
                      ))}
                    </div>
                    <h2 className="text-lg font-semibold text-foreground group-hover:text-primary transition-colors truncate">
                      {opp.title}
                    </h2>
                    <p className="text-muted-foreground text-sm mt-1">
                      {opp.isAnonymous ? 'Organisation withheld' : opp.organisation}
                    </p>
                    <p className="text-sm text-muted-foreground mt-3 line-clamp-2">{opp.description}</p>
                  </div>
                </div>

                <div className="flex items-center gap-5 mt-4 text-xs text-muted-foreground flex-wrap">
                  {opp.location && (
                    <span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{opp.location}</span>
                  )}
                  {opp.timeCommitment && (
                    <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{opp.timeCommitment}</span>
                  )}
                  {opp.remuneration && (
                    <span className="flex items-center gap-1">💷 {opp.remuneration}</span>
                  )}
                  <span className="flex items-center gap-1">
                    <Users className="h-3 w-3" />{opp._count?.expressions ?? 0} interested
                  </span>
                  <span className="ml-auto">
                    {new Date(opp.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
