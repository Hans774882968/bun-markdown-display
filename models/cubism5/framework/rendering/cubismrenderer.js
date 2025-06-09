import { CubismMatrix44 } from '../math/cubismmatrix44';
import { csmRect } from '../type/csmrectf';
export class CubismRenderer {
    static create() {
        return null;
    }
    static delete(renderer) {
        renderer = null;
    }
    initialize(model) {
        this._model = model;
    }
    drawModel() {
        if (this.getModel() == null)
            return;
        this.saveProfile();
        this.doDrawModel();
        this.restoreProfile();
    }
    setMvpMatrix(matrix44) {
        this._mvpMatrix4x4.setMatrix(matrix44.getArray());
    }
    getMvpMatrix() {
        return this._mvpMatrix4x4;
    }
    setModelColor(red, green, blue, alpha) {
        if (red < 0.0) {
            red = 0.0;
        }
        else if (red > 1.0) {
            red = 1.0;
        }
        if (green < 0.0) {
            green = 0.0;
        }
        else if (green > 1.0) {
            green = 1.0;
        }
        if (blue < 0.0) {
            blue = 0.0;
        }
        else if (blue > 1.0) {
            blue = 1.0;
        }
        if (alpha < 0.0) {
            alpha = 0.0;
        }
        else if (alpha > 1.0) {
            alpha = 1.0;
        }
        this._modelColor.r = red;
        this._modelColor.g = green;
        this._modelColor.b = blue;
        this._modelColor.a = alpha;
    }
    getModelColor() {
        return JSON.parse(JSON.stringify(this._modelColor));
    }
    getModelColorWithOpacity(opacity) {
        const modelColorRGBA = this.getModelColor();
        modelColorRGBA.a *= opacity;
        if (this.isPremultipliedAlpha()) {
            modelColorRGBA.r *= modelColorRGBA.a;
            modelColorRGBA.g *= modelColorRGBA.a;
            modelColorRGBA.b *= modelColorRGBA.a;
        }
        return modelColorRGBA;
    }
    setIsPremultipliedAlpha(enable) {
        this._isPremultipliedAlpha = enable;
    }
    isPremultipliedAlpha() {
        return this._isPremultipliedAlpha;
    }
    setIsCulling(culling) {
        this._isCulling = culling;
    }
    isCulling() {
        return this._isCulling;
    }
    setAnisotropy(n) {
        this._anisotropy = n;
    }
    getAnisotropy() {
        return this._anisotropy;
    }
    getModel() {
        return this._model;
    }
    useHighPrecisionMask(high) {
        this._useHighPrecisionMask = high;
    }
    isUsingHighPrecisionMask() {
        return this._useHighPrecisionMask;
    }
    constructor() {
        this._isCulling = false;
        this._isPremultipliedAlpha = false;
        this._anisotropy = 0.0;
        this._model = null;
        this._modelColor = new CubismTextureColor();
        this._useHighPrecisionMask = false;
        this._mvpMatrix4x4 = new CubismMatrix44();
        this._mvpMatrix4x4.loadIdentity();
    }
}
export var CubismBlendMode;
(function (CubismBlendMode) {
    CubismBlendMode[CubismBlendMode["CubismBlendMode_Normal"] = 0] = "CubismBlendMode_Normal";
    CubismBlendMode[CubismBlendMode["CubismBlendMode_Additive"] = 1] = "CubismBlendMode_Additive";
    CubismBlendMode[CubismBlendMode["CubismBlendMode_Multiplicative"] = 2] = "CubismBlendMode_Multiplicative";
})(CubismBlendMode || (CubismBlendMode = {}));
export class CubismTextureColor {
    constructor(r = 1.0, g = 1.0, b = 1.0, a = 1.0) {
        this.r = r;
        this.g = g;
        this.b = b;
        this.a = a;
    }
}
export class CubismClippingContext {
    constructor(clippingDrawableIndices, clipCount) {
        this._clippingIdList = clippingDrawableIndices;
        this._clippingIdCount = clipCount;
        this._allClippedDrawRect = new csmRect();
        this._layoutBounds = new csmRect();
        this._clippedDrawableIndexList = [];
        this._matrixForMask = new CubismMatrix44();
        this._matrixForDraw = new CubismMatrix44();
        this._bufferIndex = 0;
    }
    release() {
        if (this._layoutBounds != null) {
            this._layoutBounds = null;
        }
        if (this._allClippedDrawRect != null) {
            this._allClippedDrawRect = null;
        }
        if (this._clippedDrawableIndexList != null) {
            this._clippedDrawableIndexList = null;
        }
    }
    addClippedDrawable(drawableIndex) {
        this._clippedDrawableIndexList.push(drawableIndex);
    }
}
import * as $ from './cubismrenderer';
export var Live2DCubismFramework;
(function (Live2DCubismFramework) {
    Live2DCubismFramework.CubismBlendMode = $.CubismBlendMode;
    Live2DCubismFramework.CubismRenderer = $.CubismRenderer;
    Live2DCubismFramework.CubismTextureColor = $.CubismTextureColor;
})(Live2DCubismFramework || (Live2DCubismFramework = {}));
