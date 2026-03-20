import React from 'react';
import { Joyride, Step } from 'react-joyride';

const steps: Step[] = [
  {
    target: '.step-1',
    content: 'Step 1',

    // TODO: [react-joyride v3] 'floaterProps' renamed to 'floatingOptions' with a different API (@floating-ui instead of react-floater). Review and update the options.
    floatingOptions: { disableAnimation: true },

    // TODO: [react-joyride v3] 'disableScrollParentFix' was removed with no replacement.
    // TODO: [react-joyride v3] 'spotlightClicks' was removed (v3 default: blockTargetInteraction is false).
    overlayClickAction: false
  },
  {
    target: '.step-2',
    content: 'Step 2',
    blockTargetInteraction: true
  },
];

export default function App() {
  return <Joyride steps={steps} run={true} />;
}
