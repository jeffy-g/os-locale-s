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
// @ts-ignore
///<reference path="../index.d.ts"/>
///<reference types="basic-types"/>
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
     * @type {NsOsLocale.TInternalLocaleDetectorSig}
     */
    const detectorBase = (async) => (options = {}) => {
        /* eslint-disable indent */
        options = { spawn: true, cache: true, ...options };
        const { cache } = options;
        if (cache && cacheLocal.length) {
            return (async ? Promise.resolve(cacheLocal) : cacheLocal);
        }
        const functions = localeGetters[+(!!async)];
        /** @type {NsOsLocale.TInternalLocaleDetectorResult} */
        let locale;
        /**
         * @param {string} l
         * @param {true} [mustPromise]
         * @returns {NsOsLocale.TInternalLocaleDetectorResult}
         */
        const withCache = (l, mustPromise) => {
            l = l.replace(/_/, "-");
            cacheLocal = cache ? l : "";
            return (mustPromise ? Promise.resolve(l) : l);
        };
        const envLocale = getEnvLocale();
        if (envLocale || !options.spawn) {
            locale = purgeExtraToken(envLocale);
        }
        else {
            let { platform } = process;
            if (platform !== "win32" && platform !== "darwin") {
                platform = "linux";
            }
            locale = functions[platform]();
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
            value: "v1.0.17",
            enumerable: true,
        },
    });
}
exports.osLocale = detector;