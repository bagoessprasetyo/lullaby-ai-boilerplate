/* eslint-disable @typescript-eslint/no-explicit-any */
// components/auth/AuthModal.tsx
"use client";

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { useAuthModal } from "@/store/auth-modal-store";
import { SignIn } from '@clerk/nextjs';
import { useToast } from '@/hooks/use-toast';
import Link from 'next/link';
// import { useToast } from "@/components/ui/use-toast";

export function AuthModal() {
  const { isOpen, closeModal } = useAuthModal();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Close modal if user clicks outside or hits Esc
  const handleOpenChange = (open: boolean) => {
    if (!open) {
      closeModal();
    }
  };

  // Custom Clerk error handler
  const handleClerkError = (err: any) => {
    setError(err?.message || 'Authentication failed. Please try again.');
    setLoading(false);
    toast({
      title: 'Authentication Error',
      description: err?.message || 'An error occurred during sign in.',
      variant: 'destructive',
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[425px] bg-gradient-to-b from-purple-50 to-white dark:from-gray-800 dark:to-gray-900 rounded-lg">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-purple-600 dark:text-purple-300">Welcome to Lullaby.ai</DialogTitle>
          <DialogDescription className="text-gray-600 dark:text-gray-300">
            Create magical bedtime stories for your children
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          {error && (
            <div className="mb-4 text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/30 rounded px-3 py-2">
              {error}
            </div>
          )}
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
            afterSignInUrl="/"
            routing="hash"
          />
          {loading && (
            <div className="mt-4 flex items-center justify-center">
              <span className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-purple-600 mr-2"></span>
              <span className="text-purple-600 dark:text-purple-300 text-sm">Signing in...</span>
            </div>
          )}
          <div className="text-center text-xs text-gray-500 dark:text-gray-400 mt-4">
            By continuing, you agree to our <Link href="/terms" className="text-purple-600 dark:text-purple-400 hover:underline">Terms</Link> and <Link href="/privacy" className="text-purple-600 dark:text-purple-400 hover:underline">Privacy Policy</Link>.
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// Helper Icons component (example) - create components/icons.tsx if needed
// components/icons.tsx
// import { Loader2, type LucideProps } from "lucide-react"
// export const Icons = {
//   spinner: Loader2,
//   google: (props: LucideProps) => ( /* Add SVG for Google logo here */
//     <svg {...props} /* ... */ ></svg>
//   ),
// };
