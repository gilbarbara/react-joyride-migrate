import React, { useRef } from 'react';
import Joyride, { StoreHelpers } from 'react-joyride';

export default function App() {
  const helpers = useRef<StoreHelpers | null>(null);

  return (
    <Joyride
      steps={[]}
      getHelpers={(h) => { helpers.current = h; }}
    />
  );
}
