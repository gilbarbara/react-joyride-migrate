import React from 'react';
import { Joyride, Step } from 'react-joyride';

const steps: Step[] = [
  {
    target: '.step-1',
    content: 'Hello',
    locale: {
      next: 'Continue',
      nextWithProgress: 'Step {current} of {total}',
    },
  },
];

export default function App() {
  return <Joyride steps={steps} run={true} />;
}
