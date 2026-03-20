import React from 'react';
import { Joyride } from 'react-joyride';

export function StaticTrue() {
  return (
    // TODO: [react-joyride v3] 'spotlightClicks' was removed (v3 default: blockTargetInteraction is false).
    <Joyride steps={[]} run={true} />
  );
}

export function StaticFalse() {
  return (
    <Joyride
      steps={[]}
      options={{
        blockTargetInteraction: true
      }}
      run={true} />
  );
}

export function Dynamic({ enabled }: { enabled: boolean }) {
  return (
    <Joyride
      steps={[]}
      options={{
        blockTargetInteraction: enabled ? false : true
      }}
      run={true} />
  );
}
