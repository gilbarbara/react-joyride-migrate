import React, { useState, useRef } from 'react';
import Joyride, { CallBackProps, STATUS, StoreHelpers, Step } from 'react-joyride';

const steps: Step[] = [
  {
    target: '.step-1',
    content: 'Welcome!',
    floaterProps: { disableAnimation: true },
    disableOverlayClose: true,
  },
  {
    target: '.step-2',
    content: 'Next step',
    spotlightClicks: true,
  },
];

export default function App() {
  const [run, setRun] = useState(true);
  const helpers = useRef<StoreHelpers | null>(null);

  const handleCallback = (data: CallBackProps) => {
    if (data.status === STATUS.FINISHED) {
      setRun(false);
    }
  };

  return (
    <Joyride
      steps={steps}
      callback={handleCallback}
      run={run}
      continuous
      disableCloseOnEsc
      showProgress
      showSkipButton
      disableOverlayClose
      spotlightClicks={false}
      floaterProps={{ offset: 10 }}
      getHelpers={(h) => { helpers.current = h; }}
      tooltipComponent={CustomTooltip}
      disableScrollParentFix
    />
  );
}

function CustomTooltip(props: any) {
  return <div>{props.step.content}</div>;
}
