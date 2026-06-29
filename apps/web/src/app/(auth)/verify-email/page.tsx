'use client';
import { useEffect, useState, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { api } from '@/lib/api';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, XCircle, Loader2 } from 'lucide-react';

function VerifyContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get('token');
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');

  useEffect(() => {
    if (!token) { setStatus('error'); return; }
    api.get(`/auth/verify-email?token=${token}`)
      .then(() => setStatus('success'))
      .catch(() => setStatus('error'));
  }, [token]);

  return (
    <Card className="w-full max-w-md text-center">
      <CardContent className="pt-8 pb-8 space-y-4">
        {status === 'loading' && <Loader2 className="h-12 w-12 animate-spin mx-auto text-primary" />}
        {status === 'success' && (
          <>
            <CheckCircle className="h-12 w-12 text-green-500 mx-auto" />
            <h2 className="text-xl font-semibold">Email Verified!</h2>
            <p className="text-muted-foreground">Your email has been verified. You can now sign in.</p>
            <Link href="/login"><Button>Sign In</Button></Link>
          </>
        )}
        {status === 'error' && (
          <>
            <XCircle className="h-12 w-12 text-destructive mx-auto" />
            <h2 className="text-xl font-semibold">Verification Failed</h2>
            <p className="text-muted-foreground">Invalid or expired verification link.</p>
            <Link href="/login"><Button variant="outline">Go to Sign In</Button></Link>
          </>
        )}
      </CardContent>
    </Card>
  );
}

export default function VerifyEmailPage() {
  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <Suspense fallback={<Card className="w-full max-w-md p-8 text-center"><Loader2 className="animate-spin mx-auto" /></Card>}>
        <VerifyContent />
      </Suspense>
    </div>
  );
}
