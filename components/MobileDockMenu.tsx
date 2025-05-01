"use client"

import * as React from "react";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Library,
  Settings,
  ShoppingCartIcon,
  Sparkles, // For the center 'Create' button
} from "lucide-react";
import { Button } from "./ui/button";
import { StoryCreationWizardModal } from "./StoryCreationWizardModal";
import { Dock } from "./ui/dock-two";

export function MobileDockMenu() {
  const pathname = usePathname();
  const router = useRouter();
  const [isCreateModalOpen, setIsCreateModalOpen] = React.useState(false);

  // Re-use or adapt the nav items structure
  const lullabyNavItems = [
    {
      label: "Dashboard",
      onClick: () => {
        router.push("/dashboard");
      },
      icon: LayoutDashboard,
    },
    {
      label: "My Library",
      onClick: () => {
        router.push("/library");
      },
      icon: Library,
    },
    // Central Create button
    { 
      label: "Create", 
      onClick: () => setIsCreateModalOpen(true), 
      icon: Sparkles, 
      isCentral: true 
    },
    {
      label: "Voice Shop",
      onClick: () => {
        router.push("/voice-shop");
      },
      icon: ShoppingCartIcon,
    },
    {
      label: "Settings",
      onClick: () => {
        router.push("/account-settings");
      },
      icon: Settings,
    },
  ];

  const handleStoryComplete = (data: any) => {
    console.log("Story creation submitted from modal:", data);
    // TODO: Implement API call to backend to create the story
    alert("Story creation submitted! Check console for data.");
  };

  return (
    <>
      <nav className="fixed bottom-0 left-0 right-0 z-50 md:hidden">
        <Dock items={lullabyNavItems} />
      </nav>
      {/* Render the modal */}
      <StoryCreationWizardModal
        open={isCreateModalOpen}
        onOpenChange={setIsCreateModalOpen}
        onComplete={handleStoryComplete}
      />
    </>
  );
}