import React from 'react';
import Joyride from 'react-joyride';

function CustomTooltip(props: any) {
  return <div>{props.step.content}</div>;
}

export default function App() {
  return <Joyride steps={[]} tooltipComponent={CustomTooltip} />;
}
