"use client"

console.log('[DashboardLayout] Rendering started.'); // Add log to check if dashboard layout renders

import { AppSidebar } from "@/components/app-sidebar"
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb"
import { Separator } from "@/components/ui/separator"
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar"

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
        {children}
      </SidebarInset>
      {/* Add the Mobile Dock Menu for smaller screens */}
      <MobileDockMenu />
    </SidebarProvider>
  )
}