import React from 'react';
import Joyride, { LIFECYCLE, STATUS } from 'react-joyride';

export default function App() {
  const handleEvent = (data: any) => {
    if (data.lifecycle === LIFECYCLE.ERROR) {
      console.log('error');
    }

    if (data.status === STATUS.ERROR) {
      console.log('status error');
    }

    if (data.status === STATUS.FINISHED) {
      console.log('done');
    }
  };

  return <Joyride steps={[]} onEvent={handleEvent} />;
}
