// app/auth/error/page.js
'use client';

import { useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';

export default function AuthError() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const error = searchParams.get('error');

  useEffect(() => {
    // Automatically redirect back to login after 5 seconds
    const timer = setTimeout(() => {
      router.push('/login');
    }, 5000);

    return () => clearTimeout(timer);
  }, [router]);

  const getErrorMessage = (error) => {
    switch (error) {
      case 'CredentialsSignin':
        return 'Invalid email or password';
      case 'SessionRequired':
        return 'Please sign in to access this page';
      default:
        return 'An error occurred during authentication';
    }
  };

  return (
    <Suspense fallback={<div>Loading...</div>}>
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Authentication Error
          </h2>
          <div className="mt-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
            <p className="text-center">{getErrorMessage(error)}</p>
          </div>
          <div className="mt-4 text-center">
            <p className="text-gray-600 mb-4">
              You will be redirected to the login page in 5 seconds.
            </p>
            <Link 
              href="/login"
              className="font-medium text-indigo-600 hover:text-indigo-500"
            >
              Return to login page
            </Link>
          </div>
        </div>
      </div>
    </div>
    </Suspense>
  );
}