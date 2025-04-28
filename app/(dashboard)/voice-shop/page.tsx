import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MicVocal, Sparkles } from 'lucide-react'; // Added Sparkles icon

export default function VoiceShopPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-8rem)] p-4 bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50">
      {/* Added a subtle gradient background to the container */}
      <Card className="w-full max-w-lg text-center shadow-xl border-none overflow-hidden bg-white/80 backdrop-blur-sm">
        {/* Increased max-width, removed default bg, added backdrop blur */}
        <CardHeader className="pt-8 pb-4"> {/* Adjusted padding */}
          <div className="mx-auto bg-gradient-to-tr from-primary to-purple-400 p-4 rounded-full w-fit mb-5 shadow-md">
            {/* Changed icon background to a gradient */}
            <MicVocal className="h-10 w-10 text-white" /> {/* Increased icon size and made white */}
          </div>
          <CardTitle className="text-3xl font-bold text-gray-900 flex items-center justify-center gap-2">
            {/* Increased text size, changed color, added flex for icon */}
            Voice Shop Coming Soon!
            <Sparkles className="h-6 w-6 text-yellow-500" /> {/* Added Sparkles icon */}
          </CardTitle>
        </CardHeader>
        <CardContent className="pb-8"> {/* Adjusted padding */}
          <p className="text-gray-600 mb-8 text-lg">
            {/* Increased text size and changed color */}
            Get ready to discover unique and expressive voices for your magical bedtime stories. We're adding the final touches!
          </p>
          {/* Placeholder for a potential illustration or animation */}
          {/* <div className="h-32 bg-gray-200 rounded-md flex items-center justify-center text-gray-400">[Illustration Placeholder]</div> */}
        </CardContent>
      </Card>
    </div>
  );
}