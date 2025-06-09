export class csmVector {
    constructor(initialCapacity = 0) {
        if (initialCapacity < 1) {
            this._ptr = [];
            this._capacity = 0;
            this._size = 0;
        }
        else {
            this._ptr = new Array(initialCapacity);
            this._capacity = initialCapacity;
            this._size = 0;
        }
    }
    at(index) {
        return this._ptr[index];
    }
    set(index, value) {
        this._ptr[index] = value;
    }
    get(offset = 0) {
        const ret = new Array();
        for (let i = offset; i < this._size; i++) {
            ret.push(this._ptr[i]);
        }
        return ret;
    }
    pushBack(value) {
        if (this._size >= this._capacity) {
            this.prepareCapacity(this._capacity == 0 ? csmVector.DefaultSize : this._capacity * 2);
        }
        this._ptr[this._size++] = value;
    }
    clear() {
        this._ptr.length = 0;
        this._size = 0;
    }
    getSize() {
        return this._size;
    }
    assign(newSize, value) {
        const curSize = this._size;
        if (curSize < newSize) {
            this.prepareCapacity(newSize);
        }
        for (let i = 0; i < newSize; i++) {
            this._ptr[i] = value;
        }
        this._size = newSize;
    }
    resize(newSize, value = null) {
        this.updateSize(newSize, value, true);
    }
    updateSize(newSize, value = null, callPlacementNew = true) {
        const curSize = this._size;
        if (curSize < newSize) {
            this.prepareCapacity(newSize);
            if (callPlacementNew) {
                for (let i = this._size; i < newSize; i++) {
                    if (typeof value == 'function') {
                        this._ptr[i] = JSON.parse(JSON.stringify(new value()));
                    }
                    else {
                        this._ptr[i] = value;
                    }
                }
            }
            else {
                for (let i = this._size; i < newSize; i++) {
                    this._ptr[i] = value;
                }
            }
        }
        else {
            const sub = this._size - newSize;
            this._ptr.splice(this._size - sub, sub);
        }
        this._size = newSize;
    }
    insert(position, begin, end) {
        let dstSi = position._index;
        const srcSi = begin._index;
        const srcEi = end._index;
        const addCount = srcEi - srcSi;
        this.prepareCapacity(this._size + addCount);
        const addSize = this._size - dstSi;
        if (addSize > 0) {
            for (let i = 0; i < addSize; i++) {
                this._ptr.splice(dstSi + i, 0, null);
            }
        }
        for (let i = srcSi; i < srcEi; i++, dstSi++) {
            this._ptr[dstSi] = begin._vector._ptr[i];
        }
        this._size = this._size + addCount;
    }
    remove(index) {
        if (index < 0 || this._size <= index) {
            return false;
        }
        this._ptr.splice(index, 1);
        --this._size;
        return true;
    }
    erase(ite) {
        const index = ite._index;
        if (index < 0 || this._size <= index) {
            return ite;
        }
        this._ptr.splice(index, 1);
        --this._size;
        const ite2 = new iterator(this, index);
        return ite2;
    }
    prepareCapacity(newSize) {
        if (newSize > this._capacity) {
            if (this._capacity == 0) {
                this._ptr = new Array(newSize);
                this._capacity = newSize;
            }
            else {
                this._ptr.length = newSize;
                this._capacity = newSize;
            }
        }
    }
    begin() {
        const ite = this._size == 0 ? this.end() : new iterator(this, 0);
        return ite;
    }
    end() {
        const ite = new iterator(this, this._size);
        return ite;
    }
    getOffset(offset) {
        const newVector = new csmVector();
        newVector._ptr = this.get(offset);
        newVector._size = this.get(offset).length;
        newVector._capacity = this.get(offset).length;
        return newVector;
    }
}
csmVector.DefaultSize = 10;
export class iterator {
    constructor(v, index) {
        this._vector = v != undefined ? v : null;
        this._index = index != undefined ? index : 0;
    }
    set(ite) {
        this._index = ite._index;
        this._vector = ite._vector;
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
        const iteold = new iterator(this._vector, this._index++);
        return iteold;
    }
    decrement() {
        const iteold = new iterator(this._vector, this._index--);
        return iteold;
    }
    ptr() {
        return this._vector._ptr[this._index];
    }
    substitution(ite) {
        this._index = ite._index;
        this._vector = ite._vector;
        return this;
    }
    notEqual(ite) {
        return this._index != ite._index || this._vector != ite._vector;
    }
}
import * as $ from './csmvector';
export var Live2DCubismFramework;
(function (Live2DCubismFramework) {
    Live2DCubismFramework.csmVector = $.csmVector;
    Live2DCubismFramework.iterator = $.iterator;
})(Live2DCubismFramework || (Live2DCubismFramework = {}));
