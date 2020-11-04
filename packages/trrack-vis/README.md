# trrack-vis Library

This library is intended to be used with trrack, a provenance tracking library, which can be found [here](https://github.com/visdesignlab/trrack). Trrack-vis can be used to visualize the non-linear provenance graph, as well as change nodes within the graph. Trrack-vis is designed to be highly customizable, allowing for the size and position of the graph to be customized, custom icons to be used in the graph, custom ways to visualize annotations, and the grouping of nodes.

Here are multiple [examples](https://github.com/visdesignlab/trrack-examples) using trrack and trrack-vis.

For documentation, see http://vdl.sci.utah.edu/trrack-examples/api/trrack-vis


## Installation

- NPM

```bash
npm install --save-dev @visdesignlab/trrack-vis
```

- Yarn

```bash
yarn add @visdesignlab/trrack-vis
```

```html
<!-- Trrack Vis -->
<script src="//cdn.jsdelivr.net/combine/npm/react@17/umd/react.production.min.js,npm/react-dom@17/umd/react-dom.production.min.js,npm/react-move@6/dist/react-move.min.js,npm/typestyle@2/umd/typestyle.min.js,npm/semantic-ui-react@2/dist/umd/semantic-ui-react.min.js,npm/d3@6.2.0/dist/d3.min.js,npm/@visdesignlab/trrack-vis/dist/trrackvis.umd.development.min.js"></script>
```
