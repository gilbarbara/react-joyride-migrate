import React from 'react';
import { Joyride } from 'react-joyride';

const customLocale = {
  next: 'Next',
  back: 'Back',
  nextWithProgress: 'Continue ({current} of {total})',
};

export function WithVariable() {
  return <Joyride steps={[]} locale={customLocale} run={true} />;
}

export function WithInline() {
  return (
    <Joyride
      steps={[]}
      locale={{
        next: 'Next',
        back: 'Back',
        nextWithProgress: 'Next ({current} of {total})',
      }}
      run={true} />
  );
}
