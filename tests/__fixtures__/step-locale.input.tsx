import React from 'react';
import Joyride, { Step } from 'react-joyride';

const steps: Step[] = [
  {
    target: '.step-1',
    content: 'Hello',
    locale: {
      next: 'Continue',
      nextLabelWithProgress: 'Step {step} of {steps}',
    },
  },
];

export default function App() {
  return <Joyride steps={steps} />;
}
