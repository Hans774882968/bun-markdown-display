import { CubismIdManager } from './id/cubismidmanager';
import { CubismRenderer } from './rendering/cubismrenderer';
import { CSM_ASSERT, CubismLogInfo, CubismLogWarning } from './utils/cubismdebug';
import { Value } from './utils/cubismjson';
export function strtod(s, endPtr) {
    let index = 0;
    for (let i = 1;; i++) {
        const testC = s.slice(i - 1, i);
        if (testC == 'e' || testC == '-' || testC == 'E') {
            continue;
        }
        const test = s.substring(0, i);
        const number = Number(test);
        if (isNaN(number)) {
            break;
        }
        index = i;
    }
    let d = parseFloat(s);
    if (isNaN(d)) {
        d = NaN;
    }
    endPtr[0] = s.slice(index);
    return d;
}
let s_isStarted = false;
let s_isInitialized = false;
let s_option = null;
let s_cubismIdManager = null;
export const Constant = Object.freeze({
    vertexOffset: 0,
    vertexStep: 2
});
export function csmDelete(address) {
    if (!address) {
        return;
    }
    address = void 0;
}
export class CubismFramework {
    static startUp(option = null) {
        if (s_isStarted) {
            CubismLogInfo('CubismFramework.startUp() is already done.');
            return s_isStarted;
        }
        s_option = option;
        if (s_option != null) {
            Live2DCubismCore.Logging.csmSetLogFunction(s_option.logFunction);
        }
        s_isStarted = true;
        if (s_isStarted) {
            const version = Live2DCubismCore.Version.csmGetVersion();
            const major = (version & 0xff000000) >> 24;
            const minor = (version & 0x00ff0000) >> 16;
            const patch = version & 0x0000ffff;
            const versionNumber = version;
            CubismLogInfo(`Live2D Cubism Core version: {0}.{1}.{2} ({3})`, ('00' + major).slice(-2), ('00' + minor).slice(-2), ('0000' + patch).slice(-4), versionNumber);
        }
        CubismLogInfo('CubismFramework.startUp() is complete.');
        return s_isStarted;
    }
    static cleanUp() {
        s_isStarted = false;
        s_isInitialized = false;
        s_option = null;
        s_cubismIdManager = null;
    }
    static initialize(memorySize = 0) {
        CSM_ASSERT(s_isStarted);
        if (!s_isStarted) {
            CubismLogWarning('CubismFramework is not started.');
            return;
        }
        if (s_isInitialized) {
            CubismLogWarning('CubismFramework.initialize() skipped, already initialized.');
            return;
        }
        Value.staticInitializeNotForClientCall();
        s_cubismIdManager = new CubismIdManager();
        Live2DCubismCore.Memory.initializeAmountOfMemory(memorySize);
        s_isInitialized = true;
        CubismLogInfo('CubismFramework.initialize() is complete.');
    }
    static dispose() {
        CSM_ASSERT(s_isStarted);
        if (!s_isStarted) {
            CubismLogWarning('CubismFramework is not started.');
            return;
        }
        if (!s_isInitialized) {
            CubismLogWarning('CubismFramework.dispose() skipped, not initialized.');
            return;
        }
        Value.staticReleaseNotForClientCall();
        s_cubismIdManager.release();
        s_cubismIdManager = null;
        CubismRenderer.staticRelease();
        s_isInitialized = false;
        CubismLogInfo('CubismFramework.dispose() is complete.');
    }
    static isStarted() {
        return s_isStarted;
    }
    static isInitialized() {
        return s_isInitialized;
    }
    static coreLogFunction(message) {
        if (!Live2DCubismCore.Logging.csmGetLogFunction()) {
            return;
        }
        Live2DCubismCore.Logging.csmGetLogFunction()(message);
    }
    static getLoggingLevel() {
        if (s_option != null) {
            return s_option.loggingLevel;
        }
        return LogLevel.LogLevel_Off;
    }
    static getIdManager() {
        return s_cubismIdManager;
    }
    constructor() { }
}
export class Option {
}
export var LogLevel;
(function (LogLevel) {
    LogLevel[LogLevel["LogLevel_Verbose"] = 0] = "LogLevel_Verbose";
    LogLevel[LogLevel["LogLevel_Debug"] = 1] = "LogLevel_Debug";
    LogLevel[LogLevel["LogLevel_Info"] = 2] = "LogLevel_Info";
    LogLevel[LogLevel["LogLevel_Warning"] = 3] = "LogLevel_Warning";
    LogLevel[LogLevel["LogLevel_Error"] = 4] = "LogLevel_Error";
    LogLevel[LogLevel["LogLevel_Off"] = 5] = "LogLevel_Off";
})(LogLevel || (LogLevel = {}));
import * as $ from './live2dcubismframework';
export var Live2DCubismFramework;
(function (Live2DCubismFramework) {
    Live2DCubismFramework.Constant = $.Constant;
    Live2DCubismFramework.csmDelete = $.csmDelete;
    Live2DCubismFramework.CubismFramework = $.CubismFramework;
})(Live2DCubismFramework || (Live2DCubismFramework = {}));
