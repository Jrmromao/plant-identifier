// src/app/success/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';

export default function SuccessPage() {
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const searchParams = useSearchParams();
  const sessionId = searchParams.get('session_id');

  useEffect(() => {
    if (sessionId) {
      // Here you would typically call your backend to verify the payment
      // and update the user's subscription status
      // For now, we'll just simulate a successful verification
      setTimeout(() => {
        setStatus('success');
      }, 1000);
    } else {
      setStatus('error');
    }
  }, [sessionId]);

  if (status === 'loading') {
    return <div>Loading...</div>;
  }

  if (status === 'error') {
    return <div>An error occurred. Please contact support.</div>;
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-md text-center">
        <h1 className="text-3xl font-bold text-green-600 mb-4">Payment Successful!</h1>
        <p className="mb-6">Thank you for upgrading to the Pro Plan.</p>
        <Link href="/" className="bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 transition duration-300">
          Back to Home
        </Link>
      </div>
    </div>
  );
}