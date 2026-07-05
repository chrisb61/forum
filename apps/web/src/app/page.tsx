import Link from 'next/link';
import { Network, Users, Award, Briefcase, ArrowRight, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

export default function HomePage() {
  return (
    <div className="space-y-16">

      {/* Hero */}
      <section className="py-20 space-y-8">
        <h1 className="text-4xl md:text-6xl font-bold tracking-tight leading-tight whitespace-nowrap" style={{ color: '#C9A96E' }}>
          The ESG Intelligence Network
        </h1>
        <p className="text-2xl md:text-3xl font-semibold leading-snug max-w-3xl">
          Where <span className="text-primary">ESG expertise</span>, AI-assisted collaboration and Change Leadership converge
        </p>
        <p className="text-lg text-muted-foreground max-w-2xl leading-relaxed">
          A private, governed network for non-executive directors, board advisors, ESG strategists,
          emerging talent, and the organisations that need them. Build your reputation. Surface
          opportunities. Drive transformational change.
        </p>
        <blockquote className="border-l-4 border-primary pl-6 italic text-muted-foreground max-w-xl">
          &ldquo;ESG is not a cost — it is a cost-reduction and performance-improvement catalyst.&rdquo;
        </blockquote>
        <div className="flex items-center gap-4 pt-2">
          <Link href="/forums">
            <Button size="lg" className="gap-2">
              Enter the Network <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
          <Link href="/register">
            <Button size="lg" variant="outline">Apply for Membership</Button>
          </Link>
        </div>
      </section>

      {/* Four pillars */}
      <section className="space-y-6">
        <h2 className="text-2xl font-bold tracking-tight">What this platform does</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            {
              icon: Users,
              title: 'Community Intelligence',
              desc: 'Structured discussions that surface expertise — not noise. Every contribution builds your professional record.',
            },
            {
              icon: Award,
              title: 'Reputation Engine',
              desc: 'Evidence-based professional profiles. Board experience, sector expertise, and peer recognition — all in one place.',
            },
            {
              icon: Briefcase,
              title: 'Opportunity Matching',
              desc: 'NED positions, advisory roles, and consulting engagements matched to your expertise and ambitions.',
            },
            {
              icon: TrendingUp,
              title: 'Thought Leadership',
              desc: 'Your insights, amplified. Community discussions become articles, briefings, and distribution-ready content.',
            },
          ].map((f) => (
            <Card key={f.title} className="border-border/60 hover:border-primary/40 transition-colors">
              <CardHeader>
                <f.icon className="h-8 w-8 text-primary mb-2" />
                <CardTitle className="text-base">{f.title}</CardTitle>
                <CardDescription className="text-sm leading-relaxed">{f.desc}</CardDescription>
              </CardHeader>
            </Card>
          ))}
        </div>
      </section>

      {/* Who it's for */}
      <section className="bg-card border border-border/60 rounded-lg p-8 space-y-4">
        <h2 className="text-2xl font-bold tracking-tight">Built for professionals who lead.</h2>
        <p className="text-muted-foreground max-w-2xl leading-relaxed">
          Non-executive directors. Board advisors. Fractional executives. ESG consultants.
          Sustainable finance specialists. If your expertise shapes organisations, this network
          is built around you.
        </p>
        <div className="flex flex-wrap gap-3 pt-2">
          {['Non-Executive Directors', 'Board Advisors', 'ESG Strategists', 'Sustainable Finance', 'Fractional Executives', 'Governance Professionals'].map((tag) => (
            <span key={tag} className="text-xs font-medium px-3 py-1.5 rounded-full border border-primary/30 text-primary bg-primary/5">
              {tag}
            </span>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="text-center py-8 space-y-4">
        <h2 className="text-xl font-semibold">Ready to join the network?</h2>
        <Link href="/forums">
          <Button variant="outline" size="lg" className="gap-2">
            Browse the Community <ArrowRight className="h-4 w-4" />
          </Button>
        </Link>
      </section>

    </div>
  );
}
