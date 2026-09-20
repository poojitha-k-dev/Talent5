'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function ContentUploadRedirect() {
  const router = useRouter();
  useEffect(() => {
    router.replace('/creator-studio/upload');
  }, [router]);

  return (
    <div className="max-w-2xl mx-auto px-4 py-20 text-center space-y-4">
      <div className="w-10 h-10 border-4 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto" />
      <p className="text-xs text-amber-500 font-display uppercase tracking-wider">
        Redirecting to Creator Studio Upload Wizard...
      </p>
    </div>
  );
}
