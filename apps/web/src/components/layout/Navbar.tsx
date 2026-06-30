'use client';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Network, Bell, User, LogOut, Settings, Shield, ChevronDown, MessageSquare } from 'lucide-react';
import { useState } from 'react';

export default function Navbar() {
  const { user, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center gap-4">
        <Link href="/" className="flex items-center gap-2">
          <Network className="h-5 w-5 text-primary" />
          <div className="flex flex-col leading-tight">
            <span className="font-bold text-sm">ESG Intelligence</span>
            <span className="text-[10px] tracking-widest text-primary uppercase font-medium">Network</span>
          </div>
        </Link>

        <nav className="flex items-center gap-1 ml-4">
          <Link href="/forums" className="text-sm font-medium text-muted-foreground hover:text-foreground px-3 py-1.5 rounded-md hover:bg-accent transition-colors">
            Forums
          </Link>
          <Link href="/search" className="text-sm font-medium text-muted-foreground hover:text-foreground px-3 py-1.5 rounded-md hover:bg-accent transition-colors">
            Search
          </Link>
          <Link href="/leaderboard" className="text-sm font-medium text-muted-foreground hover:text-foreground px-3 py-1.5 rounded-md hover:bg-accent transition-colors">
            Leaderboard
          </Link>
          <Link href="/guide" className="text-sm font-medium text-muted-foreground hover:text-foreground px-3 py-1.5 rounded-md hover:bg-accent transition-colors">
            Guide
          </Link>
        </nav>

        <div className="ml-auto flex items-center gap-2">
          {user ? (
            <>
              <Link href="/notifications">
                <Button variant="ghost" size="icon" aria-label="Notifications">
                  <Bell className="h-4 w-4" />
                </Button>
              </Link>
              <Link href="/messages">
                <Button variant="ghost" size="icon" aria-label="Messages">
                  <MessageSquare className="h-4 w-4" />
                </Button>
              </Link>

              <div className="relative">
                <button
                  onClick={() => setMenuOpen(!menuOpen)}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-md hover:bg-accent transition-colors text-sm font-medium"
                >
                  {user.avatar ? (
                    <img src={user.avatar} alt={user.username} className="h-6 w-6 rounded-full object-cover" />
                  ) : (
                    <div className="h-6 w-6 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-xs font-bold">
                      {user.username.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <span className="hidden sm:inline">{user.displayName || user.username}</span>
                  <ChevronDown className="h-3 w-3" />
                </button>

                {menuOpen && (
                  <div className="absolute right-0 mt-1 w-48 bg-popover border rounded-md shadow-lg py-1 z-50">
                    <Link
                      href={`/users/${user.username}`}
                      className="flex items-center gap-2 px-3 py-2 text-sm hover:bg-accent"
                      onClick={() => setMenuOpen(false)}
                    >
                      <User className="h-4 w-4" /> Profile
                    </Link>
                    <Link
                      href="/settings"
                      className="flex items-center gap-2 px-3 py-2 text-sm hover:bg-accent"
                      onClick={() => setMenuOpen(false)}
                    >
                      <Settings className="h-4 w-4" /> Settings
                    </Link>
                    {(user.role === 'MODERATOR' || user.role === 'ADMINISTRATOR') && (
                      <Link
                        href="/moderation"
                        className="flex items-center gap-2 px-3 py-2 text-sm hover:bg-accent"
                        onClick={() => setMenuOpen(false)}
                      >
                        <Shield className="h-4 w-4" /> Moderation
                      </Link>
                    )}
                    {user.role === 'ADMINISTRATOR' && (
                      <Link
                        href="/admin"
                        className="flex items-center gap-2 px-3 py-2 text-sm hover:bg-accent"
                        onClick={() => setMenuOpen(false)}
                      >
                        <Settings className="h-4 w-4" /> Admin
                      </Link>
                    )}
                    <hr className="my-1 border-border" />
                    <button
                      onClick={() => { logout(); setMenuOpen(false); }}
                      className="flex items-center gap-2 px-3 py-2 text-sm hover:bg-accent w-full text-left text-destructive"
                    >
                      <LogOut className="h-4 w-4" /> Sign out
                    </button>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="flex items-center gap-2">
              <Link href="/login">
                <Button variant="ghost" size="sm">Sign in</Button>
              </Link>
              <Link href="/register">
                <Button size="sm">Register</Button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
