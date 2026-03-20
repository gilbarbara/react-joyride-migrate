import React from 'react';
import Joyride from 'react-joyride';

const customLocale = {
  next: 'Next',
  back: 'Back',
  nextLabelWithProgress: 'Continue ({step} of {steps})',
};

export function WithVariable() {
  return <Joyride steps={[]} locale={customLocale} />;
}

export function WithInline() {
  return (
    <Joyride
      steps={[]}
      locale={{
        next: 'Next',
        back: 'Back',
        nextLabelWithProgress: 'Next ({step} of {steps})',
      }}
    />
  );
}
