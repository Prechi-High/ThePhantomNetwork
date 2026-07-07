'use client';

import { LayoutEditorShell } from '@/components/gameplay/LayoutEditorShell';
import { useRouter } from 'next/navigation';

export default function EditLayoutPage() {
  const router = useRouter();

  return (
    <LayoutEditorShell
      layoutType="private"
      onSaved={() => {
        // Return to profile after successful save
        router.push('/profile?tab=overview');
      }}
    />
  );
}
