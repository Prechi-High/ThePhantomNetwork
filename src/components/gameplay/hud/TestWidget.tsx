/**
 * TestWidget - Demo component for HUD Studio
 * 
 * This is a simple test component to demonstrate HUD Studio functionality.
 * Shows how to register components and make them editable.
 * 
 * DELETE THIS FILE once you've verified HUD Studio works!
 */

'use client';

import { useEffect } from 'react';
import { 
  EditableComponent, 
  componentRegistry, 
  useStudioStore 
} from '@/components/gameplay/hud-studio';

/**
 * TestWidget component - A simple demo widget for testing HUD Studio
 */
function TestWidgetContent() {
  return (
    <div style={{
      width: '100%',
      height: '100%',
      background: 'linear-gradient(135deg, rgba(168, 85, 247, 0.4) 0%, rgba(147, 51, 234, 0.4) 100%)',
      border: '2px solid #a855f7',
      borderRadius: '16px',
      boxShadow: '0 10px 40px rgba(168, 85, 247, 0.3)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '8px',
      color: 'white',
      fontFamily: 'system-ui, -apple-system, sans-serif',
      padding: '20px',
      backdropFilter: 'blur(10px)',
    }}>
      <div style={{
        fontSize: '32px',
        marginBottom: '4px',
      }}>
        🎨
      </div>
      <div style={{
        fontSize: '18px',
        fontWeight: '700',
        letterSpacing: '0.5px',
      }}>
        Test Widget
      </div>
      <div style={{
        fontSize: '12px',
        opacity: 0.8,
        textAlign: 'center',
        lineHeight: '1.5',
      }}>
        Click to select • Drag to move • Resize with handles
      </div>
      <div style={{
        fontSize: '11px',
        opacity: 0.6,
        marginTop: '8px',
        padding: '6px 12px',
        background: 'rgba(0, 0, 0, 0.3)',
        borderRadius: '8px',
      }}>
        Edit properties with Property Inspector →
      </div>
    </div>
  );
}

/**
 * TestWidget - Wrapped with EditableComponent for HUD Studio
 * 
 * This component demonstrates:
 * - Component registration
 * - EditableComponent wrapper
 * - Initial state setup
 * - Visual feedback
 */
export function TestWidget() {
  const addComponent = useStudioStore(state => state.addComponent);
  const components = useStudioStore(state => state.components);

  // Register and initialize component (dev only)
  useEffect(() => {
    if (process.env.NODE_ENV !== 'development') return;

    // 1. Register with Component Registry
    componentRegistry.register({
      id: 'test-widget',
      displayName: 'Test Widget',
      category: 'developer',
      component: TestWidget,
      defaultProps: {},
      editableProps: [
        {
          key: 'message',
          label: 'Message',
          type: 'string',
          defaultValue: 'Hello!',
        },
      ],
      constraints: {
        minWidth: 0.15,
        minHeight: 0.1,
      },
      icon: '🎨',
    });

    // 2. Add initial instance to store (only if not already added)
    if (!components['test-widget-1']) {
      addComponent({
        id: 'test-widget-1',
        componentId: 'test-widget',
        position: { x: 0.35, y: 0.35 }, // Centered-ish
        size: { width: 0.3, height: 0.3 }, // 30% of canvas
        zIndex: 100, // High z-index to appear on top
        visible: true,
        locked: false,
        opacity: 1,
        props: {},
        styleOverrides: {},
      });
    }
  }, [addComponent, components]);

  // Only render in development
  if (process.env.NODE_ENV !== 'development') {
    return null;
  }

  return (
    <EditableComponent instanceId="test-widget-1">
      <TestWidgetContent />
    </EditableComponent>
  );
}
