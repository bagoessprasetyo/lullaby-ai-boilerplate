"use client"

import React, { useState, cloneElement, isValidElement } from 'react'; // Import cloneElement and isValidElement
console.log('[DashboardLayout] Rendering started.'); // Add log to check if dashboard layout renders

import { AppSidebar } from "@/components/app-sidebar"
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb"
import { Separator } from "@/components/ui/separator"
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import { FloatingStoryPlayer, FloatingPlayerStory } from '@/components/ui/floating-story-player'; // Import the player and its story type

import { usePathname } from 'next/navigation';
import { ThemeToggle } from '@/components/ThemeToggle';
import { MobileDockMenu } from '@/components/MobileDockMenu'; // Import the new component

export default function DashboardLayout({
  children
}: {
  children: React.ReactNode
}) {
  console.log('[DashboardLayout] Inside component function.'); // Add log inside the function
  
  const pathname = usePathname();
  const currentPage = pathname.split('/').pop() || 'Dashboard';

  // State for the floating player
  const [currentStory, setCurrentStory] = useState<FloatingPlayerStory | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  // Handlers for the player (will be passed down or managed via context later)
  const handlePlayStory = (story: FloatingPlayerStory) => {
    console.log('[DashboardLayout] Playing story:', story.id);
    setCurrentStory(story);
    setIsPlaying(true);
  };

  const handlePlayPause = () => {
    console.log('[DashboardLayout] Toggling play/pause. Current state:', isPlaying);
    setIsPlaying(!isPlaying);
  };

  const handleClosePlayer = () => {
    console.log('[DashboardLayout] Closing player.');
    setCurrentStory(null);
    setIsPlaying(false);
  };
  console.log('[DashboardLayout] Inside component function.', currentStory); // Add log inside the function
  // TODO: Pass handlePlayStory down to children or use Context API / Zustand

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12">
          <div className="flex items-center gap-2 px-4">
            <SidebarTrigger className="-ml-1" />
            <Separator orientation="vertical" className="mr-2 h-4" />
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem className="hidden md:block">
                  <BreadcrumbLink href="#">
                    Create Your Magical Story
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator className="hidden md:block" />
                <BreadcrumbItem>
                  <BreadcrumbPage>{currentPage.charAt(0).toUpperCase() + currentPage.slice(1)}</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
          <div className="ml-auto flex items-center gap-2 px-4">
            <ThemeToggle />
          </div>
        </header>
        {/* Pass handlePlayStory down via props using cloneElement */} 
        {isValidElement(children) ? cloneElement(children as React.ReactElement<any>, { handlePlayStory }) : children}
      </SidebarInset>
      {/* Add the Mobile Dock Menu for smaller screens */}
      <MobileDockMenu />
      {/* Render the Floating Player */}
      <FloatingStoryPlayer
        currentStory={currentStory}
        isPlaying={isPlaying}
        onPlayPause={handlePlayPause}
        onClose={handleClosePlayer}
        // onNext and onPrevious can be added later for playlist functionality
      />
    </SidebarProvider>
  )
}