'use client';
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { api } from '@/lib/api';
import { useAuth } from '@/hooks/useAuth';
import {
  FileText,
  Headphones,
  Video,
  Image,
  File,
  Upload,
  Download,
  AlertTriangle,
  BookOpen,
  Clock,
  CheckCircle,
  Filter,
} from 'lucide-react';
import { Button } from '@/components/ui/button';

const RESOURCE_TYPES = [
  { value: '', label: 'All Types' },
  { value: 'DOCUMENT', label: 'Documents', icon: FileText },
  { value: 'AUDIO', label: 'Audio', icon: Headphones },
  { value: 'VIDEO_EMBED', label: 'Video', icon: Video },
  { value: 'IMAGE', label: 'Images', icon: Image },
  { value: 'OTHER', label: 'Other', icon: File },
];

const CATEGORIES = [
  'All Categories',
  'ESG Strategy',
  'Governance',
  'Regulatory & Compliance',
  'Sustainability Reporting',
  'Climate & Environment',
  'Social Impact',
  'AI & Technology',
  'Career & Professional Development',
];

function typeIcon(type: string) {
  switch (type) {
    case 'DOCUMENT': return <FileText className="h-4 w-4" />;
    case 'AUDIO': return <Headphones className="h-4 w-4" />;
    case 'VIDEO_EMBED': return <Video className="h-4 w-4" />;
    case 'IMAGE': return <Image className="h-4 w-4" />;
    default: return <File className="h-4 w-4" />;
  }
}

function typeLabel(type: string) {
  const t = RESOURCE_TYPES.find((r) => r.value === type);
  return t?.label ?? type;
}

export default function LibraryPage() {
  const { user } = useAuth();
  const [typeFilter, setTypeFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');

  const { data: resources = [], isLoading } = useQuery<any[]>({
    queryKey: ['library', typeFilter, categoryFilter],
    queryFn: () => {
      const params = new URLSearchParams();
      if (typeFilter) params.set('type', typeFilter);
      if (categoryFilter) params.set('category', categoryFilter);
      return api.get(`/library?${params.toString()}`);
    },
  });

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <BookOpen className="h-6 w-6 text-primary" />
            <h1 className="text-3xl font-bold">Knowledge Library</h1>
          </div>
          <p className="text-muted-foreground">
            Curated resources from our community — documents, audio, video and more.
            All content is reviewed by our moderation team before publication.
          </p>
        </div>
        {user && (
          <Link href="/library/upload">
            <Button className="shrink-0">
              <Upload className="h-4 w-4 mr-2" />
              Upload Resource
            </Button>
          </Link>
        )}
      </div>

      {/* Compliance banner */}
      <div className="rounded-lg border border-amber-500/30 bg-amber-500/10 px-4 py-3 flex gap-3">
        <AlertTriangle className="h-5 w-5 text-amber-500 shrink-0 mt-0.5" />
        <div className="text-sm text-amber-200">
          <span className="font-semibold">Important:</span> Content marked with a financial disclaimer
          was identified as potentially containing financial information. This is not regulated financial
          advice. Always seek advice from an FCA-authorised professional before making financial decisions.
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 items-center">
        <Filter className="h-4 w-4 text-muted-foreground" />
        <div className="flex flex-wrap gap-2">
          {RESOURCE_TYPES.map(({ value, label }) => (
            <button
              key={value}
              onClick={() => setTypeFilter(value)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
                typeFilter === value
                  ? 'bg-primary text-primary-foreground border-primary'
                  : 'border-border text-muted-foreground hover:border-primary/50 hover:text-foreground'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value === 'All Categories' ? '' : e.target.value)}
          className="ml-auto text-sm bg-background border border-border rounded-md px-3 py-1.5 text-foreground"
        >
          {CATEGORIES.map((c) => (
            <option key={c} value={c === 'All Categories' ? '' : c}>{c}</option>
          ))}
        </select>
      </div>

      {/* Resources list */}
      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-24 rounded-xl bg-muted animate-pulse" />
          ))}
        </div>
      ) : resources.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border p-12 text-center">
          <BookOpen className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
          <p className="text-muted-foreground">No resources found. Be the first to upload!</p>
          {user && (
            <Link href="/library/upload" className="mt-4 inline-block">
              <Button variant="outline" size="sm">Upload a Resource</Button>
            </Link>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {resources.map((resource: any) => (
            <ResourceCard key={resource.id} resource={resource} user={user} />
          ))}
        </div>
      )}

      {/* Links to sub-sections */}
      <div className="grid sm:grid-cols-2 gap-4 pt-4 border-t border-border">
        <Link href="/courses" className="rounded-xl border border-border p-5 hover:border-primary/40 hover:bg-primary/5 transition-colors group">
          <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors mb-1">
            Course Marketplace
          </h3>
          <p className="text-sm text-muted-foreground">
            Discover training courses from our platform partners and external providers. All delivered
            via or in partnership with Delena.
          </p>
        </Link>
        <Link href="/cv-review" className="rounded-xl border border-border p-5 hover:border-primary/40 hover:bg-primary/5 transition-colors group">
          <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors mb-1">
            CV Writing Service
          </h3>
          <p className="text-sm text-muted-foreground">
            Submit your CV for professional review and rewriting by our expert team. Specialist
            in ESG, governance and sustainability roles.
          </p>
        </Link>
      </div>
    </div>
  );
}

function ResourceCard({ resource, user }: { resource: any; user: any }) {
  const [downloading, setDownloading] = useState(false);

  async function handleDownload() {
    setDownloading(true);
    try {
      await api.post(`/library/${resource.id}/download`, {});
      if (resource.fileUrl) {
        window.open(resource.fileUrl, '_blank');
      } else if (resource.embedUrl) {
        window.open(resource.embedUrl, '_blank');
      }
    } finally {
      setDownloading(false);
    }
  }

  return (
    <div className="rounded-xl border border-border bg-card hover:border-primary/30 transition-colors p-5">
      <div className="flex items-start gap-4">
        <div className="rounded-lg bg-primary/10 p-2.5 text-primary shrink-0">
          {typeIcon(resource.type)}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="font-semibold text-foreground">{resource.title}</h3>
                <span className="text-xs px-2 py-0.5 rounded-full bg-muted text-muted-foreground">
                  {typeLabel(resource.type)}
                </span>
                {resource.financialFlagged && (
                  <span className="text-xs px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-400 flex items-center gap-1">
                    <AlertTriangle className="h-3 w-3" />
                    Financial content
                  </span>
                )}
                {resource.category && (
                  <span className="text-xs px-2 py-0.5 rounded-full border border-border text-muted-foreground">
                    {resource.category}
                  </span>
                )}
              </div>
              {resource.description && (
                <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{resource.description}</p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-4 mt-3 text-xs text-muted-foreground">
            <span>
              by{' '}
              <Link href={`/users/${resource.uploader?.username}`} className="hover:text-primary transition-colors">
                {resource.uploader?.displayName || resource.uploader?.username}
              </Link>
            </span>
            {resource.tags?.length > 0 && (
              <span className="flex gap-1">
                {resource.tags.slice(0, 3).map((tag: string) => (
                  <span key={tag} className="bg-muted px-1.5 py-0.5 rounded">{tag}</span>
                ))}
              </span>
            )}
            <span className="flex items-center gap-1 ml-auto">
              <Download className="h-3 w-3" />
              {resource._count?.downloads ?? resource.downloadCount} downloads
            </span>
          </div>

          {resource.hasFinancialDisclaimer && (
            <div className="mt-3 text-xs text-amber-400/80 bg-amber-500/10 border border-amber-500/20 rounded px-3 py-2">
              This resource may contain financial information. It does not constitute regulated financial
              advice under the FCA Financial Promotions Order 2005. Consult an authorised professional.
            </div>
          )}
        </div>

        {user && (
          <Button
            size="sm"
            variant="outline"
            onClick={handleDownload}
            disabled={downloading}
            className="shrink-0"
          >
            <Download className="h-4 w-4 mr-1.5" />
            {resource.type === 'VIDEO_EMBED' ? 'Watch' : 'Download'}
          </Button>
        )}
      </div>
    </div>
  );
}
