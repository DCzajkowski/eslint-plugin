import typescript from '@rollup/plugin-typescript';
import terser from '@rollup/plugin-terser';
import { nodeResolve } from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';

/** @type {import('rollup').MergedRollupOptions} */
export default {
  input: 'src/index.ts',
  output: [
    {
      dir: 'dist',
      format: 'esm',
      entryFileNames: '[name].mjs',
    },
    {
      dir: 'dist',
      format: 'cjs',
      entryFileNames: '[name].cjs',
    },
  ],
  external: ['@typescript-eslint/utils', 'lodash'],
  plugins: [
    typescript({
      declaration: true,
      outDir: 'dist/types',
      include: ['src/**/*.ts'],
    }),
    terser({
      format: {
        comments: 'all',
        beautify: true,
        ecma: 2020,
      },
      compress: false,
      mangle: false,
      module: true,
    }),
    nodeResolve(),
    commonjs(),
  ],
};
