# react-joyride-migrate

jscodeshift codemod that automates react-joyride v2 -> v3 migration.

## Source of truth

The v3 API is defined in https://github.com/gilbarbara/react-joyride/tree/main/src/types and the official migration guide at https://react-joyride.com/docs/migration.

## Commands

```bash
pnpm test          # vitest — 26 fixture-based tests
pnpm build         # tsdown — builds CLI + transform

# Run the codemod
node dist/cli.cjs v3 <path> --dry --print   # dry run
node dist/cli.cjs v3 <path>                  # apply in place
```

## Structure

```
src/cli.ts              # CLI entry (thin wrapper around jscodeshift Runner)
transforms/v3.ts        # The codemod transform (all logic here)
tests/v3.spec.ts        # Test runner (reads fixture pairs, applies transform, compares)
tests/__fixtures__/     # *.input.tsx / *.output.tsx pairs
```

## Transform architecture

`transforms/v3.ts` runs these phases in order:

1. **migrateImport** — default export -> named export (`import { Joyride }`)
2. **migrateTypeImports** — rename types (`CallBackProps` -> `EventData`, etc.)
3. **migrateRemovedConstants** — TODO for `LIFECYCLE.ERROR`, `STATUS.ERROR`
4. **migrateCreateElementCalls** — detect `React.createElement(Joyride, ...)` + TODO
5. **migrateProps** (per `<Joyride>` element) — the main phase:
   - Prop renames (`callback` -> `onEvent`)
   - Options collection (props -> `options={{ ... }}` with renames)
   - Button visibility -> `buttons` array
   - Value inversions (`disableOverlayClose` -> `overlayClickAction`)
   - Styles extraction (`styles.options` -> `options` prop)
   - Locale migration (`nextLabelWithProgress` -> `nextWithProgress`)
   - `run={true}` insertion when missing
   - `getHelpers` commented out with TODO
6. **migrateStepArrays** — same transforms on step objects (traces variable references)

Variable tracing: for `steps`, `locale`, and `styles` props passed as identifiers, the codemod finds the variable declaration and transforms the object in place.

## Testing pattern

Each test is a fixture pair: `name.input.tsx` + `name.output.tsx`. The test applies the transform to input and asserts exact match with output.

To regenerate fixtures after transform changes:
```bash
npx tsx -e "
import { applyTransform } from 'jscodeshift/src/testUtils';
import transform from './transforms/v3';
import { readFileSync, writeFileSync } from 'fs';
import { resolve } from 'path';
const dir = resolve('tests/__fixtures__');
const name = 'FIXTURE_NAME';
const input = readFileSync(resolve(dir, name + '.input.tsx'), 'utf8').trimEnd();
const result = applyTransform({ default: transform, parser: 'tsx' }, {}, { source: input, path: name + '.input.tsx' });
writeFileSync(resolve(dir, name + '.output.tsx'), (result || input).trimEnd() + '\n');
"
```

## Known limitations

- **Spread props** (`<Joyride {...config} />`): can't trace object, adds TODO
- **`.map()` step arrays**: only static array literals and variable references are traced
- **`React.createElement`**: detected + TODO, not transformed
- **Dynamic button props** (`hideBackButton={condition}`): can't compose into `buttons` array, adds TODO
- **JSX child comments**: when `<Joyride>` is inside another JSX element, TODOs use `{/* */}` block syntax (recast limitation causes `}{` formatting)
