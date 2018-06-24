import pkg from './package.json';

export default {
  plugins: [],
  external: [
    'events',
    'fast-safe-stringify',
    'kronos-endpoint',
    'loglevel-mixin',
    'statetransition-mixin',
    'model-attributes',
    'registry-mixin'
  ],
  input: pkg.module,

  output: {
    format: 'cjs',
    file: pkg.main,
    interop: false
  }
};
