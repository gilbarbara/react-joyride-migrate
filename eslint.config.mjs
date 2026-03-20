import config from '@gilbarbara/eslint-config/base';
import vitest from '@gilbarbara/eslint-config/vitest';

export default [
  ...config,
  ...vitest,
  { ignores: ['node_modules', 'dist'] },
  {
    rules: {
      'no-console': 'off',
    }
  }
];
