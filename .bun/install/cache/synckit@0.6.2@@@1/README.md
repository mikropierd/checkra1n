# synckit

[![GitHub Actions](https://github.com/rx-ts/synckit/workflows/CI/badge.svg)](https://github.com/rx-ts/synckit/actions/workflows/ci.yml)
[![Codecov](https://img.shields.io/codecov/c/github/rx-ts/synckit.svg)](https://codecov.io/gh/rx-ts/synckit)
[![Codacy Grade](https://img.shields.io/codacy/grade/3eaf9a96ad12491493b712a6a99028c5)](https://www.codacy.com/gh/rx-ts/synckit)
[![type-coverage](https://img.shields.io/badge/dynamic/json.svg?label=type-coverage&prefix=%E2%89%A5&suffix=%&query=$.typeCoverage.atLeast&uri=https%3A%2F%2Fraw.githubusercontent.com%2Frx-ts%2Fsynckit%2Fmain%2Fpackage.json)](https://github.com/plantain-00/type-coverage)
[![npm](https://img.shields.io/npm/v/synckit.svg)](https://www.npmjs.com/package/synckit)
[![GitHub Release](https://img.shields.io/github/release/rx-ts/synckit)](https://github.com/rx-ts/synckit/releases)

[![David Peer](https://img.shields.io/david/peer/rx-ts/synckit.svg)](https://david-dm.org/rx-ts/synckit?type=peer)
[![David](https://img.shields.io/david/rx-ts/synckit.svg)](https://david-dm.org/rx-ts/synckit)
[![David Dev](https://img.shields.io/david/dev/rx-ts/synckit.svg)](https://david-dm.org/rx-ts/synckit?type=dev)

[![Conventional Commits](https://img.shields.io/badge/conventional%20commits-1.0.0-yellow.svg)](https://conventionalcommits.org)
[![Renovate enabled](https://img.shields.io/badge/renovate-enabled-brightgreen.svg)](https://renovatebot.com)
[![JavaScript Style Guide](https://img.shields.io/badge/code_style-standard-brightgreen.svg)](https://standardjs.com)
[![Code Style: Prettier](https://img.shields.io/badge/code_style-prettier-ff69b4.svg)](https://github.com/prettier/prettier)

Perform async work synchronously in Node.js using `worker_threads` with first-class TypeScript support.

## TOC <!-- omit in toc -->

- [Usage](#usage)
  - [Install](#install)
  - [API](#api)
  - [Envs](#envs)
  - [TypeScript](#typescript)
- [Benchmark](#benchmark)
- [Changelog](#changelog)
- [License](#license)

## Usage

### Install

```sh
# yarn
yarn add synckit

# npm
npm i synckit
```

### API

```js
// runner.js
import { createSyncFn } from 'synckit'

// the worker path must be absolute
const syncFn = createSyncFn(require.resolve('./worker'))

// do whatever you want, you will get the result synchronously!
const result = syncFn(...args)
```

```js
// worker.js
import { runAsWorker } from 'synckit'

runAsWorker(async (...args) => {
  // do expensive work
  return result
})
```

You must make sure, the `result` is serialized by [`Structured Clone Algorithm`](https://developer.mozilla.org/en-US/docs/Web/API/Web_Workers_API/Structured_clone_algorithm)

### Envs

1. `SYNCKIT_BUFFER_SIZE`: `bufferSize` to create `SharedArrayBuffer` for `worker_threads` (default as `1024`)
2. `SYNCKIT_TIMEOUT`: `timeout` for performing the async job (no default)
3. `SYNCKIT_EXEC_ARGV`: List of node CLI options passed to the worker, split with comma `,`. (default as `[]`), see also [`node` docs](https://nodejs.org/api/worker_threads.html)

### TypeScript

If you want to use `ts-node` for worker file (a `.ts` file), it is supported out of box!

If you want to use a custom tsconfig as project instead of default `tsconfig.json`, use `TS_NODE_PROJECT` env. Please view [ts-node](https://github.com/TypeStrong/ts-node#tsconfig) for more details.

If you want to integrate with [tsconfig-paths](https://www.npmjs.com/package/tsconfig-paths), please view [ts-node](https://github.com/TypeStrong/ts-node#paths-and-baseurl) for more details.

## Benchmark

It is about 20x faster than [`sync-threads`](https://github.com/lambci/sync-threads) but 3x slower than native for reading the file content itself 1000 times during runtime, and 18x faster than `sync-threads` but 4x slower than native for total time.

And it's almost same as [`deasync`](https://github.com/abbr/deasync) but requires no native bindings or `node-gyp`.

See [benchmark.cjs](./benchmarks/benchmark.cjs.txt) and [benchmark.esm](./benchmarks/benchmark.esm.txt) for more details.

You can try it with running `yarn benchmark` by yourself. [Here](./benchmarks/benchmark.js) is the benchmark source code.

## Changelog

Detailed changes for each release are documented in [CHANGELOG.md](./CHANGELOG.md).

## License

[MIT][] © [JounQin][]@[1stG.me][]

[1stg.me]: https://www.1stg.me
[jounqin]: https://GitHub.com/JounQin
[mit]: http://opensource.org/licenses/MIT
