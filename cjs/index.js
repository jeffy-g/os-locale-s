///<reference path="../index.d.ts"/>
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.osLocale = void 0;
/*!
 - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
  Copyright (C) 2020 jeffy-g <hirotom1107@gmail.com>
  Released under the MIT license
  https://opensource.org/licenses/mit-license.php
 - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
*/
// @ts-check
const lib = require("./lib");
/** @type {NsOsLocale.LocaleDetector} */
let detector;
{
    const { localeDetectorMap, getEnvLocale, purgeExtraToken, detectPlatform } = lib;
    let cacheLocal = "";
    /**
     * @param {string} localeToken
     * @param {boolean} cache
     * @returns {string}
     */
    const withCache = (localeToken, cache) => {
        localeToken = localeToken.replace(/_/g, "-");
        cacheLocal = cache ? localeToken : "";
        return localeToken;
    };
    /**
     * @template {true | void} IsAsync
     * @template {If<IsAsync, Promise<string>, string>} R
     * @param {IsAsync=} isAsync
     * @returns {(options?: NsOsLocale.LocaleDetectorOptions) => R}
     */
    const detectorBase = (isAsync) =>
    /** @type {(options?: NsOsLocale.LocaleDetectorOptions) => R} */
    (options) => {
        const { cache = true, spawn = true } = options || {};
        if (cache && cacheLocal.length) {
            return /** @type {R} */ (isAsync ? Promise.resolve(cacheLocal) : cacheLocal);
        }
        const envLocale = getEnvLocale();
        const platform = detectPlatform();
        if (isAsync) {
            const p = envLocale || !spawn
                ? Promise.resolve(purgeExtraToken(envLocale))
                : localeDetectorMap[platform](true);
            return /** @type {R} */ (p.then(loc => withCache(loc, cache)));
        }
        const s = envLocale || !spawn
            ? purgeExtraToken(envLocale)
            : localeDetectorMap[platform]();
        return /** @type {R} */ (withCache(s, cache));
    };
    detector = /** @type {NsOsLocale.LocaleDetector} */ (detectorBase(true));
    detector.sync = detectorBase();
    Object.defineProperties(detector, {
        /** @internal test use */
        purge: {
            value: () => cacheLocal = "",
            enumerable: false,
        },
        version: {
            value: "v1.1.0",
            enumerable: true,
        },
    });
}
exports.osLocale = detector;