'use client';
import { useState } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { CheckCircle, Briefcase, GraduationCap, Building2, ArrowRight, ArrowLeft, Network } from 'lucide-react';

type MemberType = 'PROFESSIONAL' | 'STUDENT' | 'CORPORATE' | null;

const MEMBER_TYPES = [
  {
    type: 'PROFESSIONAL' as MemberType,
    icon: Briefcase,
    title: 'Professional Member',
    subtitle: 'NED · Board Advisor · ESG Strategist · Executive',
    description: 'For experienced practitioners at board or senior executive level. Build your professional record, access NED and advisory opportunities, and connect with peers in governance and sustainability.',
    badge: 'Most common',
  },
  {
    type: 'STUDENT' as MemberType,
    icon: GraduationCap,
    title: 'Student & Graduate',
    subtitle: 'Undergraduate · Postgraduate · Early Career',
    description: 'For students and recent graduates building a career in ESG, sustainability, or governance. Create a profile, connect with practitioners, explore placements, and access mentorship.',
    badge: 'Early career',
  },
  {
    type: 'CORPORATE' as MemberType,
    icon: Building2,
    title: 'Corporate & Institutional',
    subtitle: 'HR Director · Talent Scout · CSO · Board Secretary',
    description: 'For organisations looking to connect with board-level talent, post NED and advisory roles, partner on ESG programmes, and access the graduate talent pipeline.',
    badge: 'Organisations',
  },
];

export default function RegisterPage() {
  const [step, setStep] = useState<'type' | 'details'>('type');
  const [memberType, setMemberType] = useState<MemberType>(null);
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleTypeSelect = (type: MemberType) => {
    setMemberType(type);
    setStep('details');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await api.post('/auth/register', { username, email, password, memberType });
      setSuccess(true);
    } catch (err: any) {
      setError(err.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    const selected = MEMBER_TYPES.find(t => t.type === memberType);
    return (
      <div className="flex items-center justify-center min-h-[70vh] px-4">
        <div className="w-full max-w-md text-center space-y-5">
          <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
            <CheckCircle className="h-8 w-8 text-primary" />
          </div>
          <h2 className="text-2xl font-bold text-foreground">Welcome to the Network</h2>
          <p className="text-muted-foreground text-sm leading-relaxed">
            Your <strong>{selected?.title}</strong> account has been created. Check your email for a verification link — once verified, you can sign in and complete your profile.
          </p>
          <Link href="/login">
            <Button className="mt-2">Sign In</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center px-4 py-10">

      {/* Header */}
      <div className="text-center mb-8">
        <div className="flex items-center justify-center gap-2 mb-3">
          <Network className="h-6 w-6 text-primary" />
          <span className="font-bold text-lg">ESG Intelligence Network</span>
        </div>
        {step === 'type' ? (
          <>
            <h1 className="text-2xl font-bold text-foreground mb-2">Who are you joining as?</h1>
            <p className="text-sm text-muted-foreground max-w-md">
              Choose the membership type that best describes you. This shapes your profile, your access, and how the network works for you.
            </p>
          </>
        ) : (
          <>
            <h1 className="text-2xl font-bold text-foreground mb-2">Create your account</h1>
            <p className="text-sm text-muted-foreground">
              Joining as a <strong>{MEMBER_TYPES.find(t => t.type === memberType)?.title}</strong>
            </p>
          </>
        )}
      </div>

      {/* Step 1 — Type selection */}
      {step === 'type' && (
        <div className="w-full max-w-2xl space-y-3">
          {MEMBER_TYPES.map(({ type, icon: Icon, title, subtitle, description, badge }) => (
            <button
              key={type}
              onClick={() => handleTypeSelect(type)}
              className="w-full text-left p-5 rounded-xl border border-border bg-card hover:border-primary/60 hover:bg-primary/5 transition-all group"
            >
              <div className="flex items-start gap-4">
                <div className="h-11 w-11 rounded-lg bg-primary/10 flex items-center justify-center shrink-0 group-hover:bg-primary/20 transition-colors">
                  <Icon className="h-5 w-5 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="font-semibold text-foreground">{title}</span>
                    <span className="text-[10px] tracking-wider uppercase font-medium text-primary bg-primary/10 px-2 py-0.5 rounded-full">{badge}</span>
                  </div>
                  <p className="text-xs text-primary/70 mb-2">{subtitle}</p>
                  <p className="text-sm text-muted-foreground leading-relaxed">{description}</p>
                </div>
                <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors shrink-0 mt-1" />
              </div>
            </button>
          ))}
          <p className="text-center text-sm text-muted-foreground pt-2">
            Already have an account?{' '}
            <Link href="/login" className="text-primary hover:underline">Sign in</Link>
          </p>
        </div>
      )}

      {/* Step 2 — Account details */}
      {step === 'details' && (
        <div className="w-full max-w-md">
          <Card>
            <CardContent className="pt-6">
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-1.5">
                  <Label htmlFor="username">Username</Label>
                  <Input
                    id="username"
                    value={username}
                    onChange={e => setUsername(e.target.value)}
                    required
                    minLength={3}
                    maxLength={30}
                    pattern="^[a-zA-Z0-9_-]+$"
                    title="Only letters, numbers, underscores, and hyphens"
                    autoComplete="username"
                    placeholder="e.g. christopher_bullock"
                  />
                  <p className="text-xs text-muted-foreground">3–30 characters · letters, numbers, _ and -</p>
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="email">Email address</Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    required
                    autoComplete="email"
                    placeholder="you@yourorganisation.com"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    required
                    minLength={8}
                    autoComplete="new-password"
                  />
                  <p className="text-xs text-muted-foreground">
                    Minimum 8 characters · must include uppercase, lowercase, and a number
                  </p>
                </div>
                {error && <p className="text-sm text-destructive">{error}</p>}
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? 'Creating account…' : 'Create Account'}
                </Button>
              </form>

              <button
                onClick={() => { setStep('type'); setError(''); }}
                className="mt-4 flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors mx-auto"
              >
                <ArrowLeft className="h-3 w-3" /> Change membership type
              </button>
            </CardContent>
          </Card>
          <p className="text-center text-sm text-muted-foreground mt-4">
            Already have an account?{' '}
            <Link href="/login" className="text-primary hover:underline">Sign in</Link>
          </p>
        </div>
      )}
    </div>
  );
}
