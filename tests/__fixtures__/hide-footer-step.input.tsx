import React from 'react';
import Joyride, { Step } from 'react-joyride';

const steps: Step[] = [
  {
    target: '.step-1',
    content: 'No footer',
    hideFooter: true,
  },
  {
    target: '.step-2',
    content: 'Combined',
    hideBackButton: true,
    showSkipButton: true,
    hideFooter: true,
  },
  {
    target: '.step-3',
    content: 'Just skip',
    showSkipButton: true,
  },
];

export default function App() {
  return <Joyride steps={steps} />;
}
