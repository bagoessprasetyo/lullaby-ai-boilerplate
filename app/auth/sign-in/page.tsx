// app/auth/sign-in/page.tsx
"use client";

import { SignIn, useUser } from '@clerk/nextjs';
import { useToast } from '@/hooks/use-toast';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function SignInPage() {
  const { toast } = useToast();
  const { user, isLoaded } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (isLoaded && user) {
      router.push('/dashboard');
    }
  }, [isLoaded, user, router]);

  // Optional: Show a loading state or null while checking auth status
  if (!isLoaded || user) {
    return null; // Or a loading spinner
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-purple-50 to-white dark:from-gray-800 dark:to-gray-900">
      <div className="w-full max-w-md p-8 rounded-lg">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-purple-600 dark:text-purple-300 mb-2">Welcome to Lullaby.ai</h1>
          <p className="text-gray-600 dark:text-gray-300">
            Create magical bedtime stories for your children
          </p>
        </div>
        
        <SignIn 
          appearance={{
            elements: {
              rootBox: 'w-full',
              card: 'bg-transparent shadow-none',
              headerTitle: 'hidden',
              headerSubtitle: 'hidden',
              socialButtonsBlockButton: 'bg-purple-600 hover:bg-purple-700 text-white dark:bg-purple-700 dark:hover:bg-purple-800',
              formButtonPrimary: 'bg-purple-600 hover:bg-purple-700 text-white dark:bg-purple-700 dark:hover:bg-purple-800'
            }
          }}
          afterSignInUrl="/dashboard"
          routing="hash"
        />
        
        <div className="text-center text-xs text-gray-500 dark:text-gray-400 mt-4">
          By continuing, you agree to our <Link href="/terms" className="text-purple-600 dark:text-purple-400 hover:underline">Terms</Link> and <Link href="/privacy" className="text-purple-600 dark:text-purple-400 hover:underline">Privacy Policy</Link>.
        </div>
      </div>
    </div>
  );
}