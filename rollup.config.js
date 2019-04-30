import serve from 'rollup-plugin-serve';
import livereload from 'rollup-plugin-livereload';
import {terser} from 'rollup-plugin-terser';
import {eslint} from 'rollup-plugin-eslint';

const watch = process.env.ROLLUP_WATCH;

export default [
  {
    input: 'src/stanford.js',
    output: {
      file: 'dist/chartjs-plugin-stanford-diagram.js',
      format: 'esm',
      sourcemap: false
    },
    plugins: [
      eslint(),
      watch && serve({
        open: true,
        openPage: '/sample/',
        contentBase: ''
      }),
      watch && livereload({
        watch: 'dist/chartjs-plugin-stanford-diagram.js'
      })
    ]
  },
  {
    input: 'src/stanford.js',
    output: {
      file: 'dist/chartjs-plugin-stanford-diagram.min.js',
      format: 'esm',
      sourcemap: true
    },
    plugins: [
      eslint(),
      terser()
    ]
  }
];
