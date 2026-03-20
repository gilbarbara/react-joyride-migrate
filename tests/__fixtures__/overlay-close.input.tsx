import React from 'react';
import Joyride from 'react-joyride';

export function StaticTrue() {
  return <Joyride steps={[]} disableOverlayClose />;
}

export function StaticFalse() {
  return <Joyride steps={[]} disableOverlayClose={false} />;
}

export function Dynamic({ disabled }: { disabled: boolean }) {
  return <Joyride steps={[]} disableOverlayClose={disabled} />;
}
