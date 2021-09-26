const sharedPresets = ["@babel/typescript", "@babel/preset-env"];
const shared = {
  ignore: ["src/**/*.spec.ts", "src/cjs/", "src/js/", "src/esm"],
  presets: sharedPresets
};

module.exports = {
  env: {
    esmUnbundled: shared,
    esmBundled: {
      ...shared,
      presets: [
        [
          "@babel/env",
          {
            targets: "> 0.25%, not dead"
          }
        ],
        ...sharedPresets
      ]
    },
    cjs: {
      ...shared,
      presets: [
        [
          "@babel/env",
          {
            modules: "commonjs"
          }
        ],
        ...sharedPresets
      ]
    }
  }
};
