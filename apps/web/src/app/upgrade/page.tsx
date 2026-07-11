'use client';
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { api } from '@/lib/api';
import {
  ArrowUpCircle, CheckCircle, Clock, XCircle,
  ArrowLeft, AlertTriangle, Star, Users, BookOpen, Unlock,
} from 'lucide-react';
import { Button } from '@/components/ui/button';

const STATUS_STYLES: Record<string, string> = {
  PENDING: 'text-amber-400 bg-amber-400/10 border-amber-400/20',
  APPROVED: 'text-green-400 bg-green-400/10 border-green-400/20',
  REJECTED: 'text-destructive bg-destructive/10 border-destructive/20',
};

const PROFESSIONAL_BENEFITS = [
  { icon: Star, text: 'Create and manage Groups & Cohorts' },
  { icon: Users, text: 'Full access to the Talent Corridor — connect with graduates and corporates' },
  { icon: BookOpen, text: 'Upload and share resources with the full community' },
  { icon: Unlock, text: 'Access all professional forums, events, and opportunities' },
  { icon: ArrowUpCircle, text: 'Eligible for board opportunity listings and endorsements' },
];

export default function UpgradePage() {
  const { user } = useAuth();
  const router = useRouter();

  const { data: applications = [] } = useQuery<any[]>({
    queryKey: ['upgrade-mine'],
    queryFn: () => api.get('/upgrade/mine'),
    enabled: !!user,
  });

  const hasPending = applications.some((a) => a.status === 'PENDING');
  const lastApproved = applications.find((a) => a.status === 'APPROVED');

  const [form, setForm] = useState({
    jobTitle: '',
    employer: '',
    yearsExperience: '',
    qualifications: '',
    linkedIn: '',
    statement: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  if (!user) {
    return (
      <div className="max-w-xl mx-auto text-center py-20 space-y-4">
        <p className="text-muted-foreground">Please sign in to apply for a membership upgrade.</p>
        <Link href="/login"><Button>Sign in</Button></Link>
      </div>
    );
  }

  if (user.memberType !== 'STUDENT') {
    return (
      <div className="max-w-xl mx-auto text-center py-20 space-y-4">
        <CheckCircle className="h-14 w-14 text-primary mx-auto" />
        <h2 className="text-2xl font-bold">You already have full access</h2>
        <p className="text-muted-foreground">
          Your account is registered as <strong>{user.memberType?.toLowerCase()}</strong> —
          no upgrade is needed. All professional features are already available to you.
        </p>
        <Link href="/settings"><Button variant="outline">Back to Settings</Button></Link>
      </div>
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      await api.post('/upgrade', { ...form, yearsExperience: form.yearsExperience ? Number(form.yearsExperience) : undefined, targetType: 'PROFESSIONAL' });
      setSuccess(true);
    } catch (err: any) {
      setError(err.message || 'Submission failed. Please try again.');
    } finally {
      setSubmitting(false);
    }
  }

  const f = (field: string, value: string) => setForm((prev) => ({ ...prev, [field]: value }));

  if (success) {
    return (
      <div className="max-w-xl mx-auto text-center py-20 space-y-4">
        <CheckCircle className="h-14 w-14 text-primary mx-auto" />
        <h2 className="text-2xl font-bold">Application Submitted</h2>
        <p className="text-muted-foreground">
          Your upgrade application has been received. Our team will review it and respond
          within 3–5 working days. You will be notified of the outcome in your account.
        </p>
        <Link href="/settings"><Button variant="outline">Back to Settings</Button></Link>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <div>
        <Link href="/settings" className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-4">
          <ArrowLeft className="h-4 w-4" />
          Back to Settings
        </Link>
        <div className="flex items-center gap-3 mb-2">
          <ArrowUpCircle className="h-7 w-7 text-primary" />
          <h1 className="text-3xl font-bold">Upgrade to Professional</h1>
        </div>
        <p className="text-muted-foreground">
          Take your membership to the next level. Professional membership unlocks the full
          capabilities of the ESG Intelligence Network.
        </p>
      </div>

      {/* What you unlock */}
      <div className="rounded-xl border border-primary/20 bg-primary/5 p-6 space-y-4">
        <h2 className="font-bold text-lg">What you unlock</h2>
        <div className="space-y-3">
          {PROFESSIONAL_BENEFITS.map(({ icon: Icon, text }) => (
            <div key={text} className="flex items-center gap-3 text-sm">
              <Icon className="h-4 w-4 text-primary shrink-0" />
              <span className="text-foreground">{text}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Subscription notice */}
      <div className="rounded-lg border border-amber-500/30 bg-amber-500/10 px-5 py-4 flex gap-3">
        <AlertTriangle className="h-5 w-5 text-amber-500 shrink-0 mt-0.5" />
        <div className="text-sm text-amber-200 space-y-1">
          <p className="font-semibold text-amber-100">Important — Subscription Cost</p>
          <p>
            Upgrading your membership to Professional will increase your monthly subscription
            cost to reflect the additional features and access you will receive.
            Exact subscription pricing has not yet been finalised and may vary from year to year.
            Our team will confirm the applicable rate with you as part of the approval process
            before any changes are made to your billing.
          </p>
        </div>
      </div>

      {/* Previous applications */}
      {applications.length > 0 && (
        <div className="space-y-3">
          <h2 className="font-semibold">Your Applications</h2>
          {applications.map((app: any) => (
            <div key={app.id} className="rounded-lg border border-border bg-card p-4 flex items-start gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className={`text-xs px-2.5 py-1 rounded-full border font-medium ${STATUS_STYLES[app.status]}`}>
                    {app.status === 'PENDING' && <><Clock className="h-3 w-3 inline mr-1" />Under Review</>}
                    {app.status === 'APPROVED' && <><CheckCircle className="h-3 w-3 inline mr-1" />Approved</>}
                    {app.status === 'REJECTED' && <><XCircle className="h-3 w-3 inline mr-1" />Not Approved</>}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    Submitted {new Date(app.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}
                  </span>
                </div>
                {app.reviewerNote && (
                  <p className="text-sm text-muted-foreground mt-2 italic">
                    Reviewer note: "{app.reviewerNote}"
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Application form */}
      {hasPending ? (
        <div className="rounded-xl border border-border p-6 text-center space-y-2">
          <Clock className="h-8 w-8 text-muted-foreground mx-auto" />
          <p className="font-medium">Application under review</p>
          <p className="text-sm text-muted-foreground">
            Your application is being reviewed by our team. You cannot submit a new application
            while one is pending. We aim to respond within 3–5 working days.
          </p>
        </div>
      ) : (
        <div className="rounded-xl border border-border p-6 space-y-6">
          <div>
            <h2 className="font-bold text-lg mb-1">Application Form</h2>
            <p className="text-sm text-muted-foreground">
              Tell us about your professional background so we can verify your eligibility
              for Professional membership. All fields marked * are required.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-sm font-medium">Current Job Title *</label>
                <input
                  required
                  value={form.jobTitle}
                  onChange={(e) => f('jobTitle', e.target.value)}
                  placeholder="e.g. Sustainability Manager"
                  className="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium">Employer / Organisation *</label>
                <input
                  required
                  value={form.employer}
                  onChange={(e) => f('employer', e.target.value)}
                  placeholder="e.g. KPMG, self-employed, NHS"
                  className="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                />
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-sm font-medium">Years of Professional Experience *</label>
                <input
                  required
                  type="number"
                  min={0}
                  max={50}
                  value={form.yearsExperience}
                  onChange={(e) => f('yearsExperience', e.target.value)}
                  placeholder="e.g. 3"
                  className="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium">LinkedIn Profile URL</label>
                <input
                  value={form.linkedIn}
                  onChange={(e) => f('linkedIn', e.target.value)}
                  placeholder="https://linkedin.com/in/yourprofile"
                  className="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium">Relevant Qualifications</label>
              <input
                value={form.qualifications}
                onChange={(e) => f('qualifications', e.target.value)}
                placeholder="e.g. CFA, CISI, ESG Certificate, MBA, IEMA"
                className="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium">Personal Statement *</label>
              <textarea
                required
                rows={5}
                value={form.statement}
                onChange={(e) => f('statement', e.target.value)}
                placeholder="Tell us about your professional background, your experience in ESG or sustainability, and why you would like to upgrade to Professional membership. What do you hope to contribute to and gain from the ESG Intelligence Network?"
                className="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none"
              />
              <p className="text-xs text-muted-foreground">Minimum 100 characters. {form.statement.length} entered.</p>
            </div>

            {error && (
              <div className="rounded-lg bg-destructive/10 border border-destructive/30 px-4 py-3 text-sm text-destructive">
                {error}
              </div>
            )}

            <Button
              type="submit"
              disabled={submitting || form.statement.length < 100}
              className="w-full"
            >
              {submitting ? 'Submitting…' : 'Submit Upgrade Application'}
            </Button>
          </form>
        </div>
      )}
    </div>
  );
}
