"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const debug = 0;
const asyncDebug = 0;
const DEFAULT = 1;
const WIN = 1;
const LINUX = 1;
const DARWIN = 1;
const reLocale = /^(?:[a-z]{2}-[A-Z]{2}|C|POSIX)$/;
const cache = {};
const setPlatform = (platform) => {
    Object.defineProperty(process, "platform", { value: platform });
};
const emitPlatformSetter = (platform, altProcess) => () => {
    return new Promise(resolve => {
        if (typeof altProcess === "function")
            altProcess();
        setPlatform(platform);
        osLocale.purge();
        resolve();
    });
};
const isBool = (b) => typeof b === "boolean";
function makeOption(bools) {
    const opt = {};
    const [spawn, cache] = bools || [];
    isBool(spawn) && (opt.spawn = spawn);
    isBool(cache) && (opt.cache = cache);
    return (isBool(spawn) || isBool(cache)) ? opt : void 0;
}
let osLocale;
const tryMatch = (lc) => {
    try {
        expect(lc).toMatch(reLocale);
    }
    catch (e) {
        console.warn("There are no locales available in this environment.");
    }
};
const asyncCallbackEmitter = (plat, bools) => async () => {
    const opt = makeOption(bools);
    const locale = await osLocale(opt);
    asyncDebug && console.log(`async [${plat}]: ${locale}`);
    tryMatch(locale);
};
const syncCallbackEmitter = (plat, bools) => () => {
    const opt = makeOption(bools);
    const locale = osLocale.sync(opt);
    debug && console.log(`[${plat}]: ${locale}`);
    tryMatch(locale);
};
beforeAll(async () => {
    return new Promise(resolve => {
        cache.env = process.env;
        cache.platform = process.platform;
        resolve();
    });
});
// eachModule("../src/");
eachModule("./");
function eachModule(path) {
    describe(`[os-locale-s], module - "${path}"`, function () {
        beforeAll(() => {
            process.env = {};
            return new Promise(resolve => {
                Promise.resolve().then(() => require(path)).then((m) => {
                    osLocale = m.osLocale;
                    resolve();
                });
            });
        });
        describe.each([
            ["linux", LINUX], ["win32", WIN], ["darwin", DARWIN]
        ])("Platform: %s (process.env.platform)", (name, enable) => {
            if (enable) {
                beforeEach(emitPlatformSetter(name));
                describe("locale detection with default options", function () {
                    it("async detection", asyncCallbackEmitter(name));
                    it("sync detection", syncCallbackEmitter(name));
                });
                describe("locale detection with default options (no spawn)", function () {
                    it("async detection", asyncCallbackEmitter(name, [false]));
                    it("sync detection", syncCallbackEmitter(name, [false]));
                });
                describe("locale detection with default options (no cache)", function () {
                    it("async detection", asyncCallbackEmitter(name, [true, false]));
                    it("sync detection", syncCallbackEmitter(name, [true, false]));
                });
                describe("locale detection with no spawn, no cache", function () {
                    it("async detection", asyncCallbackEmitter(name, [false, false]));
                    it("sync detection", syncCallbackEmitter(name, [false, false]));
                });
            }
        });
        DEFAULT && describe("OS: default (**Test depending on the actual platform)", () => {
            beforeAll(emitPlatformSetter(cache.platform, () => process.env = cache.env));
            describe("locale detection with default options", function () {
                it("async detection", asyncCallbackEmitter("default"));
                it("sync detection", syncCallbackEmitter("default"));
            });
            describe("locale detection with default options (no spawn)", function () {
                it("async detection", asyncCallbackEmitter("default", [false]));
                it("sync detection", syncCallbackEmitter("default", [false]));
            });
            describe("locale detection with default options (no cache)", function () {
                it("async detection", asyncCallbackEmitter("default", [true, false]));
                it("sync detection", syncCallbackEmitter("default", [true, false]));
            });
            describe("locale detection with no spawn, no cache", function () {
                it("async detection", asyncCallbackEmitter("default", [false, false]));
                it("sync detection", syncCallbackEmitter("default", [false, false]));
            });
        });
    });
}
