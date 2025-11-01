import { redirect } from 'next/navigation';

export default function HomePage() {
  // Phase 2: Redirect to dashboard instead of upload
  // Mobile app handles data entry now
  redirect('/dashboard');
}

