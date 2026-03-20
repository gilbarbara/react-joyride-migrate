import React from 'react';
import Joyride, { Step } from 'react-joyride';

const steps: Step[] = [
  {
    target: '.step-1',
    content: 'Step 1',
    floaterProps: { disableAnimation: true },
    disableOverlayClose: true,
    spotlightClicks: true,
    disableScrollParentFix: true,
  },
  {
    target: '.step-2',
    content: 'Step 2',
    disableOverlayClose: false,
    spotlightClicks: false,
  },
];

export default function App() {
  return <Joyride steps={steps} />;
}
