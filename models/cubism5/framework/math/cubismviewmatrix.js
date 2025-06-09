import { CubismMatrix44 } from './cubismmatrix44';
export class CubismViewMatrix extends CubismMatrix44 {
    constructor() {
        super();
        this._screenLeft = 0.0;
        this._screenRight = 0.0;
        this._screenTop = 0.0;
        this._screenBottom = 0.0;
        this._maxLeft = 0.0;
        this._maxRight = 0.0;
        this._maxTop = 0.0;
        this._maxBottom = 0.0;
        this._maxScale = 0.0;
        this._minScale = 0.0;
    }
    adjustTranslate(x, y) {
        if (this._tr[0] * this._maxLeft + (this._tr[12] + x) > this._screenLeft) {
            x = this._screenLeft - this._tr[0] * this._maxLeft - this._tr[12];
        }
        if (this._tr[0] * this._maxRight + (this._tr[12] + x) < this._screenRight) {
            x = this._screenRight - this._tr[0] * this._maxRight - this._tr[12];
        }
        if (this._tr[5] * this._maxTop + (this._tr[13] + y) < this._screenTop) {
            y = this._screenTop - this._tr[5] * this._maxTop - this._tr[13];
        }
        if (this._tr[5] * this._maxBottom + (this._tr[13] + y) >
            this._screenBottom) {
            y = this._screenBottom - this._tr[5] * this._maxBottom - this._tr[13];
        }
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
    adjustScale(cx, cy, scale) {
        const maxScale = this.getMaxScale();
        const minScale = this.getMinScale();
        const targetScale = scale * this._tr[0];
        if (targetScale < minScale) {
            if (this._tr[0] > 0.0) {
                scale = minScale / this._tr[0];
            }
        }
        else if (targetScale > maxScale) {
            if (this._tr[0] > 0.0) {
                scale = maxScale / this._tr[0];
            }
        }
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
            cx,
            cy,
            0.0,
            1.0
        ]);
        const tr2 = new Float32Array([
            scale,
            0.0,
            0.0,
            0.0,
            0.0,
            scale,
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
        const tr3 = new Float32Array([
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
            -cx,
            -cy,
            0.0,
            1.0
        ]);
        CubismMatrix44.multiply(tr3, this._tr, this._tr);
        CubismMatrix44.multiply(tr2, this._tr, this._tr);
        CubismMatrix44.multiply(tr1, this._tr, this._tr);
    }
    setScreenRect(left, right, bottom, top) {
        this._screenLeft = left;
        this._screenRight = right;
        this._screenBottom = bottom;
        this._screenTop = top;
    }
    setMaxScreenRect(left, right, bottom, top) {
        this._maxLeft = left;
        this._maxRight = right;
        this._maxTop = top;
        this._maxBottom = bottom;
    }
    setMaxScale(maxScale) {
        this._maxScale = maxScale;
    }
    setMinScale(minScale) {
        this._minScale = minScale;
    }
    getMaxScale() {
        return this._maxScale;
    }
    getMinScale() {
        return this._minScale;
    }
    isMaxScale() {
        return this.getScaleX() >= this._maxScale;
    }
    isMinScale() {
        return this.getScaleX() <= this._minScale;
    }
    getScreenLeft() {
        return this._screenLeft;
    }
    getScreenRight() {
        return this._screenRight;
    }
    getScreenBottom() {
        return this._screenBottom;
    }
    getScreenTop() {
        return this._screenTop;
    }
    getMaxLeft() {
        return this._maxLeft;
    }
    getMaxRight() {
        return this._maxRight;
    }
    getMaxBottom() {
        return this._maxBottom;
    }
    getMaxTop() {
        return this._maxTop;
    }
}
import * as $ from './cubismviewmatrix';
export var Live2DCubismFramework;
(function (Live2DCubismFramework) {
    Live2DCubismFramework.CubismViewMatrix = $.CubismViewMatrix;
})(Live2DCubismFramework || (Live2DCubismFramework = {}));
