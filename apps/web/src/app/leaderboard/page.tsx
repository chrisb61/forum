'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Trophy, Award, MessageSquare } from 'lucide-react';

const LEVELS = [
  { name: 'Newcomer',    min: 0,     color: 'text-muted-foreground' },
  { name: 'Contributor', min: 100,   color: 'text-blue-400' },
  { name: 'Established', min: 500,   color: 'text-green-400' },
  { name: 'Expert',      min: 1500,  color: 'text-purple-400' },
  { name: 'Authority',   min: 5000,  color: 'text-amber-400' },
  { name: 'Luminary',    min: 10000, color: 'text-rose-400' },
];

function getLevel(rep: number) {
  let level = LEVELS[0];
  for (const l of LEVELS) { if (rep >= l.min) level = l; }
  return level;
}

const RANK_STYLES: Record<number, string> = {
  1: 'text-amber-400 font-bold text-xl',
  2: 'text-slate-300 font-bold text-lg',
  3: 'text-amber-600 font-bold text-lg',
};

interface LeaderboardEntry {
  id: string;
  username: string;
  displayName: string | null;
  avatar: string | null;
  reputation: number;
  postCount: number;
  rank: number;
  level: string;
  badges: { badge: { name: string; icon: string | null; color: string | null } }[];
}

export default function LeaderboardPage() {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/reputation/leaderboard?limit=25`)
      .then((r) => r.json())
      .then((data) => { setEntries(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  return (
    <div className="max-w-3xl mx-auto space-y-8 py-8">
      <section className="space-y-2">
        <p className="text-sm font-semibold tracking-widest text-primary uppercase">Community</p>
        <h1 className="text-4xl font-bold tracking-tight flex items-center gap-3">
          <Trophy className="h-8 w-8 text-primary" />
          Leaderboard
        </h1>
        <p className="text-muted-foreground">
          The most respected voices in the ESG Intelligence Network, ranked by reputation.
        </p>
      </section>

      {/* Level key */}
      <div className="flex flex-wrap gap-3 p-4 bg-card border border-border/60 rounded-lg">
        <span className="text-xs text-muted-foreground font-medium self-center">Levels:</span>
        {LEVELS.map((l) => (
          <span key={l.name} className={`text-xs font-medium ${l.color}`}>
            {l.name} ({l.min.toLocaleString()}+)
          </span>
        ))}
      </div>

      {loading ? (
        <div className="text-center text-muted-foreground py-12">Loading...</div>
      ) : entries.length === 0 ? (
        <div className="text-center text-muted-foreground py-12">
          No members yet. Be the first to contribute!
        </div>
      ) : (
        <div className="space-y-2">
          {entries.map((entry) => {
            const level = getLevel(entry.reputation);
            return (
              <div
                key={entry.id}
                className="flex items-center gap-4 p-4 bg-card border border-border/60 rounded-lg hover:border-primary/30 transition-colors"
              >
                {/* Rank */}
                <div className={`w-8 text-center shrink-0 ${RANK_STYLES[entry.rank] ?? 'text-muted-foreground font-medium'}`}>
                  {entry.rank === 1 ? '🥇' : entry.rank === 2 ? '🥈' : entry.rank === 3 ? '🥉' : `#${entry.rank}`}
                </div>

                {/* Avatar */}
                <div className="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold shrink-0 overflow-hidden">
                  {entry.avatar ? (
                    <img src={entry.avatar} alt={entry.username} className="h-full w-full object-cover" />
                  ) : (
                    (entry.displayName || entry.username).charAt(0).toUpperCase()
                  )}
                </div>

                {/* Name & level */}
                <div className="flex-1 min-w-0">
                  <Link href={`/users/${entry.username}`} className="font-semibold hover:text-primary transition-colors truncate block">
                    {entry.displayName || entry.username}
                  </Link>
                  <span className={`text-xs font-medium ${level.color}`}>{level.name}</span>
                  {/* Badges (first 3) */}
                  {entry.badges.length > 0 && (
                    <div className="flex gap-1 mt-1">
                      {entry.badges.slice(0, 3).map((b) => (
                        <span key={b.badge.name} title={b.badge.name} className="text-sm">
                          {b.badge.icon ?? '🏅'}
                        </span>
                      ))}
                      {entry.badges.length > 3 && (
                        <span className="text-xs text-muted-foreground self-center">+{entry.badges.length - 3}</span>
                      )}
                    </div>
                  )}
                </div>

                {/* Stats */}
                <div className="flex items-center gap-4 shrink-0 text-right">
                  <div className="hidden sm:block text-center">
                    <div className="flex items-center gap-1 text-muted-foreground text-sm">
                      <MessageSquare className="h-3 w-3" />
                      <span>{entry.postCount}</span>
                    </div>
                    <div className="text-[10px] text-muted-foreground/60">posts</div>
                  </div>
                  <div className="text-center">
                    <div className="flex items-center gap-1 text-primary font-bold">
                      <Award className="h-4 w-4" />
                      <span>{entry.reputation.toLocaleString()}</span>
                    </div>
                    <div className="text-[10px] text-muted-foreground/60">reputation</div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
