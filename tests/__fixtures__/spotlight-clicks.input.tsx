import React from 'react';
import Joyride from 'react-joyride';

export function StaticTrue() {
  return <Joyride steps={[]} spotlightClicks />;
}

export function StaticFalse() {
  return <Joyride steps={[]} spotlightClicks={false} />;
}

export function Dynamic({ enabled }: { enabled: boolean }) {
  return <Joyride steps={[]} spotlightClicks={enabled} />;
}
