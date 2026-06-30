import Link from 'next/link';
import { ArrowRight, Users, Award, Briefcase, TrendingUp, BookOpen, Network, Database, Zap, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

export const metadata = {
  title: 'Getting Started',
  description: 'Your guide to the ESG Intelligence Network',
};

const steps = [
  {
    number: '01',
    title: 'Create your account',
    description:
      'Register with your professional email. Your profile becomes your reputation record — it grows with every contribution you make to the network.',
    action: { label: 'Register now', href: '/register' },
  },
  {
    number: '02',
    title: 'Complete your professional profile',
    description:
      'Add your board experience, sector expertise, and credentials. This is not a social media bio — it is the foundation of your professional reputation on the platform.',
    action: { label: 'View your profile', href: '/settings' },
  },
  {
    number: '03',
    title: 'Find your community',
    description:
      'Browse the forums by sector and topic. Each forum is structured around a professional discipline — governance, ESG strategy, sustainable finance, and more.',
    action: { label: 'Browse forums', href: '/forums' },
  },
  {
    number: '04',
    title: 'Contribute and build reputation',
    description:
      'Start discussions, answer questions, share insights. Every quality contribution adds to your reputation score — the platform\'s measure of your professional standing.',
    action: null,
  },
];

const features = [
  {
    icon: Users,
    title: 'Community Intelligence',
    description:
      'Structured forums organised by professional discipline. Discussions here are indexed, searchable, and attributed — not lost in a chat feed.',
  },
  {
    icon: Award,
    title: 'Reputation Engine',
    description:
      'Your contributions build a verifiable professional record. Peer recognition, expertise scores, and board experience — all in one profile.',
  },
  {
    icon: Briefcase,
    title: 'Opportunity Matching',
    description:
      'NED positions, advisory roles, and consulting engagements surfaced based on your expertise. Coming soon.',
  },
  {
    icon: TrendingUp,
    title: 'Thought Leadership',
    description:
      'Your best insights, amplified. The platform will distribute key discussions as articles, briefings, and content across professional channels. Coming soon.',
  },
  {
    icon: Database,
    title: 'Knowledge Graph',
    description:
      'Every discussion contributes to a growing intelligence layer — connecting people, expertise, organisations, and opportunities. Coming soon.',
  },
  {
    icon: Network,
    title: 'CRM & Relationship Intelligence',
    description:
      'Integration with professional CRM tools to track relationships, engagement, and commercial opportunity. Coming soon.',
  },
];

const roadmap = [
  { phase: 'Now', label: 'Community & Profiles', done: true },
  { phase: 'Next', label: 'Reputation & Gamification', done: false },
  { phase: 'Q3 2026', label: 'Professional Profile Depth (NED, Board Experience)', done: false },
  { phase: 'Q3 2026', label: 'Opportunity Matching', done: false },
  { phase: 'Q4 2026', label: 'Knowledge Graph & Boko Integration', done: false },
  { phase: 'Q4 2026', label: 'CRM & Relationship Intelligence', done: false },
  { phase: '2027', label: 'Training & Certification Layer', done: false },
];

export default function GuidePage() {
  return (
    <div className="max-w-4xl mx-auto space-y-20 py-8">

      {/* Header */}
      <section className="space-y-4">
        <p className="text-sm font-semibold tracking-widest text-primary uppercase">Getting Started</p>
        <h1 className="text-4xl font-bold tracking-tight">Your guide to the network.</h1>
        <p className="text-lg text-muted-foreground leading-relaxed max-w-2xl">
          This platform is built for professionals who lead. Here is everything you need to know
          to get the most from it — and where it is headed.
        </p>
      </section>

      {/* Steps */}
      <section className="space-y-6">
        <h2 className="text-2xl font-bold tracking-tight">How to get started</h2>
        <div className="space-y-4">
          {steps.map((step) => (
            <div
              key={step.number}
              className="flex gap-6 p-6 bg-card border border-border/60 rounded-lg hover:border-primary/30 transition-colors"
            >
              <div className="text-3xl font-bold text-primary/30 font-mono leading-none pt-1 w-10 shrink-0">
                {step.number}
              </div>
              <div className="space-y-2 flex-1">
                <h3 className="text-lg font-semibold">{step.title}</h3>
                <p className="text-muted-foreground leading-relaxed">{step.description}</p>
                {step.action && (
                  <Link href={step.action.href}>
                    <Button variant="ghost" size="sm" className="gap-1 px-0 text-primary hover:text-primary/80 hover:bg-transparent">
                      {step.action.label} <ArrowRight className="h-3 w-3" />
                    </Button>
                  </Link>
                )}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="space-y-6">
        <h2 className="text-2xl font-bold tracking-tight">What the platform does</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {features.map((f) => (
            <div key={f.title} className="p-6 bg-card border border-border/60 rounded-lg space-y-3">
              <div className="flex items-center gap-3">
                <f.icon className="h-5 w-5 text-primary shrink-0" />
                <h3 className="font-semibold">{f.title}</h3>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">{f.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Roadmap */}
      <section className="space-y-6">
        <div className="space-y-2">
          <h2 className="text-2xl font-bold tracking-tight">Where we are headed</h2>
          <p className="text-muted-foreground">
            This platform is in active development. Here is what is live, and what is coming.
          </p>
        </div>
        <div className="space-y-3">
          {roadmap.map((item) => (
            <div
              key={item.label}
              className={`flex items-center gap-4 p-4 rounded-lg border transition-colors ${
                item.done
                  ? 'bg-primary/10 border-primary/30'
                  : 'bg-card border-border/60'
              }`}
            >
              <CheckCircle
                className={`h-5 w-5 shrink-0 ${item.done ? 'text-primary' : 'text-muted-foreground/30'}`}
              />
              <div className="flex-1">
                <span className={item.done ? 'font-semibold' : 'text-muted-foreground'}>
                  {item.label}
                </span>
              </div>
              <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                item.done
                  ? 'bg-primary/20 text-primary'
                  : 'bg-muted text-muted-foreground'
              }`}>
                {item.phase}
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* Philosophy */}
      <section className="border-l-4 border-primary pl-8 space-y-4">
        <h2 className="text-2xl font-bold tracking-tight">Our philosophy</h2>
        <p className="text-muted-foreground leading-relaxed">
          Most professional networks reward activity. This one rewards expertise.
          The goal is not to accumulate connections — it is to surface the right people,
          for the right opportunities, at the right time.
        </p>
        <blockquote className="italic text-muted-foreground">
          &ldquo;ESG is not a cost — it is a cost-reduction and performance-improvement catalyst.&rdquo;
        </blockquote>
      </section>

      {/* CTA */}
      <section className="bg-card border border-border/60 rounded-lg p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-1">
          <h3 className="text-xl font-bold">Ready to join?</h3>
          <p className="text-muted-foreground">Create your profile and start building your professional record.</p>
        </div>
        <div className="flex gap-3 shrink-0">
          <Link href="/register">
            <Button size="lg" className="gap-2">
              Apply for Membership <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
          <Link href="/forums">
            <Button size="lg" variant="outline">Browse first</Button>
          </Link>
        </div>
      </section>

    </div>
  );
}
