# Provenance Library

JS/TS library to track user actions in a webapp.
Tracking user interactions in a web app is a complex process and this library requires you to use `redux` to manage state of your applications. It doesn't enforce any restriction on view management, you are free to choose any front end framework like Vue, React, Angular or just plain javascript/typescript.

## What it does?

`provenance-lib-core` is designed to record user actions in a non linear graph.

## How to use it?

You can install the library from `npm` using `npm i provenance-lib-core` or similar command for `yarn`.
You need to provide the library with user actions.

## Install

```
npm i provenance-lib-core
```

### Develop

```bash
git clone https://github.com/visdesignlab/provenance-lib-core.git
cd provenance-lib-core

npm start
```

### NPM scripts

- `npm t`: Run test suite
- `npm start`: Run `npm run dev-lib`
