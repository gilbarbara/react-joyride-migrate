import React from 'react';
import Joyride from 'react-joyride';

export function HideBack() {
  return <Joyride steps={[]} hideBackButton />;
}

export function HideClose() {
  return <Joyride steps={[]} hideCloseButton={true} />;
}

export function ShowSkip() {
  return <Joyride steps={[]} showSkipButton />;
}

export function HideBackShowSkip() {
  return <Joyride steps={[]} hideBackButton showSkipButton />;
}

export function HideAll() {
  return <Joyride steps={[]} hideBackButton hideCloseButton />;
}

export function AllFalse() {
  return <Joyride steps={[]} hideBackButton={false} showSkipButton={false} />;
}
