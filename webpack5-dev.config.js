const webpack = require("webpack");
const path = require("path");

module.exports = [
  {
    // https://webpack.js.org/configuration/mode/
    mode: "development",
    entry: "./src/cjs/entry.js",
    // entry: "./src/esm/index.js",
    output: {
      path: path.resolve(__dirname, "./dist"),
      filename: "plotboilerplate.js"
    },
    devtool: "source-map",
    optimization: {
      minimize: false
    },
    resolve: {
      extensions: ['.ts', '.js', '.json', '.d.ts'],
      modules: ['node_modules'],
      symlinks: true,
      alias: {
        three$: path.resolve(__dirname, 'node_modules/@types/three/index.d.ts'),
      },
    },
    resolveLoader: {
      modules: ['node_modules'],
      extensions: ['.js', '.json'],
      mainFields: ['loader', 'main'],
    },
    module: {
      rules: [
        {
          test: /.ts/,
          loader: 'awesome-typescript-loader',
          exclude: /node_modules/,
        },
      ],
    }
  }
];
