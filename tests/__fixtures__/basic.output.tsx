import React from 'react';
import { Joyride } from 'react-joyride';

const steps = [
  {
    target: '.my-first-step',
    content: 'This is my first step!',
  },
];

export default function App() {
  return (
    <div>
      <Joyride steps={steps} run={true} continuous />
    </div>
  );
}
