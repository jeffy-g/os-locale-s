/*!
 - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
  Copyright (C) 2020 jeffy-g <hirotom1107@gmail.com>
  Released under the MIT license
  https://opensource.org/licenses/mit-license.php
 - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
*/
///<reference path="../index.d.ts"/>
import { exec, execSync } from "child_process";
/**
 * @import { ExecException, ExecSyncOptionsWithStringEncoding } from "child_process";
 */
const defaultLocale = "en_US";
/** @type {ExecSyncOptionsWithStringEncoding} */
const execOpt = {
    encoding: "utf8",
};
/**
 * @template {true | void} P
 * @template {If<P, Promise<string | ExecException>, string>} R
 * @param {string} command
 * @param {P=} async
 * @returns {R}
 * @date 2024-01-03
 * @date 2026/03/02 By using exec and execSync, it is simplified.
 */
function execCommand(command, async) {
    if (async) {
        return /** @type {R} */ (new Promise((resolve) => {
            exec(command, execOpt, (err, stdout) => resolve(err || stdout));
        }));
    }
    try {
        return /** @type {R} */ (execSync(command, execOpt));
    }
    catch (e) {
        return /** @type {R} */ (e);
    }
}
const isDebugMode = process.env.OS_LOCALE_S_DEBUG === "1";
/**
 * @param {string | Error} result
 */
/* istanbul ignore next */
const getErrorMessage = (result) => {
    if (result && typeof result === "object" && "message" in result) {
        return String(result.message || "");
    }
    return "";
};
/**
 * If an exception occurs while executing command such as
 * `locale`, `wmic os get locale` the result cannot be applied,
 * so filtering is performed.
 *
 *  * If `result` is empty string, Error object, etc., returns "__en_US__"
 *
 * @todo latest error cache
 * @param {string | Error} result `string` or `Error` object
 * @param {TNativeResultProcessor} [processor] If `result` is a `string`, delegate processing
 * @todo strict check of `result`
 */
function validate(result, processor) {
    if (typeof result === "string" && result.length) {
        return processor ? processor(result) : result.trim();
    }
    if (isDebugMode) {
        /* istanbul ignore next */
        const message = getErrorMessage(result) || "locale command failed";
        /* istanbul ignore next */
        console.error(`[os-locale-s] ${message}`);
    }
    return defaultLocale;
}
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
    }, /** @type {NodeJS.Dict<string>} */ ({}));
    return getEnvLocale(env);
}
/**
 * attempts to extract `LC_ALL`, `LC_MESSAGES`, `LANG`, `LANGUAGE` values from a map object like `process.env`
 *
 *  * If there is no value for those keys, it will be an empty string
 *
 * @param {NodeJS.Dict<string>} [env] more details see {@link https://nodejs.org/api/process.html#process_process_env process.env}
 */
export const getEnvLocale = (env = process.env) => env.LC_ALL || env.LC_MESSAGES || env.LANG || env.LANGUAGE || "";
/**
 * e.g - "en-US.utf8" => "en-US"
 *
 * @param {string} str probably, string like "en-US.utf8". if `str` is empty string then returns `en_US`.
 */
export const purgeExtraToken = (str) => (str && str.replace(/[.:].*/, "")) || defaultLocale;
/** @type {TEmitLocalDetector} */
const emitDetector = (command, processor) => (isAsync) => {
    if (isAsync) {
        return /** @type {any} */ (execCommand(command, true).then(locale => validate(locale, processor)));
    }
    return validate(execCommand(command), processor);
};
/** @type {TNativeResultProcessor} */
const unixProcessor = (result) => purgeExtraToken(parseLocale(result));
const detectUnixLocale = emitDetector("locale", unixProcessor);
const localeNameCommand = "(get-culture).name";
const winCommandLine = `powershell -NoProfile -NonInteractive -Command "[Console]::OutputEncoding=[Text.Encoding]::UTF8; ${localeNameCommand}"`;
const detectWinLocale = emitDetector(winCommandLine, locale => locale.trim());
/**
 * @param {string} locale result of command `defaults -globalDomain -g AppleLocale`
 * @param {string} locales result of command `locale -a`
 */
const getSupportedLocale = (locale, locales) => locales.includes(locale) ? locale : /* istanbul ignore next */ defaultLocale;
/** @type {TNativeLocaleDetector} */
const detectAppleLocale = (isAsync) => {
    const localeCommand = "defaults read -globalDomain AppleLocale";
    const listLocaleCommand = "locale -a";
    if (isAsync) {
        /**
         * Locale detection for MAC OS
         */
        return /** @type {any} */ (Promise.all([
            execCommand(localeCommand, true).then(validate),
            execCommand(listLocaleCommand, true).then(validate),
        ]).then(results => getSupportedLocale(results[0], results[1])));
    }
    /**
     * Locale detection for MAC OS
     */
    return /** @type {any} */ (getSupportedLocale(validate(execCommand(localeCommand)), validate(execCommand(listLocaleCommand))));
};
/**
 * Use the value of process.platform as the function name.
 * The OS can be limited to 'win32' and 'darwin',
 * but other OS must be Linux-based, so a check code like `detectPlatform` is required.
 *
 * @see {@link detectPlatform}
 */
export const localeDetectorMap = {
    win32: detectWinLocale,
    darwin: detectAppleLocale,
    linux: detectUnixLocale,
};
/**
 * Use the value of `process.platform`.
 * `darwin` can be limited to MAC OS, `win32` to Windows, and the command to get the locale is a little special.
 * In addition, UNIX locale commands can be used for `aix`, `freebsd`, `linux`, `openbsd`, and `sunos`.
 * @see {@link https://nodejs.org/api/process.html#processplatform process.platform}
 */
export const detectPlatform = () => {
    let { platform } = process;
    if (platform !== "win32" && platform !== "darwin") {
        platform = "linux";
    }
    return platform;
};