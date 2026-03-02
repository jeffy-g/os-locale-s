/*!
 - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
  Copyright (C) 2020 jeffy-g <hirotom1107@gmail.com>
  Released under the MIT license
  https://opensource.org/licenses/mit-license.php
 - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
*/
/// <reference path="./extra-types.d.ts" preserve="true"/>

declare global {
  type If<T, A, B> = void extends T ? B : A;
}

export declare interface LocaleDetectorOptions {
  /**
   * Set to `false` to avoid spawning subprocesses and instead only resolve the locale from environment variables.
   * 
   * @default true
   */
  readonly spawn?: boolean;
  /**
   * The first result is cached and used the next time.
   * 
   * @default true
   */
  readonly cache?: boolean;
}
export declare interface LocaleDetectorBase {
  /**
   * Get the system [locale](https://en.wikipedia.org/wiki/Locale_(computer_software)).
   * 
   * @returns The locale.
   * 
   * @example
   * ```
   * import { osLocale } = require("os-locale-s");
       * 
   * (async () => {
   *     console.log(await osLocale());
   *     //=> 'en-US'
   * })();
   * ```
   */
  (options?: LocaleDetectorOptions): Promise<string>;
  /**
   *
   */
  readonly version: string;
}

export declare interface LocaleDetector extends LocaleDetectorBase {
  /**
   * Synchronously get the system [locale](https://en.wikipedia.org/wiki/Locale_(computer_software)).
   * 
   * @returns The locale.
   */
  sync(options?: LocaleDetectorOptions): string;
}

/**
 * @internal
 */
export type TInternalLocaleDetectorSig = {
  bivarianceHack<IsAsync extends true | void, R extends If<IsAsync, Promise<string>, string>>(async?: IsAsync): (options?: LocaleDetectorOptions) => R;
}["bivarianceHack"];
// /**
//  * @internal
//  */
// export type TInternalLocaleDetectorResult = ReturnType<ReturnType<TInternalLocaleDetectorSig>>;

export declare const osLocale: LocaleDetector;

export as namespace NsOsLocale;
