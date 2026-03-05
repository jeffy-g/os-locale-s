/*!
 - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
  Copyright (C) 2020 jeffy-g <hirotom1107@gmail.com>
  Released under the MIT license
  https://opensource.org/licenses/mit-license.php
 - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
*/
// @ts-check
///<reference path="../index.d.ts"/>
import * as lib from "./lib.mjs";
/** @type {NsOsLocale.LocaleDetector} */
let detector;
{
  const { detectNativeLocale, getEnvLocale, purgeExtraToken } = lib;
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
   * @template {true | void} [IsAsync=void]
   * @template [R=SelectIf<IsAsync, Promise<string>, string>]
   * @param {NsOsLocale.LocaleDetectorOptions=} options
   * @param {IsAsync=} isAsync
   * @returns {R}
   */
  const detectorBase = (options, isAsync) => {
    const { cache = true, spawn = true } = options || {};
    if (cache && cacheLocal.length) {
      return /** @type {R} */ (
        isAsync ? Promise.resolve(cacheLocal) : cacheLocal
      );
    }
    const envLocale = getEnvLocale();
    const useEnv = !!(envLocale || !spawn);
    if (isAsync) {
      const promise = useEnv
        ? Promise.resolve(purgeExtraToken(envLocale))
        : detectNativeLocale(true);
      return /** @type {R} */ (promise.then((loc) => withCache(loc, cache)));
    }
    const locale = useEnv ? purgeExtraToken(envLocale) : detectNativeLocale();
    return /** @type {R} */ (withCache(locale, cache));
  };
  detector = /** @type {NsOsLocale.LocaleDetector} */ (
    (opt) => detectorBase(opt, true)
  );
  detector.sync = (opt) => detectorBase(opt);
  Object.defineProperties(detector, {
    /** @internal test use */
    purge: {
      value: () => (cacheLocal = ""),
      enumerable: false,
    },
    version: {
      value: "v1.1.4",
      enumerable: true,
    },
  });
}
export const osLocale = detector;
