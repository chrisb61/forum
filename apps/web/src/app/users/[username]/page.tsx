'use client';
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { api } from '@/lib/api';
import { User, Thread, PaginatedResponse } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { formatDate, timeAgo } from '@/lib/utils';
import { useAuth } from '@/hooks/useAuth';
import {
  MessageSquare, Calendar, Award, FileText,
  MapPin, Linkedin, Globe, Briefcase, CheckCircle, ExternalLink, ThumbsUp, Plus, X
} from 'lucide-react';

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000';

const LEVELS = [
  { name: 'Newcomer', min: 0 },
  { name: 'Contributor', min: 100 },
  { name: 'Established', min: 500 },
  { name: 'Expert', min: 1500 },
  { name: 'Authority', min: 5000 },
  { name: 'Luminary', min: 10000 },
];

const SKILL_LABELS: Record<string, string> = {
  GOVERNANCE: 'Governance',
  STRATEGIC_THINKING: 'Strategic Thinking',
  LEADERSHIP: 'Leadership',
  ESG_KNOWLEDGE: 'ESG Knowledge',
  DIGITAL_EXPERTISE: 'Digital Expertise',
  FINANCIAL_EXPERTISE: 'Financial Expertise',
  RISK_MANAGEMENT: 'Risk Management',
  STAKEHOLDER_ENGAGEMENT: 'Stakeholder Engagement',
  TRANSFORMATION: 'Transformation',
  INVESTOR_RELATIONS: 'Investor Relations',
};

const ALL_SKILLS = Object.keys(SKILL_LABELS);

function getLevel(rep: number) {
  let level = LEVELS[0];
  for (const l of LEVELS) { if (rep >= l.min) level = l; }
  const idx = LEVELS.indexOf(level);
  const next = LEVELS[idx + 1] ?? null;
  const progress = next ? Math.round(((rep - level.min) / (next.min - level.min)) * 100) : 100;
  return { level, next, progress };
}

interface BoardRole {
  company: string; role: string; startYear: number; endYear?: number; current: boolean;
}
interface ProfessionalProfile {
  headline?: string; location?: string; linkedIn?: string; website?: string;
  availability?: string; sectors?: string[]; expertiseAreas?: string[];
  qualifications?: string[]; boardExperience?: BoardRole[];
}
interface UserWithProfile extends User {
  professionalProfile?: ProfessionalProfile;
}

function EndorsementsSection({ profileUserId, isOwnProfile }: { profileUserId: string; isOwnProfile: boolean }) {
  const { user, token } = useAuth();
  const qc = useQueryClient();
  const [showPicker, setShowPicker] = useState(false);
  const [endorsingSkill, setEndorsingSkill] = useState<string | null>(null);
  const [comment, setComment] = useState('');

  const { data: rawEndorsements } = useQuery({
    queryKey: ['endorsements', profileUserId],
    queryFn: async () => {
      const headers: any = {};
      if (token) headers['Authorization'] = `Bearer ${token}`;
      const res = await fetch(`${API_URL}/api/v1/endorsements/users/${profileUserId}`, { headers });
      return res.json();
    },
  });

  const endorseMutation = useMutation({
    mutationFn: async ({ skill, comment }: { skill: string; comment: string }) => {
      const res = await fetch(`${API_URL}/api/v1/endorsements/users/${profileUserId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ skill, comment }),
      });
      if (!res.ok) throw new Error('Failed to endorse');
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['endorsements', profileUserId] });
      setEndorsingSkill(null);
      setComment('');
      setShowPicker(false);
    },
  });

  const removeMutation = useMutation({
    mutationFn: async (skill: string) => {
      await fetch(`${API_URL}/api/v1/endorsements/users/${profileUserId}/${skill}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['endorsements', profileUserId] }),
  });

  const endorsements = Array.isArray(rawEndorsements) ? rawEndorsements : [];
  const existingSkills = endorsements.map((e: any) => e.skill);
  const canEndorse = user && !isOwnProfile;
  const unskilled = ALL_SKILLS.filter(s => !existingSkills.includes(s));

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm flex items-center gap-2">
            <ThumbsUp className="h-4 w-4 text-primary" /> Peer Endorsements
          </CardTitle>
          {canEndorse && !showPicker && (
            <button
              onClick={() => setShowPicker(true)}
              className="text-xs text-primary hover:text-primary/80 flex items-center gap-1 transition-colors"
            >
              <Plus className="h-3 w-3" /> Endorse
            </button>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-3">

        {/* Skill picker */}
        {showPicker && canEndorse && (
          <div className="border border-primary/30 rounded-lg p-3 space-y-3 bg-primary/5">
            <p className="text-xs text-muted-foreground font-medium">Select a skill to endorse</p>
            <div className="flex flex-wrap gap-2">
              {unskilled.map(skill => (
                <button
                  key={skill}
                  onClick={() => setEndorsingSkill(endorsingSkill === skill ? null : skill)}
                  className={`text-xs px-2.5 py-1 rounded-full border transition-colors ${endorsingSkill === skill ? 'bg-primary text-primary-foreground border-primary' : 'border-border text-muted-foreground hover:border-primary/50'}`}
                >
                  {SKILL_LABELS[skill]}
                </button>
              ))}
              {unskilled.length === 0 && (
                <p className="text-xs text-muted-foreground">You've endorsed all available skills.</p>
              )}
            </div>
            {endorsingSkill && (
              <div className="space-y-2">
                <textarea
                  rows={2}
                  placeholder="Optional comment (e.g. why you're endorsing this skill)..."
                  value={comment}
                  onChange={e => setComment(e.target.value)}
                  className="w-full bg-background border border-border rounded-md px-3 py-2 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary resize-none"
                />
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    onClick={() => endorseMutation.mutate({ skill: endorsingSkill, comment })}
                    disabled={endorseMutation.isPending}
                    className="text-xs h-7 bg-primary text-primary-foreground hover:bg-primary/90"
                  >
                    {endorseMutation.isPending ? 'Endorsing…' : `Endorse ${SKILL_LABELS[endorsingSkill]}`}
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => setShowPicker(false)} className="text-xs h-7">
                    Cancel
                  </Button>
                </div>
              </div>
            )}
            {!endorsingSkill && (
              <button onClick={() => setShowPicker(false)} className="text-xs text-muted-foreground hover:text-foreground">
                Cancel
              </button>
            )}
          </div>
        )}

        {/* Existing endorsements */}
        {endorsements.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            {canEndorse ? 'Be the first to endorse this member.' : 'No endorsements yet.'}
          </p>
        ) : (
          <div className="space-y-2">
            {endorsements.map((e: any) => {
              const myEndorsement = e.myEndorsement;
              return (
                <div key={e.skill} className="flex items-center gap-3 group">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-foreground">{SKILL_LABELS[e.skill] ?? e.skill}</span>
                      <span className="text-xs font-bold text-primary bg-primary/10 px-1.5 py-0.5 rounded-full">
                        {e.count}
                      </span>
                    </div>
                    <div className="flex items-center gap-1 mt-1 flex-wrap">
                      {e.endorsers.slice(0, 4).map((endorser: any) => (
                        <Link key={endorser.id} href={`/users/${endorser.username}`} title={endorser.displayName ?? endorser.username}>
                          <div className="h-5 w-5 rounded-full bg-muted border border-border flex items-center justify-center text-[9px] font-bold text-muted-foreground hover:border-primary transition-colors">
                            {(endorser.displayName ?? endorser.username)?.[0]?.toUpperCase()}
                          </div>
                        </Link>
                      ))}
                      {e.count > 4 && (
                        <span className="text-xs text-muted-foreground">+{e.count - 4} more</span>
                      )}
                    </div>
                  </div>
                  {myEndorsement && canEndorse && (
                    <button
                      onClick={() => removeMutation.mutate(e.skill)}
                      className="opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-red-400 p-1"
                      title="Remove your endorsement"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default function UserProfilePage() {
  const { username } = useParams();
  const { user: currentUser } = useAuth();

  const { data: user, isLoading } = useQuery<UserWithProfile>({
    queryKey: ['user', username],
    queryFn: () => api.get(`/users/${username}`),
  });

  const { data: threads } = useQuery<PaginatedResponse<Thread>>({
    queryKey: ['user-threads', username],
    queryFn: () => api.get(`/users/${username}/threads`),
    enabled: !!user,
  });

  if (isLoading) return <div className="h-64 bg-muted rounded animate-pulse" />;
  if (!user) return <div className="text-center py-12 text-muted-foreground">User not found</div>;

  const pp = user.professionalProfile;
  const { level, next, progress } = getLevel(user.reputation);
  const isOwnProfile = currentUser?.id === user.id;

  return (
    <div className="max-w-5xl mx-auto space-y-6">

      {/* Hero banner */}
      <div className="bg-card border border-border/60 rounded-lg p-6">
        <div className="flex flex-col sm:flex-row gap-6 items-start">
          <div className="shrink-0">
            {user.avatar ? (
              <img src={user.avatar} alt={user.username} className="w-24 h-24 rounded-full object-cover border-2 border-primary/30" />
            ) : (
              <div className="w-24 h-24 rounded-full bg-primary/20 flex items-center justify-center text-primary text-3xl font-bold border-2 border-primary/30">
                {(user.displayName || user.username).charAt(0).toUpperCase()}
              </div>
            )}
          </div>
          <div className="flex-1 space-y-2">
            <div>
              <h1 className="text-2xl font-bold">{user.displayName || user.username}</h1>
              <p className="text-muted-foreground text-sm">@{user.username}</p>
            </div>
            {pp?.headline && <p className="text-primary font-medium">{pp.headline}</p>}
            {pp?.qualifications && pp.qualifications.length > 0 && (
              <p className="text-sm text-muted-foreground tracking-wide">{pp.qualifications.join(' · ')}</p>
            )}
            <div className="flex flex-wrap gap-3 text-sm text-muted-foreground pt-1">
              {pp?.location && <span className="flex items-center gap-1"><MapPin className="h-3.5 w-3.5" /> {pp.location}</span>}
              {pp?.linkedIn && (
                <a href={pp.linkedIn} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 hover:text-primary transition-colors">
                  <Linkedin className="h-3.5 w-3.5" /> LinkedIn <ExternalLink className="h-3 w-3" />
                </a>
              )}
              {pp?.website && (
                <a href={pp.website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 hover:text-primary transition-colors">
                  <Globe className="h-3.5 w-3.5" /> Website <ExternalLink className="h-3 w-3" />
                </a>
              )}
            </div>
            {pp?.availability && (
              <span className="inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1 rounded-full bg-primary/10 text-primary border border-primary/20">
                <CheckCircle className="h-3 w-3" /> {pp.availability}
              </span>
            )}
            {user.bio && <p className="text-sm text-muted-foreground leading-relaxed pt-1">{user.bio}</p>}
          </div>
          <Badge variant="secondary" className="shrink-0">{user.role.replace('_', ' ')}</Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

        {/* Left column */}
        <div className="space-y-4">

          {/* Reputation */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <Award className="h-4 w-4 text-primary" /> Reputation
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-end justify-between">
                <span className="text-2xl font-bold text-primary">{user.reputation.toLocaleString()}</span>
                <span className="text-sm font-semibold text-muted-foreground">{level.name}</span>
              </div>
              <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                <div className="h-full bg-primary rounded-full transition-all duration-500" style={{ width: `${progress}%` }} />
              </div>
              {next && <p className="text-xs text-muted-foreground">{(next.min - user.reputation).toLocaleString()} pts to {next.name}</p>}
              <div className="pt-1 space-y-1 text-sm">
                <div className="flex justify-between text-muted-foreground">
                  <span className="flex items-center gap-1"><MessageSquare className="h-3.5 w-3.5" /> Posts</span>
                  <span className="font-medium text-foreground">{user.postCount}</span>
                </div>
                <div className="flex justify-between text-muted-foreground">
                  <span className="flex items-center gap-1"><Calendar className="h-3.5 w-3.5" /> Member since</span>
                  <span className="font-medium text-foreground">{formatDate(user.createdAt)}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Badges */}
          {user.badges && user.badges.length > 0 && (
            <Card>
              <CardHeader className="pb-2"><CardTitle className="text-sm">Badges</CardTitle></CardHeader>
              <CardContent className="space-y-2">
                {user.badges.map((ub: any) => (
                  <div key={ub.badge.id} className="flex items-center gap-2 text-xs p-2 rounded-md bg-muted/40">
                    <span className="text-base">{ub.badge.icon}</span>
                    <div>
                      <div className="font-semibold">{ub.badge.name}</div>
                      <div className="text-muted-foreground">{ub.badge.description}</div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {/* Sectors */}
          {pp?.sectors && pp.sectors.length > 0 && (
            <Card>
              <CardHeader className="pb-2"><CardTitle className="text-sm">Sectors</CardTitle></CardHeader>
              <CardContent className="flex flex-wrap gap-2">
                {pp.sectors.map((s) => (
                  <span key={s} className="text-xs px-2 py-1 rounded-full border border-primary/30 text-primary bg-primary/5">{s}</span>
                ))}
              </CardContent>
            </Card>
          )}

          {/* Expertise */}
          {pp?.expertiseAreas && pp.expertiseAreas.length > 0 && (
            <Card>
              <CardHeader className="pb-2"><CardTitle className="text-sm">Areas of Expertise</CardTitle></CardHeader>
              <CardContent className="flex flex-wrap gap-2">
                {pp.expertiseAreas.map((e) => (
                  <span key={e} className="text-xs px-2 py-1 rounded-full bg-muted text-muted-foreground">{e}</span>
                ))}
              </CardContent>
            </Card>
          )}
        </div>

        {/* Right column */}
        <div className="md:col-span-2 space-y-4">

          {/* Endorsements */}
          <EndorsementsSection profileUserId={user.id} isOwnProfile={isOwnProfile} />

          {/* Board experience */}
          {pp?.boardExperience && pp.boardExperience.length > 0 && (
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Briefcase className="h-4 w-4 text-primary" /> Board Experience
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {pp.boardExperience.map((b: BoardRole, i: number) => (
                  <div key={i} className="flex gap-3 pb-3 border-b border-border/40 last:border-0 last:pb-0">
                    <div className="mt-1 h-2 w-2 rounded-full bg-primary shrink-0" />
                    <div>
                      <div className="font-semibold text-sm">{b.role}</div>
                      <div className="text-muted-foreground text-sm">{b.company}</div>
                      <div className="text-xs text-muted-foreground/70 mt-0.5">
                        {b.startYear} – {b.current ? 'Present' : b.endYear}
                        {b.current && <span className="ml-2 text-primary font-medium">Current</span>}
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {/* Recent threads */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <FileText className="h-4 w-4" /> Recent Discussions
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {!threads || threads.data.length === 0 ? (
                <p className="p-4 text-sm text-muted-foreground">No discussions yet.</p>
              ) : (
                <div className="divide-y divide-border/40">
                  {threads.data.map((t: Thread) => (
                    <div key={t.id} className="px-4 py-3">
                      <Link href={`/threads/${t.slug}`} className="text-sm font-medium hover:text-primary transition-colors">
                        {t.title}
                      </Link>
                      <p className="text-xs text-muted-foreground mt-0.5">{timeAgo(t.createdAt)} · {t._count?.posts || 0} replies</p>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

        </div>
      </div>
    </div>
  );
}
