import React from 'react';
import Joyride, { Callback, CallBackProps, StoreHelpers, FloaterProps, StylesWithFloaterStyles, Step } from 'react-joyride';

type MyCallback = Callback;
type MyProps = CallBackProps;
type MyHelpers = StoreHelpers;
type MyStyles = StylesWithFloaterStyles;

export default function App() {
  return <Joyride steps={[]} />;
}
