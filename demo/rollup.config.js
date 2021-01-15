import serve from 'rollup-plugin-serve';
import livereload from 'rollup-plugin-livereload';
import babel from '@rollup/plugin-babel';
import nodeResolve from '@rollup/plugin-node-resolve';

export default [
  {
    input: 'src/index.js',
    output: {
      file: 'dist/bundle.js',
      format: 'esm',
      sourcemap: false
    },
    plugins: [
      nodeResolve(),
      babel({
        babelHelpers: 'bundled',
        babelrc: false,
        exclude: 'node_modules/**',
        presets: [['@babel/preset-env', { modules: false }]]
      }),
      serve({
        open: true,
        openPage: '',
        contentBase: ''
      }),
      livereload({
        watch: ['dist/bundle.js', 'index.html']
      })
    ]
  }
];
