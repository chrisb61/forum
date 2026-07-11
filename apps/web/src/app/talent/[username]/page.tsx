'use client';
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { api } from '@/lib/api';
import {
  GraduationCap, MapPin, Calendar, ExternalLink,
  Mail, Briefcase, Star, ArrowLeft, CheckCircle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function TalentProfilePage() {
  const { username } = useParams<{ username: string }>();
  const { user } = useAuth();
  const qc = useQueryClient();
  const [message, setMessage] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [done, setDone] = useState(false);

  const { data: profile, isLoading, error } = useQuery({
    queryKey: ['talent-profile', username],
    queryFn: () => api.get<any>(`/talent/${username}`),
  });

  const { mutate: expressInterest, isPending } = useMutation({
    mutationFn: () => api.post(`/talent/${username}/interest`, { message }),
    onSuccess: () => {
      setDone(true);
      setShowForm(false);
      qc.invalidateQueries({ queryKey: ['talent-profile', username] });
    },
  });

  const canInteract = user && ['PROFESSIONAL', 'CORPORATE', 'ADMINISTRATOR'].includes(user.memberType ?? '');

  if (isLoading) {
    return (
      <div className="max-w-2xl mx-auto space-y-4 animate-pulse">
        <div className="h-32 rounded-xl bg-muted" />
        <div className="h-48 rounded-xl bg-muted" />
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="max-w-2xl mx-auto text-center py-20 space-y-3">
        <GraduationCap className="h-12 w-12 text-muted-foreground mx-auto" />
        <p className="text-lg font-medium">Profile not found</p>
        <p className="text-muted-foreground">This profile may be private or no longer available.</p>
        <Link href="/talent"><Button variant="outline" size="sm"><ArrowLeft className="h-4 w-4 mr-2" />Back to Talent Corridor</Button></Link>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-5">
      <Link href="/talent" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors">
        <ArrowLeft className="h-4 w-4" />
        Talent Corridor
      </Link>

      {/* Hero card */}
      <div className="rounded-xl border border-border bg-card p-6 space-y-4">
        <div className="flex items-start gap-4">
          <div className="h-16 w-16 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-bold text-2xl shrink-0">
            {(profile.user?.displayName || profile.user?.username || '?').charAt(0).toUpperCase()}
          </div>
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-foreground">
              {profile.user?.displayName || profile.user?.username}
            </h1>
            {profile.degree && <p className="text-muted-foreground">{profile.degree}</p>}
            <div className="flex flex-wrap gap-3 mt-2 text-sm text-muted-foreground">
              {profile.university && (
                <span className="flex items-center gap-1.5">
                  <GraduationCap className="h-4 w-4" />
                  {profile.university}
                </span>
              )}
              {profile.graduationYear && (
                <span className="flex items-center gap-1.5">
                  <Calendar className="h-4 w-4" />
                  Class of {profile.graduationYear}
                </span>
              )}
              {profile.location && (
                <span className="flex items-center gap-1.5">
                  <MapPin className="h-4 w-4" />
                  {profile.location}
                </span>
              )}
            </div>
          </div>
          {profile.placementAvailable && (
            <span className="text-sm px-3 py-1 rounded-full bg-green-500/15 text-green-400 border border-green-500/20 shrink-0">
              Available for placement
            </span>
          )}
        </div>

        {profile.bio && (
          <p className="text-sm text-muted-foreground leading-relaxed border-t border-border pt-4">
            {profile.bio}
          </p>
        )}
      </div>

      {/* Details */}
      <div className="rounded-xl border border-border bg-card p-6 space-y-4">
        <h2 className="font-semibold text-foreground">Profile Details</h2>

        {profile.studyArea && (
          <div>
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">Area of Study</p>
            <p className="text-sm text-foreground">{profile.studyArea}</p>
          </div>
        )}

        {profile.dissertationTopic && (
          <div>
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">Dissertation / Research Topic</p>
            <p className="text-sm text-foreground">{profile.dissertationTopic}</p>
          </div>
        )}

        {profile.availableFrom && (
          <div>
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">Available From</p>
            <p className="text-sm text-foreground">{profile.availableFrom}</p>
          </div>
        )}

        {profile.esgInterests?.length > 0 && (
          <div>
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">ESG Interests</p>
            <div className="flex flex-wrap gap-2">
              {profile.esgInterests.map((i: string) => (
                <span key={i} className="text-xs px-2.5 py-1 rounded-full bg-primary/10 text-primary border border-primary/20">
                  {i}
                </span>
              ))}
            </div>
          </div>
        )}

        {profile.skills?.length > 0 && (
          <div>
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">Skills</p>
            <div className="flex flex-wrap gap-2">
              {profile.skills.map((s: string) => (
                <span key={s} className="text-xs px-2.5 py-1 rounded-full bg-muted text-muted-foreground border border-border">
                  {s}
                </span>
              ))}
            </div>
          </div>
        )}

        <div className="flex flex-wrap gap-3 pt-2 border-t border-border">
          {profile.linkedIn && (
            <a href={profile.linkedIn} target="_blank" rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-sm text-primary hover:underline">
              <ExternalLink className="h-3.5 w-3.5" />
              LinkedIn
            </a>
          )}
          {profile.portfolioUrl && (
            <a href={profile.portfolioUrl} target="_blank" rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-sm text-primary hover:underline">
              <ExternalLink className="h-3.5 w-3.5" />
              Portfolio
            </a>
          )}
          {profile.user?.email && (
            <a href={`mailto:${profile.user.email}`}
              className="inline-flex items-center gap-1.5 text-sm text-primary hover:underline">
              <Mail className="h-3.5 w-3.5" />
              {profile.user.email}
            </a>
          )}
        </div>
      </div>

      {/* Express Interest */}
      {canInteract && (
        <div className="rounded-xl border border-border bg-card p-6 space-y-3">
          <div className="flex items-center gap-2">
            <Briefcase className="h-5 w-5 text-primary" />
            <h2 className="font-semibold text-foreground">Express Interest</h2>
          </div>

          {done ? (
            <div className="flex items-center gap-2 text-green-400 text-sm">
              <CheckCircle className="h-4 w-4" />
              Your interest has been sent. The candidate will be able to see it on their profile.
            </div>
          ) : showForm ? (
            <div className="space-y-3">
              <p className="text-sm text-muted-foreground">
                Add an optional message introducing yourself or your organisation.
              </p>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={4}
                placeholder="Hi, I'm reaching out because…"
                className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none"
              />
              <div className="flex gap-2">
                <Button onClick={() => expressInterest()} disabled={isPending} size="sm">
                  {isPending ? 'Sending…' : 'Send Expression of Interest'}
                </Button>
                <Button variant="outline" size="sm" onClick={() => setShowForm(false)}>Cancel</Button>
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">
                Let this candidate know you are interested in their profile. They will be notified and can view your details.
              </p>
              <Button onClick={() => setShowForm(true)} size="sm">
                <Star className="h-4 w-4 mr-2" />
                Express Interest
              </Button>
            </div>
          )}
        </div>
      )}

      {!user && (
        <div className="rounded-xl border border-dashed border-border p-8 text-center space-y-3">
          <p className="text-muted-foreground text-sm">Sign in as a Professional or Corporate member to express interest in this candidate.</p>
          <Link href="/login"><Button size="sm">Sign in</Button></Link>
        </div>
      )}
    </div>
  );
}
