/* eslint-disable @typescript-eslint/no-explicit-any */
// components/auth/AuthListener.tsx
"use client";

import { useEffect } from 'react';
import { useUser, useClerk } from '@clerk/nextjs';
import { upsertUserProfile } from '@/app/auth/actions'; // Import server action
import { useAuthModal } from '@/store/auth-modal-store';
import { useToast } from '@/hooks/use-toast';
// import { useToast } from "@/components/ui/use-toast";

export function AuthListener() {
  const { user } = useUser();
  const { closeModal } = useAuthModal();
  const { toast } = useToast();
  const { signOut } = useClerk();

  useEffect(() => {
    const handleAuthChange = async () => {
      if (user) {
        console.log("User signed in:", user.id);
        closeModal();
        
        const userData = {
          id: user.id,
          email: user.emailAddresses[0]?.emailAddress || '',
          name: user.fullName || null,
          avatar_url: user.imageUrl || null,
          oauth_id: user.externalAccounts[0]?.providerUserId || null,
          clerk_reference: user.id
        };

        try {
          console.log("Calling upsertUserProfile with:", userData);
          const result = await upsertUserProfile(userData);
          if (result?.error) {
            console.error("Profile Upsert Error:", result.error);
            toast({
              title: "Profile Update Failed",
              description: result.error.message || "Could not update your profile.",
              variant: "destructive",
            });
          } else {
            console.log("Profile upsert successful (from listener)");
          }
        } catch (error: any) {
          console.error("Error calling upsertUserProfile:", error);
          toast({
            title: "Error",
            description: "An unexpected error occurred while updating your profile.",
            variant: "destructive",
          });
        }
      }
    };
    
    handleAuthChange();
  }, [user, closeModal, toast]);

  // This component doesn't render anything itself
  return null;
}
