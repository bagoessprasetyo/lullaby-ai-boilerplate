"use client";
import { useScroll, motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';
import { useAuthModal } from '@/store/auth-modal-store';

export default function StickyCTA() {
  const { scrollYProgress } = useScroll();
  const { openModal } = useAuthModal();
  
  const handleClick = () => {
    // openModal();
    // Alternatively, redirect directly to sign-in page:
    window.location.href = '/auth/sign-in';
  };
  
  return (
    <motion.div
      className="fixed bottom-4 left-0 right-0 flex justify-center z-[9998]"
      style={{ 
        opacity: scrollYProgress,
        y: scrollYProgress.get() > 0.1 ? 0 : 100
      }}
      transition={{ type: 'spring', damping: 20 }}
    >
      <Button 
        size="lg" 
        className="shadow-lg group"
        onClick={handleClick}
      >
        Create Your First Story Free
        <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
      </Button>
    </motion.div>
  );
}