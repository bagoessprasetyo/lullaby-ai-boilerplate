// Add to app/pricing/page.tsx
import { useSearchParams } from 'next/navigation'; // Make sure this is imported
import { useEffect, useState } from 'react'; // If not already imported

// Inside the PricingPage component:
const searchParams = useSearchParams();
const [showCancelMessage, setShowCancelMessage] = useState(false);

useEffect(() => {
    if (searchParams.get('canceled') === 'true') {
        setShowCancelMessage(true);
        // Optional: remove the query param from URL without reload
        // window.history.replaceState(null, '', '/pricing');
        // Optional: show a toast notification instead
    }
}, [searchParams]);

// ... rest of the component

// Add this within the main return div, perhaps above the h1:
{showCancelMessage && (
    <div className="mb-6 p-4 bg-yellow-100 border border-yellow-300 text-yellow-800 rounded-md text-center">
        Your payment process was canceled. You can try choosing a plan again.
    </div>
)}

// ... rest of the JSX