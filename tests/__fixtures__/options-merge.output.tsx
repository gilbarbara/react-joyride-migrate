import React from 'react';
import { Joyride } from 'react-joyride';

export default function App() {
  return (
    <Joyride
      steps={[]}
      options={{
        zIndex: 200,
        hideOverlay: true,
        showProgress: true
      }}
      run={true} />
  );
}
