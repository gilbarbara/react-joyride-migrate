import React from 'react';
import { Joyride } from 'react-joyride';

export function HideBack() {
  return (
    <Joyride
      steps={[]}
      options={{
        buttons: ['close', 'primary']
      }}
      run={true} />
  );
}

export function HideClose() {
  return (
    <Joyride
      steps={[]}
      options={{
        buttons: ['back', 'primary']
      }}
      run={true} />
  );
}

export function ShowSkip() {
  return (
    <Joyride
      steps={[]}
      options={{
        buttons: ['back', 'close', 'primary', 'skip']
      }}
      run={true} />
  );
}

export function HideBackShowSkip() {
  return (
    <Joyride steps={[]} options={{
      buttons: ['close', 'primary', 'skip']
    }} run={true} />
  );
}

export function HideAll() {
  return (
    <Joyride steps={[]} options={{
      buttons: ['primary']
    }} run={true} />
  );
}

export function AllFalse() {
  return <Joyride steps={[]} run={true} />;
}
