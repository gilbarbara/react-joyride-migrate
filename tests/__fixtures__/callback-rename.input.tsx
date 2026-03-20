import React, { useState } from 'react';
import Joyride, { CallBackProps, STATUS } from 'react-joyride';

export default function App() {
  const [run, setRun] = useState(true);

  const handleCallback = (data: CallBackProps) => {
    const { status } = data;

    if (status === STATUS.FINISHED || status === STATUS.SKIPPED) {
      setRun(false);
    }
  };

  return (
    <Joyride
      steps={[{ target: '.step', content: 'Hello' }]}
      callback={handleCallback}
      run={run}
      continuous
    />
  );
}
