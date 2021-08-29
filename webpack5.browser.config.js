const webpack = require("webpack");
const path = require("path");

module.exports = [
  {
    // https://webpack.js.org/configuration/mode/
    mode: "production",
    entry: "./src/cjs/entry.js",
    // entry: "./src/esm/index.js",
    output: {
      path: path.resolve(__dirname, "./dist"),
      filename: "ngdg.browser.min.js"
    },
    resolve: {
      extensions: [".ts", ".js", ".json"],
      modules: ["node_modules"],
      symlinks: true,
      alias: {
        // three$: path.resolve(__dirname, "node_modules/@types/three/index.d.ts")
      }
    },
    resolveLoader: {
      modules: ["node_modules"],
      extensions: [".js", ".json"],
      mainFields: ["loader", "main"]
    },
    devtool: "source-map",
    optimization: {
      minimize: true
    },
    module: {
      rules: [
        {
          test: /.ts/,
          loader: "awesome-typescript-loader",
          exclude: /node_modules/
        }
      ]
    }
  },
  {
    mode: "development",
    entry: "./src/cjs/entry.js",
    // entry: "./src/esm/index.js",
    output: {
      path: path.resolve(__dirname, "./dist"),
      filename: "ngdg.js"
    },
    resolve: {
      extensions: [".ts", ".js", ".json"],
      modules: ["node_modules"],
      symlinks: true,
      alias: {
        // three$: path.resolve(__dirname, "node_modules/@types/three/index.d.ts")
      }
    },
    resolveLoader: {
      modules: ["node_modules"],
      extensions: [".js", ".json"],
      mainFields: ["loader", "main"]
    },
    optimization: {
      minimize: false
    },
    module: {
      rules: [
        {
          test: /.ts/,
          loader: "awesome-typescript-loader",
          exclude: /node_modules/
        }
      ]
    }
  }
];
