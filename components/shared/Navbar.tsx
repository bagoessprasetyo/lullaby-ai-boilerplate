// components/shared/Navbar.tsx
"use client"; // FloatingNav likely uses client-side hooks

import React from "react";
import { FloatingNav } from "@/components/ui/floating-navbar"; // Adjust path if needed
import { Home, Sparkles, HelpCircle, Tag, LogIn } from "lucide-react"; // Example icons
import { useAuthModal } from "@/store/auth-modal-store";
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { cn } from "@/lib/utils";

export default function Navbar() {
  const router = useRouter();
  const { openModal } = useAuthModal();

  useEffect(() => {
    if (router) {
      const routes = ['/dashboard', '/library', '/create'];
      routes.forEach(route => router.prefetch(route));
    }
  }, []);
  const navItems = [
    {
      name: "Home",
      link: "#",
      icon: <Home className="h-4 w-4 text-neutral-600 dark:text-white" aria-hidden="true" />,
      ariaLabel: "Navigate to home section"
    },
    {
      name: "How it Works",
      link: "#how-it-works", 
      icon: <Sparkles className="h-4 w-4 text-neutral-600 dark:text-white" aria-hidden="true" />,
      ariaLabel: "Navigate to how it works section"
    },
    {
      name: "Features",
      link: "#features",
      icon: <Sparkles className="h-4 w-4 text-neutral-600 dark:text-white" aria-hidden="true" />,
      ariaLabel: "Navigate to features section"
    },
    {
      name: "Pricing",
      link: "#pricing",
      icon: <Tag className="h-4 w-4 text-neutral-600 dark:text-white" aria-hidden="true" />,
      ariaLabel: "Navigate to pricing section"
    },
    {
      name: "FAQ",
      link: "#faq",
      icon: <HelpCircle className="h-4 w-4 text-neutral-600 dark:text-white" aria-hidden="true" />,
      ariaLabel: "Navigate to FAQ section"
    }
  ];

  return (
    <nav aria-label="Main navigation">
      <div className="relative w-full">
        <FloatingNav 
          navItems={navItems.map(item => ({
            ...item,
            className: cn(
              "relative items-center flex space-x-1",
              "text-neutral-600 dark:text-neutral-300 hover:text-neutral-900 dark:hover:text-white",
              "focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2",
              "transition-colors duration-200"
            )
          }))} 
        />
      </div>
    </nav>
  );
}
