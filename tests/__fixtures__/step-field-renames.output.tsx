import React from 'react';
import { Joyride, Step } from 'react-joyride';

const steps: Step[] = [
  {
    target: '.step-1',
    content: 'Hello',
    skipBeacon: true,
    beaconTrigger: 'hover',
    beaconPlacement: 'top',
  },
  {
    target: '.step-2',
    content: 'World',
    hideOverlay: true,
    skipScroll: true,
  },
];

export default function App() {
  return <Joyride steps={steps} run={true} />;
}
