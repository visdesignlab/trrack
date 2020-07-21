# Trrack Library

A library to create and track provenance in web based apps. Trrack allows you to create and maintain a non linear provenance graph representing the history of the state of your visualization. Through this graph, you can easily implement complete action recovery, as well as store custom metadata and annotations.

Trrack also allows for easy sharing of a visualization's current state through URL sharing. To share entire session history, Trrack allows for the import and exporting of provenance graphs, as well as has built in integration with firebase to store the graphs. 

[![code style: prettier](https://img.shields.io/badge/code_style-prettier-ff69b4.svg?style=flat-square)](https://github.com/prettier/prettier)
[![Build Status](https://travis-ci.com/visdesignlab/provenance-lib-core.svg?branch=master)](https://travis-ci.com/visdesignlab/provenance-lib-core)
[![Coverage Status](https://coveralls.io/repos/github/visdesignlab/provenance-lib-core/badge.svg?branch=master)](https://coveralls.io/github/visdesignlab/provenance-lib-core?branch=master)

For full documentation, see http://vdl.sci.utah.edu/trrack-examples/api/trrack

## Features

- Power you application to track user interactions or changes
- Enable undo/redo functionality
- Track changes in non-linear manner with branches
- Add custom metadata and annotations to each node in the graph
- Built in Firebase support for storing large graphs
- Simple API
- Full Typescript support

## Installation

- NPM

```bash
npm install --save-dev @visdesignlab/trrack
```

- Yarn

```bash
yarn add @visdesignlab/trrack
```

## Usage

```typescript
import { initProvenance, Provenance, ProvenanceGraph } from '@visdesignlab/trrack';

// ************************************************
// Setup all the interfaces and types

enum SortByOptions {
  PETAL_LENGTH = 'PETAL_LENGTH',
  PETAL_WIDTH = 'PETAL_WIDTH',
  SEPAL_LENGTH = 'SEPAL_LENGTH',
  SEPAL_WIDTH = 'SEPAL_WIDTH'
}

enum SortDirection {
  ASCENDING = 'ASCENDING',
  DESCENDING = 'DESCENDING'
}

// This is the interface which defines the state of your application. Instance of this interface will be tracked
interface ApplicationState {
  irisDatasetPath: string;
  sortConfig: {
    sortBy: SortByOptions;
    sortDirection: SortDirection;
  };
}

// The instance of the ApplicationState which will be tracked. This is also the root state in Provenance Graph
const initialState = {
  irisDatasetPath: '/path/to/dataset/iris.csv',
  sortConfig: {
    sortBy: SortByOptions.PETAL_LENGTH,
    sortDirection: SortDirection.ASCENDING
  }
};

// Initialize provenance tracking by passing root state.
const provenance = initProvenance(initialState);

// Add observers to do something on state change.

provenance.addObserver(['irisDatasetPath'], () => {
  // Dataset changed, do something
});

provenance.addObserver(['sortConfig', 'sortDirection'], (state?: ApplicationState) => {
  // Sort direction changed, do something
});

provenance.addObserver(['sortConfig', 'sortBy'], (state?: ApplicationState) => {
  // Sort by attribute changed, do something
});

// Call this when all the observers are defined.
// This is optional and only used when you want to enable sharing and loading states from URL.
// Refere documentation for advanced usage scenario.
provenance.done();

// Define actions to change various states. This can be as granular or coarse as you wish.
// The state here will be the current state which provenance passes in.
const changeSortDirection: ActionFunction<ApplicationState> = (
  state: ApplicationState,
  sortDirection: SortDirection
) => {
  state.sortConfig.sortDirection = sortDirection;
  return state;
};

const changeSortByAttribute: ActionFunction<ApplicationState> = (
  state: ApplicationState,
  sortBy: SortByOptions
) => {
  state.sortConfig.sortBy = sortBy;
  return state;
};

const changeDataset: ActionFunction<ApplicationState> = (
  state: ApplicationState,
  newFilePath: string
) => {
  state.irisDatasetPath = newFilePath;
  return state;
};

// Then apply the above actions as needed using applyAction method.
// It takes in multiple arguments. The first two are required.
// First is the label describing the event, second is the function. This can be anonymous function.
// Third is optional parameters which will be passed to the function passed as second arguments.
let action = provenance.addAction('Changing dataset', changeDataset);

action
  .addArgs('/path/to/new/dataset')
  .applyAction();

```

## Development

### Clone the repository

```bash
git clone git@github.com:visdesignlab/trrack.git
```

### Use npm commands

- `npm t`: Run test suite
- `npm start`: Run `npm run build` in watch mode
- `npm run test:watch`: Run test suite in [interactive watch mode](http://facebook.github.io/jest/docs/cli.html#watch)
- `npm run test:prod`: Run linting and generate coverage
- `npm run build`: Generate bundles and typings, create docs
- `npm run lint`: Lints code
- `npm run commit`: Commit using conventional commit style ([husky](https://github.com/typicode/husky) will tell you to use it if you haven't :wink:)

## Resources

Project created using [Typescript library starter](https://github.com/alexjoverm/typescript-library-starter) by [alexjoverm](https://github.com/alexjoverm/)

## Other provenance related projects

[Example](https://github.com/visdesignlab/provenance-lib-core-demo) application using provenance. Also demonstrates how to import and export the current state of an application.

[More Examples](https://github.com/visdesignlab/trrack-examples) using provenance with typescript and d3.

[trrack-vis](https://github.com/visdesignlab/trrack-vis) is a library for visualizing the provenance graph created from this library.

[Intent System](https://github.com/visdesignlab/intent-system) is a tool for predicting user intent patterns when brushing in scatterplots. The intent system utilizes the provenance library to control all interaction, as well as the ProvVis library to visualize the resulting provenance graph.
