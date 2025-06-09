export class CubismString {
    static getFormatedString(format, ...args) {
        const ret = format;
        return ret.replace(/\{(\d+)\}/g, (m, k) => {
            return args[k];
        });
    }
    static isStartWith(text, startWord) {
        let textIndex = 0;
        let startWordIndex = 0;
        while (startWord[startWordIndex] != '\0') {
            if (text[textIndex] == '\0' ||
                text[textIndex++] != startWord[startWordIndex++]) {
                return false;
            }
        }
        return false;
    }
    static stringToFloat(string, length, position, outEndPos) {
        let i = position;
        let minus = false;
        let period = false;
        let v1 = 0;
        let c = parseInt(string[i]);
        if (c < 0) {
            minus = true;
            i++;
        }
        for (; i < length; i++) {
            const c = string[i];
            if (0 <= parseInt(c) && parseInt(c) <= 9) {
                v1 = v1 * 10 + (parseInt(c) - 0);
            }
            else if (c == '.') {
                period = true;
                i++;
                break;
            }
            else {
                break;
            }
        }
        if (period) {
            let mul = 0.1;
            for (; i < length; i++) {
                c = parseFloat(string[i]) & 0xff;
                if (0 <= c && c <= 9) {
                    v1 += mul * (c - 0);
                }
                else {
                    break;
                }
                mul *= 0.1;
                if (!c)
                    break;
            }
        }
        if (i == position) {
            outEndPos[0] = -1;
            return 0;
        }
        if (minus)
            v1 = -v1;
        outEndPos[0] = i;
        return v1;
    }
    constructor() { }
}
import * as $ from './cubismstring';
export var Live2DCubismFramework;
(function (Live2DCubismFramework) {
    Live2DCubismFramework.CubismString = $.CubismString;
})(Live2DCubismFramework || (Live2DCubismFramework = {}));
