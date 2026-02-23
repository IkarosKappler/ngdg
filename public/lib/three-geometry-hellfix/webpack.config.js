const path = require('path');
const TerserPlugin = require("terser-webpack-plugin");
const { name } = require("./package.json");

module.exports = env => {
  return {
    entry: './src/cjs/entry.js',
    mode: env.development ? "development" : "production",
    output: {
      filename: name + "-[name]" + (env.development ? '' : '.min') + '.js',
      path: path.resolve(__dirname, 'dist'),
    },
    // Add this line to get the ./dist/build.js.map file
    devtool: "source-map",
    optimization: {
      minimize: !env.development,
      minimizer: [
          // extractComment=false to prevent the generation of License.txt
          new TerserPlugin({extractComments: false})
      ],
    },
    resolve: {
      extensions: ['.ts', '.js', '.d.ts'],
    },
    externals: {
      three: 'three'
    }
  }
};
