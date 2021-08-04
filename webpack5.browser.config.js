const webpack = require("webpack");
const path = require("path");

module.exports = [
  {
    // https://webpack.js.org/configuration/mode/
    mode: "production",
    entry: "./src/cjs/entry.js",
    output: {
      path: path.resolve(__dirname, "./dist"),
      filename: "plotboilerplate.browser.min.js"
    },
    resolve: {
      symlinks: true
    },
    devtool: "source-map",
    optimization: {
      minimize: true
    }
  },
  {
    mode: "development",
    entry: "./src/cjs/entry.js",
    output: {
      path: path.resolve(__dirname, "./dist"),
      filename: "plotboilerplate.js"
    },
    resolve: {
      symlinks: true
    },
    optimization: {
      minimize: false
    }
  }
];
