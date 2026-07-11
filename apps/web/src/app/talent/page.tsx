'use client';
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { api } from '@/lib/api';
import {
  GraduationCap, MapPin, Calendar, Search,
  Briefcase, Star, Eye, EyeOff, ArrowUpCircle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';

const ESG_INTERESTS = [
  'All Interests', 'ESG Strategy', 'Climate & Environment', 'Governance',
  'Social Impact', 'Sustainability Reporting', 'Green Finance',
  'Circular Economy', 'Biodiversity', 'Human Rights', 'AI & Technology',
];

const GRADUATION_YEARS = ['All Years', '2025', '2026', '2027', '2028'];

export default function TalentCorridorPage() {
  const { user } = useAuth();
  const [search, setSearch] = useState('');
  const [interest, setInterest] = useState('');
  const [graduationYear, setGraduationYear] = useState('');
  const [placementOnly, setPlacementOnly] = useState(false);

  const { data: profiles = [], isLoading } = useQuery<any[]>({
    queryKey: ['talent', search, interest, graduationYear, placementOnly],
    queryFn: () => {
      const params = new URLSearchParams();
      if (search) params.set('search', search);
      if (interest) params.set('interest', interest);
      if (graduationYear) params.set('graduationYear', graduationYear);
      if (placementOnly) params.set('placement', 'true');
      return api.get(`/talent?${params.toString()}`);
    },
  });

  const canViewTalent = user && ['PROFESSIONAL', 'CORPORATE', 'ADMINISTRATOR'].includes(user.memberType ?? '');
  const isStudent = user?.memberType === 'STUDENT';

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <GraduationCap className="h-6 w-6 text-primary" />
            <h1 className="text-3xl font-bold">Talent Corridor</h1>
          </div>
          <p className="text-muted-foreground max-w-2xl">
            Discover the next generation of ESG and sustainability professionals.
            Connect directly with graduates and students seeking placements,
            internships, and their first professional roles.
          </p>
        </div>
        {isStudent && (
          <Link href="/talent/my-profile">
            <Button className="shrink-0">
              <Star className="h-4 w-4 mr-2" />
              My Talent Profile
            </Button>
          </Link>
        )}
      </div>

      {/* Value proposition for corporates */}
      {user?.memberType === 'CORPORATE' && (
        <div className="rounded-xl border border-primary/20 bg-primary/5 p-5 flex gap-4">
          <Briefcase className="h-6 w-6 text-primary shrink-0 mt-0.5" />
          <div className="text-sm space-y-1">
            <p className="font-semibold text-foreground">Find ESG talent — at a fraction of recruitment costs</p>
            <p className="text-muted-foreground">
              Browse verified student profiles from universities worldwide. Express interest
              directly — no agency fees, no intermediaries. The ESG Intelligence Network
              connects you straight to tomorrow's sustainability leaders.
            </p>
          </div>
        </div>
      )}

      {/* Student — manage profile prompt */}
      {isStudent && (
        <div className="rounded-xl border border-primary/20 bg-primary/5 p-5 flex gap-4">
          <Star className="h-6 w-6 text-primary shrink-0 mt-0.5" />
          <div className="text-sm space-y-1 flex-1">
            <p className="font-semibold text-foreground">Your profile is your shop window</p>
            <p className="text-muted-foreground">
              Corporate members and professional recruiters browse this corridor looking for
              ESG talent. Keep your profile complete, up to date, and visibility turned on
              to be discovered.
            </p>
          </div>
          <Link href="/talent/my-profile" className="shrink-0">
            <Button size="sm" variant="outline">Edit Profile</Button>
          </Link>
        </div>
      )}

      {/* Non-member prompt */}
      {!user && (
        <div className="rounded-xl border border-border p-10 text-center space-y-3">
          <GraduationCap className="h-10 w-10 text-muted-foreground mx-auto" />
          <p className="font-medium">Sign in to browse the Talent Corridor</p>
          <p className="text-sm text-muted-foreground">Professional and Corporate members can view and connect with candidates.</p>
          <div className="flex justify-center gap-3">
            <Link href="/login"><Button>Sign in</Button></Link>
            <Link href="/register"><Button variant="outline">Register</Button></Link>
          </div>
        </div>
      )}

      {/* Student upgrade prompt */}
      {isStudent && (
        <div className="rounded-lg border border-border bg-muted/30 px-5 py-4 text-sm text-muted-foreground flex items-center gap-3">
          <EyeOff className="h-4 w-4 shrink-0" />
          <span>
            As a Student member you can manage your own profile below but cannot browse other candidates.
            <Link href="/upgrade" className="text-primary hover:underline ml-1">Upgrade to Professional</Link> to unlock full access.
          </span>
        </div>
      )}

      {/* Filters — only shown to non-students */}
      {canViewTalent && (
        <div className="space-y-3">
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name, university, degree or keyword…"
              className="w-full rounded-lg border border-border bg-background pl-10 pr-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
            />
          </div>
          <div className="flex flex-wrap gap-3">
            <select
              value={interest}
              onChange={(e) => setInterest(e.target.value === 'All Interests' ? '' : e.target.value)}
              className="rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
            >
              {ESG_INTERESTS.map((i) => <option key={i} value={i === 'All Interests' ? '' : i}>{i}</option>)}
            </select>
            <select
              value={graduationYear}
              onChange={(e) => setGraduationYear(e.target.value === 'All Years' ? '' : e.target.value)}
              className="rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
            >
              {GRADUATION_YEARS.map((y) => <option key={y} value={y === 'All Years' ? '' : y}>{y}</option>)}
            </select>
            <label className="flex items-center gap-2 text-sm text-muted-foreground cursor-pointer px-3 py-2 rounded-lg border border-border hover:border-primary/40 transition-colors">
              <input
                type="checkbox"
                checked={placementOnly}
                onChange={(e) => setPlacementOnly(e.target.checked)}
                className="accent-primary"
              />
              Placement available only
            </label>
          </div>
        </div>
      )}

      {/* Profile grid */}
      {canViewTalent && (
        isLoading ? (
          <div className="grid sm:grid-cols-2 gap-4">
            {[1, 2, 3, 4].map((i) => <div key={i} className="h-48 rounded-xl bg-muted animate-pulse" />)}
          </div>
        ) : profiles.length === 0 ? (
          <div className="rounded-xl border border-dashed border-border p-12 text-center">
            <GraduationCap className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
            <p className="text-muted-foreground">No profiles match your filters. Try broadening your search.</p>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 gap-4">
            {profiles.map((profile: any) => (
              <TalentCard key={profile.userId} profile={profile} />
            ))}
          </div>
        )
      )}
    </div>
  );
}

function TalentCard({ profile }: { profile: any }) {
  return (
    <Link href={`/talent/${profile.user?.username}`}>
      <div className="rounded-xl border border-border bg-card hover:border-primary/40 transition-colors p-5 h-full space-y-3 cursor-pointer group">
        <div className="flex items-start gap-3">
          <div className="h-10 w-10 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-bold text-sm shrink-0">
            {(profile.user?.displayName || profile.user?.username || '?').charAt(0).toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors truncate">
              {profile.user?.displayName || profile.user?.username}
            </h3>
            {profile.degree && (
              <p className="text-sm text-muted-foreground truncate">{profile.degree}</p>
            )}
          </div>
          {profile.placementAvailable && (
            <span className="text-xs px-2 py-0.5 rounded-full bg-green-500/15 text-green-400 border border-green-500/20 shrink-0">
              Available
            </span>
          )}
        </div>

        <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
          {profile.university && (
            <span className="flex items-center gap-1">
              <GraduationCap className="h-3.5 w-3.5" />
              {profile.university}
            </span>
          )}
          {profile.graduationYear && (
            <span className="flex items-center gap-1">
              <Calendar className="h-3.5 w-3.5" />
              Class of {profile.graduationYear}
            </span>
          )}
          {profile.location && (
            <span className="flex items-center gap-1">
              <MapPin className="h-3.5 w-3.5" />
              {profile.location}
            </span>
          )}
        </div>

        {profile.bio && (
          <p className="text-sm text-muted-foreground line-clamp-2">{profile.bio}</p>
        )}

        {profile.esgInterests?.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {profile.esgInterests.slice(0, 3).map((interest: string) => (
              <span key={interest} className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20">
                {interest}
              </span>
            ))}
            {profile.esgInterests.length > 3 && (
              <span className="text-xs px-2 py-0.5 rounded-full bg-muted text-muted-foreground">
                +{profile.esgInterests.length - 3} more
              </span>
            )}
          </div>
        )}
      </div>
    </Link>
  );
}
