const webpack = require("webpack");
const path = require("path");

module.exports = [
  {
    // https://webpack.js.org/configuration/mode/
    // mode: "production",
    mode: "development",
    entry: "./src/cjs/entry.js",
    // entry: {
    //   import: "./src/cjs/entry.js"
    //   // dependOn: "shared",
    //   // shared: "three"
    // },
    // entry: "./src/esm/index.js",
    output: {
      path: path.resolve(__dirname, "./dist"),
      // filename: "ngdg.browser.min.js"
      filename: "[name].bundle.browser.min.js"
    },
    resolve: {
      extensions: [".ts", ".js", ".json"],
      modules: ["node_modules"],
      symlinks: true,
      alias: {
        // three$: path.resolve(__dirname, "node_modules/@types/three/index.d.ts")
      }
    },
    // resolveLoader: {
    //   modules: ["node_modules"],
    //   extensions: [".js", ".json"],
    //   mainFields: ["loader", "main"]
    // },
    devtool: "source-map",
    optimization: {
      minimize: true
    },
    module: {
      rules: [
        {
          test: /.ts/,
          loader: "awesome-typescript-loader", // ?configFileName=tsconfig.browser.json",
          exclude: /node_modules/,
          options: { configFileName: "tsconfig.browser.json" }
        }
      ]
      // module: {
      //   loaders: [
      //       {
      //           test: /\.js$/,
      //           exclude: /node_modules/,
      //           loader: 'babel-loader?{ "stage": 0, "optional": ["runtime"] }'
      //       }
      //   ]
      // }
    }
  }
  // ,
  // {
  //   mode: "development",
  //   entry: "./src/cjs/entry.js",
  //   // entry: "./src/esm/index.js",
  //   output: {
  //     path: path.resolve(__dirname, "./dist"),
  //     filename: "ngdg.js"
  //   },
  //   resolve: {
  //     extensions: [".ts", ".js", ".json"],
  //     modules: ["node_modules"],
  //     symlinks: true,
  //     alias: {
  //       // three$: path.resolve(__dirname, "node_modules/@types/three/index.d.ts")
  //     }
  //   },
  //   resolveLoader: {
  //     modules: ["node_modules"],
  //     extensions: [".js", ".json"],
  //     mainFields: ["loader", "main"]
  //   },
  //   optimization: {
  //     minimize: false
  //   },
  //   module: {
  //     rules: [
  //       {
  //         test: /.ts/,
  //         loader: "awesome-typescript-loader",
  //         exclude: /node_modules/
  //       }
  //     ]
  //   }
  // }
];
