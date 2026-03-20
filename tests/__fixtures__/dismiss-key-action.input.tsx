import React from 'react';
import Joyride from 'react-joyride';

export function StaticTrue() {
  return <Joyride steps={[]} disableCloseOnEsc />;
}

export function StaticFalse() {
  return <Joyride steps={[]} disableCloseOnEsc={false} />;
}

export function Dynamic({ disabled }: { disabled: boolean }) {
  return <Joyride steps={[]} disableCloseOnEsc={disabled} />;
}
