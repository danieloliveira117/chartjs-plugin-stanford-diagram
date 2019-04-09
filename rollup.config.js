import serve from 'rollup-plugin-serve'
import livereload from 'rollup-plugin-livereload'
import { terser } from "rollup-plugin-terser";
import { eslint } from "rollup-plugin-eslint";

const production = !process.env.ROLLUP_WATCH;

export default {
	input: "src/stanford-diagram.js",
	output: {
		file: production ? "dist/chartjs-plugin-stanford-diagram.min.js" : "dist/chartjs-plugin-stanford-diagram.js",
		format: "esm",
		sourcemap: production
	},
	plugins: [
		eslint(),
    !production && serve({
      open: true,
      openPage: '/sample/',
      contentBase: ''
    }),
    !production && livereload({
      watch: 'dist'
    }),
		production && terser()
	],
};
