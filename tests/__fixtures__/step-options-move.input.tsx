import React from 'react';
import Joyride from 'react-joyride';

export default function App() {
  return (
    <Joyride
      steps={[]}
      disableCloseOnEsc
      disableOverlay={true}
      disableScrolling={false}
      hideBackButton
      hideCloseButton={true}
      showProgress
      showSkipButton
      spotlightPadding={10}
    />
  );
}
