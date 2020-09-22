import serve from 'rollup-plugin-serve';
import livereload from 'rollup-plugin-livereload';
import { terser } from 'rollup-plugin-terser';
import { eslint } from 'rollup-plugin-eslint';
import babel from '@rollup/plugin-babel';

const watch = process.env.ROLLUP_WATCH;

let builds;

if (watch) {
  builds = [
    {
      input: 'src/stanford.js',
      output: {
        file: 'dist/chartjs-plugin-stanford-diagram.esm.js',
        format: 'esm',
        sourcemap: false
      },
      plugins: [
        eslint(),
        serve({
          open: true,
          openPage: '/sample/',
          contentBase: ''
        }),
        livereload({
          watch: [
            'dist/chartjs-plugin-stanford-diagram.esm.js',
            'sample/**'
          ]
        })
      ]
    }
  ];
} else {
  builds = [
    {
      input: 'src/stanford.js',
      output: {
        file: 'dist/chartjs-plugin-stanford-diagram.esm.js',
        format: 'esm',
        sourcemap: false
      },
      plugins: [
        eslint(),
        babel({
          babelHelpers: 'bundled',
          babelrc: false,
          exclude: 'node_modules/**',
          presets: [
            ['@babel/preset-env', { modules: false }]
          ]
        })
      ]
    },
    {
      input: 'src/stanford.js',
      output: {
        file: 'dist/chartjs-plugin-stanford-diagram.esm.min.js',
        format: 'esm',
        sourcemap: true
      },
      plugins: [
        eslint(),
        babel({
          babelHelpers: 'bundled',
          babelrc: false,
          exclude: 'node_modules/**',
          presets: [
            ['@babel/preset-env', { modules: false }]
          ]
        }),
        terser()
      ]
    },
    {
      input: 'src/stanford.js',
      output: {
        file: 'dist/chartjs-plugin-stanford-diagram.js',
        format: 'umd',
        exports: 'named',
        name: 'stanfordDiagramPlugin',
        esModule: false
      },
      plugins: [
        eslint(),
        babel({
          babelHelpers: 'bundled',
          babelrc: false,
          exclude: 'node_modules/**',
          presets: [
            ['@babel/preset-env', { modules: false }]
          ]
        })
      ]
    },
    {
      input: 'src/stanford.js',
      output: {
        file: 'dist/chartjs-plugin-stanford-diagram.min.js',
        format: 'umd',
        exports: 'named',
        name: 'stanfordDiagramPlugin',
        esModule: false,
        sourcemap: true
      },
      plugins: [
        eslint(),
        babel({
          babelHelpers: 'bundled',
          babelrc: false,
          exclude: 'node_modules/**',
          presets: [
            ['@babel/preset-env', { modules: false }]
          ]
        }),
        terser()
      ]
    }
  ];
}

export default builds;
