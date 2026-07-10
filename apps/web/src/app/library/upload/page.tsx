'use client';
import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { AlertTriangle, Upload, ArrowLeft, CheckCircle, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';

const RESOURCE_TYPES = [
  { value: 'DOCUMENT', label: 'Document (PDF, Word, PowerPoint)', accept: '.pdf,.doc,.docx,.ppt,.pptx' },
  { value: 'AUDIO', label: 'Audio recording (MP3, WAV)', accept: '.mp3,.wav,.m4a' },
  { value: 'VIDEO_EMBED', label: 'Video (YouTube / Vimeo embed link)', accept: null },
  { value: 'IMAGE', label: 'Image (JPEG, PNG)', accept: '.jpg,.jpeg,.png,.gif,.webp' },
  { value: 'OTHER', label: 'Other document', accept: '*' },
];

const CATEGORIES = [
  'ESG Strategy',
  'Governance',
  'Regulatory & Compliance',
  'Sustainability Reporting',
  'Climate & Environment',
  'Social Impact',
  'AI & Technology',
  'Career & Professional Development',
];

const FINANCIAL_KEYWORDS = [
  'invest', 'investment', 'return', 'profit', 'guaranteed', 'income', 'yield',
  'portfolio', 'fund', 'bond', 'equity', 'shares', 'dividend', 'pension',
];

function containsFinancialTerms(text: string) {
  const lower = text.toLowerCase();
  return FINANCIAL_KEYWORDS.some((kw) => lower.includes(kw));
}

export default function UploadResourcePage() {
  const { user } = useAuth();
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState({
    title: '',
    description: '',
    type: 'DOCUMENT',
    embedUrl: '',
    category: '',
    tags: '',
    ipDeclared: false,
  });
  const [file, setFile] = useState<File | null>(null);
  const [financialWarning, setFinancialWarning] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  if (!user) {
    return (
      <div className="max-w-xl mx-auto text-center py-20">
        <p className="text-muted-foreground mb-4">You must be signed in to upload resources.</p>
        <Link href="/login"><Button>Sign in</Button></Link>
      </div>
    );
  }

  function handleTextChange(field: string, value: string) {
    setForm((f) => ({ ...f, [field]: value }));
    if (field === 'title' || field === 'description') {
      const combined = `${field === 'title' ? value : form.title} ${field === 'description' ? value : form.description}`;
      setFinancialWarning(containsFinancialTerms(combined));
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');

    if (!form.ipDeclared) {
      setError('You must declare that you own or have the right to share this content.');
      return;
    }
    if (form.type === 'VIDEO_EMBED' && !form.embedUrl) {
      setError('Please provide an embed URL for video content.');
      return;
    }
    if (form.type !== 'VIDEO_EMBED' && !file) {
      setError('Please select a file to upload.');
      return;
    }

    setSubmitting(true);
    try {
      const data = new FormData();
      data.append('title', form.title);
      if (form.description) data.append('description', form.description);
      data.append('type', form.type);
      if (form.embedUrl) data.append('embedUrl', form.embedUrl);
      if (form.category) data.append('category', form.category);
      if (form.tags) data.append('tags', form.tags);
      data.append('ipDeclared', 'true');
      if (file) data.append('file', file);

      const token = localStorage.getItem('token');
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'}/library`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: data,
      });

      if (!res.ok) {
        const text = await res.text();
        console.error('Upload error response:', res.status, text);
        let readable = 'Upload failed';
        try {
          const json = JSON.parse(text);
          const msg = json.message;
          readable = Array.isArray(msg) ? msg.join(', ') : typeof msg === 'string' ? msg : text;
        } catch { readable = text || 'Upload failed'; }
        throw new Error(readable);
      }

      setSuccess(true);
    } catch (err: any) {
      setError(err.message || 'Upload failed. Please try again.');
    } finally {
      setSubmitting(false);
    }
  }

  if (success) {
    return (
      <div className="max-w-xl mx-auto py-16 text-center space-y-4">
        <CheckCircle className="h-14 w-14 text-primary mx-auto" />
        <h2 className="text-2xl font-bold">Upload Received</h2>
        <p className="text-muted-foreground">
          Your resource has been submitted for moderation. Our team will review it before it
          goes live in the library — usually within 24–48 hours.
        </p>
        <div className="flex justify-center gap-3">
          <Link href="/library"><Button>Back to Library</Button></Link>
          <Button variant="outline" onClick={() => { setSuccess(false); setForm({ title: '', description: '', type: 'DOCUMENT', embedUrl: '', category: '', tags: '', ipDeclared: false }); setFile(null); }}>
            Upload Another
          </Button>
        </div>
      </div>
    );
  }

  const selectedType = RESOURCE_TYPES.find((t) => t.value === form.type)!;

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <Link href="/library" className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-4">
          <ArrowLeft className="h-4 w-4" />
          Back to Library
        </Link>
        <h1 className="text-2xl font-bold">Upload a Resource</h1>
        <p className="text-muted-foreground text-sm mt-1">
          All uploads are reviewed by our moderation team before appearing in the library.
        </p>
      </div>

      {/* Submission guidelines */}
      <div className="rounded-lg border border-primary/20 bg-primary/5 p-4 text-sm space-y-1">
        <div className="flex items-center gap-2 font-semibold text-foreground mb-2">
          <Info className="h-4 w-4 text-primary" />
          Submission guidelines
        </div>
        <ul className="space-y-1 text-muted-foreground list-disc list-inside">
          <li>Documents, audio files and images can be uploaded directly (max 50 MB)</li>
          <li>Videos must be shared via a YouTube or Vimeo link — no direct video upload</li>
          <li>You must own or have rights to share all uploaded content</li>
          <li>Financial content is automatically flagged and reviewed under FCA guidelines</li>
          <li>Content is reviewed within 24–48 hours before going live</li>
        </ul>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Content type */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Content Type *</label>
          <div className="grid gap-2">
            {RESOURCE_TYPES.map((t) => (
              <label
                key={t.value}
                className={`flex items-center gap-3 rounded-lg border px-4 py-3 cursor-pointer transition-colors ${
                  form.type === t.value
                    ? 'border-primary bg-primary/5'
                    : 'border-border hover:border-primary/40'
                }`}
              >
                <input
                  type="radio"
                  name="type"
                  value={t.value}
                  checked={form.type === t.value}
                  onChange={(e) => setForm((f) => ({ ...f, type: e.target.value, embedUrl: '', }))}
                  className="accent-primary"
                />
                <span className="text-sm">{t.label}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Title */}
        <div className="space-y-1.5">
          <label className="text-sm font-medium">Title *</label>
          <input
            required
            value={form.title}
            onChange={(e) => handleTextChange('title', e.target.value)}
            placeholder="Give your resource a clear, descriptive title"
            className="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
          />
        </div>

        {/* Description */}
        <div className="space-y-1.5">
          <label className="text-sm font-medium">Description</label>
          <textarea
            rows={3}
            value={form.description}
            onChange={(e) => handleTextChange('description', e.target.value)}
            placeholder="Briefly describe what this resource covers and who it is for"
            className="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none"
          />
        </div>

        {/* Financial warning (live scan) */}
        {financialWarning && (
          <div className="rounded-lg border border-amber-500/40 bg-amber-500/10 p-4 flex gap-3">
            <AlertTriangle className="h-5 w-5 text-amber-500 shrink-0 mt-0.5" />
            <div className="text-sm text-amber-200">
              <strong>Financial content detected.</strong> Your title or description contains
              financial terminology. This resource will be flagged for enhanced compliance review
              and will display an FCA disclaimer when published.
            </div>
          </div>
        )}

        {/* File or embed */}
        {form.type === 'VIDEO_EMBED' ? (
          <div className="space-y-1.5">
            <label className="text-sm font-medium">YouTube or Vimeo URL *</label>
            <input
              required
              value={form.embedUrl}
              onChange={(e) => setForm((f) => ({ ...f, embedUrl: e.target.value }))}
              placeholder="https://www.youtube.com/watch?v=..."
              className="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
            />
            <p className="text-xs text-muted-foreground">Paste the full YouTube or Vimeo URL. Direct video uploads are not supported.</p>
          </div>
        ) : (
          <div className="space-y-1.5">
            <label className="text-sm font-medium">File *</label>
            <div
              onClick={() => fileRef.current?.click()}
              className="rounded-lg border-2 border-dashed border-border hover:border-primary/40 p-8 text-center cursor-pointer transition-colors"
            >
              {file ? (
                <div className="space-y-1">
                  <p className="font-medium text-foreground">{file.name}</p>
                  <p className="text-xs text-muted-foreground">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                </div>
              ) : (
                <div className="space-y-2">
                  <Upload className="h-8 w-8 text-muted-foreground mx-auto" />
                  <p className="text-sm text-muted-foreground">Click to select a file</p>
                  <p className="text-xs text-muted-foreground">{selectedType.label} — Max 50 MB</p>
                </div>
              )}
            </div>
            <input
              ref={fileRef}
              type="file"
              accept={selectedType.accept ?? undefined}
              className="hidden"
              onChange={(e) => setFile(e.target.files?.[0] ?? null)}
            />
          </div>
        )}

        {/* Category */}
        <div className="space-y-1.5">
          <label className="text-sm font-medium">Category</label>
          <select
            value={form.category}
            onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
            className="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
          >
            <option value="">Select a category (optional)</option>
            {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>

        {/* Tags */}
        <div className="space-y-1.5">
          <label className="text-sm font-medium">Tags</label>
          <input
            value={form.tags}
            onChange={(e) => setForm((f) => ({ ...f, tags: e.target.value }))}
            placeholder="e.g. TCFD, net-zero, Scope 3 (comma-separated)"
            className="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
          />
        </div>

        {/* IP declaration */}
        <div className="rounded-lg border border-border p-4 space-y-3">
          <h3 className="font-medium text-sm">Intellectual Property Declaration</h3>
          <label className="flex items-start gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={form.ipDeclared}
              onChange={(e) => setForm((f) => ({ ...f, ipDeclared: e.target.checked }))}
              className="mt-0.5 accent-primary"
            />
            <span className="text-sm text-muted-foreground">
              I confirm that I own this content or have the right to share it on this platform.
              I understand that submitting content I do not have rights to may result in its
              removal and suspension of my account. I consent to GDPR-compliant storage of
              this content, and understand I may request its removal at any time via my account settings.
            </span>
          </label>
        </div>

        {error && (
          <div className="rounded-lg bg-destructive/10 border border-destructive/30 px-4 py-3 text-sm text-destructive">
            {error}
          </div>
        )}

        <Button type="submit" disabled={submitting || !form.ipDeclared} className="w-full">
          {submitting ? 'Uploading…' : 'Submit for Review'}
        </Button>
      </form>
    </div>
  );
}
