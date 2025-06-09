import { Constant } from '../live2dcubismframework';
import { csmVector } from '../type/csmvector';
import { csmRect } from '../type/csmrectf';
import { CubismMatrix44 } from '../math/cubismmatrix44';
import { CubismTextureColor } from './cubismrenderer';
import { CubismLogError, CubismLogWarning } from '../utils/cubismdebug';
const ColorChannelCount = 4;
const ClippingMaskMaxCountOnDefault = 36;
const ClippingMaskMaxCountOnMultiRenderTexture = 32;
export class CubismClippingManager {
    constructor(clippingContextFactory) {
        this._renderTextureCount = 0;
        this._clippingMaskBufferSize = 256;
        this._clippingContextListForMask = new csmVector();
        this._clippingContextListForDraw = new csmVector();
        this._channelColors = new csmVector();
        this._tmpBoundsOnModel = new csmRect();
        this._tmpMatrix = new CubismMatrix44();
        this._tmpMatrixForMask = new CubismMatrix44();
        this._tmpMatrixForDraw = new CubismMatrix44();
        this._clippingContexttConstructor = clippingContextFactory;
        let tmp = new CubismTextureColor();
        tmp.r = 1.0;
        tmp.g = 0.0;
        tmp.b = 0.0;
        tmp.a = 0.0;
        this._channelColors.pushBack(tmp);
        tmp = new CubismTextureColor();
        tmp.r = 0.0;
        tmp.g = 1.0;
        tmp.b = 0.0;
        tmp.a = 0.0;
        this._channelColors.pushBack(tmp);
        tmp = new CubismTextureColor();
        tmp.r = 0.0;
        tmp.g = 0.0;
        tmp.b = 1.0;
        tmp.a = 0.0;
        this._channelColors.pushBack(tmp);
        tmp = new CubismTextureColor();
        tmp.r = 0.0;
        tmp.g = 0.0;
        tmp.b = 0.0;
        tmp.a = 1.0;
        this._channelColors.pushBack(tmp);
    }
    release() {
        for (let i = 0; i < this._clippingContextListForMask.getSize(); i++) {
            if (this._clippingContextListForMask.at(i)) {
                this._clippingContextListForMask.at(i).release();
                this._clippingContextListForMask.set(i, void 0);
            }
            this._clippingContextListForMask.set(i, null);
        }
        this._clippingContextListForMask = null;
        for (let i = 0; i < this._clippingContextListForDraw.getSize(); i++) {
            this._clippingContextListForDraw.set(i, null);
        }
        this._clippingContextListForDraw = null;
        for (let i = 0; i < this._channelColors.getSize(); i++) {
            this._channelColors.set(i, null);
        }
        this._channelColors = null;
        if (this._clearedFrameBufferFlags != null) {
            this._clearedFrameBufferFlags.clear();
        }
        this._clearedFrameBufferFlags = null;
    }
    initialize(model, renderTextureCount) {
        if (renderTextureCount % 1 != 0) {
            CubismLogWarning('The number of render textures must be specified as an integer. The decimal point is rounded down and corrected to an integer.');
            renderTextureCount = ~~renderTextureCount;
        }
        if (renderTextureCount < 1) {
            CubismLogWarning('The number of render textures must be an integer greater than or equal to 1. Set the number of render textures to 1.');
        }
        this._renderTextureCount = renderTextureCount < 1 ? 1 : renderTextureCount;
        this._clearedFrameBufferFlags = new csmVector(this._renderTextureCount);
        for (let i = 0; i < model.getDrawableCount(); i++) {
            if (model.getDrawableMaskCounts()[i] <= 0) {
                this._clippingContextListForDraw.pushBack(null);
                continue;
            }
            let clippingContext = this.findSameClip(model.getDrawableMasks()[i], model.getDrawableMaskCounts()[i]);
            if (clippingContext == null) {
                clippingContext = new this._clippingContexttConstructor(this, model.getDrawableMasks()[i], model.getDrawableMaskCounts()[i]);
                this._clippingContextListForMask.pushBack(clippingContext);
            }
            clippingContext.addClippedDrawable(i);
            this._clippingContextListForDraw.pushBack(clippingContext);
        }
    }
    findSameClip(drawableMasks, drawableMaskCounts) {
        for (let i = 0; i < this._clippingContextListForMask.getSize(); i++) {
            const clippingContext = this._clippingContextListForMask.at(i);
            const count = clippingContext._clippingIdCount;
            if (count != drawableMaskCounts) {
                continue;
            }
            let sameCount = 0;
            for (let j = 0; j < count; j++) {
                const clipId = clippingContext._clippingIdList[j];
                for (let k = 0; k < count; k++) {
                    if (drawableMasks[k] == clipId) {
                        sameCount++;
                        break;
                    }
                }
            }
            if (sameCount == count) {
                return clippingContext;
            }
        }
        return null;
    }
    setupMatrixForHighPrecision(model, isRightHanded) {
        let usingClipCount = 0;
        for (let clipIndex = 0; clipIndex < this._clippingContextListForMask.getSize(); clipIndex++) {
            const cc = this._clippingContextListForMask.at(clipIndex);
            this.calcClippedDrawTotalBounds(model, cc);
            if (cc._isUsing) {
                usingClipCount++;
            }
        }
        if (usingClipCount > 0) {
            this.setupLayoutBounds(0);
            if (this._clearedFrameBufferFlags.getSize() != this._renderTextureCount) {
                this._clearedFrameBufferFlags.clear();
                for (let i = 0; i < this._renderTextureCount; i++) {
                    this._clearedFrameBufferFlags.pushBack(false);
                }
            }
            else {
                for (let i = 0; i < this._renderTextureCount; i++) {
                    this._clearedFrameBufferFlags.set(i, false);
                }
            }
            for (let clipIndex = 0; clipIndex < this._clippingContextListForMask.getSize(); clipIndex++) {
                const clipContext = this._clippingContextListForMask.at(clipIndex);
                const allClippedDrawRect = clipContext._allClippedDrawRect;
                const layoutBoundsOnTex01 = clipContext._layoutBounds;
                const margin = 0.05;
                let scaleX = 0.0;
                let scaleY = 0.0;
                const ppu = model.getPixelsPerUnit();
                const maskPixelSize = clipContext
                    .getClippingManager()
                    .getClippingMaskBufferSize();
                const physicalMaskWidth = layoutBoundsOnTex01.width * maskPixelSize;
                const physicalMaskHeight = layoutBoundsOnTex01.height * maskPixelSize;
                this._tmpBoundsOnModel.setRect(allClippedDrawRect);
                if (this._tmpBoundsOnModel.width * ppu > physicalMaskWidth) {
                    this._tmpBoundsOnModel.expand(allClippedDrawRect.width * margin, 0.0);
                    scaleX = layoutBoundsOnTex01.width / this._tmpBoundsOnModel.width;
                }
                else {
                    scaleX = ppu / physicalMaskWidth;
                }
                if (this._tmpBoundsOnModel.height * ppu > physicalMaskHeight) {
                    this._tmpBoundsOnModel.expand(0.0, allClippedDrawRect.height * margin);
                    scaleY = layoutBoundsOnTex01.height / this._tmpBoundsOnModel.height;
                }
                else {
                    scaleY = ppu / physicalMaskHeight;
                }
                this.createMatrixForMask(isRightHanded, layoutBoundsOnTex01, scaleX, scaleY);
                clipContext._matrixForMask.setMatrix(this._tmpMatrixForMask.getArray());
                clipContext._matrixForDraw.setMatrix(this._tmpMatrixForDraw.getArray());
            }
        }
    }
    createMatrixForMask(isRightHanded, layoutBoundsOnTex01, scaleX, scaleY) {
        this._tmpMatrix.loadIdentity();
        {
            this._tmpMatrix.translateRelative(-1.0, -1.0);
            this._tmpMatrix.scaleRelative(2.0, 2.0);
        }
        {
            this._tmpMatrix.translateRelative(layoutBoundsOnTex01.x, layoutBoundsOnTex01.y);
            this._tmpMatrix.scaleRelative(scaleX, scaleY);
            this._tmpMatrix.translateRelative(-this._tmpBoundsOnModel.x, -this._tmpBoundsOnModel.y);
        }
        this._tmpMatrixForMask.setMatrix(this._tmpMatrix.getArray());
        this._tmpMatrix.loadIdentity();
        {
            this._tmpMatrix.translateRelative(layoutBoundsOnTex01.x, layoutBoundsOnTex01.y * (isRightHanded ? -1.0 : 1.0));
            this._tmpMatrix.scaleRelative(scaleX, scaleY * (isRightHanded ? -1.0 : 1.0));
            this._tmpMatrix.translateRelative(-this._tmpBoundsOnModel.x, -this._tmpBoundsOnModel.y);
        }
        this._tmpMatrixForDraw.setMatrix(this._tmpMatrix.getArray());
    }
    setupLayoutBounds(usingClipCount) {
        const useClippingMaskMaxCount = this._renderTextureCount <= 1
            ? ClippingMaskMaxCountOnDefault
            : ClippingMaskMaxCountOnMultiRenderTexture * this._renderTextureCount;
        if (usingClipCount <= 0 || usingClipCount > useClippingMaskMaxCount) {
            if (usingClipCount > useClippingMaskMaxCount) {
                CubismLogError('not supported mask count : {0}\n[Details] render texture count : {1}, mask count : {2}', usingClipCount - useClippingMaskMaxCount, this._renderTextureCount, usingClipCount);
            }
            for (let index = 0; index < this._clippingContextListForMask.getSize(); index++) {
                const clipContext = this._clippingContextListForMask.at(index);
                clipContext._layoutChannelIndex = 0;
                clipContext._layoutBounds.x = 0.0;
                clipContext._layoutBounds.y = 0.0;
                clipContext._layoutBounds.width = 1.0;
                clipContext._layoutBounds.height = 1.0;
                clipContext._bufferIndex = 0;
            }
            return;
        }
        const layoutCountMaxValue = this._renderTextureCount <= 1 ? 9 : 8;
        let countPerSheetDiv = usingClipCount / this._renderTextureCount;
        const reduceLayoutTextureCount = usingClipCount % this._renderTextureCount;
        countPerSheetDiv = Math.ceil(countPerSheetDiv);
        let divCount = countPerSheetDiv / ColorChannelCount;
        const modCount = countPerSheetDiv % ColorChannelCount;
        divCount = ~~divCount;
        let curClipIndex = 0;
        for (let renderTextureIndex = 0; renderTextureIndex < this._renderTextureCount; renderTextureIndex++) {
            for (let channelIndex = 0; channelIndex < ColorChannelCount; channelIndex++) {
                let layoutCount = divCount + (channelIndex < modCount ? 1 : 0);
                const checkChannelIndex = modCount + (divCount < 1 ? -1 : 0);
                if (channelIndex == checkChannelIndex && reduceLayoutTextureCount > 0) {
                    layoutCount -= !(renderTextureIndex < reduceLayoutTextureCount)
                        ? 1
                        : 0;
                }
                if (layoutCount == 0) {
                }
                else if (layoutCount == 1) {
                    const clipContext = this._clippingContextListForMask.at(curClipIndex++);
                    clipContext._layoutChannelIndex = channelIndex;
                    clipContext._layoutBounds.x = 0.0;
                    clipContext._layoutBounds.y = 0.0;
                    clipContext._layoutBounds.width = 1.0;
                    clipContext._layoutBounds.height = 1.0;
                    clipContext._bufferIndex = renderTextureIndex;
                }
                else if (layoutCount == 2) {
                    for (let i = 0; i < layoutCount; i++) {
                        let xpos = i % 2;
                        xpos = ~~xpos;
                        const cc = this._clippingContextListForMask.at(curClipIndex++);
                        cc._layoutChannelIndex = channelIndex;
                        cc._layoutBounds.x = xpos * 0.5;
                        cc._layoutBounds.y = 0.0;
                        cc._layoutBounds.width = 0.5;
                        cc._layoutBounds.height = 1.0;
                        cc._bufferIndex = renderTextureIndex;
                    }
                }
                else if (layoutCount <= 4) {
                    for (let i = 0; i < layoutCount; i++) {
                        let xpos = i % 2;
                        let ypos = i / 2;
                        xpos = ~~xpos;
                        ypos = ~~ypos;
                        const cc = this._clippingContextListForMask.at(curClipIndex++);
                        cc._layoutChannelIndex = channelIndex;
                        cc._layoutBounds.x = xpos * 0.5;
                        cc._layoutBounds.y = ypos * 0.5;
                        cc._layoutBounds.width = 0.5;
                        cc._layoutBounds.height = 0.5;
                        cc._bufferIndex = renderTextureIndex;
                    }
                }
                else if (layoutCount <= layoutCountMaxValue) {
                    for (let i = 0; i < layoutCount; i++) {
                        let xpos = i % 3;
                        let ypos = i / 3;
                        xpos = ~~xpos;
                        ypos = ~~ypos;
                        const cc = this._clippingContextListForMask.at(curClipIndex++);
                        cc._layoutChannelIndex = channelIndex;
                        cc._layoutBounds.x = xpos / 3.0;
                        cc._layoutBounds.y = ypos / 3.0;
                        cc._layoutBounds.width = 1.0 / 3.0;
                        cc._layoutBounds.height = 1.0 / 3.0;
                        cc._bufferIndex = renderTextureIndex;
                    }
                }
                else {
                    CubismLogError('not supported mask count : {0}\n[Details] render texture count : {1}, mask count : {2}', usingClipCount - useClippingMaskMaxCount, this._renderTextureCount, usingClipCount);
                    for (let index = 0; index < layoutCount; index++) {
                        const cc = this._clippingContextListForMask.at(curClipIndex++);
                        cc._layoutChannelIndex = 0;
                        cc._layoutBounds.x = 0.0;
                        cc._layoutBounds.y = 0.0;
                        cc._layoutBounds.width = 1.0;
                        cc._layoutBounds.height = 1.0;
                        cc._bufferIndex = 0;
                    }
                }
            }
        }
    }
    calcClippedDrawTotalBounds(model, clippingContext) {
        let clippedDrawTotalMinX = Number.MAX_VALUE;
        let clippedDrawTotalMinY = Number.MAX_VALUE;
        let clippedDrawTotalMaxX = Number.MIN_VALUE;
        let clippedDrawTotalMaxY = Number.MIN_VALUE;
        const clippedDrawCount = clippingContext._clippedDrawableIndexList.length;
        for (let clippedDrawableIndex = 0; clippedDrawableIndex < clippedDrawCount; clippedDrawableIndex++) {
            const drawableIndex = clippingContext._clippedDrawableIndexList[clippedDrawableIndex];
            const drawableVertexCount = model.getDrawableVertexCount(drawableIndex);
            const drawableVertexes = model.getDrawableVertices(drawableIndex);
            let minX = Number.MAX_VALUE;
            let minY = Number.MAX_VALUE;
            let maxX = -Number.MAX_VALUE;
            let maxY = -Number.MAX_VALUE;
            const loop = drawableVertexCount * Constant.vertexStep;
            for (let pi = Constant.vertexOffset; pi < loop; pi += Constant.vertexStep) {
                const x = drawableVertexes[pi];
                const y = drawableVertexes[pi + 1];
                if (x < minX) {
                    minX = x;
                }
                if (x > maxX) {
                    maxX = x;
                }
                if (y < minY) {
                    minY = y;
                }
                if (y > maxY) {
                    maxY = y;
                }
            }
            if (minX == Number.MAX_VALUE) {
                continue;
            }
            if (minX < clippedDrawTotalMinX) {
                clippedDrawTotalMinX = minX;
            }
            if (minY < clippedDrawTotalMinY) {
                clippedDrawTotalMinY = minY;
            }
            if (maxX > clippedDrawTotalMaxX) {
                clippedDrawTotalMaxX = maxX;
            }
            if (maxY > clippedDrawTotalMaxY) {
                clippedDrawTotalMaxY = maxY;
            }
            if (clippedDrawTotalMinX == Number.MAX_VALUE) {
                clippingContext._allClippedDrawRect.x = 0.0;
                clippingContext._allClippedDrawRect.y = 0.0;
                clippingContext._allClippedDrawRect.width = 0.0;
                clippingContext._allClippedDrawRect.height = 0.0;
                clippingContext._isUsing = false;
            }
            else {
                clippingContext._isUsing = true;
                const w = clippedDrawTotalMaxX - clippedDrawTotalMinX;
                const h = clippedDrawTotalMaxY - clippedDrawTotalMinY;
                clippingContext._allClippedDrawRect.x = clippedDrawTotalMinX;
                clippingContext._allClippedDrawRect.y = clippedDrawTotalMinY;
                clippingContext._allClippedDrawRect.width = w;
                clippingContext._allClippedDrawRect.height = h;
            }
        }
    }
    getClippingContextListForDraw() {
        return this._clippingContextListForDraw;
    }
    getClippingMaskBufferSize() {
        return this._clippingMaskBufferSize;
    }
    getRenderTextureCount() {
        return this._renderTextureCount;
    }
    getChannelFlagAsColor(channelNo) {
        return this._channelColors.at(channelNo);
    }
    setClippingMaskBufferSize(size) {
        this._clippingMaskBufferSize = size;
    }
}
