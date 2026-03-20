import React, { useState, useRef } from 'react';
import { Joyride, EventData, STATUS, Controls, Step } from 'react-joyride';

const steps: Step[] = [
  {
    target: '.step-1',
    content: 'Welcome!',

    // TODO: [react-joyride v3] 'floaterProps' renamed to 'floatingOptions' with a different API (@floating-ui instead of react-floater). Review and update the options.
    floatingOptions: { disableAnimation: true },

    overlayClickAction: false
  },
  {
    target: '.step-2',

    // TODO: [react-joyride v3] 'spotlightClicks' was removed (v3 default: blockTargetInteraction is false).
    content: 'Next step'
  },
];

export default function App() {
  const [run, setRun] = useState(true);
  const helpers = useRef<Controls | null>(null);

  const handleCallback = (data: EventData) => {
    if (data.status === STATUS.FINISHED) {
      setRun(false);
    }
  };

  return (
    // TODO: [react-joyride v3] 'floaterProps' renamed to 'floatingOptions' with a different API (@floating-ui instead of react-floater). Review and update the options.
    // TODO: [react-joyride v3] Custom tooltipComponent: 'tooltipProps.ref' was removed in v3. Update your component.
    // TODO: [react-joyride v3] 'disableScrollParentFix' was removed with no replacement.
    <Joyride
      steps={steps}
      onEvent={handleCallback}
      run={run}
      continuous
      floatingOptions={{ offset: 10 }}
      // TODO: [react-joyride v3] 'getHelpers' was removed. Use the 'controls' returned by useJoyride() instead.
      // getHelpers={(h) => { helpers.current = h; }}
      tooltipComponent={CustomTooltip}
      options={{
        dismissKeyAction: false,
        showProgress: true,
        overlayClickAction: false,
        blockTargetInteraction: true,
        buttons: ['back', 'close', 'primary', 'skip']
      }} />
  );
}

function CustomTooltip(props: any) {
  return <div>{props.step.content}</div>;
}
