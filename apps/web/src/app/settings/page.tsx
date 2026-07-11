'use client';
import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { CheckCircle, Plus, Trash2, Shield, Upload, Loader2, Sparkles, ArrowUpCircle } from 'lucide-react';
import Link from 'next/link';

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000';

const SECTORS = [
  'Financial Services', 'Healthcare', 'Technology', 'Energy & Utilities',
  'ESG & Sustainability', 'Private Equity', 'Real Estate', 'Education',
  'Professional Services', 'Infrastructure', 'Retail & Consumer', 'Media',
  'Public Sector', 'Charity & NFP', 'Manufacturing', 'Life Sciences',
  'Legal', 'Asset Management', 'Insurance', 'Fintech',
];

const EXPERTISE = [
  'Board Governance', 'ESG Strategy', 'Risk Management', 'M&A / Transactions',
  'Digital Transformation', 'Financial Oversight', 'Stakeholder Engagement',
  'Regulatory Compliance', 'Audit & Assurance', 'Executive Remuneration',
  'Succession Planning', 'Investor Relations', 'Cybersecurity', 'AI Governance',
  'Sustainability Reporting', 'Crisis Management', 'Capital Markets',
];

const QUALIFICATIONS = [
  'FCA', 'FCCA', 'FRC', 'MBA', 'PhD', 'MSc', 'IoD Certificate',
  'IoD Diploma', 'ICSA / CGI', 'CIMA', 'CIPD', 'CFA', 'ACCA',
];

const AVAILABILITY = [
  'Available for NED roles', 'Available for Advisory roles', 'Available for Chair roles',
  'Open to approaches', 'Currently at capacity', 'Available from Q3 2026',
];

interface BoardRole {
  company: string; role: string; startYear: number; endYear?: number; current: boolean;
}

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <label className="text-sm font-medium text-foreground">{label}</label>
      {children}
      {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
    </div>
  );
}

function TextInput({ value, onChange, placeholder, type = 'text', maxLength }: {
  value: string; onChange: (v: string) => void; placeholder?: string; type?: string; maxLength?: number;
}) {
  return (
    <input
      type={type}
      value={value}
      onChange={e => onChange(e.target.value)}
      placeholder={placeholder}
      maxLength={maxLength}
      className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary"
    />
  );
}

function Toggle({ checked, onChange, label }: { checked: boolean; onChange: (v: boolean) => void; label: string }) {
  return (
    <label className="flex items-center gap-3 cursor-pointer group">
      <div
        onClick={() => onChange(!checked)}
        className={`relative w-10 h-5 rounded-full transition-colors ${checked ? 'bg-primary' : 'bg-muted'}`}
      >
        <div className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white transition-transform ${checked ? 'translate-x-5' : 'translate-x-0'}`} />
      </div>
      <span className="text-sm text-foreground">{label}</span>
    </label>
  );
}

export default function SettingsPage() {
  const { user, isLoading, token } = useAuth();
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState<'identity' | 'contact' | 'professional' | 'board' | 'privacy'>('identity');
  const [cvParsing, setCvParsing] = useState(false);
  const [cvError, setCvError] = useState('');
  const [cvSuccess, setCvSuccess] = useState(false);
  const cvInputRef = useRef<HTMLInputElement>(null);

  // Identity
  const [displayName, setDisplayName] = useState('');
  const [bio, setBio] = useState('');
  const [headline, setHeadline] = useState('');
  const [location, setLocation] = useState('');
  const [availability, setAvailability] = useState('');

  // Contact
  const [professionalEmail, setProfessionalEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [linkedIn, setLinkedIn] = useState('');
  const [website, setWebsite] = useState('');
  const [twitterX, setTwitterX] = useState('');

  // Professional
  const [sectors, setSectors] = useState<string[]>([]);
  const [expertiseAreas, setExpertiseAreas] = useState<string[]>([]);
  const [qualifications, setQualifications] = useState<string[]>([]);
  const [customQual, setCustomQual] = useState('');

  // Board experience
  const [boardExperience, setBoardExperience] = useState<BoardRole[]>([]);
  const [newRole, setNewRole] = useState<BoardRole>({ company: '', role: '', startYear: new Date().getFullYear(), current: true });

  // Privacy
  const [showEmail, setShowEmail] = useState(false);
  const [showPhone, setShowPhone] = useState(false);
  const [showLinkedIn, setShowLinkedIn] = useState(true);
  const [profileVisibility, setProfileVisibility] = useState('members');

  useEffect(() => {
    setCvError('');
    if (!isLoading && !user) router.push('/login');
    if (user) {
      setDisplayName(user.displayName || '');
      setBio(user.bio || '');
      const pp = (user as any).professionalProfile;
      if (pp) {
        setHeadline(pp.headline || '');
        setLocation(pp.location || '');
        setAvailability(pp.availability || '');
        setProfessionalEmail(pp.professionalEmail || '');
        setPhone(pp.phone || '');
        setLinkedIn(pp.linkedIn || '');
        setWebsite(pp.website || '');
        setTwitterX(pp.twitterX || '');
        setSectors(pp.sectors || []);
        setExpertiseAreas(pp.expertiseAreas || []);
        setQualifications(pp.qualifications || []);
        setBoardExperience(pp.boardExperience || []);
        setShowEmail(pp.showEmail ?? false);
        setShowPhone(pp.showPhone ?? false);
        setShowLinkedIn(pp.showLinkedIn ?? true);
        setProfileVisibility(pp.profileVisibility || 'members');
      }
    }
  }, [user, isLoading, router]);

  const toggleItem = (list: string[], setList: (v: string[]) => void, item: string) =>
    setList(list.includes(item) ? list.filter(x => x !== item) : [...list, item]);

  const addBoardRole = () => {
    if (!newRole.company || !newRole.role) return;
    setBoardExperience(prev => [...prev, newRole]);
    setNewRole({ company: '', role: '', startYear: new Date().getFullYear(), current: true });
  };

  const handleCvUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setCvParsing(true);
    setCvError('');
    setCvSuccess(false);
    try {
      const formData = new FormData();
      formData.append('file', file);
      const authToken = token || localStorage.getItem('forum_token');
      const res = await fetch(`${API_URL}/cv/parse`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${authToken}` },
        body: formData,
      });
      const result = await res.json();
      if (!res.ok) {
        const msg = result?.message?.message || result?.message || 'Upload failed. Please try again.';
        setCvError(typeof msg === 'string' ? msg : 'Upload failed. Please try again.');
        return;
      }
      const d = result.data;
      // Pre-fill all fields from parsed CV
      if (d.displayName) setDisplayName(d.displayName);
      if (d.headline) setHeadline(d.headline);
      if (d.location) setLocation(d.location);
      if (d.bio) setBio(d.bio.slice(0, 500));
      if (d.professionalEmail) setProfessionalEmail(d.professionalEmail);
      if (d.phone) setPhone(d.phone);
      if (d.linkedIn) setLinkedIn(d.linkedIn);
      if (d.website) setWebsite(d.website);
      if (d.twitterX) setTwitterX(d.twitterX);
      if (d.sectors?.length) setSectors(d.sectors);
      if (d.expertiseAreas?.length) setExpertiseAreas(d.expertiseAreas);
      if (d.qualifications?.length) setQualifications(d.qualifications);
      if (d.boardExperience?.length) setBoardExperience(d.boardExperience);
      setCvSuccess(true);
      setActiveTab('identity');
    } catch (err: any) {
      setCvError(err?.message ?? 'Could not parse CV');
    } finally {
      setCvParsing(false);
      if (cvInputRef.current) cvInputRef.current.value = '';
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      await api.put('/users/profile', {
        displayName: displayName || undefined,
        bio: bio || undefined,
        headline: headline || undefined,
        location: location || undefined,
        availability: availability || undefined,
        professionalEmail: professionalEmail || undefined,
        phone: phone || undefined,
        linkedIn: linkedIn || undefined,
        website: website || undefined,
        twitterX: twitterX || undefined,
        sectors, expertiseAreas, qualifications, boardExperience,
        showEmail, showPhone, showLinkedIn, profileVisibility,
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err: any) {
      setError(typeof err?.message === 'string' ? err.message : 'Failed to save. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  if (!user) return null;

  const tabs = [
    { id: 'identity', label: 'Identity' },
    { id: 'contact', label: 'Contact' },
    { id: 'professional', label: 'Expertise' },
    { id: 'board', label: 'Board History' },
    { id: 'privacy', label: 'Privacy' },
  ] as const;

  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-foreground">Professional Profile</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Your profile is your professional record within the ESG Intelligence Network.
        </p>
      </div>

      {/* Student upgrade banner */}
      {user?.memberType === 'STUDENT' && (
        <div className="mb-6 rounded-xl border border-primary/30 bg-primary/5 p-5 flex items-start gap-4">
          <div className="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
            <ArrowUpCircle className="h-5 w-5 text-primary" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-foreground text-sm mb-1">Ready to upgrade your membership?</h3>
            <p className="text-xs text-muted-foreground mb-3">
              As a Student member you have access to core platform features. Upgrading to Professional
              unlocks groups, the full talent network, all forums, and more. Note that your subscription
              cost will increase on approval — our team will confirm the rate with you.
            </p>
            <Link href="/upgrade">
              <button className="text-xs font-medium text-primary hover:underline flex items-center gap-1">
                <ArrowUpCircle className="h-3.5 w-3.5" />
                Apply to upgrade to Professional →
              </button>
            </Link>
          </div>
        </div>
      )}

      {/* CV Upload banner */}
      <div className="mb-6 rounded-xl border border-primary/30 bg-primary/5 p-5">
        <div className="flex items-start gap-4">
          <div className="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
            <Sparkles className="h-5 w-5 text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-foreground text-sm mb-1">Import from your CV</h3>
            <p className="text-xs text-muted-foreground mb-3">
              Upload your CV and we'll automatically fill in your profile fields. Supports PDF and Word documents. Review and adjust before saving.
            </p>
            {cvSuccess && (
              <div className="flex items-center gap-2 text-green-400 text-xs mb-3">
                <CheckCircle className="h-4 w-4" /> CV imported — review your details below then click Save Profile.
              </div>
            )}
            {typeof cvError === 'string' && cvError.length > 0 && <p className="text-red-400 text-xs mb-3">{cvError}</p>}
            <input ref={cvInputRef} type="file" accept=".pdf,.doc,.docx" onChange={handleCvUpload} className="hidden" />
            <Button
              type="button"
              variant="outline"
              disabled={cvParsing}
              onClick={() => cvInputRef.current?.click()}
              className="gap-2 text-sm border-primary/40 hover:border-primary"
            >
              {cvParsing ? <><Loader2 className="h-4 w-4 animate-spin" /> Reading your CV…</> : <><Upload className="h-4 w-4" /> Upload CV</>}
            </Button>
          </div>
        </div>
      </div>

      {/* Tab navigation */}
      <div className="flex gap-1 mb-6 bg-muted/40 rounded-lg p-1 border border-border">
        {tabs.map(t => (
          <button
            key={t.id}
            onClick={() => setActiveTab(t.id)}
            className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-colors ${activeTab === t.id ? 'bg-card text-foreground shadow-sm border border-border' : 'text-muted-foreground hover:text-foreground'}`}
          >
            {t.label}
          </button>
        ))}
      </div>

      <form onSubmit={handleSave} className="space-y-6">

        {/* IDENTITY */}
        {activeTab === 'identity' && (
          <Card>
            <CardHeader>
              <CardTitle>Identity</CardTitle>
              <CardDescription>How you appear professionally across the network</CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
              <Field label="Username" hint="Your unique handle — used in your profile URL. Cannot be changed.">
                <input value={user.username} disabled className="w-full bg-muted border border-border rounded-lg px-3 py-2 text-sm text-muted-foreground" />
              </Field>
              <Field label="Professional Name" hint="This is what other members see — use your full professional name (e.g. Christopher F Bullock).">
                <TextInput value={displayName} onChange={setDisplayName} placeholder="e.g. Christopher F Bullock" maxLength={50} />
              </Field>
              <Field label="Professional Headline" hint="Your primary role or value proposition — shown beneath your name.">
                <TextInput value={headline} onChange={setHeadline} placeholder="e.g. Non-Executive Director | ESG & Governance Specialist" maxLength={120} />
              </Field>
              <Field label="Location">
                <TextInput value={location} onChange={setLocation} placeholder="e.g. London, UK" maxLength={100} />
              </Field>
              <Field label="Availability">
                <select
                  value={availability}
                  onChange={e => setAvailability(e.target.value)}
                  className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:border-primary"
                >
                  <option value="">Select availability status</option>
                  {AVAILABILITY.map(a => <option key={a} value={a}>{a}</option>)}
                </select>
              </Field>
              <Field label="Professional Biography" hint={`${bio.length}/500 characters`}>
                <textarea
                  rows={5}
                  value={bio}
                  onChange={e => setBio(e.target.value)}
                  maxLength={500}
                  placeholder="A professional summary of your background, focus areas, and what you bring to boards and organisations..."
                  className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary resize-none"
                />
              </Field>
            </CardContent>
          </Card>
        )}

        {/* CONTACT */}
        {activeTab === 'contact' && (
          <Card>
            <CardHeader>
              <CardTitle>Contact Details</CardTitle>
              <CardDescription>Professional contact information. Visibility is controlled in the Privacy tab.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="flex items-start gap-3 p-3 rounded-lg bg-primary/5 border border-primary/20 text-xs text-muted-foreground">
                <Shield className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                <p>Your contact details are protected under GDPR. You control exactly what is visible to other members in the <button type="button" onClick={() => setActiveTab('privacy')} className="text-primary underline">Privacy settings</button>.</p>
              </div>
              <Field label="Login Email" hint="Your account email — not shown on your profile.">
                <input value={user.email} disabled className="w-full bg-muted border border-border rounded-lg px-3 py-2 text-sm text-muted-foreground" />
              </Field>
              <Field label="Professional Email" hint="A contact email you choose to share with the network (can be different to your login email).">
                <TextInput value={professionalEmail} onChange={setProfessionalEmail} type="email" placeholder="e.g. christopher@yourcompany.com" />
              </Field>
              <Field label="Phone / Mobile" hint="Only visible to members you choose — controlled in Privacy settings.">
                <TextInput value={phone} onChange={setPhone} placeholder="e.g. +44 7700 000000" maxLength={30} />
              </Field>
              <Field label="LinkedIn Profile URL">
                <TextInput value={linkedIn} onChange={setLinkedIn} placeholder="https://linkedin.com/in/yourprofile" />
              </Field>
              <Field label="Personal / Company Website">
                <TextInput value={website} onChange={setWebsite} placeholder="https://yourwebsite.com" />
              </Field>
              <Field label="X (formerly Twitter)">
                <TextInput value={twitterX} onChange={setTwitterX} placeholder="https://x.com/yourhandle" />
              </Field>
            </CardContent>
          </Card>
        )}

        {/* EXPERTISE */}
        {activeTab === 'professional' && (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Sectors</CardTitle>
                <CardDescription>Select the sectors you have professional experience in</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {SECTORS.map(s => (
                    <button key={s} type="button"
                      onClick={() => toggleItem(sectors, setSectors, s)}
                      className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${sectors.includes(s) ? 'bg-primary text-primary-foreground border-primary' : 'border-border text-muted-foreground hover:border-primary/50'}`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Areas of Expertise</CardTitle>
                <CardDescription>Select your specialist areas of board and executive expertise</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {EXPERTISE.map(e => (
                    <button key={e} type="button"
                      onClick={() => toggleItem(expertiseAreas, setExpertiseAreas, e)}
                      className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${expertiseAreas.includes(e) ? 'bg-primary text-primary-foreground border-primary' : 'border-border text-muted-foreground hover:border-primary/50'}`}
                    >
                      {e}
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Qualifications & Memberships</CardTitle>
                <CardDescription>Professional qualifications, designations, and institute memberships</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex flex-wrap gap-2">
                  {QUALIFICATIONS.map(q => (
                    <button key={q} type="button"
                      onClick={() => toggleItem(qualifications, setQualifications, q)}
                      className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${qualifications.includes(q) ? 'bg-primary text-primary-foreground border-primary' : 'border-border text-muted-foreground hover:border-primary/50'}`}
                    >
                      {q}
                    </button>
                  ))}
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={customQual}
                    onChange={e => setCustomQual(e.target.value)}
                    placeholder="Add a qualification not listed..."
                    className="flex-1 bg-background border border-border rounded-lg px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary"
                    onKeyDown={e => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        if (customQual.trim()) { setQualifications(q => [...q, customQual.trim()]); setCustomQual(''); }
                      }
                    }}
                  />
                  <Button type="button" variant="outline" onClick={() => {
                    if (customQual.trim()) { setQualifications(q => [...q, customQual.trim()]); setCustomQual(''); }
                  }}>Add</Button>
                </div>
                {qualifications.filter(q => !QUALIFICATIONS.includes(q)).length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {qualifications.filter(q => !QUALIFICATIONS.includes(q)).map(q => (
                      <span key={q} className="text-xs px-3 py-1.5 rounded-full bg-primary text-primary-foreground flex items-center gap-1">
                        {q}
                        <button type="button" onClick={() => setQualifications(prev => prev.filter(x => x !== q))}><Trash2 className="h-3 w-3" /></button>
                      </span>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}

        {/* BOARD HISTORY */}
        {activeTab === 'board' && (
          <Card>
            <CardHeader>
              <CardTitle>Board & Executive History</CardTitle>
              <CardDescription>Your NED, Chair, and senior executive roles</CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
              {boardExperience.map((b, i) => (
                <div key={i} className="flex gap-3 items-start p-3 rounded-lg bg-muted/40 border border-border">
                  <div className="flex-1">
                    <div className="font-medium text-sm">{b.role}</div>
                    <div className="text-muted-foreground text-sm">{b.company}</div>
                    <div className="text-xs text-muted-foreground mt-0.5">
                      {b.startYear} – {b.current ? 'Present' : b.endYear}
                    </div>
                  </div>
                  <button type="button" onClick={() => setBoardExperience(prev => prev.filter((_, j) => j !== i))}
                    className="text-muted-foreground hover:text-red-400 transition-colors p-1">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}

              <div className="border border-dashed border-border rounded-lg p-4 space-y-3">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Add a role</p>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs text-muted-foreground mb-1 block">Role / Title</label>
                    <TextInput value={newRole.role} onChange={v => setNewRole(r => ({ ...r, role: v }))} placeholder="e.g. Non-Executive Director" />
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground mb-1 block">Company / Organisation</label>
                    <TextInput value={newRole.company} onChange={v => setNewRole(r => ({ ...r, company: v }))} placeholder="e.g. Acme plc" />
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground mb-1 block">Start Year</label>
                    <TextInput value={String(newRole.startYear)} onChange={v => setNewRole(r => ({ ...r, startYear: parseInt(v) || r.startYear }))} placeholder="2020" maxLength={4} />
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground mb-1 block">End Year</label>
                    <TextInput value={newRole.current ? '' : String(newRole.endYear ?? '')} onChange={v => setNewRole(r => ({ ...r, endYear: parseInt(v) || undefined, current: !v }))} placeholder="Leave blank if current" maxLength={4} />
                  </div>
                </div>
                <label className="flex items-center gap-2 cursor-pointer text-sm text-foreground">
                  <input type="checkbox" checked={newRole.current} onChange={e => setNewRole(r => ({ ...r, current: e.target.checked }))} className="rounded border-border" />
                  This is a current role
                </label>
                <Button type="button" variant="outline" onClick={addBoardRole} className="gap-2">
                  <Plus className="h-4 w-4" /> Add Role
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* PRIVACY */}
        {activeTab === 'privacy' && (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2"><Shield className="h-4 w-4 text-primary" /> Privacy & GDPR Controls</CardTitle>
                <CardDescription>You are in full control of what other members can see. All data is handled in accordance with UK GDPR and the Data Protection Act 2018.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-5">
                <div>
                  <p className="text-sm font-medium text-foreground mb-3">Profile Visibility</p>
                  <div className="space-y-2">
                    {[
                      { value: 'members', label: 'Members only', desc: 'Only signed-in members can view your full profile' },
                      { value: 'public', label: 'Public', desc: 'Anyone with the link can view your profile' },
                      { value: 'private', label: 'Private', desc: 'Only you can view your profile' },
                    ].map(opt => (
                      <label key={opt.value} className="flex items-start gap-3 p-3 rounded-lg border border-border cursor-pointer hover:border-primary/50 transition-colors">
                        <input type="radio" name="visibility" value={opt.value} checked={profileVisibility === opt.value}
                          onChange={() => setProfileVisibility(opt.value)} className="mt-0.5" />
                        <div>
                          <div className="text-sm font-medium text-foreground">{opt.label}</div>
                          <div className="text-xs text-muted-foreground">{opt.desc}</div>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="border-t border-border pt-5">
                  <p className="text-sm font-medium text-foreground mb-1">Contact Information Visibility</p>
                  <p className="text-xs text-muted-foreground mb-4">Choose what contact details members can see on your profile.</p>
                  <div className="space-y-4">
                    <Toggle checked={showLinkedIn} onChange={setShowLinkedIn} label="Show LinkedIn profile link" />
                    <Toggle checked={showEmail} onChange={setShowEmail} label="Show professional email address" />
                    <Toggle checked={showPhone} onChange={setShowPhone} label="Show phone number" />
                  </div>
                </div>

                <div className="border-t border-border pt-5 text-xs text-muted-foreground space-y-2">
                  <p className="font-medium text-foreground text-sm">Your data rights</p>
                  <p>Under UK GDPR you have the right to access, rectify, and erase your personal data at any time. To request a full data export or account deletion, contact the platform administrator.</p>
                  <p>Your data is never sold to third parties and is used solely to operate this professional network.</p>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {error && <p className="text-red-400 text-sm">{error}</p>}

        <div className="flex items-center gap-4">
          <Button type="submit" disabled={saving} className="bg-primary text-primary-foreground hover:bg-primary/90 px-8">
            {saving ? 'Saving…' : 'Save Profile'}
          </Button>
          {saved && (
            <span className="flex items-center gap-1.5 text-sm text-green-400">
              <CheckCircle className="h-4 w-4" /> Profile saved
            </span>
          )}
        </div>
      </form>
    </div>
  );
}
