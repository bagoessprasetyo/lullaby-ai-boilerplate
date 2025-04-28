import dynamic from 'next/dynamic';
const HeroSection = dynamic(() => import('@/components/landing/HeroSection'));
const HowItWorksSection = dynamic(() => import('@/components/landing/HowItWorks'));
const FeaturesSection = dynamic(() => import('@/components/landing/FeaturesSection'));
const BenefitsSection = dynamic(() => import('@/components/landing/BenefitsSection'));
const PricingSection = dynamic(() => import('@/components/landing/PricingSection'));
const FaqSection = dynamic(() => import('@/components/landing/FaqSection'));
const CtaSection = dynamic(() => import('@/components/landing/CTASection'));
const TestimonialsSection = dynamic(() => import('@/components/landing/TestimonialsSection'));

import Navbar from '@/components/shared/Navbar';
import Footer from '@/components/shared/Footer';
import ScrollProgress from '@/components/ui/scroll-progress';
import StickyCTA from '@/components/ui/sticky-cta';
import Head from 'next/head';
import Link from 'next/link';

export default function LandingPage() {
  return (
    <div className="flex flex-col min-h-screen font-[family-name:var(--font-geist-sans)]">
      <Head>
        <title>Lullaby.ai - Create Personalized Bedtime Stories</title>
        <meta name="description" content="Transform photos into magical AI bedtime stories for your children" />
      </Head>
      
      <ScrollProgress aria-label="Page scroll progress indicator" />
      
      <Navbar aria-label="Main navigation" />
    
      <Link
        href="#main-content" 
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:bg-white focus:px-4 focus:py-2 focus:rounded focus:shadow-lg focus:z-[9999]"
      >
        Skip to content
      </Link>
      
      <main id="main-content" role="main" className="flex-grow scroll-smooth">
        <HeroSection aria-label="Introduction to Lullaby.ai" />
        <HowItWorksSection aria-label="How Lullaby.ai works" />
        <BenefitsSection aria-label="Benefits of using Lullaby.ai" />
        <FeaturesSection aria-label="Key features" />
        <PricingSection aria-label="Pricing plans" />
        <TestimonialsSection aria-label="Customer testimonials" />
        <FaqSection aria-label="Frequently asked questions" />
        {/* <CtaSection aria-label="Call to action" /> */}
      </main>
      
      <Footer aria-label="Site footer" />
      
      <StickyCTA aria-label="Quick action button" />
    </div>
  );
}
