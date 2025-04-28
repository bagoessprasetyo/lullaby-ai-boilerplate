"use client"

console.log('[Dashboard Page] Rendering started.'); // Add log to check if dashboard page renders

import { AppSidebar } from "@/components/app-sidebar"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { Separator } from "@/components/ui/separator"
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar"
// import StoryCard, { TopPlayedStoriesDemo } from "@/components/ui/StoryCard"
import { BadgeCheckIcon, BookOpenIcon, HeadphonesIcon, Sparkles } from "lucide-react"
import { useMostPlayedStories } from '@/hooks/use-most-played-stories';
import { auth } from "@clerk/nextjs/server"
import { useUser } from "@clerk/nextjs"
import Image from "next/image"
import { cn } from "@/lib/utils"
import { Skeleton } from "@/components/ui/skeleton"
// import { useTheme } from "next-themes";

export default function Page() {
  console.log('[Dashboard Page] Inside component function.'); // Add log inside the function
  // const { userId } =  auth();
  const { user } = useUser();
  const { data, isLoading } = useMostPlayedStories(user?.id);
  console.log('usrrrr : '+ user?.publicMetadata);
  // const { theme } = useTheme();
  return (
    <>
        <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
          <div className="grid auto-rows-min gap-4 md:grid-cols-3">
            <div className="rounded-xl bg-[#faf7f5] p-6 shadow-sm">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-medium ">Stories Created</h3>
                <BookOpenIcon className="h-4 w-4 " />
              </div>
              <div className="mt-2">
                <p className="text-2xl font-bold ">12</p>
                <p className="text-xs ">+2 from last month</p>
              </div>
            </div>
            <div className="rounded-xl bg-[#faf7f5] p-6 shadow-sm">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-medium ">Listening Time</h3>
                <HeadphonesIcon className="h-4 w-4 " />
              </div>
              <div className="mt-2">
                <p className="text-2xl font-bold ">45m</p>
                <p className="text-xs ">+10m from last week</p>
              </div>
            </div>
            <div className="rounded-xl bg-[#faf7f5] p-6 shadow-sm">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-medium ">Subscription</h3>
                <BadgeCheckIcon className="h-4 w-4 " />
              </div>
              <div className="mt-2">
                <p className="text-2xl font-bold ">Premium</p>
                <p className="text-xs ">Renews in 15 days</p>
              </div>
            </div>
          </div>
          <div className="min-h-[100vh] flex-1 rounded-xl bg-muted/50 md:min-h-min">
            <div className="p-6">
              <h2 className="text-lg font-semibold mb-4">Top Played Stories</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {isLoading && Array.from({ length: 6 }).map((_, index) => (
                  <div key={index} className="max-w-xs w-full">
                    <Skeleton className="h-96 rounded-md shadow-xl mx-auto" />
                  </div>
                ))}
              {!isLoading && data?.map((story) => (
  <div key={story.id} className="max-w-xs w-full mx-auto">
    <div
      className={cn(
        "group relative w-full cursor-pointer overflow-hidden card h-96 rounded-md shadow-xl flex flex-col justify-end p-4 border border-transparent dark:border-neutral-800",
        "transition-all duration-500"
      )}
      style={{
        background: story.images?.[0]?.storage_path ? 
          `url("${story.images[0].storage_path}")` : 
          'none',
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      {/* Dark overlay on hover */}
      <div className="absolute inset-0 bg-black opacity-0 group-hover:opacity-80 transition-opacity duration-500" />

      {/* Favorite Button */}
      <button
        className="absolute top-3 right-3 z-20 opacity-0 group-hover:opacity-100 bg-white/80 hover:bg-white p-2 rounded-full transition-all"
        onClick={(e) => {
          e.stopPropagation();
          console.log('Add to favorites', story.id);
        }}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-5 w-5 text-pink-600"
          fill="currentColor"
          viewBox="0 0 24 24"
        >
          <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 
                  4.42 3 7.5 3c1.74 0 3.41 0.81 
                  4.5 2.09C13.09 3.81 14.76 3 16.5 3 
                  19.58 3 22 5.42 22 8.5c0 3.78-3.4 
                  6.86-8.55 11.54L12 21.35z" />
        </svg>
      </button>

      {/* Play Button */}
      <button
        className="absolute inset-0 flex items-center justify-center z-10 opacity-0 group-hover:opacity-100 transition-opacity"
        onClick={(e) => {
          e.stopPropagation();
          console.log('Play story', story.id);
        }}
      >
        <div className="bg-white/80 hover:bg-white p-4 rounded-full shadow-md">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-8 w-8 text-black"
            fill="currentColor"
            viewBox="0 0 24 24"
          >
            <path d="M8 5v14l11-7z" />
          </svg>
        </div>
      </button>

      {/* Text content */}
      <div className="relative z-10">
        <h1 className="font-bold text-xl md:text-3xl text-gray-50">
          {story.title}
        </h1>
        <p className="font-normal text-base text-gray-50 my-4">
          Duration: {Math.floor(story.duration / 60)} minutes | Plays: {story.play_count}
        </p>
      </div>
    </div>
  </div>
))}
                {/* <TopPlayedStoriesDemo/> */}
              </div>
            </div>
          </div>
        </div>
        </>
  )
}
