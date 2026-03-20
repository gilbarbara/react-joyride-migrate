import React, { useRef } from 'react';
import { Joyride, Controls } from 'react-joyride';

export default function App() {
  const helpers = useRef<Controls | null>(null);

  return (
    <Joyride
      // TODO: [react-joyride v3] 'getHelpers' was removed. Use the 'controls' returned by useJoyride() instead.
      // getHelpers={(h) => { helpers.current = h; }}
      steps={[]}
      run={true}
    />
  );
}
