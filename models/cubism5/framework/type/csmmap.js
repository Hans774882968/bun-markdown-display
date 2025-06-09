import { CubismLogDebug, CubismLogWarning } from '../utils/cubismdebug';
export class csmPair {
    constructor(key, value) {
        this.first = key == undefined ? null : key;
        this.second = value == undefined ? null : value;
    }
}
export class csmMap {
    constructor(size) {
        if (size != undefined) {
            if (size < 1) {
                this._keyValues = [];
                this._dummyValue = null;
                this._size = 0;
            }
            else {
                this._keyValues = new Array(size);
                this._size = size;
            }
        }
        else {
            this._keyValues = [];
            this._dummyValue = null;
            this._size = 0;
        }
    }
    release() {
        this.clear();
    }
    appendKey(key) {
        let findIndex = -1;
        for (let i = 0; i < this._size; i++) {
            if (this._keyValues[i].first == key) {
                findIndex = i;
                break;
            }
        }
        if (findIndex != -1) {
            CubismLogWarning('The key `{0}` is already append.', key);
            return;
        }
        this.prepareCapacity(this._size + 1, false);
        this._keyValues[this._size] = new csmPair(key);
        this._size += 1;
    }
    getValue(key) {
        let found = -1;
        for (let i = 0; i < this._size; i++) {
            if (this._keyValues[i].first == key) {
                found = i;
                break;
            }
        }
        if (found >= 0) {
            return this._keyValues[found].second;
        }
        else {
            this.appendKey(key);
            return this._keyValues[this._size - 1].second;
        }
    }
    setValue(key, value) {
        let found = -1;
        for (let i = 0; i < this._size; i++) {
            if (this._keyValues[i].first == key) {
                found = i;
                break;
            }
        }
        if (found >= 0) {
            this._keyValues[found].second = value;
        }
        else {
            this.appendKey(key);
            this._keyValues[this._size - 1].second = value;
        }
    }
    isExist(key) {
        for (let i = 0; i < this._size; i++) {
            if (this._keyValues[i].first == key) {
                return true;
            }
        }
        return false;
    }
    clear() {
        this._keyValues = void 0;
        this._keyValues = null;
        this._keyValues = [];
        this._size = 0;
    }
    getSize() {
        return this._size;
    }
    prepareCapacity(newSize, fitToSize) {
        if (newSize > this._keyValues.length) {
            if (this._keyValues.length == 0) {
                if (!fitToSize && newSize < csmMap.DefaultSize)
                    newSize = csmMap.DefaultSize;
                this._keyValues.length = newSize;
            }
            else {
                if (!fitToSize && newSize < this._keyValues.length * 2)
                    newSize = this._keyValues.length * 2;
                this._keyValues.length = newSize;
            }
        }
    }
    begin() {
        const ite = new iterator(this, 0);
        return ite;
    }
    end() {
        const ite = new iterator(this, this._size);
        return ite;
    }
    erase(ite) {
        const index = ite._index;
        if (index < 0 || this._size <= index) {
            return ite;
        }
        this._keyValues.splice(index, 1);
        --this._size;
        const ite2 = new iterator(this, index);
        return ite2;
    }
    dumpAsInt() {
        for (let i = 0; i < this._size; i++) {
            CubismLogDebug('{0} ,', this._keyValues[i]);
            CubismLogDebug('\n');
        }
    }
}
csmMap.DefaultSize = 10;
export class iterator {
    constructor(v, idx) {
        this._map = v != undefined ? v : new csmMap();
        this._index = idx != undefined ? idx : 0;
    }
    set(ite) {
        this._index = ite._index;
        this._map = ite._map;
        return this;
    }
    preIncrement() {
        ++this._index;
        return this;
    }
    preDecrement() {
        --this._index;
        return this;
    }
    increment() {
        const iteold = new iterator(this._map, this._index++);
        return iteold;
    }
    decrement() {
        const iteold = new iterator(this._map, this._index);
        this._map = iteold._map;
        this._index = iteold._index;
        return this;
    }
    ptr() {
        return this._map._keyValues[this._index];
    }
    notEqual(ite) {
        return this._index != ite._index || this._map != ite._map;
    }
}
import * as $ from './csmmap';
export var Live2DCubismFramework;
(function (Live2DCubismFramework) {
    Live2DCubismFramework.csmMap = $.csmMap;
    Live2DCubismFramework.csmPair = $.csmPair;
    Live2DCubismFramework.iterator = $.iterator;
})(Live2DCubismFramework || (Live2DCubismFramework = {}));
