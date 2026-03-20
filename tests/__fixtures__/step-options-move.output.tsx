import React from 'react';
import { Joyride } from 'react-joyride';

export default function App() {
  return (
    <Joyride
      steps={[]}
      options={{
        dismissKeyAction: false,
        hideOverlay: true,
        skipScroll: false,
        showProgress: true,
        spotlightPadding: 10,
        buttons: ['primary', 'skip']
      }}
      run={true} />
  );
}
