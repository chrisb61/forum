'use client';
import Link from 'next/link';
import { CheckCircle, Users, Brain, TrendingUp, Briefcase, Shield, Star, ArrowRight, Network, BookOpen, Award, Globe } from 'lucide-react';

const BENEFITS = [
  {
    icon: Network,
    title: 'A Network That Understands Your World',
    summary: 'Built exclusively for NEDs, board advisors, ESG strategists, and senior executives.',
    detail: 'LinkedIn is a broadcast channel. Generic forums are noise. The ESG Intelligence Network is a curated, professionally governed space where every member has been through the same rigorous profile process — sector expertise, board history, qualifications, and peer endorsements. You are not networking with the internet. You are networking with your peers.',
    accent: 'Not LinkedIn. Not a forum. A professional intelligence community.',
  },
  {
    icon: Brain,
    title: 'Evidence-Based Professional Profiles',
    summary: 'Your profile is your professional record — not a CV, not a social feed.',
    detail: 'Every member builds a structured profile that captures board experience, sector expertise, qualifications, governance credentials, and areas of specialist knowledge. Peer endorsements from fellow members add independent verification. Over time your profile becomes a living, evidence-backed professional record that speaks for itself.',
    accent: 'Endorsed by peers. Verified by participation. Trusted by boards.',
  },
  {
    icon: Briefcase,
    title: 'Board Opportunity Marketplace',
    summary: 'NED, Chair, and Advisory roles — matched to your expertise, not your follower count.',
    detail: 'Opportunities posted on this platform are targeted. Organisations post NED, Chair, and advisory roles with full context — sector, time commitment, remuneration, and skills required. Members express interest privately. No cold outreach. No recruiters taking 30%. A direct, transparent marketplace built on professional trust.',
    accent: 'The right role, with the right organisation, at the right stage.',
  },
  {
    icon: TrendingUp,
    title: 'Reputation You Can Actually See',
    summary: 'Your contributions build a reputation score that reflects real professional value.',
    detail: 'Every insight shared, every endorsement given, every board role logged — it all contributes to a transparent reputation engine. Leaderboards, badges, and expertise scores mean that the most knowledgeable, most engaged members are visible. Reputation here is earned, not bought.',
    accent: 'Merit-based visibility. Not pay-to-play.',
  },
  {
    icon: Users,
    title: 'Governed Peer Discussion',
    summary: 'Structured forums where depth of thinking is valued over volume of posts.',
    detail: 'Forum categories are designed around the topics that matter to board-level professionals — ESG strategy, governance, risk, sustainable finance, digital transformation, regulatory compliance. Discussion is moderated by experienced practitioners, not algorithms. Quality is enforced. Noise is removed.',
    accent: 'Structured. Moderated. Professionally relevant.',
  },
  {
    icon: BookOpen,
    title: 'Knowledge That Compounds Over Time',
    summary: 'The platform learns from its community and surfaces what matters.',
    detail: 'As the network grows, AI-assisted knowledge tools will surface the most relevant insights, discussions, and members for your specific areas of focus. The platform is designed to become more valuable the longer you use it — your expertise, your connections, your reputation all compound over time.',
    accent: 'The longer you engage, the more valuable your membership becomes.',
  },
  {
    icon: Shield,
    title: 'GDPR-First Privacy Controls',
    summary: 'You control exactly what is visible, to whom, and when.',
    detail: 'Every contact detail, every piece of profile information — you decide what is shown and to whom. Professional email, phone, LinkedIn, and profile visibility are individually controlled. Your data is never sold, never shared with third parties, and is held under UK GDPR and the Data Protection Act 2018. You can request a full export or deletion at any time.',
    accent: 'Your data. Your rules. Always.',
  },
  {
    icon: Globe,
    title: 'A Platform With a Purpose',
    summary: 'Built to accelerate the transition to a more sustainable, better-governed economy.',
    detail: 'The ESG Intelligence Network exists because the transition to sustainable business needs experienced, well-connected practitioners who can implement — not just advise. Every feature, every conversation, every introduction made on this platform serves that mission. This is not a social network with an ESG badge. This is infrastructure for the people doing the work.',
    accent: '"ESG is not a cost — it is a cost-reduction and performance-improvement catalyst."',
  },
];

const WHAT_YOU_GET = [
  'Curated professional profile with board history, sector expertise and peer endorsements',
  'Access to governed, high-quality discussion forums by topic',
  'Visibility of Board Opportunity listings — NED, Chair and Advisory roles',
  'Reputation score and expert badges that grow with your contributions',
  'Private messaging with fellow members',
  'AI-assisted CV import to build your profile in minutes',
  'GDPR-controlled contact visibility settings',
  'Access to the knowledge base built from community expertise',
  'Early access to new features as the platform develops',
];

const WHAT_YOU_WONT_GET = [
  'Spam, cold outreach, or unsolicited connection requests',
  'Algorithmic feeds designed to maximise time-on-site',
  'Recruiters charging 30% introduction fees',
  'Data sold to third parties or advertisers',
  'Generic content written for everyone and relevant to no one',
  'A race to the bottom on professional standards',
];

export default function FeaturesPage() {
  return (
    <div className="min-h-screen bg-background">

      {/* Hero */}
      <section className="border-b border-border bg-card/40">
        <div className="max-w-4xl mx-auto px-6 py-16 text-center">
          <div className="inline-flex items-center gap-2 text-xs tracking-widest uppercase text-primary font-semibold mb-6 border border-primary/30 rounded-full px-4 py-1.5">
            Key Features Document
          </div>
          <h1 className="text-4xl font-bold text-foreground mb-4 leading-tight">
            Why the ESG Intelligence Network exists — and what you get by joining
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-8">
            Most professional platforms make you work hard to understand their value. We believe you should know exactly what you are joining, what it costs, and what you get — before you commit.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/register"
              className="inline-flex items-center justify-center gap-2 bg-primary text-primary-foreground hover:bg-primary/90 px-6 py-3 rounded-lg font-semibold text-sm transition-colors">
              Apply for Membership <ArrowRight className="h-4 w-4" />
            </Link>
            <Link href="/forums"
              className="inline-flex items-center justify-center gap-2 border border-border hover:border-primary/50 px-6 py-3 rounded-lg font-semibold text-sm transition-colors text-foreground">
              Explore the Network
            </Link>
          </div>
        </div>
      </section>

      {/* The problem we solve */}
      <section className="max-w-4xl mx-auto px-6 py-14">
        <div className="border-l-4 border-primary pl-6 mb-10">
          <h2 className="text-2xl font-bold text-foreground mb-3">The problem we solve</h2>
          <p className="text-muted-foreground leading-relaxed">
            ESG and governance professionals are scattered across LinkedIn, WhatsApp groups, private email chains, and expensive in-person events. There is no single place where experienced board-level practitioners can connect, share knowledge, access relevant opportunities, and build a verifiable professional reputation — without noise, without algorithms, and without handing their data to advertisers.
          </p>
          <p className="text-muted-foreground leading-relaxed mt-3">
            The ESG Intelligence Network is that place.
          </p>
        </div>

        {/* Core benefits */}
        <div className="space-y-8">
          {BENEFITS.map((b, i) => {
            const Icon = b.icon;
            return (
              <div key={i} className="flex gap-5 p-6 rounded-xl border border-border bg-card/30 hover:border-primary/40 transition-colors">
                <div className="shrink-0 h-11 w-11 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Icon className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground text-base mb-1">{b.title}</h3>
                  <p className="text-sm text-primary font-medium mb-2">{b.summary}</p>
                  <p className="text-sm text-muted-foreground leading-relaxed mb-3">{b.detail}</p>
                  <p className="text-xs italic text-primary/80 border-l-2 border-primary/30 pl-3">{b.accent}</p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* What you get / don't get */}
      <section className="border-t border-border bg-card/20">
        <div className="max-w-4xl mx-auto px-6 py-14">
          <h2 className="text-2xl font-bold text-foreground mb-8 text-center">A plain-English summary</h2>
          <div className="grid sm:grid-cols-2 gap-8">
            <div>
              <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-primary" /> What you get
              </h3>
              <ul className="space-y-3">
                {WHAT_YOU_GET.map((item, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                    <span className="text-primary mt-0.5 shrink-0">✓</span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
                <Shield className="h-5 w-5 text-destructive/70" /> What you won't get
              </h3>
              <ul className="space-y-3">
                {WHAT_YOU_WONT_GET.map((item, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                    <span className="text-destructive/60 mt-0.5 shrink-0">✕</span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Membership note */}
      <section className="border-t border-border">
        <div className="max-w-4xl mx-auto px-6 py-14">
          <div className="rounded-xl border border-primary/30 bg-primary/5 p-8 text-center">
            <Award className="h-8 w-8 text-primary mx-auto mb-4" />
            <h2 className="text-xl font-bold text-foreground mb-3">A note on membership</h2>
            <p className="text-muted-foreground text-sm leading-relaxed max-w-2xl mx-auto mb-4">
              The ESG Intelligence Network is in its founding member phase. Founding members help shape the platform — your feedback, your contributions, and your connections define what this becomes. Subscription pricing will be introduced as the platform matures. Early members will be rewarded for their contribution to building the community.
            </p>
            <p className="text-xs text-muted-foreground italic">
              This features document is updated as new capabilities are added to the platform. Last reviewed: July 2026.
            </p>
          </div>

          <div className="text-center mt-10">
            <p className="text-muted-foreground text-sm mb-6">
              If you have read this far, you understand what we are building and why. The next step is straightforward.
            </p>
            <Link href="/register"
              className="inline-flex items-center gap-2 bg-primary text-primary-foreground hover:bg-primary/90 px-8 py-3 rounded-lg font-semibold transition-colors">
              Join the Network <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

    </div>
  );
}
