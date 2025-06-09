import { csmVector } from '../type/csmvector';
import { CubismId } from './cubismid';
export class CubismIdManager {
    constructor() {
        this._ids = new csmVector();
    }
    release() {
        for (let i = 0; i < this._ids.getSize(); ++i) {
            this._ids.set(i, void 0);
        }
        this._ids = null;
    }
    registerIds(ids) {
        for (let i = 0; i < ids.length; i++) {
            this.registerId(ids[i]);
        }
    }
    registerId(id) {
        let result = null;
        if ('string' == typeof id) {
            if ((result = this.findId(id)) != null) {
                return result;
            }
            result = CubismId.createIdInternal(id);
            this._ids.pushBack(result);
        }
        else {
            return this.registerId(id.s);
        }
        return result;
    }
    getId(id) {
        return this.registerId(id);
    }
    isExist(id) {
        if ('string' == typeof id) {
            return this.findId(id) != null;
        }
        return this.isExist(id.s);
    }
    findId(id) {
        for (let i = 0; i < this._ids.getSize(); ++i) {
            if (this._ids.at(i).getString().isEqual(id)) {
                return this._ids.at(i);
            }
        }
        return null;
    }
}
import * as $ from './cubismidmanager';
export var Live2DCubismFramework;
(function (Live2DCubismFramework) {
    Live2DCubismFramework.CubismIdManager = $.CubismIdManager;
})(Live2DCubismFramework || (Live2DCubismFramework = {}));
