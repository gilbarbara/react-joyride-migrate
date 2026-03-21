# react-joyride-migrate

Codemod to automate [react-joyride](https://github.com/gilbarbara/react-joyride) v2 to v3 migration.

## Usage

```bash
# Dry run (no file writes, prints transformed output)
npx react-joyride-migrate v3 src/ --dry --print

# Apply in place
npx react-joyride-migrate v3 src/

# Single file
npx react-joyride-migrate v3 src/components/Tour.tsx
```

Supports `.tsx`, `.ts`, `.jsx`, and `.js` files.

> See https://react-joyride.com/docs/migration for the complete v2 to v3 migration reference.

## What it does

### Import

Converts default export to named export:

```tsx
// Before
import Joyride from 'react-joyride';

// After
import { Joyride } from 'react-joyride';
```

### Props moved to `options`

| v2 prop | v3 `options` field | Notes |
|---|---|---|
| `disableCloseOnEsc` | `dismissKeyAction` | `true` -> `false`, `false` -> omit |
| `disableOverlay` | `hideOverlay` | Renamed |
| `disableOverlayClose` | `overlayClickAction` | `true` -> `false`, `false` -> omit |
| `disableScrolling` | `skipScroll` | Renamed |
| `disableBeacon` | `skipBeacon` | Renamed |
| `spotlightClicks` | `blockTargetInteraction` | Inverted: `false` -> `true` |
| `showProgress` | `showProgress` | Relocated |
| `spotlightPadding` | `spotlightPadding` | Relocated |
| `offset` | `offset` | Relocated |
| `scrollDuration` | `scrollDuration` | Relocated |
| `scrollOffset` | `scrollOffset` | Relocated |

### Button visibility -> `buttons` array

| v2 prop | Effect |
|---|---|
| `hideBackButton` | Remove `'back'` from default `['back', 'close', 'primary']` |
| `hideCloseButton` | Remove `'close'` |
| `showSkipButton` | Add `'skip'` |
| `hideFooter` | Set to `[]` (step-level) |

### Props renamed

| v2 | v3 |
|---|---|
| `callback` | `onEvent` |
| `floaterProps` | `floatingOptions` (+ TODO: different API) |

### Props removed

| v2 prop | Codemod action |
|---|---|
| `getHelpers` | Commented out + TODO (use `useJoyride()` hook) |
| `disableScrollParentFix` | Removed + TODO |

### Type renames

| v2 | v3 |
|---|---|
| `Callback` | `EventHandler` |
| `CallBackProps` | `EventData` |
| `StoreHelpers` | `Controls` |
| `FloaterProps` | `FloatingOptions` (+ TODO) |
| `StylesWithFloaterStyles` | `Styles` |

### Step field renames

| v2 | v3 |
|---|---|
| `event` | `beaconTrigger` |
| `placementBeacon` | `beaconPlacement` |
| `disableBeacon` | `skipBeacon` |

### Other transforms

- **`run` default**: Adds `run={true}` when missing (v3 defaults to `false`)
- **`styles.options`**: Extracted to `options` prop
- **`styles.buttonNext`**: Renamed to `styles.buttonPrimary`
- **Removed styles**: `spotlight`, `spotlightLegacy`, `overlayLegacy`, `overlayLegacyCenter` stripped + TODO
- **Locale**: `nextLabelWithProgress` -> `nextWithProgress`, `{step}/{steps}` -> `{current}/{total}`
- **Constants**: `LIFECYCLE.ERROR` and `STATUS.ERROR` flagged with TODO
- **Variable tracing**: `steps`, `locale`, and `styles` props passed as variables are traced to their declaration and transformed in place

## Before / After

```tsx
// Before
import Joyride, { CallBackProps, STATUS } from 'react-joyride';

<Joyride
  steps={steps}
  callback={handleCallback}
  disableCloseOnEsc
  disableOverlayClose
  showProgress
  showSkipButton
  hideBackButton
  spotlightClicks={false}
/>

// After
import { Joyride, EventData, STATUS } from 'react-joyride';

<Joyride
  steps={steps}
  onEvent={handleCallback}
  options={{
    dismissKeyAction: false,
    overlayClickAction: false,
    showProgress: true,
    blockTargetInteraction: true,
    buttons: ['close', 'primary', 'skip']
  }}
  run={true}
/>
```

## Known limitations

- **Spread props** (`<Joyride {...config} />`): adds a TODO, can't trace the object
- **Dynamic step arrays** (`.map()`, `.filter()`): only static arrays and variable references are traced
- **`React.createElement(Joyride, ...)`**: detected + TODO, not transformed
- **Dynamic button props** (`hideBackButton={condition}`): can't statically compose into `buttons` array, adds TODO
- **`floaterProps` values**: renamed to `floatingOptions` but the value shape changed (`react-floater` -> `@floating-ui`), requires manual review

## License

MIT
