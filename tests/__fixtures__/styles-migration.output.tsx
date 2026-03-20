import React from 'react';
import { Joyride } from 'react-joyride';

export function WithStylesOptions() {
  return (
    <Joyride
      steps={[]}
      styles={{
        tooltip: { borderRadius: 8 },
        buttonPrimary: { backgroundColor: 'blue' }
      }}
      options={{
        primaryColor: '#e91e63',
        textColor: '#333'
      }}
      run={true} />
  );
}

export function WithRemovedStyles() {
  return (
    // TODO: [react-joyride v3] Removed styles (spotlight/overlay legacy) are no longer supported. SVG overlay replaces CSS spotlight.
    <Joyride
      steps={[]}
      styles={{
        tooltip: { padding: 10 }
      }}
      run={true} />
  );
}

export function StylesOnlyOptions() {
  return (
    <Joyride
      steps={[]}
      options={{
        overlayColor: 'rgba(0, 0, 0, 0.5)'
      }}
      run={true} />
  );
}
