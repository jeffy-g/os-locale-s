//
// Copyright (c) Sindre Sorhus <sindresorhus@gmail.com> (https://sindresorhus.com)
// Released under the MIT license
// https://opensource.org/licenses/mit-license.php
//
/*!
 - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
  Copyright (C) 2020 jeffy-g <hirotom1107@gmail.com>
  Released under the MIT license
  https://opensource.org/licenses/mit-license.php
 - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
*/

declare global {
    /**
     * T is falsy then return A, trusy then B
     * 
     * ```ts
     * type ConditionalX<T, A, B> = T extends (void | false | undefined) ? A : B // <- maybe not works
     * type Conditional<T, A, B> = void extends T ? A : T extends (void | false | undefined) ? A : B;
     * 
     * function x<T extends true | void, R extends ConditionalX<T, string, string[]>>(need?: T): R {
     *     return (need? "": [""]) as R;
     * }
     * // string | string[]
     * const xret = x();
     * // string[]
     * const xret2 = x(true);
     * 
     * function ok<T extends true | void, R extends Conditional<T, string, string[]>>(need?: T): R {
     *     return (need? "": [""]) as R;
     * }
     * // string
     * const okret = ok();
     * // string[]
     * const okret2 = ok(true);
     * ```
     * 
     * @date 20/03/31
     */
    type Conditional<T, A, B> = void extends T ? A : T extends (void | false | undefined) ? A : B;
}

export declare interface LocaleDetectorOptions {
    /**
     * Set to `false` to avoid spawning subprocesses and instead only resolve the locale from environment variables.
     * 
     * @default true
     */
    readonly spawn?: boolean;
    /**
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
    bivarianceHack<IsAsync extends true | void, R extends Conditional<IsAsync, string, Promise<string>>>(async?: IsAsync): (options?: LocaleDetectorOptions) => R;
}["bivarianceHack"];
// /**
//  * @internal
//  */
// export type TInternalLocaleDetectorResult = ReturnType<ReturnType<TInternalLocaleDetectorSig>>;

export declare const osLocale: LocaleDetector;

export as namespace NsOsLocale;
