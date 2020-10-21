module.exports = {
  // This function will run for each entry/format/env combination
  rollup(config, options) {
    if (config.output.format === 'umd') {
      config.output.globals['lz-string'] = 'LZString';
      config.output.globals['deep-diff'] = 'DeepDiff';
    }
    return config; // always return a config.
  },
};
