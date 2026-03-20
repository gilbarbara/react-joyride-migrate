import React from 'react';
import { Joyride } from 'react-joyride';

const myStyles = {
  tooltip: { borderRadius: 8 },
  buttonPrimary: { backgroundColor: 'blue' }
};

export default function App() {
  return (
    // TODO: [react-joyride v3] Removed styles (spotlight/overlay legacy) are no longer supported. SVG overlay replaces CSS spotlight.
    <Joyride
      steps={[]}
      styles={myStyles}
      options={{
        primaryColor: '#e91e63'
      }}
      run={true} />
  );
}
