'use client';
import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { api } from '@/lib/api';
import {
  GraduationCap, Eye, EyeOff, CheckCircle, ArrowLeft,
  Star, Briefcase,
} from 'lucide-react';
import { Button } from '@/components/ui/button';

const ESG_INTERESTS = [
  'ESG Strategy', 'Climate & Environment', 'Governance',
  'Social Impact', 'Sustainability Reporting', 'Green Finance',
  'Circular Economy', 'Biodiversity', 'Human Rights', 'AI & Technology',
];

const GRADUATION_YEARS = ['2025', '2026', '2027', '2028', '2029', '2030'];

export default function MyTalentProfilePage() {
  const { user } = useAuth();
  const qc = useQueryClient();

  const { data: existing } = useQuery({
    queryKey: ['my-talent-profile'],
    queryFn: () => api.get<any>('/talent/my-profile'),
    retry: false,
  });

  const [form, setForm] = useState({
    university: '',
    degree: '',
    studyArea: '',
    graduationYear: '',
    dissertationTopic: '',
    availableFrom: '',
    location: '',
    bio: '',
    linkedIn: '',
    portfolioUrl: '',
    esgInterests: [] as string[],
    skills: '',
    placementAvailable: true,
    showEmail: false,
    talentVisible: true,
  });
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (existing) {
      setForm({
        university: existing.university ?? '',
        degree: existing.degree ?? '',
        studyArea: existing.studyArea ?? '',
        graduationYear: existing.graduationYear?.toString() ?? '',
        dissertationTopic: existing.dissertationTopic ?? '',
        availableFrom: existing.availableFrom ?? '',
        location: existing.location ?? '',
        bio: existing.bio ?? '',
        linkedIn: existing.linkedIn ?? '',
        portfolioUrl: existing.portfolioUrl ?? '',
        esgInterests: existing.esgInterests ?? [],
        skills: (existing.skills ?? []).join(', '),
        placementAvailable: existing.placementAvailable ?? true,
        showEmail: existing.showEmail ?? false,
        talentVisible: existing.talentVisible ?? true,
      });
    }
  }, [existing]);

  const { mutate: save, isPending } = useMutation({
    mutationFn: () => api.put('/talent/my-profile', {
      ...form,
      graduationYear: form.graduationYear ? Number(form.graduationYear) : undefined,
      skills: form.skills.split(',').map((s) => s.trim()).filter(Boolean),
    }),
    onSuccess: () => {
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
      qc.invalidateQueries({ queryKey: ['my-talent-profile'] });
    },
    onError: (e: any) => setError(e?.message ?? 'Failed to save profile'),
  });

  const toggleInterest = (i: string) => {
    setForm((f) => ({
      ...f,
      esgInterests: f.esgInterests.includes(i)
        ? f.esgInterests.filter((x) => x !== i)
        : [...f.esgInterests, i],
    }));
  };

  if (!user) {
    return (
      <div className="text-center py-20">
        <Link href="/login"><Button>Sign in</Button></Link>
      </div>
    );
  }

  const isStudent = user.memberType === 'STUDENT';

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <Link href="/talent" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors">
        <ArrowLeft className="h-4 w-4" />
        Talent Corridor
      </Link>

      <div className="flex items-center gap-2">
        <Star className="h-6 w-6 text-primary" />
        <h1 className="text-2xl font-bold">My Talent Profile</h1>
      </div>

      {!isStudent && (
        <div className="rounded-lg border border-amber-500/30 bg-amber-500/10 px-5 py-4 text-sm text-amber-400">
          Your talent profile is only visible in the Talent Corridor if your membership type is Student.
        </div>
      )}

      {/* Visibility toggle */}
      <div className="rounded-xl border border-border bg-card p-5 flex items-start gap-4">
        <div className="flex-1">
          <p className="font-medium text-foreground">Profile Visibility</p>
          <p className="text-sm text-muted-foreground mt-0.5">
            {form.talentVisible
              ? 'Your profile is visible to Professional and Corporate members in the Talent Corridor.'
              : 'Your profile is hidden. Corporate and Professional members cannot find you.'}
          </p>
        </div>
        <button
          onClick={() => setForm((f) => ({ ...f, talentVisible: !f.talentVisible }))}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg border text-sm font-medium transition-colors ${
            form.talentVisible
              ? 'border-green-500/40 bg-green-500/10 text-green-400 hover:bg-green-500/20'
              : 'border-border bg-muted text-muted-foreground hover:border-primary/40'
          }`}
        >
          {form.talentVisible ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
          {form.talentVisible ? 'Visible' : 'Hidden'}
        </button>
      </div>

      {/* Form */}
      <div className="rounded-xl border border-border bg-card p-6 space-y-5">
        <h2 className="font-semibold text-foreground">Academic Details</h2>

        <div className="grid grid-cols-2 gap-4">
          <Field label="University / Institution" required>
            <input value={form.university} onChange={(e) => setForm((f) => ({ ...f, university: e.target.value }))}
              className={inputCls} placeholder="e.g. University of Edinburgh" />
          </Field>
          <Field label="Degree Title" required>
            <input value={form.degree} onChange={(e) => setForm((f) => ({ ...f, degree: e.target.value }))}
              className={inputCls} placeholder="e.g. MSc Sustainable Finance" />
          </Field>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Field label="Area of Study">
            <input value={form.studyArea} onChange={(e) => setForm((f) => ({ ...f, studyArea: e.target.value }))}
              className={inputCls} placeholder="e.g. Environmental Economics" />
          </Field>
          <Field label="Expected Graduation Year">
            <select value={form.graduationYear} onChange={(e) => setForm((f) => ({ ...f, graduationYear: e.target.value }))}
              className={inputCls}>
              <option value="">Select year…</option>
              {GRADUATION_YEARS.map((y) => <option key={y} value={y}>{y}</option>)}
            </select>
          </Field>
        </div>

        <Field label="Dissertation / Research Topic">
          <input value={form.dissertationTopic} onChange={(e) => setForm((f) => ({ ...f, dissertationTopic: e.target.value }))}
            className={inputCls} placeholder="Brief title or topic" />
        </Field>
      </div>

      <div className="rounded-xl border border-border bg-card p-6 space-y-5">
        <h2 className="font-semibold text-foreground">Personal Details</h2>

        <Field label="Location (City / Country)">
          <input value={form.location} onChange={(e) => setForm((f) => ({ ...f, location: e.target.value }))}
            className={inputCls} placeholder="e.g. London, UK" />
        </Field>

        <Field label="Professional Summary">
          <textarea value={form.bio} onChange={(e) => setForm((f) => ({ ...f, bio: e.target.value }))}
            rows={4} className={inputCls + ' resize-none'}
            placeholder="A short paragraph about your career aspirations, ESG passion, and what makes you stand out…" />
        </Field>

        <div className="grid grid-cols-2 gap-4">
          <Field label="LinkedIn URL">
            <input value={form.linkedIn} onChange={(e) => setForm((f) => ({ ...f, linkedIn: e.target.value }))}
              className={inputCls} placeholder="https://linkedin.com/in/…" />
          </Field>
          <Field label="Portfolio / Website">
            <input value={form.portfolioUrl} onChange={(e) => setForm((f) => ({ ...f, portfolioUrl: e.target.value }))}
              className={inputCls} placeholder="https://…" />
          </Field>
        </div>

        <Field label="Skills (comma-separated)">
          <input value={form.skills} onChange={(e) => setForm((f) => ({ ...f, skills: e.target.value }))}
            className={inputCls} placeholder="e.g. Python, TCFD Reporting, Stakeholder Engagement" />
        </Field>
      </div>

      <div className="rounded-xl border border-border bg-card p-6 space-y-5">
        <h2 className="font-semibold text-foreground">ESG Interests</h2>
        <p className="text-sm text-muted-foreground -mt-2">Select all that apply — these help employers find you.</p>
        <div className="flex flex-wrap gap-2">
          {ESG_INTERESTS.map((i) => (
            <button
              key={i}
              onClick={() => toggleInterest(i)}
              className={`text-sm px-3 py-1.5 rounded-full border transition-colors ${
                form.esgInterests.includes(i)
                  ? 'bg-primary/15 border-primary/40 text-primary'
                  : 'bg-muted border-border text-muted-foreground hover:border-primary/30'
              }`}
            >
              {i}
            </button>
          ))}
        </div>
      </div>

      <div className="rounded-xl border border-border bg-card p-6 space-y-4">
        <h2 className="font-semibold text-foreground">Availability & Preferences</h2>

        <div className="grid grid-cols-2 gap-4">
          <Field label="Available From">
            <input value={form.availableFrom} onChange={(e) => setForm((f) => ({ ...f, availableFrom: e.target.value }))}
              className={inputCls} placeholder="e.g. June 2025 or Immediately" />
          </Field>
        </div>

        <label className="flex items-center gap-3 cursor-pointer group">
          <input type="checkbox" checked={form.placementAvailable}
            onChange={(e) => setForm((f) => ({ ...f, placementAvailable: e.target.checked }))}
            className="h-4 w-4 accent-primary" />
          <div>
            <p className="text-sm font-medium text-foreground">Available for Placement / Internship</p>
            <p className="text-xs text-muted-foreground">Show an "Available" badge on your profile</p>
          </div>
        </label>

        <label className="flex items-center gap-3 cursor-pointer group">
          <input type="checkbox" checked={form.showEmail}
            onChange={(e) => setForm((f) => ({ ...f, showEmail: e.target.checked }))}
            className="h-4 w-4 accent-primary" />
          <div>
            <p className="text-sm font-medium text-foreground">Show my email address on my public profile</p>
            <p className="text-xs text-muted-foreground">Allows employers to contact you directly (recommended: use LinkedIn instead)</p>
          </div>
        </label>
      </div>

      {/* Interest received */}
      <InterestReceived />

      {error && <p className="text-sm text-red-500">{error}</p>}

      <div className="flex items-center gap-3 pb-6">
        <Button onClick={() => save()} disabled={isPending} size="lg">
          {isPending ? 'Saving…' : 'Save Profile'}
        </Button>
        {saved && (
          <span className="flex items-center gap-1.5 text-sm text-green-400">
            <CheckCircle className="h-4 w-4" />
            Saved!
          </span>
        )}
      </div>
    </div>
  );
}

function InterestReceived() {
  const { data: expressions = [] } = useQuery<any[]>({
    queryKey: ['interest-received'],
    queryFn: () => api.get('/talent/interest-received'),
    retry: false,
  });

  if (!expressions.length) return null;

  return (
    <div className="rounded-xl border border-border bg-card p-6 space-y-4">
      <div className="flex items-center gap-2">
        <Briefcase className="h-5 w-5 text-primary" />
        <h2 className="font-semibold text-foreground">Interest Received ({expressions.length})</h2>
      </div>
      <div className="space-y-3">
        {expressions.map((e: any) => (
          <div key={e.id} className="rounded-lg border border-border p-4 space-y-1">
            <div className="flex items-center gap-2">
              <div className="h-7 w-7 rounded-full bg-primary/20 flex items-center justify-center text-primary text-xs font-bold">
                {(e.corporate?.displayName || e.corporate?.username || '?').charAt(0).toUpperCase()}
              </div>
              <div>
                <p className="text-sm font-medium text-foreground">
                  {e.corporate?.displayName || e.corporate?.username}
                  {e.corporate?.corporateProfile?.companyName && (
                    <span className="text-muted-foreground font-normal"> · {e.corporate.corporateProfile.companyName}</span>
                  )}
                </p>
                <p className="text-xs text-muted-foreground">{new Date(e.createdAt).toLocaleDateString()}</p>
              </div>
            </div>
            {e.message && <p className="text-sm text-muted-foreground pl-9">{e.message}</p>}
          </div>
        ))}
      </div>
    </div>
  );
}

function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <label className="text-sm font-medium text-foreground">
        {label}{required && <span className="text-red-400 ml-0.5">*</span>}
      </label>
      {children}
    </div>
  );
}

const inputCls = 'w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50';
