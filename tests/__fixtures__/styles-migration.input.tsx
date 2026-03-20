import React from 'react';
import Joyride from 'react-joyride';

export function WithStylesOptions() {
  return (
    <Joyride
      steps={[]}
      styles={{
        options: {
          primaryColor: '#e91e63',
          textColor: '#333',
        },
        tooltip: { borderRadius: 8 },
        buttonNext: { backgroundColor: 'blue' },
      }}
    />
  );
}

export function WithRemovedStyles() {
  return (
    <Joyride
      steps={[]}
      styles={{
        spotlight: { borderRadius: 4 },
        spotlightLegacy: { opacity: 0.5 },
        tooltip: { padding: 10 },
      }}
    />
  );
}

export function StylesOnlyOptions() {
  return (
    <Joyride
      steps={[]}
      styles={{
        options: {
          overlayColor: 'rgba(0, 0, 0, 0.5)',
        },
      }}
    />
  );
}
