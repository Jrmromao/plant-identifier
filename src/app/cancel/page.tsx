// src/app/cancel/page.tsx
import Link from 'next/link';

export default function CancelPage() {
  return (
    <div className="text-center mt-10">
      <h1 className="text-3xl font-bold text-red-600">Payment Cancelled</h1>
      <p className="mt-4">Your payment was cancelled. You have not been charged.</p>
      <Link href="/" className="mt-6 inline-block bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 transition duration-300">
        Back to Home
      </Link>
    </div>
  );
}