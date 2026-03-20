import React from 'react';
import { Joyride } from 'react-joyride';

export default function App() {
  return (
    <div>
      <Joyride
        steps={[]}
        onEvent={() => {}}
        options={{
          showProgress: true
        }}
        run={true} />
      <Joyride
        steps={[]}
        onEvent={() => {}}
        options={{
          buttons: ['close', 'primary']
        }}
        run={true} />
    </div>
  );
}
