"use strict";
/*!
 - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
  Copyright (C) 2020 jeffy-g <hirotom1107@gmail.com>
  Released under the MIT license
  https://opensource.org/licenses/mit-license.php
 - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
*/
// @ts-ignore 
/// <reference path="./index.d.ts"/>
// @ts-ignore 
/// <reference path="../src/index.d.ts"/>
const fs = require("fs");
/**
 * @typedef {typeof process.platform} TOSTokens
 * @typedef {keyof typeof global} TGThisKeys
 * @typedef {[spawn?: boolean, cache?: boolean]} TDetectorOptValues
 * @typedef {Record<string, Record<string, string>>} TLocaleResultMap
 * @typedef TProcessCache
 * @prop {typeof process["env"]} env
 * @prop {TOSTokens} platform
 */
/**
 * @template {*} T
 * @typedef {{-readonly [P in keyof T]: T[P]}} XReadonly
 */
/**
 * @typedef LocaleDetectorOptions
 * @prop {boolean} [spawn] Set to `false` to avoid spawning subprocesses and instead only resolve the locale from environment variables.&#64;default true
 * @prop {boolean} [cache] &#64;default true
 */
/**
 * @type {NsOsLocale.LocaleDetector}
 */
let osLocale;
// @ts-ignore 
const ifDefined = (varName, fallback) => typeof global[varName] !== "undefined" ? global[varName] : fallback;
const debug = ifDefined("printSync", false);
const asyncDebug = ifDefined("printAsync", false);
const DEFAULT = 1;
const WIN = 1;
const LINUX = 1;
const DARWIN = 1;
const reLocale = /^(?:[a-z]{2}-[A-Z]{2}|C|POSIX)$/;
/** @type {TProcessCache} */
const cache = {
    env: process.env,
    platform: process.platform
};
/**
 *
 * @param {TOSTokens} platform "darwin", "linux", "win32"
 */
const setPlatform = (platform) => {
    Object.defineProperty(process, "platform", { value: platform });
};
/**
 * @param {TOSTokens} platform
 * @param {() => void} [extraProcess]
 * @returns {() => Promise<void>}
 */
const setPlatformOf = (platform, extraProcess) => () => {
    return new Promise(resolve => {
        extraProcess && extraProcess();
        setPlatform(platform);
        // @ts-ignore @internal
        osLocale.purge();
        resolve();
    });
};
/**
 * @param {boolean=} b
 * @returns {b is boolean}
 */
const isBool = (b) => typeof b === "boolean";
/**
 * @param {TDetectorOptValues=} bools
 * @returns
 */
function makeOption(bools) {
    /** @type {XReadonly<LocaleDetectorOptions>} */
    const opt = {};
    const [spawn, cache] = bools || [];
    isBool(spawn) && (opt.spawn = spawn);
    isBool(cache) && (opt.cache = cache);
    return (isBool(spawn) || isBool(cache)) ? opt : void 0;
}
const tryMatch = (lc) => {
    try {
        expect(lc).toMatch(reLocale);
    }
    catch (e) {
        console.warn("There are no locales available in this environment.");
    }
};
/**
 * @param {string} prefix
 * @param {string} locale
 * @param {XReadonly<LocaleDetectorOptions>=} opt
 */
const printInfo = (prefix, locale, opt) => {
    console.log(`${prefix}[platform: ${process.platform}, options: ${opt ? JSON.stringify(opt) : "use default(undefined)"}]: ${locale}`);
};
/**
 * @param {TLocaleResultMap} localeResult
 * @param {TDetectorOptValues=} detectorOpt [spawn, cache]
 * @param {true=} async
 */
const emitCallback = (localeResult, detectorOpt, async) => async () => {
    const opt = makeOption(detectorOpt);
    const fn = async ? osLocale : osLocale.sync;
    const result = fn(opt);
    const locale = /** @type {string} */ (async ? await result : result);
    let root = localeResult[process.platform];
    if (!root) {
        root = localeResult[process.platform] = {};
    }
    root[`options: ${opt ? JSON.stringify(opt).replace(/\\"/g, "") : "use default(undefined)"}`] = locale;
    debug && printInfo(async ? "async " : "", locale, opt);
    tryMatch(locale);
};

eachModule(".");
/**
 * @param {string} path module path `"../src/"(.ts)` or `"../dist/"(.js)`
 */
function eachModule(path) {
    describe(` ====================== running test: [os-locale-s], module - "${path}" ======================`, function () {
        /** @type {TLocaleResultMap} */
        const localeResult = {};
        beforeAll(/** @type {() => Promise<void>} */ () => {
            process.env = {};
            return new Promise(resolve => {
                Promise.resolve(`${path}`).then(s => require(s)).then((m) => {
                    ({ osLocale } = m);
                    resolve();
                });
            });
        });
        afterAll(() => {
            const logRoot = "./logs/";
            if (!fs.existsSync(logRoot)) {
                fs.mkdirSync(logRoot);
            }
            const outputJsonPath = logRoot + path.replace(/[.]+/g, "dots").replace(/[/\\]/g, "_") + "_test-result.json";
            fs.writeFileSync(outputJsonPath, JSON.stringify(localeResult, null, 2));
        });
        describe.each([
            [/** @type {TOSTokens} */ ("linux"), LINUX], [/** @type {TOSTokens} */ ("win32"), WIN], [/** @type {TOSTokens} */ ("darwin"), DARWIN]
        ])("[[[ Platform: %s (process.env.platform) ]]]", (name, enable) => {
            if (enable) {
                beforeEach(setPlatformOf(name));
                describe("locale detection with default options", function () {
                    it("async detection", emitCallback(localeResult, void 0, true));
                    it("sync detection", emitCallback(localeResult));
                });
                describe("locale detection with default options (no spawn)", function () {
                    it("async detection", emitCallback(localeResult, [false], true));
                    it("sync detection", emitCallback(localeResult, [false]));
                });
                describe("locale detection with default options (no cache)", function () {
                    it("async detection", emitCallback(localeResult, [true, false], true));
                    it("sync detection", emitCallback(localeResult, [true, false]));
                });
                describe("locale detection with no spawn, no cache", function () {
                    it("async detection", emitCallback(localeResult, [false, false], true));
                    it("sync detection", emitCallback(localeResult, [false, false]));
                });
            }
        });
        DEFAULT && describe("[[[ OS: default (**Test depending on the actual platform) ]]]", () => {
            beforeAll(setPlatformOf(cache.platform, () => process.env = cache.env));
            describe("locale detection with default options", function () {
                it("async detection", emitCallback(localeResult, void 0, true));
                it("sync detection", emitCallback(localeResult));
            });
            describe("locale detection with default options (no spawn)", function () {
                it("async detection", emitCallback(localeResult, [false], true));
                it("sync detection", emitCallback(localeResult, [false]));
            });
            describe("locale detection with default options (no cache)", function () {
                it("async detection", emitCallback(localeResult, [true, false], true));
                it("sync detection", emitCallback(localeResult, [true, false]));
            });
            describe("locale detection with no spawn, no cache", function () {
                it("async detection", emitCallback(localeResult, [false, false], true));
                it("sync detection", emitCallback(localeResult, [false, false]));
            });
        });
    });
}