import React, { useState } from 'react';
import { Joyride, EventData, STATUS } from 'react-joyride';

export default function App() {
  const [run, setRun] = useState(true);

  const handleCallback = (data: EventData) => {
    const { status } = data;

    if (status === STATUS.FINISHED || status === STATUS.SKIPPED) {
      setRun(false);
    }
  };

  return (
    <Joyride
      steps={[{ target: '.step', content: 'Hello' }]}
      onEvent={handleCallback}
      run={run}
      continuous
    />
  );
}
