import React, { Suspense } from 'react';
import { Metadata } from 'next';
import { AdminLoginGate } from '@/components/admin/AdminLoginGate';

export const metadata: Metadata = {
  title: 'Admin Gateway | Talent5 Command Center',
  description: 'Administrative authentication and security clearance portal for Talent5 Desi Music Platform.',
};

export default function AdminLoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#06070B] flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-rose-500/30 border-t-rose-500 rounded-full animate-spin" />
        </div>
      }
    >
      <AdminLoginGate />
    </Suspense>
  );
}
