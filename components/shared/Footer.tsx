// components/shared/Footer.tsx
import Link from 'next/link';
import { Mail, Twitter, Linkedin } from 'lucide-react';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
      <div className="container mx-auto px-4 md:px-6 py-6 flex flex-col sm:flex-row justify-between items-center text-sm text-gray-500 dark:text-gray-400">
        {/* Copyright */}
        <p className="mb-2 sm:mb-0">
          &copy; {currentYear} Lullaby.ai. All rights reserved.
        </p>

        {/* Links (Optional - Add more as needed) */}
        <nav className="flex gap-4 sm:gap-6">
          <Link href="/privacy-policy" className="hover:text-gray-900 dark:hover:text-gray-100 transition-colors">
            Privacy Policy
          </Link>
          <Link href="/terms-of-service" className="hover:text-gray-900 dark:hover:text-gray-100 transition-colors">
            Terms of Service
          </Link>
          <Link href="mailto:hello@lullaby-ai.com" className="hover:text-gray-900 dark:hover:text-gray-100 transition-colors flex items-center gap-1">
            <Mail className="h-4 w-4" /> Email
          </Link>
          <Link href="https://twitter.com/bagoessprasetyo" target="_blank" rel="noopener noreferrer" className="hover:text-gray-900 dark:hover:text-gray-100 transition-colors flex items-center gap-1">
            <Twitter className="h-4 w-4" /> Twitter
          </Link>
          <Link href="https://www.linkedin.com/in/bagus-prasetyo-96a506113/" target="_blank" rel="noopener noreferrer" className="hover:text-gray-900 dark:hover:text-gray-100 transition-colors flex items-center gap-1">
            <Linkedin className="h-4 w-4" /> LinkedIn
          </Link>
        </nav>
      </div>
    </footer>
  );
}
