import typescript from "rollup-plugin-typescript2";
import commonjs from "rollup-plugin-commonjs";
import external from "rollup-plugin-peer-deps-external";
import resolve from "rollup-plugin-node-resolve";
import {terser} from 'rollup-plugin-terser';

const moduleName = "ngdg";

export default {
    input: "src/esm/index.js",
    output: [
	{
	    file: "dist/index.esm.min.js",
		format: "cjs",
	    // format: "es",
	    // exports: "named",
	    name: moduleName,
	    sourcemap: true,
	    plugins: [terser()]
	},
	{
	    file: "dist/index.esm.js",
	    format: "es",
	    name: moduleName,
	    // exports: "named",
	    sourcemap: true
	}
    ],
    plugins: [
	external(),
	resolve(),
	typescript({
	    rollupCommonJSResolveHack: true,
	    exclude: "**/__tests__/**",
	    clean: true
	}),
	commonjs({
	    include: ["node_modules/**"]
	})
    ]
};
