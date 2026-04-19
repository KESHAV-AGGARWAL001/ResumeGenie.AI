'use client';

import { useRouter } from 'next/navigation';
import { signInWithPopup } from 'firebase/auth';
import { auth, provider } from '@/lib/firebase/config';

export default function FinalCTA() {
  const router = useRouter();

  const handleSignIn = async () => {
    try {
      await signInWithPopup(auth, provider);
      router.push('/builder');
    } catch (error) {
      console.error('Error signing in:', error);
    }
  };

  return (
    <section className="relative py-24 px-6">
      <div className="max-w-3xl mx-auto text-center">
        <div className="p-12 rounded-[2rem] bg-gradient-to-br from-purple-600 via-violet-600 to-indigo-700 text-white relative overflow-hidden">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2240%22%20height%3D%2240%22%20viewBox%3D%220%200%2040%2040%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Cg%20fill%3D%22%23fff%22%20fill-opacity%3D%220.05%22%3E%3Cpath%20d%3D%22M0%2040L40%200H20L0%2020M40%2040V20L20%2040%22%2F%3E%3C%2Fg%3E%3C%2Fsvg%3E')] opacity-50" />

          <h2 className="relative text-3xl md:text-4xl font-black mb-4">
            Ready to stand out?
          </h2>
          <p className="relative text-purple-100 text-lg mb-8 max-w-md mx-auto">
            Stop tweaking margins in Google Docs. Build a resume that actually
            gets you interviews.
          </p>
          <button
            onClick={handleSignIn}
            className="relative px-10 py-4 text-lg font-bold bg-white text-purple-700 rounded-2xl hover:bg-purple-50 shadow-xl transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl"
          >
            Start Building — It&apos;s Free
          </button>
        </div>
      </div>
    </section>
  );
}
