import React from 'react';
import Joyride from 'react-joyride';

export default function App() {
  return (
    <div>
      <Joyride
        steps={[]}
        callback={() => {}}
        showProgress
      />
      <Joyride
        steps={[]}
        callback={() => {}}
        hideBackButton
      />
    </div>
  );
}
