'use client';

import { useEffect, useRef } from 'react';
import { doc, setDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { useAuthStore } from '@/stores/auth-store';
import { useResumeStore } from '@/stores/resume-store';

export function useAutoSave() {
  const { user } = useAuthStore();
  const { resumeData, latex, setSaveStatus } = useResumeStore();
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!user) return;
    if (timerRef.current) clearTimeout(timerRef.current);

    timerRef.current = setTimeout(async () => {
      try {
        const userDocRef = doc(db, 'userResumes', user.uid);
        await setDoc(userDocRef, {
          resumeData,
          latex,
          updatedAt: new Date().toISOString(),
        });
        setSaveStatus('Auto-saved');
        setTimeout(() => setSaveStatus(''), 2000);
      } catch {
        // silently fail
      }
    }, 30000);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [resumeData, latex, user, setSaveStatus]);
}
