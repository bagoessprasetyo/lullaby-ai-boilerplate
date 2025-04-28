"use client";

import * as React from "react";

// This page is no longer used for the main creation flow.
// The story creation wizard is now in a modal triggered from the sidebar.

function DeprecatedCreatePage() {
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Create Story</h1>
      <p className="text-muted-foreground">
        Story creation is now handled via the 'Quick Create' button in the sidebar.
      </p>
      {/* You can add a button here to manually trigger the modal if needed for testing,
          or redirect the user, or simply leave this placeholder content. */}
    </div>
  );
}

export default DeprecatedCreatePage;