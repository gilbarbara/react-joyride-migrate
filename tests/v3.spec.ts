import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { applyTransform } from 'jscodeshift/src/testUtils';
import { describe, expect, it } from 'vitest';

import transform from '../transforms/v3';

const fixturesDir = resolve(__dirname, '__fixtures__');

function readFixture(name: string): string {
  return readFileSync(resolve(fixturesDir, name), 'utf8').trimEnd();
}

function testFixture(name: string) {
  const input = readFixture(`${name}.input.tsx`);
  const expected = readFixture(`${name}.output.tsx`);

  const result = applyTransform(
    { default: transform, parser: 'tsx' },
    {},
    { source: input, path: `${name}.input.tsx` },
  );

  // applyTransform returns '' when the transform returns undefined (no changes)
  const actual = result || input;

  expect(actual.trimEnd()).toBe(expected);
}

describe('v3 codemod', () => {
  it('converts default import to named import', () => {
    testFixture('basic');
  });

  it('converts aliased default import', () => {
    testFixture('default-import');
  });

  it('renames callback to onEvent and CallBackProps to EventData', () => {
    testFixture('callback-rename');
  });

  it('renames type imports', () => {
    testFixture('type-imports');
  });

  it('moves and renames props to options', () => {
    testFixture('step-options-move');
  });

  it('inverts disableOverlayClose to overlayClickAction', () => {
    testFixture('overlay-close');
  });

  it('inverts spotlightClicks to blockTargetInteraction', () => {
    testFixture('spotlight-clicks');
  });

  it('transforms disableCloseOnEsc to dismissKeyAction', () => {
    testFixture('dismiss-key-action');
  });

  it('converts button visibility props to buttons array', () => {
    testFixture('buttons-array');
  });

  it('removes getHelpers and adds TODO', () => {
    testFixture('get-helpers');
  });

  it('handles spread props with TODO', () => {
    testFixture('spread-props');
  });

  it('handles tooltipComponent with TODO', () => {
    testFixture('tooltip-component');
  });

  it('migrates step array object props', () => {
    testFixture('step-array-props');
  });

  it('renames step fields (event, placementBeacon, disableBeacon)', () => {
    testFixture('step-field-renames');
  });

  it('migrates styles object', () => {
    testFixture('styles-migration');
  });

  it('migrates locale properties', () => {
    testFixture('locale-migration');
  });

  it('detects removed constants (LIFECYCLE.ERROR, STATUS.ERROR)', () => {
    testFixture('removed-constants');
  });

  it('handles conditional rendering', () => {
    testFixture('conditional-rendering');
  });

  it('handles multiple instances', () => {
    testFixture('multiple-instances');
  });

  it('handles combined migrations', () => {
    testFixture('combined');
  });

  it('converts hideFooter to empty buttons array in step objects', () => {
    testFixture('hide-footer-step');
  });

  it('adds TODO for styles as variable reference', () => {
    testFixture('styles-identifier');
  });

  it('adds TODO for dynamic button visibility props', () => {
    testFixture('dynamic-buttons');
  });

  it('merges into existing options prop', () => {
    testFixture('options-merge');
  });

  it('migrates locale in step objects', () => {
    testFixture('step-locale');
  });

  it('uses JSX block comments when Joyride is a JSX child', () => {
    testFixture('jsx-child-todo');
  });
});
