import pkg from './package.json';

export default {
  plugins: [],
  external: ['kronos-endpoint', 'loglevel-mixin', 'statetransition-mixin', 'model-attributes', 'registry-mixin'],
  input: pkg.module,

  output: {
    format: 'cjs',
    file: pkg.main
  }
};
