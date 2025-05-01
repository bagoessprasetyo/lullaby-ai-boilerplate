// app/coming-soon/page.tsx
'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Mail } from 'lucide-react';
import Link from 'next/link';

export default function ComingSoonPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-purple-50 via-pink-50 to-white dark:from-gray-900 dark:via-purple-900/10 dark:to-background px-4 text-center">
      <h1 className="text-4xl md:text-6xl font-bold tracking-tighter mb-4 text-gray-900 dark:text-gray-100 animate-fade-in">
        Coming Soon!
      </h1>
      <p className="max-w-md text-lg md:text-xl text-gray-600 dark:text-gray-400 mb-8 animate-fade-in animation-delay-200">
        We're working hard to bring Lullaby.ai to life. Sign up below to get notified when we launch!
      </p>
      
      {/* Removed form, replaced with direct mailto link */}
      <div className="w-full max-w-sm flex flex-col sm:flex-row gap-3 mb-8 animate-fade-in animation-delay-400">
        {/* Input is kept for visual consistency, but not functional for submission */}
        <Input 
          type="email" 
          placeholder="Enter your email address" 
          className="flex-grow" 
          aria-label="Email address for launch notification"
          readOnly // Make input read-only as it's not submitted
        />
        <Button 
          type="button" // Changed from submit to button
          className="group"
          onClick={() => window.location.href = 'mailto:support@lullaby-ai.com'}
        >
          Notify Me
          <Mail className="ml-2 h-5 w-5 group-hover:animate-bounce" />
        </Button>
      </div>

      <Link href="/">
        <Button variant="outline" className="animate-fade-in animation-delay-600">
          Go Back Home
        </Button>
      </Link>
    </div>
  );
}

// Add some basic animation styles if not already present globally
// You might want to add these to your global CSS file (e.g., globals.css)
/*
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

.animate-fade-in {
  animation: fadeIn 0.5s ease-out forwards;
}

.animation-delay-200 { animation-delay: 0.2s; }
.animation-delay-400 { animation-delay: 0.4s; }
.animation-delay-600 { animation-delay: 0.6s; }

@keyframes bounce {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-5px); }
}

.group-hover\:animate-bounce:hover .group-hover\:animate-bounce {
  animation: bounce 0.5s infinite;
}
*/