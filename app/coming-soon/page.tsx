// app/coming-soon/page.tsx
'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { Mail, CheckCircle, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';

export default function ComingSoonPage() {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email.trim()) {
      toast({
        variant: "destructive",
        title: "Email Required",
        description: "Please enter your email address."
      });
      return;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      toast({
        variant: "destructive",
        title: "Invalid Email",
        description: "Please enter a valid email address."
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch('/api/waitlist', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: email.trim(),
          source: 'coming-soon-page'
        }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setIsSuccess(true);
        setEmail(''); // Clear the email field
        toast({
          title: "Success!",
          description: data.message,
          duration: 5000
        });
      } else {
        // Handle API errors
        toast({
          variant: "destructive",
          title: "Sign Up Failed",
          description: data.error || "Something went wrong. Please try again."
        });
      }
    } catch (error) {
      console.error('Waitlist signup error:', error);
      toast({
        variant: "destructive",
        title: "Network Error",
        description: "Please check your connection and try again."
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-purple-50 via-pink-50 to-white dark:from-gray-900 dark:via-purple-900/10 dark:to-background px-4 text-center">
      <div className="w-full max-w-md space-y-8">
        {/* Header */}
        <div className="space-y-4 animate-fade-in">
          <h1 className="text-4xl md:text-6xl font-bold tracking-tighter text-gray-900 dark:text-gray-100">
            Coming Soon!
          </h1>
          <p className="text-lg md:text-xl text-gray-600 dark:text-gray-400">
            We're working hard to bring Lullaby.ai to life. Sign up below to get notified when we launch!
          </p>
        </div>

        {/* Success State */}
        {isSuccess ? (
          <div className="space-y-6 animate-fade-in animation-delay-200">
            <div className="flex flex-col items-center space-y-4">
              <div className="w-16 h-16 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center">
                <CheckCircle className="w-8 h-8 text-green-600 dark:text-green-400" />
              </div>
              <div className="space-y-2">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                  You're on the list!
                </h2>
                <p className="text-gray-600 dark:text-gray-400">
                  We'll send you an email as soon as Lullaby.ai is ready to create magical bedtime stories.
                </p>
              </div>
            </div>
            
            <div className="space-y-3">
              <Button 
                onClick={() => setIsSuccess(false)}
                variant="outline" 
                className="w-full"
              >
                Sign Up Another Email
              </Button>
              <div className="text-xs text-gray-500 dark:text-gray-400">
                Want to follow our progress?{' '}
                <button 
                  className="text-purple-600 dark:text-purple-400 hover:underline"
                  onClick={() => window.open('mailto:hello@lullaby-ai.com')}
                >
                  Contact us
                </button>
              </div>
            </div>
          </div>
        ) : (
          /* Sign Up Form */
          <form onSubmit={handleSubmit} className="space-y-6 animate-fade-in animation-delay-400">
            <div className="space-y-3">
              <div className="flex flex-col gap-3">
                <Input 
                  type="email" 
                  placeholder="Enter your email address" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isSubmitting}
                  className="text-center text-lg py-3 bg-white/80 backdrop-blur-sm border-gray-200 dark:border-gray-700 focus:border-purple-400 dark:focus:border-purple-500 transition-colors"
                  aria-label="Email address for launch notification"
                />
                <Button 
                  type="submit"
                  disabled={isSubmitting || !email.trim()}
                  className="group py-3 text-lg bg-purple-600 hover:bg-purple-700 dark:bg-purple-700 dark:hover:bg-purple-800 transition-all duration-200 disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      Adding you to the list...
                    </>
                  ) : (
                    <>
                      Notify Me
                      <Mail className="ml-2 h-5 w-5 group-hover:animate-bounce transition-transform" />
                    </>
                  )}
                </Button>
              </div>
              
              <p className="text-xs text-gray-500 dark:text-gray-400">
                We'll only email you about our launch. No spam, promise! 🌟
              </p>
            </div>

            {/* Privacy Note */}
            <div className="text-xs text-gray-400 dark:text-gray-500 space-y-1">
              <p>By signing up, you agree to receive launch notifications.</p>
              <p>You can unsubscribe at any time.</p>
            </div>
          </form>
        )}

        {/* Back to Home Link */}
        <div className="animate-fade-in animation-delay-600">
          <Link href="/">
            <Button variant="ghost" className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100">
              ← Go Back Home
            </Button>
          </Link>
        </div>

        {/* Optional: Add some visual elements */}
        <div className="flex justify-center space-x-2 animate-fade-in animation-delay-800">
          <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse"></div>
          <div className="w-2 h-2 bg-pink-400 rounded-full animate-pulse animation-delay-100"></div>
          <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse animation-delay-200"></div>
        </div>
      </div>
    </div>
  );
}

// CSS animations (add to your global CSS file if not already present)
/*
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

.animate-fade-in {
  animation: fadeIn 0.5s ease-out forwards;
}

.animation-delay-100 { animation-delay: 0.1s; }
.animation-delay-200 { animation-delay: 0.2s; }
.animation-delay-400 { animation-delay: 0.4s; }
.animation-delay-600 { animation-delay: 0.6s; }
.animation-delay-800 { animation-delay: 0.8s; }

@keyframes bounce {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-5px); }
}

.group:hover .group-hover\:animate-bounce {
  animation: bounce 0.5s infinite;
}
*/