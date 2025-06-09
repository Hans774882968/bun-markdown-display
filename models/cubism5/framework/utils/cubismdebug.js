import { CSM_LOG_LEVEL, CSM_LOG_LEVEL_DEBUG, CSM_LOG_LEVEL_ERROR, CSM_LOG_LEVEL_INFO, CSM_LOG_LEVEL_VERBOSE, CSM_LOG_LEVEL_WARNING } from '../cubismframeworkconfig';
import { CubismFramework, LogLevel } from '../live2dcubismframework';
export const CubismLogPrint = (level, fmt, args) => {
    CubismDebug.print(level, '[CSM]' + fmt, args);
};
export const CubismLogPrintIn = (level, fmt, args) => {
    CubismLogPrint(level, fmt + '\n', args);
};
export const CSM_ASSERT = (expr) => {
    console.assert(expr);
};
export let CubismLogVerbose;
export let CubismLogDebug;
export let CubismLogInfo;
export let CubismLogWarning;
export let CubismLogError;
if (CSM_LOG_LEVEL <= CSM_LOG_LEVEL_VERBOSE) {
    CubismLogVerbose = (fmt, ...args) => {
        CubismLogPrintIn(LogLevel.LogLevel_Verbose, '[V]' + fmt, args);
    };
    CubismLogDebug = (fmt, ...args) => {
        CubismLogPrintIn(LogLevel.LogLevel_Debug, '[D]' + fmt, args);
    };
    CubismLogInfo = (fmt, ...args) => {
        CubismLogPrintIn(LogLevel.LogLevel_Info, '[I]' + fmt, args);
    };
    CubismLogWarning = (fmt, ...args) => {
        CubismLogPrintIn(LogLevel.LogLevel_Warning, '[W]' + fmt, args);
    };
    CubismLogError = (fmt, ...args) => {
        CubismLogPrintIn(LogLevel.LogLevel_Error, '[E]' + fmt, args);
    };
}
else if (CSM_LOG_LEVEL == CSM_LOG_LEVEL_DEBUG) {
    CubismLogDebug = (fmt, ...args) => {
        CubismLogPrintIn(LogLevel.LogLevel_Debug, '[D]' + fmt, args);
    };
    CubismLogInfo = (fmt, ...args) => {
        CubismLogPrintIn(LogLevel.LogLevel_Info, '[I]' + fmt, args);
    };
    CubismLogWarning = (fmt, ...args) => {
        CubismLogPrintIn(LogLevel.LogLevel_Warning, '[W]' + fmt, args);
    };
    CubismLogError = (fmt, ...args) => {
        CubismLogPrintIn(LogLevel.LogLevel_Error, '[E]' + fmt, args);
    };
}
else if (CSM_LOG_LEVEL == CSM_LOG_LEVEL_INFO) {
    CubismLogInfo = (fmt, ...args) => {
        CubismLogPrintIn(LogLevel.LogLevel_Info, '[I]' + fmt, args);
    };
    CubismLogWarning = (fmt, ...args) => {
        CubismLogPrintIn(LogLevel.LogLevel_Warning, '[W]' + fmt, args);
    };
    CubismLogError = (fmt, ...args) => {
        CubismLogPrintIn(LogLevel.LogLevel_Error, '[E]' + fmt, args);
    };
}
else if (CSM_LOG_LEVEL == CSM_LOG_LEVEL_WARNING) {
    CubismLogWarning = (fmt, ...args) => {
        CubismLogPrintIn(LogLevel.LogLevel_Warning, '[W]' + fmt, args);
    };
    CubismLogError = (fmt, ...args) => {
        CubismLogPrintIn(LogLevel.LogLevel_Error, '[E]' + fmt, args);
    };
}
else if (CSM_LOG_LEVEL == CSM_LOG_LEVEL_ERROR) {
    CubismLogError = (fmt, ...args) => {
        CubismLogPrintIn(LogLevel.LogLevel_Error, '[E]' + fmt, args);
    };
}
export class CubismDebug {
    static print(logLevel, format, args) {
        if (logLevel < CubismFramework.getLoggingLevel()) {
            return;
        }
        const logPrint = CubismFramework.coreLogFunction;
        if (!logPrint)
            return;
        const buffer = format.replace(/\{(\d+)\}/g, (m, k) => {
            return args[k];
        });
        logPrint(buffer);
    }
    static dumpBytes(logLevel, data, length) {
        for (let i = 0; i < length; i++) {
            if (i % 16 == 0 && i > 0)
                this.print(logLevel, '\n');
            else if (i % 8 == 0 && i > 0)
                this.print(logLevel, '  ');
            this.print(logLevel, '{0} ', [data[i] & 0xff]);
        }
        this.print(logLevel, '\n');
    }
    constructor() { }
}
import * as $ from './cubismdebug';
export var Live2DCubismFramework;
(function (Live2DCubismFramework) {
    Live2DCubismFramework.CubismDebug = $.CubismDebug;
})(Live2DCubismFramework || (Live2DCubismFramework = {}));
