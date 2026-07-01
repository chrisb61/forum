'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';

const API = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000';

const TYPES = [
  { value: 'NED', label: 'Non-Executive Director' },
  { value: 'CHAIR', label: 'Chair' },
  { value: 'ADVISORY_BOARD', label: 'Advisory Board' },
  { value: 'COMMITTEE', label: 'Committee' },
  { value: 'TRUSTEE', label: 'Trustee' },
  { value: 'FRACTIONAL_EXECUTIVE', label: 'Fractional Executive' },
  { value: 'INVESTOR', label: 'Investor' },
  { value: 'MENTOR', label: 'Mentor' },
];

const SECTORS = [
  'Financial Services', 'Healthcare', 'Technology', 'Energy & Utilities',
  'ESG & Sustainability', 'Private Equity', 'Real Estate', 'Education',
  'Professional Services', 'Infrastructure', 'Retail & Consumer', 'Media',
  'Public Sector', 'Charity & NFP', 'Manufacturing',
];

export default function NewOpportunityPage() {
  const { user, token } = useAuth();
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [selectedSectors, setSelectedSectors] = useState<string[]>([]);

  const [form, setForm] = useState({
    title: '', organisation: '', type: 'NED', description: '',
    requirements: '', location: '', remuneration: '', timeCommitment: '',
    closingDate: '', isAnonymous: false,
  });

  if (!user) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center text-muted-foreground">
        Please sign in to post an opportunity.
      </div>
    );
  }

  const toggleSector = (s: string) =>
    setSelectedSectors(prev => prev.includes(s) ? prev.filter(x => x !== s) : [...prev, s]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      const res = await fetch(`${API}/api/v1/opportunities`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ ...form, sectors: selectedSectors }),
      });
      if (!res.ok) throw new Error('Failed to post opportunity');
      const data = await res.json();
      router.push(`/opportunities/${data.id}`);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const field = (label: string, key: keyof typeof form, opts?: { type?: string; placeholder?: string; rows?: number }) => (
    <div>
      <label className="block text-sm font-medium text-foreground mb-1.5">{label}</label>
      {opts?.rows ? (
        <textarea
          rows={opts.rows}
          placeholder={opts?.placeholder}
          value={form[key] as string}
          onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
          className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary resize-none"
        />
      ) : (
        <input
          type={opts?.type ?? 'text'}
          placeholder={opts?.placeholder}
          value={form[key] as string}
          onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
          className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary"
        />
      )}
    </div>
  );

  return (
    <div className="max-w-2xl mx-auto px-4 py-10">
      <h1 className="text-2xl font-bold text-foreground mb-2">Post a Board Opportunity</h1>
      <p className="text-muted-foreground text-sm mb-8">Share a NED, Chair, Advisory or Executive role with the network</p>

      <form onSubmit={handleSubmit} className="space-y-6">
        {field('Role Title', 'title', { placeholder: 'e.g. Non-Executive Director — Healthcare' })}

        <div>
          <label className="block text-sm font-medium text-foreground mb-1.5">Opportunity Type</label>
          <select
            value={form.type}
            onChange={e => setForm(f => ({ ...f, type: e.target.value }))}
            className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:border-primary"
          >
            {TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
          </select>
        </div>

        <div className="flex items-center gap-3">
          <input
            type="checkbox"
            id="anon"
            checked={form.isAnonymous}
            onChange={e => setForm(f => ({ ...f, isAnonymous: e.target.checked }))}
            className="rounded border-border"
          />
          <label htmlFor="anon" className="text-sm text-foreground">Keep organisation name confidential</label>
        </div>

        {!form.isAnonymous && field('Organisation', 'organisation', { placeholder: 'Company or organisation name' })}

        {field('Description', 'description', { rows: 5, placeholder: 'Describe the role, its responsibilities, and what you are looking for...' })}
        {field('Requirements', 'requirements', { rows: 3, placeholder: 'Experience, qualifications, or skills required...' })}

        <div>
          <label className="block text-sm font-medium text-foreground mb-2">Relevant Sectors</label>
          <div className="flex flex-wrap gap-2">
            {SECTORS.map(s => (
              <button
                key={s} type="button"
                onClick={() => toggleSector(s)}
                className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${selectedSectors.includes(s) ? 'bg-primary text-primary-foreground border-primary' : 'border-border text-muted-foreground hover:border-primary/50'}`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          {field('Location', 'location', { placeholder: 'e.g. London / Remote' })}
          {field('Time Commitment', 'timeCommitment', { placeholder: 'e.g. 2 days/month' })}
        </div>
        <div className="grid grid-cols-2 gap-4">
          {field('Remuneration', 'remuneration', { placeholder: 'e.g. £40,000 p.a. / Equity / Pro bono' })}
          {field('Closing Date', 'closingDate', { type: 'date' })}
        </div>

        {error && <p className="text-red-400 text-sm">{error}</p>}

        <div className="flex gap-3 pt-2">
          <Button type="submit" disabled={saving} className="bg-primary text-primary-foreground hover:bg-primary/90">
            {saving ? 'Posting…' : 'Post Opportunity'}
          </Button>
          <Button type="button" variant="outline" onClick={() => router.back()}>Cancel</Button>
        </div>
      </form>
    </div>
  );
}
