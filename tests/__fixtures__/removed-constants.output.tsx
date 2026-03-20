import React from 'react';
import { Joyride, LIFECYCLE, STATUS } from 'react-joyride';

export default function App() {
  const handleEvent = (data: any) => {
    // TODO: [react-joyride v3] 'LIFECYCLE.ERROR' was removed. Errors now use the 'error' event type.
    if (data.lifecycle === LIFECYCLE.ERROR) {
      console.log('error');
    }

    // TODO: [react-joyride v3] 'STATUS.ERROR' was removed. Errors now use the 'error' event type.
    if (data.status === STATUS.ERROR) {
      console.log('status error');
    }

    if (data.status === STATUS.FINISHED) {
      console.log('done');
    }
  };

  return <Joyride steps={[]} onEvent={handleEvent} run={true} />;
}
