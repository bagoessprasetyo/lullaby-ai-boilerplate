"use client"

console.log('[AppSidebar] Component rendering started.'); // Add log to check if component renders at all

import * as React from "react";
import {
  LayoutDashboard, // Icon for Dashboard
  PlusSquare,    // Icon for Create Story
  Library,       // Icon for My Library
  Settings,      // Icon for Account Settings
  ArrowUpCircleIcon, // Existing icon
  ExternalLink,
  ShoppingCartIcon,
  Sparkles, // Icon for Quick Create
} from "lucide-react"
import { useAuth, useUser } from "@clerk/nextjs"; // Import useUser from Clerk
// Removed useProfile import as it's now in StoryCreditsDisplay

import { NavMain } from "@/components/nav-main"
import { NavUser } from "@/components/nav-user"
// Remove NavProjects and TeamSwitcher imports as they are not needed
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton
} from "@/components/ui/sidebar"
import { InfoCard, InfoCardAction, InfoCardContent, InfoCardDescription, InfoCardDismiss, InfoCardFooter, InfoCardTitle } from "./ui/info-card";
import Link from "next/link";
import { StoryCreationWizardModal } from "./StoryCreationWizardModal"; // Import the new modal component
import { Button } from "./ui/button"; // Import Button
import { StoryCreditsDisplay } from "./StoryCreditsDisplay"; // Import the new component

// Define the new navigation structure for Lullaby.ai
const lullabyNavItems = [
  {
    title: "Dashboard",
    url: "/dashboard", // Update with actual route
    icon: LayoutDashboard,
    isActive: false, // Logic to determine active state needed
  },
  // Remove Create Story link from main nav
  // {
  //   title: "Create Story",
  //   url: "/create", // Update with actual route
  //   icon: PlusSquare,
  //   isActive: false,
  // },
  {
    title: "My Library",
    url: "/library", // Update with actual route
    icon: Library,
    isActive: false,
  },
  {
    title: "Account Settings",
    url: "/account-settings", // Updated route
    icon: Settings,
    isActive: false,
  },
  {
    title: "Voice Shop",
    url: "/voice-shop", // Updated route to the new page
    icon: ShoppingCartIcon,
    isActive: false,
  },
]

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const [isCreateModalOpen, setIsCreateModalOpen] = React.useState(false);
  const { user } = useUser(); // Fetch user data using Clerk hook
  
  // Prepare user data for NavUser, handling potential null values
  const navUserData = user
    ? {
        id: user.id,
        name: user.fullName || user.firstName || "User",
        email: user.primaryEmailAddress?.emailAddress || "No email",
        avatar: user.imageUrl || "/avatars/default.png", // Provide a default avatar
      }
    : {
        id: "",
        name: "Guest",
        email: "",
        avatar: "/avatars/default.png", // Default for logged-out state
      }

  const handleStoryComplete = (data: any) => {
    console.log("Story creation submitted from modal:", data);
    // TODO: Implement API call to backend to create the story
    alert("Story creation submitted! Check console for data.");
  };

  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              className="data-[slot=sidebar-menu-button]:!p-1.5"
            >
              <a href="/"> {/* Link to homepage */} 
                <ArrowUpCircleIcon className="h-5 w-5" />
                <span className="text-base font-semibold">Lullaby.ai</span>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
        {/* Add Quick Create Button here */}
        <div className="px-2 py-2">
          <Button 
            className="w-full justify-start" 
            onClick={() => setIsCreateModalOpen(true)}
          >
            <Sparkles className="mr-2 h-4 w-4" /> Create New Story
          </Button>
        </div>
      </SidebarHeader>
      <SidebarContent>
        {/* Use the new Lullaby navigation items */}
        <NavMain items={lullabyNavItems} />
        {/* Remove NavProjects and NavDocuments if not needed */}
      </SidebarContent>
      <SidebarFooter>
        {/* Use the new Story Credits Display component, render only when user.id is available */}
        {user?.id && <StoryCreditsDisplay user={navUserData}/>}
        {/* Pass the fetched user data to NavUser */}
        <NavUser user={navUserData} />
      </SidebarFooter>
      {/* Remove SidebarRail if not used */}
      {/* Render the modal */}
      <StoryCreationWizardModal 
        open={isCreateModalOpen} 
        onOpenChange={setIsCreateModalOpen} 
        onComplete={handleStoryComplete} 
      />
    </Sidebar>
  )
}
