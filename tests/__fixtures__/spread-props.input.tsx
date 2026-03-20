import React from 'react';
import Joyride from 'react-joyride';

const config = {
  continuous: true,
  showProgress: true,
};

export default function App() {
  return <Joyride steps={[]} {...config} callback={() => {}} />;
}
