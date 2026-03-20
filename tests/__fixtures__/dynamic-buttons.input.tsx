import React from 'react';
import Joyride from 'react-joyride';

export default function App({ hideBack, showSkip }: { hideBack: boolean; showSkip: boolean }) {
  return <Joyride steps={[]} hideBackButton={hideBack} showSkipButton={showSkip} />;
}
