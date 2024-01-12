"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.osLocale = void 0;
/*!
 // Copyright (c) Sindre Sorhus <sindresorhus@gmail.com> (https://sindresorhus.com)
 // Released under the MIT license
 // https://opensource.org/licenses/mit-license.php
 */
/*!
 - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
  Copyright (C) 2020 jeffy-g <hirotom1107@gmail.com>
  Released under the MIT license
  https://opensource.org/licenses/mit-license.php
 - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
*/
// @ts-check
///<reference path="../index.d.ts"/>
const lib = require("./lib");
/**
 * @typedef {(o: any) => o is Promise<any>} TPromiseChecker
 */
/** @type {NsOsLocale.LocaleDetector} */
let detector;
{
    const { localeGetters, getEnvLocale, purgeExtraToken } = lib;
    /**
     * The argument values ​​passed to this function are always string or Promises.
     * @type {TPromiseChecker}
     */
    const isPromise = (o) => typeof o.then === "function";
    let cacheLocal = "";
    /**
     * @template {true | void} IsAsync
     * @template {Conditional<IsAsync, string, Promise<string>>} R
     * @param {IsAsync=} async
     * @returns {(options?: NsOsLocale.LocaleDetectorOptions) => R}
     */
    // @ts-ignore 
    const detectorBase = (async) => (options = {}) => {
        /* eslint-disable indent */
        options = { spawn: true, cache: true, ...options };
        const { cache } = options;
        if (cache && cacheLocal.length) {
            return (async ? Promise.resolve(cacheLocal) : cacheLocal);
        }
        const functions = localeGetters[+(!!async)];
        /** @type {R} */
        let locale;
        /**
         * @param {string} l
         * @param {true} [mustPromise]
         * @returns {R}
         */
        const withCache = (l, mustPromise) => {
            l = l.replace(/_/, "-");
            cacheLocal = cache ? l : "";
            return /** @type {R} */ (mustPromise ? Promise.resolve(l) : l);
        };
        const envLocale = getEnvLocale();
        if (envLocale || !options.spawn) {
            locale = /** @type {R} */ (purgeExtraToken(envLocale));
        }
        else {
            let { platform } = process;
            if (platform !== "win32" && platform !== "darwin") {
                platform = "linux";
            }
            locale = /** @type {R} */ (functions[platform]());
        }
        return (isPromise(locale) ? locale.then(withCache) : withCache(locale, async === true || void 0));
    };
    /* eslint-enable indent */
    detector = /** @type {NsOsLocale.LocaleDetector} */ (detectorBase(true));
    detector.sync = detectorBase();
    Object.defineProperties(detector, {
        /** @internal test use */
        purge: {
            value: () => cacheLocal = "",
            enumerable: false,
        },
        version: {
            value: "v1.0.26",
            enumerable: true,
        },
    });
}
exports.osLocale = detector;