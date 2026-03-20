import React from 'react';
import { Joyride } from 'react-joyride';

const config = {
  continuous: true,
  showProgress: true,
};

export default function App() {
  return (
    // TODO: [react-joyride v3] Verify spread props are v3-compatible. Check for: overlayClickAction, blockTargetInteraction, floatingOptions, buttons, dismissKeyAction.
    <Joyride steps={[]} {...config} onEvent={() => {}} run={true} />
  );
}
