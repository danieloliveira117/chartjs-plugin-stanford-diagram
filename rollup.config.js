import resolve from "rollup-plugin-node-resolve";
import commonjs from "rollup-plugin-commonjs";
import { terser } from "rollup-plugin-terser";
import { eslint } from "rollup-plugin-eslint";

// `npm run build` -> `production` is true
// `npm run dev` -> `production` is false
const production = !process.env.ROLLUP_WATCH;

export default {
	input: "src/stanford-diagram.js",
	output: {
		file: production ? "dist/chartjs-plugin-stanford-diagram.min.js" : "dist/chartjs-plugin-stanford-diagram.js",
		format: "es",
		sourcemap: production
	},
	plugins: [
		resolve(),
		commonjs(), // converts date-fns to ES modules
		eslint(),
		production && terser(),
	],
};
