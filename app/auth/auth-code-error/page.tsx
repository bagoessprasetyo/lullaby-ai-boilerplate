"use client";

import { Button } from "@/components/ui/button";
import { useRouter, useSearchParams } from "next/navigation";

export default function AuthErrorPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const error = searchParams.get('error');

  const errorMessages = {
    database_error: "Failed to save user data. Please try again.",
    missing_code: "Invalid authentication request.",
    server_error: "Server error occurred during login.",
    default: "An unknown error occurred during login."
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      <h1 className="text-2xl font-bold mb-4">Login Error</h1>
      <p className="mb-6">
        {errorMessages[error as keyof typeof errorMessages] || errorMessages.default}
      </p>
      <Button onClick={() => router.push('/')}>
        Return to Home
      </Button>
    </div>
  );
}