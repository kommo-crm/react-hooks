import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['esm', 'cjs'],
  tsconfig: 'tsconfig.build.json',
  dts: true,
  sourcemap: true,
  clean: true,
  minify: false,
  outDir: 'dist',
  banner: {
    js: `/**
 * Copyright (c) QSOFT LLC.
 *
 * This source code is licensed under a custom license based 
 * on MIT license found in the LICENSE file in the root 
 * directory of this source tree.
 */`,
  },
});
