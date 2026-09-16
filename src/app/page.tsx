import { redirect } from 'next/navigation';

export default function RootPage() {
  // Root redirects to landing
  redirect('/home');
}
