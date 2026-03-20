import React from 'react';
import { Joyride } from 'react-joyride';

export function StaticTrue() {
  return (
    <Joyride
      steps={[]}
      options={{
        overlayClickAction: false
      }}
      run={true} />
  );
}

export function StaticFalse() {
  return <Joyride steps={[]} run={true} />;
}

export function Dynamic({ disabled }: { disabled: boolean }) {
  return (
    <Joyride
      steps={[]}
      options={{
        overlayClickAction: disabled ? false : 'close'
      }}
      run={true} />
  );
}
