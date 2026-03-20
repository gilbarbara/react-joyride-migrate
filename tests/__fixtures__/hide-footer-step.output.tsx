import React from 'react';
import { Joyride, Step } from 'react-joyride';

const steps: Step[] = [
  {
    target: '.step-1',
    content: 'No footer',
    buttons: []
  },
  {
    target: '.step-2',
    content: 'Combined',
    buttons: []
  },
  {
    target: '.step-3',
    content: 'Just skip',
    buttons: ['back', 'close', 'primary', 'skip']
  },
];

export default function App() {
  return <Joyride steps={steps} run={true} />;
}
