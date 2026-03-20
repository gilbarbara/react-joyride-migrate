import { resolve } from 'node:path';

import { run as jscodeshift } from 'jscodeshift/src/Runner';

const TRANSFORMS: Record<string, string> = {
  v3: resolve(__dirname, '..', 'transforms', 'dist', 'v3.cjs'),
};

async function main() {
  const arguments_ = process.argv.slice(2);

  if (arguments_.length === 0 || arguments_.includes('--help') || arguments_.includes('-h')) {
    printUsage();
    process.exit(0);
  }

  const subcommand = arguments_[0];

  if (!TRANSFORMS[subcommand]) {
    console.error(`Unknown subcommand: ${subcommand}`);
    console.error(`Available: ${Object.keys(TRANSFORMS).join(', ')}`);
    process.exit(1);
  }

  const paths = arguments_.filter((a, index) => index > 0 && !a.startsWith('--'));

  if (paths.length === 0) {
    console.error('Error: No paths specified.');
    printUsage();
    process.exit(1);
  }

  const dry = arguments_.includes('--dry');
  const print = arguments_.includes('--print');
  const useHook = arguments_.includes('--use-hook');

  const transformPath = TRANSFORMS[subcommand];

  const result = await jscodeshift(transformPath, paths, {
    dry,
    print,
    parser: 'tsx',
    extensions: 'tsx,ts,jsx,js',
    useHook,
  });

  if (result?.error > 0) {
    process.exit(1);
  }
}

function printUsage() {
  console.log(
    `
Usage: react-joyride-migrate <version> <paths...> [options]

Commands:
  v3    Migrate from react-joyride v2 to v3

Options:
  --dry         Dry run (no file writes)
  --print       Print transformed files to stdout
  --use-hook    Migrate to useJoyride() hook (experimental)
  --help, -h    Show this help message

Examples:
  npx react-joyride-migrate v3 src/
  npx react-joyride-migrate v3 src/ --dry
  npx react-joyride-migrate v3 src/ --use-hook
`.trim(),
  );
}

main().catch(error => {
  console.error(error);
  process.exit(1);
});
