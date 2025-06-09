import { CubismMatrix44 } from '../framework/math/cubismmatrix44';
import { CubismViewMatrix } from '../framework/math/cubismviewmatrix';
import * as LAppDefine from './lappdefine';
import { LAppPal } from './lapppal';
import { LAppSprite } from './lappsprite';
import { TouchManager } from './touchmanager';
export class LAppView {
    constructor() {
        this._programId = null;
        this._back = null;
        this._gear = null;
        this._touchManager = new TouchManager();
        this._deviceToScreen = new CubismMatrix44();
        this._viewMatrix = new CubismViewMatrix();
    }
    initialize(subdelegate) {
        this._subdelegate = subdelegate;
        const { width, height } = subdelegate.getCanvas();
        const ratio = width / height;
        const left = -ratio;
        const right = ratio;
        const bottom = LAppDefine.ViewLogicalLeft;
        const top = LAppDefine.ViewLogicalRight;
        this._viewMatrix.setScreenRect(left, right, bottom, top);
        this._viewMatrix.scale(LAppDefine.ViewScale, LAppDefine.ViewScale);
        this._deviceToScreen.loadIdentity();
        if (width > height) {
            const screenW = Math.abs(right - left);
            this._deviceToScreen.scaleRelative(screenW / width, -screenW / width);
        }
        else {
            const screenH = Math.abs(top - bottom);
            this._deviceToScreen.scaleRelative(screenH / height, -screenH / height);
        }
        this._deviceToScreen.translateRelative(-width * 0.5, -height * 0.5);
        this._viewMatrix.setMaxScale(LAppDefine.ViewMaxScale);
        this._viewMatrix.setMinScale(LAppDefine.ViewMinScale);
        this._viewMatrix.setMaxScreenRect(LAppDefine.ViewLogicalMaxLeft, LAppDefine.ViewLogicalMaxRight, LAppDefine.ViewLogicalMaxBottom, LAppDefine.ViewLogicalMaxTop);
    }
    release() {
        this._viewMatrix = null;
        this._touchManager = null;
        this._deviceToScreen = null;
        this._gear.release();
        this._gear = null;
        this._back.release();
        this._back = null;
        this._subdelegate.getGlManager().getGl().deleteProgram(this._programId);
        this._programId = null;
    }
    render() {
        this._subdelegate.getGlManager().getGl().useProgram(this._programId);
        if (this._back) {
            this._back.render(this._programId);
        }
        if (this._gear) {
            this._gear.render(this._programId);
        }
        this._subdelegate.getGlManager().getGl().flush();
        const lapplive2dmanager = this._subdelegate.getLive2DManager();
        if (lapplive2dmanager != null) {
            lapplive2dmanager.setViewMatrix(this._viewMatrix);
            lapplive2dmanager.onUpdate();
        }
    }
    initializeSprite() {
        const width = this._subdelegate.getCanvas().width;
        const height = this._subdelegate.getCanvas().height;
        const textureManager = this._subdelegate.getTextureManager();
        const resourcesPath = LAppDefine.ResourcesPath;
        let imageName = '';
        imageName = LAppDefine.BackImageName;
        const initBackGroundTexture = (textureInfo) => {
            const x = width * 0.5;
            const y = height * 0.5;
            const fwidth = textureInfo.width * 2.0;
            const fheight = height * 0.95;
            this._back = new LAppSprite(x, y, fwidth, fheight, textureInfo.id);
            this._back.setSubdelegate(this._subdelegate);
        };
        textureManager.createTextureFromPngFile(resourcesPath + imageName, false, initBackGroundTexture);
        imageName = LAppDefine.GearImageName;
        const initGearTexture = (textureInfo) => {
            const x = width - textureInfo.width * 0.5;
            const y = height - textureInfo.height * 0.5;
            const fwidth = textureInfo.width;
            const fheight = textureInfo.height;
            this._gear = new LAppSprite(x, y, fwidth, fheight, textureInfo.id);
            this._gear.setSubdelegate(this._subdelegate);
        };
        textureManager.createTextureFromPngFile(resourcesPath + imageName, false, initGearTexture);
        if (this._programId == null) {
            this._programId = this._subdelegate.createShader();
        }
    }
    onTouchesBegan(pointX, pointY) {
        this._touchManager.touchesBegan(pointX * window.devicePixelRatio, pointY * window.devicePixelRatio);
    }
    onTouchesMoved(pointX, pointY) {
        const posX = pointX * window.devicePixelRatio;
        const posY = pointY * window.devicePixelRatio;
        const lapplive2dmanager = this._subdelegate.getLive2DManager();
        const viewX = this.transformViewX(this._touchManager.getX());
        const viewY = this.transformViewY(this._touchManager.getY());
        this._touchManager.touchesMoved(posX, posY);
        lapplive2dmanager.onDrag(viewX, viewY);
    }
    onTouchesEnded(pointX, pointY) {
        const posX = pointX * window.devicePixelRatio;
        const posY = pointY * window.devicePixelRatio;
        const lapplive2dmanager = this._subdelegate.getLive2DManager();
        lapplive2dmanager.onDrag(0.0, 0.0);
        const x = this.transformViewX(posX);
        const y = this.transformViewY(posY);
        if (LAppDefine.DebugTouchLogEnable) {
            LAppPal.printMessage(`[bun-markdown-display] touchesEnded x: ${x} y: ${y}`);
        }
        lapplive2dmanager.onTap(x, y);
        if (this._gear.isHit(posX, posY)) {
            lapplive2dmanager.nextScene();
        }
    }
    transformViewX(deviceX) {
        const screenX = this._deviceToScreen.transformX(deviceX);
        return this._viewMatrix.invertTransformX(screenX);
    }
    transformViewY(deviceY) {
        const screenY = this._deviceToScreen.transformY(deviceY);
        return this._viewMatrix.invertTransformY(screenY);
    }
    transformScreenX(deviceX) {
        return this._deviceToScreen.transformX(deviceX);
    }
    transformScreenY(deviceY) {
        return this._deviceToScreen.transformY(deviceY);
    }
}
