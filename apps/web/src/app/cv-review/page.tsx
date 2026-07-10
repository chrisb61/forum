'use client';
import { useState, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { api } from '@/lib/api';
import { FileText, Upload, CheckCircle, Clock, Star, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

const STATUS_LABELS: Record<string, { label: string; colour: string }> = {
  RECEIVED: { label: 'Received', colour: 'text-blue-400 bg-blue-400/10 border-blue-400/20' },
  IN_REVIEW: { label: 'In Review', colour: 'text-amber-400 bg-amber-400/10 border-amber-400/20' },
  COMPLETED: { label: 'Completed', colour: 'text-green-400 bg-green-400/10 border-green-400/20' },
  CANCELLED: { label: 'Cancelled', colour: 'text-muted-foreground bg-muted border-border' },
};

const BENEFITS = [
  { icon: Star, title: 'ESG & Governance specialists', body: 'Our reviewers have deep expertise in ESG roles, board positions, sustainability reporting, and governance — so your CV speaks the right language.' },
  { icon: FileText, title: 'ATS-optimised formatting', body: 'We restructure your CV so it passes applicant tracking systems used by corporates and recruiters in the sustainability space.' },
  { icon: CheckCircle, title: 'Compliance-checked', body: 'Where relevant, we flag any regulatory considerations, particularly important for members from FCA-regulated backgrounds.' },
  { icon: Clock, title: 'Fast turnaround', body: '3–5 working days for a full review and rewrite. Premium same-day service available on request.' },
];

export default function CvReviewPage() {
  const { user } = useAuth();
  const fileRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const { data: submissions = [], refetch } = useQuery<any[]>({
    queryKey: ['cv-submissions'],
    queryFn: () => api.get('/cv-submissions/mine'),
    enabled: !!user,
  });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!file) { setError('Please select your CV file.'); return; }
    setSubmitting(true);
    setError('');
    try {
      const data = new FormData();
      data.append('file', file);
      if (notes) data.append('notes', notes);

      const token = localStorage.getItem('token');
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'}/cv-submissions`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: data,
      });
      if (!res.ok) {
        const json = await res.json();
        throw new Error(json.message || 'Submission failed');
      }
      setSuccess(true);
      refetch();
    } catch (err: any) {
      setError(err.message || 'Submission failed. Please try again.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="max-w-4xl mx-auto space-y-10">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 mb-2">
          <FileText className="h-6 w-6 text-primary" />
          <h1 className="text-3xl font-bold">CV Writing Service</h1>
        </div>
        <p className="text-muted-foreground max-w-2xl">
          Get your CV professionally reviewed and rewritten by specialists who understand ESG,
          governance, sustainability, and board-level roles. Stand out in a competitive market.
        </p>
      </div>

      {/* Benefits */}
      <div className="grid sm:grid-cols-2 gap-4">
        {BENEFITS.map(({ icon: Icon, title, body }) => (
          <div key={title} className="rounded-xl border border-border bg-card p-5 space-y-2">
            <div className="flex items-center gap-2.5 text-primary">
              <Icon className="h-5 w-5" />
              <h3 className="font-semibold text-foreground">{title}</h3>
            </div>
            <p className="text-sm text-muted-foreground">{body}</p>
          </div>
        ))}
      </div>

      {/* Pricing */}
      <div className="rounded-xl border border-primary/20 bg-primary/5 p-6">
        <h2 className="font-bold text-lg mb-4">Pricing</h2>
        <div className="grid sm:grid-cols-3 gap-4">
          {[
            { name: 'Review & Feedback', price: '£79', desc: 'Detailed written feedback on your existing CV with specific recommendations' },
            { name: 'Full Rewrite', price: '£149', desc: 'Complete professional rewrite, tailored for ESG and governance roles' },
            { name: 'Premium (24hr)', price: '£249', desc: 'Full rewrite with same-day delivery — ideal before application deadlines' },
          ].map(({ name, price, desc }) => (
            <div key={name} className="rounded-lg border border-border bg-card p-4 text-center space-y-2">
              <p className="font-semibold">{name}</p>
              <p className="text-2xl font-bold text-primary">{price}</p>
              <p className="text-xs text-muted-foreground">{desc}</p>
            </div>
          ))}
        </div>
        <p className="text-xs text-muted-foreground mt-4">
          * Pricing subject to final confirmation. After submitting your CV, our team will
          review and contact you with service options and payment details.
        </p>
      </div>

      {/* Submit or sign-in prompt */}
      {!user ? (
        <div className="rounded-xl border border-border p-8 text-center space-y-4">
          <p className="text-muted-foreground">Sign in to submit your CV for professional review.</p>
          <div className="flex justify-center gap-3">
            <Link href="/login"><Button>Sign in</Button></Link>
            <Link href="/register"><Button variant="outline">Register</Button></Link>
          </div>
        </div>
      ) : success ? (
        <div className="rounded-xl border border-primary/30 bg-primary/5 p-8 text-center space-y-4">
          <CheckCircle className="h-12 w-12 text-primary mx-auto" />
          <h3 className="text-xl font-bold">CV Received</h3>
          <p className="text-muted-foreground max-w-md mx-auto">
            Your CV has been received. Our team will review it and contact you within 24 hours
            with service options and next steps.
          </p>
          <Button onClick={() => { setSuccess(false); setFile(null); setNotes(''); }}>
            Submit Another
          </Button>
        </div>
      ) : (
        <div className="rounded-xl border border-border p-6 space-y-5">
          <h2 className="font-bold text-lg">Submit Your CV</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div
              onClick={() => fileRef.current?.click()}
              className="rounded-lg border-2 border-dashed border-border hover:border-primary/40 p-8 text-center cursor-pointer transition-colors"
            >
              {file ? (
                <div className="space-y-1">
                  <CheckCircle className="h-6 w-6 text-primary mx-auto" />
                  <p className="font-medium">{file.name}</p>
                  <p className="text-xs text-muted-foreground">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                </div>
              ) : (
                <div className="space-y-2">
                  <Upload className="h-8 w-8 text-muted-foreground mx-auto" />
                  <p className="text-sm text-muted-foreground">Click to upload your CV</p>
                  <p className="text-xs text-muted-foreground">PDF or Word document — Max 10 MB</p>
                </div>
              )}
            </div>
            <input
              ref={fileRef}
              type="file"
              accept=".pdf,.doc,.docx"
              className="hidden"
              onChange={(e) => setFile(e.target.files?.[0] ?? null)}
            />

            <div className="space-y-1.5">
              <label className="text-sm font-medium">Additional Notes (optional)</label>
              <textarea
                rows={3}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Tell us about the types of roles you are targeting, any specific concerns, or anything else useful for our reviewers"
                className="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary/50 placeholder:text-muted-foreground text-foreground"
              />
            </div>

            {error && (
              <p className="text-sm text-destructive">{error}</p>
            )}

            <Button type="submit" disabled={submitting || !file} className="w-full">
              {submitting ? 'Uploading…' : 'Submit CV for Review'}
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </form>
        </div>
      )}

      {/* Past submissions */}
      {user && submissions.length > 0 && (
        <div className="space-y-3">
          <h2 className="font-bold text-lg">Your Submissions</h2>
          <div className="space-y-2">
            {submissions.map((sub: any) => {
              const status = STATUS_LABELS[sub.status] ?? STATUS_LABELS.RECEIVED;
              return (
                <div key={sub.id} className="rounded-lg border border-border bg-card p-4 flex items-center gap-4">
                  <FileText className="h-5 w-5 text-muted-foreground shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">{sub.filename}</p>
                    <p className="text-xs text-muted-foreground">
                      Submitted {new Date(sub.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}
                    </p>
                    {sub.reviewerNote && (
                      <p className="text-xs text-muted-foreground mt-1 italic">"{sub.reviewerNote}"</p>
                    )}
                  </div>
                  <span className={`text-xs px-2.5 py-1 rounded-full border font-medium ${status.colour}`}>
                    {status.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
