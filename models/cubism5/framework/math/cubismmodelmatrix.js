import { CubismMatrix44 } from './cubismmatrix44';
export class CubismModelMatrix extends CubismMatrix44 {
    constructor(w, h) {
        super();
        this._width = w !== undefined ? w : 0.0;
        this._height = h !== undefined ? h : 0.0;
        this.setHeight(2.0);
    }
    setWidth(w) {
        const scaleX = w / this._width;
        const scaleY = scaleX;
        this.scale(scaleX, scaleY);
    }
    setHeight(h) {
        const scaleX = h / this._height;
        const scaleY = scaleX;
        this.scale(scaleX, scaleY);
    }
    setPosition(x, y) {
        this.translate(x, y);
    }
    setCenterPosition(x, y) {
        this.centerX(x);
        this.centerY(y);
    }
    top(y) {
        this.setY(y);
    }
    bottom(y) {
        const h = this._height * this.getScaleY();
        this.translateY(y - h);
    }
    left(x) {
        this.setX(x);
    }
    right(x) {
        const w = this._width * this.getScaleX();
        this.translateX(x - w);
    }
    centerX(x) {
        const w = this._width * this.getScaleX();
        this.translateX(x - w / 2.0);
    }
    setX(x) {
        this.translateX(x);
    }
    centerY(y) {
        const h = this._height * this.getScaleY();
        this.translateY(y - h / 2.0);
    }
    setY(y) {
        this.translateY(y);
    }
    setupFromLayout(layout) {
        const keyWidth = 'width';
        const keyHeight = 'height';
        const keyX = 'x';
        const keyY = 'y';
        const keyCenterX = 'center_x';
        const keyCenterY = 'center_y';
        const keyTop = 'top';
        const keyBottom = 'bottom';
        const keyLeft = 'left';
        const keyRight = 'right';
        for (const ite = layout.begin(); ite.notEqual(layout.end()); ite.preIncrement()) {
            const key = ite.ptr().first;
            const value = ite.ptr().second;
            if (key == keyWidth) {
                this.setWidth(value);
            }
            else if (key == keyHeight) {
                this.setHeight(value);
            }
        }
        for (const ite = layout.begin(); ite.notEqual(layout.end()); ite.preIncrement()) {
            const key = ite.ptr().first;
            const value = ite.ptr().second;
            if (key == keyX) {
                this.setX(value);
            }
            else if (key == keyY) {
                this.setY(value);
            }
            else if (key == keyCenterX) {
                this.centerX(value);
            }
            else if (key == keyCenterY) {
                this.centerY(value);
            }
            else if (key == keyTop) {
                this.top(value);
            }
            else if (key == keyBottom) {
                this.bottom(value);
            }
            else if (key == keyLeft) {
                this.left(value);
            }
            else if (key == keyRight) {
                this.right(value);
            }
        }
    }
}
import * as $ from './cubismmodelmatrix';
export var Live2DCubismFramework;
(function (Live2DCubismFramework) {
    Live2DCubismFramework.CubismModelMatrix = $.CubismModelMatrix;
})(Live2DCubismFramework || (Live2DCubismFramework = {}));
