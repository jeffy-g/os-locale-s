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
///<reference path="../index.d.ts"/>
import * as lcid from "lcid";
import * as cp from "child_process";
const { execFile, execFileSync } = cp;
const defaultLocale = "en_US";
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
/**
 * @typedef {cp.ExecFileException} ExecFileException
 * @typedef {"defaults" | "locale" | "wmic"} TLocalCmdToken
 * @typedef TExecuteCmdOpt
 * @prop {true} [async]
 * @prop {TLocalCmdToken} command
 * @prop {readonly string[]} [args]
 */
/**
 * @template {TExecuteCmdOpt} P
 * @template {Conditional<P["async"], string, Promise<string | ExecFileException>>} R
 * @param {P} options
 * @returns {R}
 * @date 2024-01-03
 */
function execCommand(options) {
    const { async, command, args } = options;
    if (async) {
        return /** @type {R} */ (new Promise((resolve) => {
            execFile(command, args, (err, stdout) => resolve(err || stdout));
        }));
    }
    try {
        return /** @type {R} */ (execFileSync(command, args, { encoding: "utf8" }));
    }
    catch (e) {
        return /** @type {R} */ (e);
    }
}
/**
 * If an exception occurs while executing command such as
 * `locale`, `wmic os get locale` the result cannot be applied,
 * so filtering is performed.
 *
 *  * If `result` is empty string, Error object, etc., returns "__en_US__"
 *
 * @todo latest error cache
 * @param {string | Error} result `string` or `Error` object
 * @param {(result: string) => string} [processor] If `result` is a `string`, delegate processing
 * @todo strict check of `result`
 */
function validate(result, processor) {
    if (typeof result === "string" && result.length) {
        return processor ? processor(result) : result.trim();
    }
    else {
        // @ts-ignore 
        console.info(result.message);
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
export const getEnvLocale = gel;
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
export const purgeExtraToken = pet;
/**
 * MAC OS
 *
 * @param {string} locale result of command `defaults -globalDomain -g AppleLocale`
 * @param {string} locales result of command `locale -a`
 */
const getSupportedLocale = (locale, locales) => locales.includes(locale) ? locale : /* istanbul ignore next */ defaultLocale;
/**
 * @typedef {(a: TLocalCmdToken, b: string[], c: TLocalCmdToken, d: string[]) => TAsyncSyncPair} TAppleLocaleFunctions
 */
const [getAppleLocale, getAppleLocaleSync] = /** @type {TAppleLocaleFunctions} */ ((cmd0, args0, cmd1, args1) => {
    return [
        /**
         * Locale detection for MAC OS
         * @async
         */
        async () => {
            const results = await Promise.all([
                execCommand({
                    async: true,
                    command: cmd0, args: args0
                }).then(validate),
                execCommand({
                    async: true,
                    command: cmd1, args: args1
                }).then(validate),
            ]);
            return getSupportedLocale(results[0], results[1]);
        },
        /**
         * Locale detection for MAC OS
         */
        () => getSupportedLocale(validate(execCommand({ command: cmd0, args: args0 })), validate(execCommand({ command: cmd1, args: args1 })))
    ];
})("defaults", ["read", "-globalDomain", "AppleLocale"], "locale", ["-a"]);
/** @type {(a: TLocalCmdToken, b: string[], p: (result: string) => string) => TAsyncSyncPair} */
const emitGetters = (command, args, processor) => {
    return [
        /**
         * Locale detection for windows or UNIX OS
         *
         *   + `> locale`
         *   + `> wmic os get locale`
         *
         * @async
         */
        async () => validate(await execCommand({ command, args, async: true }), processor),
        /**
         * Locale detection for windows or UNIX OS
         */
        () => validate(execCommand({ command, args }), processor)
    ];
};
/** @type {Parameters<typeof validate>[1]} */
const unixProcessor = (result) => {
    return pet(parseLocale(result));
};
const [getUnixLocale, getUnixLocaleSync] = emitGetters("locale", [], unixProcessor);
/**
 * @param {string} result
 * @see {@link module:lcid}
 */
const parseLCID = (result) => {
    const lcidCode = +("0x" + result.replace(/Locale|\s/g, ""));
    return lcid.from(lcidCode) || /* istanbul ignore next */ defaultLocale;
};
const [getWinLocale, getWinLocaleSync] = emitGetters("wmic", ["os", "get", "locale"], parseLCID);
/** @type {[ TGetLocaleFunctions<string>, TGetLocaleFunctions<Promise<string>> ]} */
export const localeGetters = [
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