// components/shared/Footer.tsx
import Link from 'next/link';
import { Mail, Twitter, Linkedin, Github, ExternalLink } from 'lucide-react';
import { Separator } from "@/components/ui/separator";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-border bg-background py-8 md:py-12">
      <div className="container mx-auto px-4 md:px-6">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-12">
          {/* Brand and Description */}
          <div className="md:col-span-4">
            <Link href="/" className="flex items-center gap-2">
              {/* Assuming you have a Logo component or similar */}
              {/* <Logo className="h-6 w-auto" /> */}
              <span className="text-xl font-bold text-foreground">Lullaby.ai</span>
            </Link>
            <p className="mt-2 text-sm text-muted-foreground">
              Personalized AI bedtime stories for your little ones.
            </p>
            <p className="mt-6 text-sm text-muted-foreground">
              &copy; {currentYear} Lullaby.ai. All rights reserved.
            </p>
          </div>

          {/* Links Section */}
          <div className="md:col-span-8">
            <div className="grid grid-cols-2 gap-8 sm:grid-cols-3">
              {/* Company Links - Placeholder, update as needed */}
              <div>
                <h3 className="text-sm font-medium text-foreground">Company</h3>
                <ul className="mt-4 space-y-3">
                  {/* Add relevant company links here if available */}
                  {/* Example:
                  <li>
                    <Link href="/about" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                      About Us
                    </Link>
                  </li>
                  */}
                </ul>
              </div>

              {/* Legal Links */}
              <div>
                <h3 className="text-sm font-medium text-foreground">Legal</h3>
                <ul className="mt-4 space-y-3">
                  <li>
                    <Link href="/privacy-policy" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                      Privacy Policy
                    </Link>
                  </li>
                  <li>
                    <Link href="/terms-of-service" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                      Terms of Service
                    </Link>
                  </li>
                  {/* Add other legal links like Cookie Policy if needed */}
                </ul>
              </div>

              {/* Connect Links */}
              <div>
                <h3 className="text-sm font-medium text-foreground">Connect</h3>
                <ul className="mt-4 space-y-3">
                  <li>
                    <Link
                      href="mailto:hello@lullaby-ai.com"
                      className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
                    >
                      <Mail className="h-4 w-4" />
                      <span>Contact Us</span>
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="https://twitter.com/bagoessprasetyo"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
                    >
                      <Twitter className="h-4 w-4" />
                      <span>Twitter</span>
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="https://www.linkedin.com/in/bagus-prasetyo-96a506113/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
                    >
                      <Linkedin className="h-4 w-4" />
                      <span>LinkedIn</span>
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="https://github.com/bagoessprasetyo/lullaby-boilerplate" // Update with your actual repo
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
                    >
                      <Github className="h-4 w-4" />
                      <span>GitHub</span>
                    </Link>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        <Separator className="my-8" />

        <div className="flex flex-col items-center justify-center gap-4 md:flex-row md:justify-between">
          <p className="text-xs text-muted-foreground text-center md:text-left">
            Built with <span role="img" aria-label="heart">❤️</span> using Next.js, Supabase, Stripe, and Shadcn UI.
          </p>
          {/* Optional: Add link back to your portfolio or site */}
          {/*
          <div className="flex items-center gap-4">
            <Link
              href="https://your-portfolio-link.com"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              <ExternalLink className="h-3 w-3" />
              <span>Your Name/Brand</span>
            </Link>
          </div>
          */}
        </div>
      </div>
    </footer>
  );
}
