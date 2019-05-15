import builtins from "builtin-modules";
import json from "rollup-plugin-json";
import cleanup from 'rollup-plugin-cleanup';
import executable from 'rollup-plugin-executable';
import commonjs from 'rollup-plugin-commonjs';
import resolve from 'rollup-plugin-node-resolve';
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
