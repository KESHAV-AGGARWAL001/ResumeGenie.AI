'use client';

import { useEffect } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase/config';
import { useAuthStore } from '@/stores/auth-store';
import { useResumeStore } from '@/stores/resume-store';
import { apiGet } from '@/lib/api';

export default function AuthProvider({ children }: { children: React.ReactNode }) {
  const { setUser, setSubscription, setLoading } = useAuthStore();
  const { setResumeData, setLatex } = useResumeStore();

  useEffect(() => {
    let cancelled = false;

    const unsubscribe = onAuthStateChanged(auth, async (authUser) => {
      if (cancelled) return;

      setUser(authUser);

      if (authUser) {
        try {
          const subRes = await apiGet('/payments/status');
          if (!cancelled && subRes.ok) {
            const subData = await subRes.json();
            setSubscription(subData.subscription || { tier: 'free', status: 'active' });
          }
        } catch {
          // Default to free
        }

        try {
          const docRef = doc(db, 'userResumes', authUser.uid);
          const docSnap = await getDoc(docRef);
          if (!cancelled && docSnap.exists()) {
            const data = docSnap.data();
            if (data.resumeData) setResumeData(data.resumeData);
            if (data.latex) setLatex(data.latex);
          }
        } catch {
          // Silently fail
        }
      }

      if (!cancelled) setLoading(false);
    });

    return () => {
      cancelled = true;
      unsubscribe();
    };
  }, [setUser, setSubscription, setLoading, setResumeData, setLatex]);

  return <>{children}</>;
}
