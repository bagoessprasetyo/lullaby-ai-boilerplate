import Link from 'next/link';
import { Suspense } from 'react'; // Import Suspense
import { CheckCircle } from 'lucide-react';

// Optional: Component to display session details (client-side fetch or server-side with searchParams)
function SuccessDisplay({ sessionId }: { sessionId: string | null }) {
    // Here you could fetch session details from Stripe using the sessionId
    // Be cautious about doing this client-side without authentication
    // Or just show a generic success message.

    return (
        <div className="p-6 md:p-10 bg-white rounded-lg shadow-xl text-center">
            <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
            <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-2">Payment Successful!</h1>
            <p className="text-gray-600 mb-6">Thank you for your subscription. Your payment was processed successfully.</p>
            {sessionId && (
                <p className="text-sm text-gray-500 mb-6">Session ID: {sessionId}</p>
            )}
            <p className="text-gray-600 mb-6">You can now access your new features.</p>
            {/* Add a link to the user's dashboard or relevant page */}
            <Link href="/dashboard" className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-6 rounded transition duration-200">
                Go to Dashboard
            </Link>
        </div>
    );
}

export default function PaymentSuccessPage({ searchParams }: { searchParams: { session_id?: string } }) {
    const sessionId = searchParams?.session_id ?? null;

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-100 px-4">
            {/* Wrap the component that uses searchParams in Suspense */}
            <Suspense fallback={<div className="text-center">Loading confirmation...</div>}>
                <SuccessDisplay sessionId={sessionId} />
            </Suspense>
        </div>
    );
}