import React from 'react';
import { Joyride } from 'react-joyride';

function CustomTooltip(props: any) {
  return <div>{props.step.content}</div>;
}

export default function App() {
  return (
    // TODO: [react-joyride v3] Custom tooltipComponent: 'tooltipProps.ref' was removed in v3. Update your component.
    <Joyride steps={[]} tooltipComponent={CustomTooltip} run={true} />
  );
}
