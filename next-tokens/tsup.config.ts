/**
 * Copyright 2026-present Suryansh Singh
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 * ------------------------------------------------------------------------------------------------------
 *
 * @path [ROOT]/next-tokens/tsup.config.ts
 * @file tsup.config.ts
 * @description Build configuration for @thedevmystic/next-tokens.
 *
 * @author thedevmystic (Surya)
 * @copyright 2026-present Suryansh Singh Apache-2.0 License
 *
 * SPDX-FileCopyrightText: 2026-present Suryansh Singh
 * SPDX-License-Identifier: Apache-2.0
 */

import { defineConfig, type Options } from 'tsup';

export default defineConfig({
  entry: ['src/index.tsx'],
  format: ['esm', 'cjs'],
  dts: {
    resolve: true,
    compilerOptions: {
      incremental: false,
      composite: false,
    },
  },
  outExtension({ format }) {
    return {
      js: format === 'esm' ? '.mjs' : '.cjs',
    };
  },
  sourcemap: true,
  external: ['react', 'react-dom', 'react/jsx-runtime'],
  clean: true,
  minify: true,
  splitting: false,
  treeshake: true,
  bundle: true,
  outDir: 'dist',

  onSuccess: async () => {
    const { readFileSync, writeFileSync } = await import('fs');
    const directive = '"use client";\n';
    for (const file of ['dist/index.mjs', 'dist/index.cjs']) {
      const content = readFileSync(file, 'utf8');
      if (!content.startsWith('"use client"')) {
        writeFileSync(file, directive + content);
      }
    }
    console.log('Injected "use client" directive');
  },
});
