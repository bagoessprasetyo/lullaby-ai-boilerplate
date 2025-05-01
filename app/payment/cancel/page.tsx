"use client";
import { useSearchParams } from 'next/navigation'; // Make sure this is imported
import { useEffect, useState, Suspense } from 'react'; // Import Suspense

// Create a client component that uses searchParams
function CancelContent() {
  const searchParams = useSearchParams();
  const [showCancelMessage, setShowCancelMessage] = useState(false);

  useEffect(() => {
    if (searchParams.get('canceled') === 'true') {
      setShowCancelMessage(true);
      // Optional: remove the query param from URL without reload
      // window.history.replaceState(null, '', '/payment/cancel'); // Corrected path
      // Optional: show a toast notification instead
    }
  }, [searchParams]);

  return (
    <>
      {showCancelMessage && (
        <div className="mb-6 p-4 bg-yellow-100 border border-yellow-300 text-yellow-800 rounded-md text-center">
          Your payment process was canceled. You can try choosing a plan again.
        </div>
      )}

      <h1 className="text-2xl font-bold mb-4">Payment Canceled</h1>
      <p className="mb-4">
        It looks like you canceled the payment process. If this was a mistake, you can return to the pricing page.
      </p>
      <a href="/pricing" className="text-blue-600 hover:underline">
        Go back to Pricing
      </a>
    </>
  );
}

// Loading fallback for Suspense
function CancelLoadingFallback() {
  return <p className="text-center">Loading...</p>;
}

// Define the main page component
export default function PaymentCancelPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      {/* Wrap the component that uses searchParams in Suspense */}
      <Suspense fallback={<CancelLoadingFallback />}>
        <CancelContent />
      </Suspense>
    </div>
  );
}