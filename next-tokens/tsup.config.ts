/* Build configuration */

import { defineConfig } from 'tsup';

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
