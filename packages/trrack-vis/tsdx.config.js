module.exports = {
  // This function will run for each entry/format/env combination
  rollup(config, options) {
    if (config.output.format === 'umd') {
      config.output.globals['@visdesignlab/trrack'] = 'trrack';
      config.output.globals.d3 = 'd3';
      config.output.globals['react-move'] = 'ReactMove';
      config.output.globals['semantic-ui-react'] = 'semanticUIReact';
    }
    return config; // always return a config.
  },
};
