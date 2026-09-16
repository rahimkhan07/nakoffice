import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export const metadata = { title: 'Help & Support' };

export default function HelpPage() {
  return (
    <div className="p-10 text-center max-w-xl mx-auto mt-20">
      <h1 className="text-2xl font-bold mb-4">Help & Support</h1>
      <p className="text-[var(--text-secondary)] mb-6">
        Need help? Browse our documentation or contact our support team.
      </p>
      <Link href="/dashboard" className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700">
        <ArrowLeft className="w-4 h-4" /> Back to Dashboard
      </Link>
    </div>
  );
}
