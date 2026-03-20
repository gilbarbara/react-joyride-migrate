import React from 'react';
// TODO: [react-joyride v3] 'FloaterProps' type was removed. Use FloatingOptions instead.
import { Joyride, EventHandler, EventData, Controls, FloatingOptions, Styles, Step } from 'react-joyride';

type MyCallback = EventHandler;
type MyProps = EventData;
type MyHelpers = Controls;
type MyStyles = Styles;

export default function App() {
  return <Joyride steps={[]} run={true} />;
}
