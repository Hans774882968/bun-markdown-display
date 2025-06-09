export class CubismMatrix44 {
    constructor() {
        this._tr = new Float32Array(16);
        this.loadIdentity();
    }
    static multiply(a, b, dst) {
        const c = new Float32Array([
            0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0,
            0.0
        ]);
        const n = 4;
        for (let i = 0; i < n; ++i) {
            for (let j = 0; j < n; ++j) {
                for (let k = 0; k < n; ++k) {
                    c[j + i * 4] += a[k + i * 4] * b[j + k * 4];
                }
            }
        }
        for (let i = 0; i < 16; ++i) {
            dst[i] = c[i];
        }
    }
    loadIdentity() {
        const c = new Float32Array([
            1.0, 0.0, 0.0, 0.0, 0.0, 1.0, 0.0, 0.0, 0.0, 0.0, 1.0, 0.0, 0.0, 0.0, 0.0,
            1.0
        ]);
        this.setMatrix(c);
    }
    setMatrix(tr) {
        for (let i = 0; i < 16; ++i) {
            this._tr[i] = tr[i];
        }
    }
    getArray() {
        return this._tr;
    }
    getScaleX() {
        return this._tr[0];
    }
    getScaleY() {
        return this._tr[5];
    }
    getTranslateX() {
        return this._tr[12];
    }
    getTranslateY() {
        return this._tr[13];
    }
    transformX(src) {
        return this._tr[0] * src + this._tr[12];
    }
    transformY(src) {
        return this._tr[5] * src + this._tr[13];
    }
    invertTransformX(src) {
        return (src - this._tr[12]) / this._tr[0];
    }
    invertTransformY(src) {
        return (src - this._tr[13]) / this._tr[5];
    }
    translateRelative(x, y) {
        const tr1 = new Float32Array([
            1.0,
            0.0,
            0.0,
            0.0,
            0.0,
            1.0,
            0.0,
            0.0,
            0.0,
            0.0,
            1.0,
            0.0,
            x,
            y,
            0.0,
            1.0
        ]);
        CubismMatrix44.multiply(tr1, this._tr, this._tr);
    }
    translate(x, y) {
        this._tr[12] = x;
        this._tr[13] = y;
    }
    translateX(x) {
        this._tr[12] = x;
    }
    translateY(y) {
        this._tr[13] = y;
    }
    scaleRelative(x, y) {
        const tr1 = new Float32Array([
            x,
            0.0,
            0.0,
            0.0,
            0.0,
            y,
            0.0,
            0.0,
            0.0,
            0.0,
            1.0,
            0.0,
            0.0,
            0.0,
            0.0,
            1.0
        ]);
        CubismMatrix44.multiply(tr1, this._tr, this._tr);
    }
    scale(x, y) {
        this._tr[0] = x;
        this._tr[5] = y;
    }
    multiplyByMatrix(m) {
        CubismMatrix44.multiply(m.getArray(), this._tr, this._tr);
    }
    clone() {
        const cloneMatrix = new CubismMatrix44();
        for (let i = 0; i < this._tr.length; i++) {
            cloneMatrix._tr[i] = this._tr[i];
        }
        return cloneMatrix;
    }
}
import * as $ from './cubismmatrix44';
export var Live2DCubismFramework;
(function (Live2DCubismFramework) {
    Live2DCubismFramework.CubismMatrix44 = $.CubismMatrix44;
})(Live2DCubismFramework || (Live2DCubismFramework = {}));
