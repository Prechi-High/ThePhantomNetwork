'use client';

import { useState } from 'react';
import type {
  LayoutConfig,
  PostUserLayoutResponse,
  PostGlobalLayoutResponse,
  DeleteUserLayoutResponse,
} from '@/lib/types/layout';

/**
 * Custom hook for managing layout editor operations
 * Handles loading, saving (private), publishing (global), and resetting layouts
 */
export function useLayoutEditor() {
  const [layout, setLayout] = useState<LayoutConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  /**
   * Load the active layout (private or global)
   * @param layoutType - Either 'private' for user layout or 'global' for the active global layout
   */
  async function loadLayout(layoutType: 'private' | 'global') {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch('/api/layouts/active', {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'same-origin',
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.error || `Failed to load ${layoutType} layout`
        );
      }

      const data = await response.json();
      setLayout(data.layout);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Failed to load layout';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }

  /**
   * Save layout to user's private layout
   * @param layoutData - The layout configuration to save
   * @returns Promise with success status and layout ID
   */
  async function savePrivateLayout(
    layoutData: LayoutConfig
  ): Promise<PostUserLayoutResponse> {
    try {
      setIsSaving(true);
      setError(null);

      const response = await fetch('/api/layouts/user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'same-origin',
        body: JSON.stringify({ layout: layoutData }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.error || 'Failed to save private layout'
        );
      }

      const data: PostUserLayoutResponse = await response.json();
      setLayout(layoutData);
      return data;
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Failed to save private layout';
      setError(errorMessage);
      throw err;
    } finally {
      setIsSaving(false);
    }
  }

  /**
   * Publish layout as the new global layout
   * @param layoutData - The layout configuration to publish
   * @param changeNotes - Optional description of changes made
   * @returns Promise with success status, version number, and layout ID
   */
  async function publishGlobalLayout(
    layoutData: LayoutConfig,
    changeNotes?: string
  ): Promise<PostGlobalLayoutResponse> {
    try {
      setIsSaving(true);

      const response = await fetch('/api/layouts/global', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'same-origin',
        body: JSON.stringify({
          layout: layoutData,
          changeNotes,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.error || 'Failed to publish global layout'
        );
      }

      const data: PostGlobalLayoutResponse = await response.json();
      setLayout(layoutData);
      return data;
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Failed to publish global layout';
      setError(errorMessage);
      throw err;
    } finally {
      setIsSaving(false);
    }
  }

  /**
   * Reset user's private layout (delete custom layout and fall back to global)
   * @returns Promise with success status
   */
  async function resetToGlobal(): Promise<DeleteUserLayoutResponse> {
    try {
      setIsSaving(true);

      const response = await fetch('/api/layouts/user', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'same-origin',
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.error || 'Failed to reset layout to global'
        );
      }

      const data: DeleteUserLayoutResponse = await response.json();
      setLayout(null);
      return data;
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Failed to reset layout';
      setError(errorMessage);
      throw err;
    } finally {
      setIsSaving(false);
    }
  }

  return {
    layout,
    loading,
    error,
    isSaving,
    loadLayout,
    savePrivateLayout,
    publishGlobalLayout,
    resetToGlobal,
  };
}
