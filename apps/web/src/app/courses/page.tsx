'use client';
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { api } from '@/lib/api';
import { GraduationCap, ExternalLink, Plus, Calendar, MapPin, Tag, Award } from 'lucide-react';
import { Button } from '@/components/ui/button';

const DELIVERY_MODES = ['All', 'Online', 'In-person', 'Hybrid'];

export default function CoursesPage() {
  const { user } = useAuth();
  const [deliveryFilter, setDeliveryFilter] = useState('All');
  const [showSubmitForm, setShowSubmitForm] = useState(false);

  const { data: courses = [], isLoading, refetch } = useQuery<any[]>({
    queryKey: ['courses'],
    queryFn: () => api.get('/courses'),
  });

  const filtered = deliveryFilter === 'All'
    ? courses
    : courses.filter((c: any) => c.deliveryMode?.toLowerCase() === deliveryFilter.toLowerCase());

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <GraduationCap className="h-6 w-6 text-primary" />
            <h1 className="text-3xl font-bold">Course Marketplace</h1>
          </div>
          <p className="text-muted-foreground">
            Training courses in ESG, governance, and sustainability — from our platform partners
            and external providers, many delivered via the Delena platform.
          </p>
        </div>
        {user && (
          <Button onClick={() => setShowSubmitForm(!showSubmitForm)} className="shrink-0">
            <Plus className="h-4 w-4 mr-2" />
            List a Course
          </Button>
        )}
      </div>

      {/* Delena partnership note */}
      <div className="rounded-xl border border-primary/20 bg-primary/5 p-5">
        <div className="flex items-start gap-3">
          <Award className="h-5 w-5 text-primary shrink-0 mt-0.5" />
          <div>
            <h3 className="font-semibold text-foreground mb-1">Powered by Delena</h3>
            <p className="text-sm text-muted-foreground">
              Courses listed on this platform that are run through our infrastructure are delivered
              via our partner platform Delena — a global, technology-first learning platform.
              When you click through to a Delena-delivered course, the ESG Intelligence Network
              receives a referral commission at no extra cost to you.
            </p>
          </div>
        </div>
      </div>

      {/* Submit form (inline, collapsed by default) */}
      {showSubmitForm && user && (
        <CourseSubmitForm onSuccess={() => { setShowSubmitForm(false); refetch(); }} />
      )}

      {/* Filters */}
      <div className="flex gap-2 flex-wrap">
        {DELIVERY_MODES.map((mode) => (
          <button
            key={mode}
            onClick={() => setDeliveryFilter(mode)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
              deliveryFilter === mode
                ? 'bg-primary text-primary-foreground border-primary'
                : 'border-border text-muted-foreground hover:border-primary/50 hover:text-foreground'
            }`}
          >
            {mode}
          </button>
        ))}
      </div>

      {/* Courses */}
      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => <div key={i} className="h-32 rounded-xl bg-muted animate-pulse" />)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border p-12 text-center">
          <GraduationCap className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
          <p className="text-muted-foreground mb-3">No courses listed yet.</p>
          {user && (
            <Button variant="outline" size="sm" onClick={() => setShowSubmitForm(true)}>
              Be the first to list a course
            </Button>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map((course: any) => (
            <CourseCard key={course.id} course={course} />
          ))}
        </div>
      )}
    </div>
  );
}

function CourseCard({ course }: { course: any }) {
  const linkUrl = course.commissionUrl || course.externalUrl;

  return (
    <div className="rounded-xl border border-border bg-card hover:border-primary/30 transition-colors p-6">
      <div className="flex items-start gap-4">
        <div className="rounded-lg bg-primary/10 p-3 text-primary shrink-0">
          <GraduationCap className="h-5 w-5" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h3 className="font-semibold text-foreground text-lg">{course.title}</h3>
              <p className="text-sm text-primary/80 mt-0.5">{course.providerName}</p>
            </div>
            {course.price && (
              <span className="text-sm font-semibold text-foreground shrink-0 bg-muted px-3 py-1 rounded-full">
                {course.price}
              </span>
            )}
          </div>

          <p className="text-sm text-muted-foreground mt-2 line-clamp-3">{course.description}</p>

          <div className="flex flex-wrap gap-4 mt-3 text-xs text-muted-foreground">
            {course.deliveryMode && (
              <span className="flex items-center gap-1">
                <MapPin className="h-3.5 w-3.5" />
                {course.deliveryMode}
              </span>
            )}
            {course.startDate && (
              <span className="flex items-center gap-1">
                <Calendar className="h-3.5 w-3.5" />
                {new Date(course.startDate).toLocaleDateString('en-GB', { month: 'long', year: 'numeric' })}
              </span>
            )}
            {course.sectors?.length > 0 && (
              <span className="flex items-center gap-1">
                <Tag className="h-3.5 w-3.5" />
                {course.sectors.join(', ')}
              </span>
            )}
            {course.isExternalProvider && (
              <span className="px-2 py-0.5 rounded-full border border-border">External provider</span>
            )}
            {!course.isExternalProvider && (
              <span className="px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20">
                Delena partner
              </span>
            )}
          </div>

          {linkUrl && (
            <div className="mt-4">
              <a href={linkUrl} target="_blank" rel="noopener noreferrer">
                <Button size="sm" variant={course.commissionUrl ? 'default' : 'outline'}>
                  <ExternalLink className="h-3.5 w-3.5 mr-1.5" />
                  {course.commissionUrl ? 'Enrol via Delena' : 'Visit Course'}
                </Button>
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function CourseSubmitForm({ onSuccess }: { onSuccess: () => void }) {
  const [form, setForm] = useState({
    title: '',
    providerName: '',
    description: '',
    isExternalProvider: false,
    externalUrl: '',
    price: '',
    deliveryMode: 'Online',
    startDate: '',
    sectors: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'}/courses`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          ...form,
          sectors: form.sectors ? form.sectors.split(',').map((s) => s.trim()) : [],
        }),
      });
      if (!res.ok) {
        const json = await res.json();
        throw new Error(json.message || 'Submission failed');
      }
      onSuccess();
    } catch (err: any) {
      setError(err.message || 'Submission failed');
    } finally {
      setSubmitting(false);
    }
  }

  const f = (field: string, value: any) => setForm((prev) => ({ ...prev, [field]: value }));

  return (
    <div className="rounded-xl border border-primary/30 bg-primary/5 p-6 space-y-4">
      <h3 className="font-semibold text-lg">Submit a Course Listing</h3>
      <p className="text-sm text-muted-foreground">
        All listings are reviewed before going live. Platform courses delivered via Delena are
        listed free. External provider courses are subject to a listing fee — our team will be
        in touch after submission.
      </p>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-sm font-medium">Course Title *</label>
            <input required value={form.title} onChange={(e) => f('title', e.target.value)}
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50" />
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium">Provider / Organisation *</label>
            <input required value={form.providerName} onChange={(e) => f('providerName', e.target.value)}
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50" />
          </div>
        </div>
        <div className="space-y-1.5">
          <label className="text-sm font-medium">Description *</label>
          <textarea required rows={3} value={form.description} onChange={(e) => f('description', e.target.value)}
            className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary/50" />
        </div>
        <div className="grid sm:grid-cols-3 gap-4">
          <div className="space-y-1.5">
            <label className="text-sm font-medium">Delivery Mode</label>
            <select value={form.deliveryMode} onChange={(e) => f('deliveryMode', e.target.value)}
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm">
              <option>Online</option><option>In-person</option><option>Hybrid</option>
            </select>
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium">Price</label>
            <input value={form.price} onChange={(e) => f('price', e.target.value)} placeholder="e.g. £495 or Free"
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm" />
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium">Start Date</label>
            <input type="date" value={form.startDate} onChange={(e) => f('startDate', e.target.value)}
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm" />
          </div>
        </div>
        <div className="space-y-1.5">
          <label className="text-sm font-medium">External URL</label>
          <input value={form.externalUrl} onChange={(e) => f('externalUrl', e.target.value)} placeholder="https://..."
            className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm" />
        </div>
        <div className="space-y-1.5">
          <label className="text-sm font-medium">Sectors (comma-separated)</label>
          <input value={form.sectors} onChange={(e) => f('sectors', e.target.value)} placeholder="e.g. ESG, Climate, Governance"
            className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm" />
        </div>
        <label className="flex items-center gap-3 cursor-pointer">
          <input type="checkbox" checked={form.isExternalProvider} onChange={(e) => f('isExternalProvider', e.target.checked)} className="accent-primary" />
          <span className="text-sm text-muted-foreground">This course is run by an external provider (not through the ESG Intelligence Network / Delena partnership)</span>
        </label>
        {error && <p className="text-sm text-destructive">{error}</p>}
        <div className="flex gap-3">
          <Button type="submit" disabled={submitting}>{submitting ? 'Submitting…' : 'Submit for Review'}</Button>
          <Button type="button" variant="outline" onClick={onSuccess}>Cancel</Button>
        </div>
      </form>
    </div>
  );
}
