export class csmString {
    append(c, length) {
        this.s += length !== undefined ? c.substr(0, length) : c;
        return this;
    }
    expansion(length, v) {
        for (let i = 0; i < length; i++) {
            this.append(v);
        }
        return this;
    }
    getBytes() {
        return encodeURIComponent(this.s).replace(/%../g, 'x').length;
    }
    getLength() {
        return this.s.length;
    }
    isLess(s) {
        return this.s < s.s;
    }
    isGreat(s) {
        return this.s > s.s;
    }
    isEqual(s) {
        return this.s == s;
    }
    isEmpty() {
        return this.s.length == 0;
    }
    constructor(s) {
        this.s = s;
    }
}
import * as $ from './csmstring';
export var Live2DCubismFramework;
(function (Live2DCubismFramework) {
    Live2DCubismFramework.csmString = $.csmString;
})(Live2DCubismFramework || (Live2DCubismFramework = {}));
