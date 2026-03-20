import React from 'react';
import { Joyride } from 'react-joyride';

export default function App({ showTour }: { showTour: boolean }) {
  return (
    <div>
      {showTour && (
        <Joyride
          steps={[]}
          onEvent={() => {}}
          options={{
            overlayClickAction: false
          }}
          run={true} />
      )}
    </div>
  );
}
