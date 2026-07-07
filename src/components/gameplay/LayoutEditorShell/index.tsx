'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useLayoutEditor } from '@/lib/hooks/useLayoutEditor';
import { useNotifications } from '@/components/ui/NotificationProvider';
import { EditorHeader } from './EditorHeader';
import { SavePrivateLayoutModal } from './SavePrivateLayoutModal';
import { PublishGlobalLayoutModal } from './PublishGlobalLayoutModal';
import { Skeleton } from '@/components/ui/Skeleton';
import type { LayoutConfig } from '@/lib/types/layout';

/**
 * LayoutEditorShell Component
 * Wraps the existing HUD Studio editor with save/publish workflows
 * Manages the full-screen editor mode and modal dialogs
 */

interface LayoutEditorShellProps {
  layoutType: 'private' | 'global';
  initialLayout?: LayoutConfig;
  onSaved?: () => void;
}

export function LayoutEditorShell({
  layoutType,
  initialLayout,
  onSaved,
}: LayoutEditorShellProps) {
  const router = useRouter();
  const { notify } = useNotifications();
  const { loadLayout, savePrivateLayout, publishGlobalLayout, loading } =
    useLayoutEditor();

  const [isLoading, setIsLoading] = useState(true);
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const editorRef = useRef<HTMLDivElement>(null);

  /**
   * Load layout data on mount
   */
  useEffect(() => {
    async function init() {
      try {
        setIsLoading(true);
        await loadLayout(layoutType);
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : 'Failed to load layout';
        notify(errorMessage, 'error');
      } finally {
        setIsLoading(false);
      }
    }

    init();
  }, [layoutType]);

  /**
   * Handle save button click - open appropriate modal
   */
  const handleSave = () => {
    setShowSaveModal(true);
  };

  /**
   * Handle private layout save confirmation
   */
  const handleSavePrivate = async () => {
    if (!editorRef.current) {
      notify('Editor not found', 'error');
      return;
    }

    // Get layout data from editor
    // In real implementation, this would be retrieved from HUD Studio context
    const layoutData: LayoutConfig = {
      components: {},
      version: '1.0.0',
      metadata: {
        createdAt: new Date().toISOString(),
      },
    };

    try {
      setIsSaving(true);

      await savePrivateLayout(layoutData);

      notify('Private layout saved successfully', 'success');
      setShowSaveModal(false);

      // Return to settings page
      setTimeout(() => {
        onSaved?.();
        router.push('/profile?tab=overview');
      }, 500);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Failed to save layout';
      notify(errorMessage, 'error');
    } finally {
      setIsSaving(false);
    }
  };

  /**
   * Handle global layout publish confirmation
   */
  const handlePublishGlobal = async (changeNotes: string) => {
    if (!editorRef.current) {
      notify('Editor not found', 'error');
      return;
    }

    // Get layout data from editor
    const layoutData: LayoutConfig = {
      components: {},
      version: '1.0.0',
      metadata: {
        createdAt: new Date().toISOString(),
      },
    };

    try {
      setIsSaving(true);

      const result = await publishGlobalLayout(layoutData, changeNotes);

      notify(
        `Global layout published as v${result.version}`,
        'success'
      );
      setShowSaveModal(false);

      // Return to settings page
      setTimeout(() => {
        onSaved?.();
        router.push('/profile?tab=overview');
      }, 500);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Failed to publish layout';
      notify(errorMessage, 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const title =
    layoutType === 'private'
      ? 'Edit Gameplay Layout'
      : 'Edit Global Layout';

  if (isLoading || loading) {
    return (
      <div className="flex flex-col h-screen bg-phantom-background">
        <EditorHeader
          title={title}
          onSave={() => {}}
          isSaving={true}
        />
        <div className="flex-1 flex flex-col gap-4 p-4 overflow-hidden">
          <Skeleton className="h-full" />
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-phantom-background overflow-hidden">
      {/* Editor Header */}
      <EditorHeader
        title={title}
        onSave={handleSave}
        isSaving={isSaving}
      />

      {/* Editor Container - Full Screen */}
      <div
        ref={editorRef}
        className="flex-1 overflow-hidden bg-phantom-background"
      >
        {/* 
          HUD Studio Editor would be mounted here
          The editor component receives layout data via props/context
          and emits layout changes back to parent through callbacks
          
          Example (commented for reference):
          <HUDStudioProvider initialLayout={layout}>
            <HUDStudio onLayoutChange={handleLayoutChange} />
          </HUDStudioProvider>
        */}

        <div className="w-full h-full flex items-center justify-center text-phantom-muted">
          <div className="text-center space-y-4">
            <div className="text-6xl">🎨</div>
            <p className="text-lg">HUD Studio Editor</p>
            <p className="text-sm text-phantom-muted">
              Ready for integration with HUD Studio component
            </p>
          </div>
        </div>
      </div>

      {/* Save Modal - Private Layout */}
      {layoutType === 'private' && (
        <SavePrivateLayoutModal
          open={showSaveModal}
          onConfirm={handleSavePrivate}
          onCancel={() => setShowSaveModal(false)}
        />
      )}

      {/* Publish Modal - Global Layout */}
      {layoutType === 'global' && (
        <PublishGlobalLayoutModal
          open={showSaveModal}
          onConfirm={handlePublishGlobal}
          onCancel={() => setShowSaveModal(false)}
        />
      )}
    </div>
  );
}
