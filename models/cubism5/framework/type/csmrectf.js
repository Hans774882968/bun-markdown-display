export class csmRect {
    constructor(x, y, w, h) {
        this.x = x;
        this.y = y;
        this.width = w;
        this.height = h;
    }
    getCenterX() {
        return this.x + 0.5 * this.width;
    }
    getCenterY() {
        return this.y + 0.5 * this.height;
    }
    getRight() {
        return this.x + this.width;
    }
    getBottom() {
        return this.y + this.height;
    }
    setRect(r) {
        this.x = r.x;
        this.y = r.y;
        this.width = r.width;
        this.height = r.height;
    }
    expand(w, h) {
        this.x -= w;
        this.y -= h;
        this.width += w * 2.0;
        this.height += h * 2.0;
    }
}
import * as $ from './csmrectf';
export var Live2DCubismFramework;
(function (Live2DCubismFramework) {
    Live2DCubismFramework.csmRect = $.csmRect;
})(Live2DCubismFramework || (Live2DCubismFramework = {}));
