"use strict";
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
// @ts-ignore
///<reference path="../index.d.ts"/>
///<reference path="./index.d.ts"/>
///<reference path="./extra-types.d.ts"/>
Object.defineProperty(exports, "__esModule", { value: true });
exports.localeGetters = exports.purgeExtraToken = exports.getEnvLocale = void 0;
const lcid = require("lcid");
const cp = require("child_process");
const { execFile, execFileSync } = cp;
/**
 * @template T, A, B
 * @typedef {unknown extends T ? A : T extends (void | false | undefined) ? A : B} Conditional
 */
/**
 * @template R
 * @typedef {{
 *     win32: () => R;
 *     darwin: () => R;
 *     linux: () => R;
 * }} TGetLocaleFunctions
 */
/**
 * @typedef {ArrayLike<[() => Promise<string>, () => string]>[0]} TAsyncSyncPair
 */
const defaultLocale = "en_US";
/**
 * @typedef {"defaults" | "locale" | "wmic"} TLocalCmdToken
 */
/**
 * execute command by execFile
 *
 * more details see {@link https://nodejs.org/api/child_process.html#child_process_child_process_execfile_file_args_options_callback child_process.execFile}
 *
 * @param {TLocalCmdToken} command
 * @param {readonly string[]} [args]
 */
const getStdOut = (command, args) => new Promise((resolve) => {
    execFile(command, args /*, execOpt*/, (err, stdout /*, stderr*/) => {
        resolve(err || stdout);
    });
});
/**
 * execute command by execFileSync
 *
 * more details see {@link https://nodejs.org/api/child_process.html#child_process_child_process_execfilesync_file_args_options child_process.execFileSync}
 *
 * @param {TLocalCmdToken} command
 * @param {readonly string[]} [args]
 */
const getStdOutSync = (command, args) => {
    try {
        return execFileSync(command, args /*, execOpt*/);
    }
    catch (e) {
        return e;
    }
};
/**
 * If an exception occurs while executing command such as
 * `locale`, `wmic os get locale` the result cannot be applied,
 * so filtering is performed.
 *
 *  * If `result` is empty string, Error object, etc., returns "__en_US__"
 *
 * @todo latest error cache
 * @param {string | any} result `string` or `Error` object
 * @param {(result: string) => TBD<string>} [processor] If `result` is a `string`, delegate processing
 */
function validate(result, processor) {
    if (typeof result === "string" && result.length) {
        return processor ? processor(result) : result.trim();
    }
    return defaultLocale;
}
/**
 * attempts to extract `LC_ALL`, `LC_MESSAGES`, `LANG`, `LANGUAGE` values from a map object like `process.env`
 *
 *  * If there is no value for those keys, it will be an empty string
 *
 * @param {NodeJS.Dict<string>} [env] more details see {@link https://nodejs.org/api/process.html#process_process_env process.env}
 */
const gel = (env = process.env) => env.LC_ALL || env.LC_MESSAGES || env.LANG || env.LANGUAGE || "";
exports.getEnvLocale = gel;
/**
 * parse of `locale` command result string
 *
 * @param {string} str
 */
function parseLocale(str) {
    const env = str.split("\n").reduce((env, definition) => {
        const [key, value] = definition.split("=");
        if (key && value) {
            env[key] = value.replace(/^"|"$/g, "");
        }
        return env;
    }, {});
    return gel(env);
}
/**
 * e.g - "en-US.utf8" => "en-US"
 *
 * @param {string} str probably, string like "en-US.utf8". if `str` is empty string then returns `en_US`.
 */
const pet = (str) => (str && str.replace(/[.:].*/, "")) || defaultLocale;
exports.purgeExtraToken = pet;
/**
 * MAC OS
 *
 * @param {string} locale result of command `defaults -globalDomain -g AppleLocale`
 * @param {string} locales result of command `locale -a`
 */
const getSupportedLocale = (locale, locales) => locales.includes(locale) ? locale : /* istanbul ignore next */ defaultLocale;
const [getAppleLocale, getAppleLocaleSync] = /** @type {(a: TLocalCmdToken, b: string[], c: TLocalCmdToken, d: string[]) => TAsyncSyncPair} */ ((cmd0, args0, cmd1, args1) => {
    return [
        /**
         * Locale detection for MAC OS
         * @async
         */
        async () => {
            const results = await Promise.all([
                getStdOut(cmd0, args0).then(ret => validate(ret)),
                getStdOut(cmd1, args1).then(ret => validate(ret))
            ]);
            return getSupportedLocale(results[0], results[1]);
        },
        /**
         * Locale detection for MAC OS
         */
        () => getSupportedLocale(validate(getStdOutSync(cmd0, args0)), validate(getStdOutSync(cmd1, args1)))
    ];
})("defaults", ["read", "-globalDomain", "AppleLocale"], "locale", ["-a"]);
const [getUnixLocale, getUnixLocaleSync] = /** @type {(cmd: TLocalCmdToken) => TAsyncSyncPair} */ ((cmd) => {
    return [
        /**
         * Locale detection for UNIX OS related
         * @async
         */
        async () => pet(parseLocale(await getStdOut(cmd).then(ret => validate(ret)))),
        /**
         * Locale detection for UNIX OS related
         */
        () => pet(parseLocale(validate(getStdOutSync(cmd))))
    ];
})("locale");
/**
 * @param {string} result
 * @see {@link module:lcid}
 */
const parseLCID = (result) => {
    const lcidCode = parseInt(result.replace("Locale", ""), 16);
    return lcid.from(lcidCode) || defaultLocale;
};
const [getWinLocale, getWinLocaleSync] = /** @type {(a: TLocalCmdToken, b: string[]) => TAsyncSyncPair} */ ((cmd0, args0) => {
    return [
        /**
         * Locale detection for windows OS
         *
         *   + `wmic os get locale`
         *
         * @async
         */
        async () => validate(await getStdOut(cmd0, args0), parseLCID),
        /**
         * Locale detection for windows OS
         */
        () => validate(getStdOutSync(cmd0, args0), parseLCID)
    ];
})("wmic", ["os", "get", "locale"]);
/** @type {[ TGetLocaleFunctions<string>, TGetLocaleFunctions<Promise<string>> ]} */
exports.localeGetters = [
    {
        win32: getWinLocaleSync,
        darwin: getAppleLocaleSync,
        linux: getUnixLocaleSync,
    }, {
        win32: getWinLocale,
        darwin: getAppleLocale,
        linux: getUnixLocale,
    }
];