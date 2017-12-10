import multiEntry from 'rollup-plugin-multi-entry';

export default {
  input: 'tests/**/*-test.js',
  output: {
    file: 'build/bundle-test.js',
    format: 'cjs',
    sourcemap: true
  },
  external: [
    'ava',
    'registry-mixin',
    'kronos-endpoint',
    'loglevel-mixin',
    'statetransition-mixin',
    'model-attributes',
    'kronos-interceptor'
  ],
  plugins: [multiEntry()]
};
