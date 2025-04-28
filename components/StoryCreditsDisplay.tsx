"use client"

import * as React from "react";
import { useProfile } from "@/hooks/use-profile";

export function StoryCreditsDisplay({
    user,
  }: {
    user: {
      id: string
      name: string
      email: string
      avatar: string
    }
  }) {
  const { data: profile, isLoading: isLoadingProfile, error: profileError } = useProfile(user?.id);
  console.log('use profile ', user?.id);
  return (
    <div className="px-4 py-2 border-t border-border">
      <p className="text-sm font-medium text-foreground">Story Credits</p>
      {isLoadingProfile ? (
        <p className="text-xs text-muted-foreground">Loading credits...</p>
      ) : profileError ? (
        <p className="text-xs text-red-500">Error loading credits</p>
      ) : profile ? (
        <p className="text-xs text-muted-foreground">
          {profile.story_credits ?? 0} remaining
          {/* TODO: Add total credits based on subscription tier if available */}
          {/* Example: {profile.story_credits ?? 0} / {getMaxCredits(profile.subscription_tier)} remaining */}
        </p>
      ) : (
        <p className="text-xs text-muted-foreground">N/A</p> // Handle case where profile is null
      )}
    </div>
  );
}