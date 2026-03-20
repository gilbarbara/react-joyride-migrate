import React from 'react';
import Joyride, { Step } from 'react-joyride';

const steps: Step[] = [
  {
    target: '.step-1',
    content: 'Hello',
    disableBeacon: true,
    event: 'hover',
    placementBeacon: 'top',
  },
  {
    target: '.step-2',
    content: 'World',
    disableOverlay: true,
    disableScrolling: true,
  },
];

export default function App() {
  return <Joyride steps={steps} />;
}
