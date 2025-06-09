import { csmString } from '../type/csmstring';
export class CubismId {
    static createIdInternal(id) {
        return new CubismId(id);
    }
    getString() {
        return this._id;
    }
    isEqual(c) {
        if (typeof c === 'string') {
            return this._id.isEqual(c);
        }
        else if (c instanceof csmString) {
            return this._id.isEqual(c.s);
        }
        else if (c instanceof CubismId) {
            return this._id.isEqual(c._id.s);
        }
        return false;
    }
    isNotEqual(c) {
        if (typeof c == 'string') {
            return !this._id.isEqual(c);
        }
        else if (c instanceof csmString) {
            return !this._id.isEqual(c.s);
        }
        else if (c instanceof CubismId) {
            return !this._id.isEqual(c._id.s);
        }
        return false;
    }
    constructor(id) {
        if (typeof id === 'string') {
            this._id = new csmString(id);
            return;
        }
        this._id = id;
    }
}
import * as $ from './cubismid';
export var Live2DCubismFramework;
(function (Live2DCubismFramework) {
    Live2DCubismFramework.CubismId = $.CubismId;
})(Live2DCubismFramework || (Live2DCubismFramework = {}));
