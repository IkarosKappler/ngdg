const webpack = require("webpack");
const path = require("path");

module.exports = [
  {
    // https://webpack.js.org/configuration/mode/
    mode: "development",
    entry: "./src/cjs/entry.js",
    output: {
      path: path.resolve(__dirname, "./dist"),
      filename: "plotboilerplate.js"
    },
    devtool: "source-map",
    optimization: {
      minimize: false
    }
  },
  {
    // https://webpack.js.org/configuration/mode/
    mode: "development",
    entry: "./src/cjs/entry-glsupport.js",
    output: {
      path: path.resolve(__dirname, "./dist"),
      filename: "plotboilerplate-glsupport.js"
    },
    devtool: "source-map",
    optimization: {
      minimize: false
    }
  }
];
