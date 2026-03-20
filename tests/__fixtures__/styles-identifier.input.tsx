import React from 'react';
import Joyride from 'react-joyride';

const myStyles = {
  options: { primaryColor: '#e91e63' },
  tooltip: { borderRadius: 8 },
  buttonNext: { backgroundColor: 'blue' },
  spotlight: { borderRadius: 4 },
};

export default function App() {
  return <Joyride steps={[]} styles={myStyles} />;
}
