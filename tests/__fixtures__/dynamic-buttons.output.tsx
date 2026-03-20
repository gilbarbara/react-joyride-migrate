import React from 'react';
import { Joyride } from 'react-joyride';

export default function App({ hideBack, showSkip }: { hideBack: boolean; showSkip: boolean }) {
  return (
    // TODO: [react-joyride v3] Dynamic button visibility prop detected. Manually convert to options.buttons array: ['back', 'close', 'primary', 'skip'].
    <Joyride steps={[]} options={{
      buttons: ['back', 'close', 'primary']
    }} run={true} />
  );
}
