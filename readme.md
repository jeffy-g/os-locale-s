# OS locale detector (os-locale-s)
[![Node.js CI](https://github.com/jeffy-g/os-locale-s/actions/workflows/ci.yml/badge.svg)](https://github.com/jeffy-g/os-locale-s/actions/workflows/ci.yml)
![GitHub](https://img.shields.io/github/license/jeffy-g/os-locale-s?style=flat)
[![codecov](https://codecov.io/gh/jeffy-g/os-locale-s/graph/badge.svg?token=XYGZYM5LV0)](https://codecov.io/gh/jeffy-g/os-locale-s)
![npm](https://img.shields.io/npm/dm/os-locale-s.svg?style=plastic)


__Compatibility-first locale detector for mixed and legacy-like environments.__

> Get the system [locale](https://en.wikipedia.org/wiki/Locale_(computer_software))

Useful for localizing your module or app.

POSIX systems: The returned locale refers to the [`LC_MESSAGE`](http://www.gnu.org/software/libc/manual/html_node/Locale-Categories.html#Locale-Categories) category, suitable for selecting the language used in the user interface for message translation.

## Motivation (Legacy Context)

Originally, this package was created as a lightweight rewrite for simple locale detection.
That historical reason still matters, but the project now has its own direction.

## Project Position (2026)

`os-locale` and `os-locale-s` are no longer trying to be the same thing.
`os-locale-s` focuses on compatibility-first behavior for real-world environments, including restricted or legacy-like setups.

If your runtime is modern and up to date, check `os-locale` first.
Recent upstream implementations are very lightweight and may already be the best default choice.

Use `os-locale-s` when you need legacy-friendly behavior, stricter fallback handling, or env-first control in mixed environments.

## Legacy-Friendly Behavior

- Environment-first detection via `LC_ALL`, `LC_MESSAGES`, `LANG`, `LANGUAGE`
- `spawn: false` mode for environments where subprocess execution is restricted
- Platform detectors when spawning is enabled
- Windows: PowerShell locale name
- macOS: `defaults` + `locale -a`
- Linux/Unix: `locale`
- Safe fallback to `en_US` if commands fail


## Install

```
$ npm install os-locale-s
```

## Usage

```js
// node (commenjs)
const { osLocale } = require("os-locale-s");
(async () => {
    console.log(await osLocale());
    //=> 'en-US'
})();
```

```ts
// ECMA module
import { osLocale } from "os-locale-s";
(async () => {
    console.log(await osLocale());
    //=> 'en-US'
})();
```
## API

### osLocale(options?)

Returns a `Promise` for the locale.

### osLocale.sync(options?)

Returns the locale.

#### options

Type: `object`

##### spawn

Type: `boolean`\
Default: `true`

Set to `false` to avoid spawning subprocesses and instead only resolve the locale from environment variables. (`process.env`)

##### cache

Type: `boolean`\
Default: `true`

Once the locale is detected, its value is retained and reused at the second and subsequent detections.

If set to `false`, the last held value will be ignored and do locale detection again (and the resulting value is not preserved)
