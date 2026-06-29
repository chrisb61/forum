import Link from 'next/link';
import { MessageSquare, Users, TrendingUp, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

export default function HomePage() {
  return (
    <div className="space-y-12">
      <section className="text-center py-16 space-y-6">
        <h1 className="text-4xl md:text-6xl font-bold tracking-tight">
          Welcome to{' '}
          <span className="text-primary">Forum Platform</span>
        </h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          A modern, secure community discussion platform. Join conversations, share knowledge, and connect with others.
        </p>
        <div className="flex items-center justify-center gap-4">
          <Link href="/forums">
            <Button size="lg">Browse Forums</Button>
          </Link>
          <Link href="/register">
            <Button size="lg" variant="outline">Join Now</Button>
          </Link>
        </div>
      </section>

      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          {
            icon: MessageSquare,
            title: 'Rich Discussions',
            desc: 'Markdown support, code blocks, quotes, reactions, and more.',
          },
          {
            icon: Users,
            title: 'Community',
            desc: 'User profiles, reputation, badges, and direct messaging.',
          },
          {
            icon: TrendingUp,
            title: 'Reputation',
            desc: 'Earn points for helpful contributions and quality posts.',
          },
          {
            icon: Shield,
            title: 'Moderation',
            desc: 'Robust moderation tools to keep the community safe.',
          },
        ].map((f) => (
          <Card key={f.title}>
            <CardHeader>
              <f.icon className="h-8 w-8 text-primary mb-2" />
              <CardTitle className="text-lg">{f.title}</CardTitle>
              <CardDescription>{f.desc}</CardDescription>
            </CardHeader>
          </Card>
        ))}
      </section>

      <section className="text-center">
        <Link href="/forums">
          <Button variant="outline" size="lg">View All Forums →</Button>
        </Link>
      </section>
    </div>
  );
}
