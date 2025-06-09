import { CubismFramework } from '../live2dcubismframework';
import { CubismMath } from '../math/cubismmath';
import { CubismBlendMode, CubismTextureColor } from '../rendering/cubismrenderer';
import { csmMap } from '../type/csmmap';
import { csmVector } from '../type/csmvector';
import { CSM_ASSERT, CubismLogWarning } from '../utils/cubismdebug';
export class ParameterRepeatData {
    constructor(isOverridden = false, isParameterRepeated = false) {
        this.isOverridden = isOverridden;
        this.isParameterRepeated = isParameterRepeated;
    }
}
export class DrawableColorData {
    constructor(isOverridden = false, color = new CubismTextureColor()) {
        this.isOverridden = isOverridden;
        this.color = color;
    }
    get isOverwritten() {
        return this.isOverridden;
    }
}
export class PartColorData {
    constructor(isOverridden = false, color = new CubismTextureColor()) {
        this.isOverridden = isOverridden;
        this.color = color;
    }
    get isOverwritten() {
        return this.isOverridden;
    }
}
export class DrawableCullingData {
    constructor(isOverridden = false, isCulling = false) {
        this.isOverridden = isOverridden;
        this.isCulling = isCulling;
    }
    get isOverwritten() {
        return this.isOverridden;
    }
}
export class CubismModel {
    update() {
        this._model.update();
        this._model.drawables.resetDynamicFlags();
    }
    getPixelsPerUnit() {
        if (this._model == null) {
            return 0.0;
        }
        return this._model.canvasinfo.PixelsPerUnit;
    }
    getCanvasWidth() {
        if (this._model == null) {
            return 0.0;
        }
        return (this._model.canvasinfo.CanvasWidth / this._model.canvasinfo.PixelsPerUnit);
    }
    getCanvasHeight() {
        if (this._model == null) {
            return 0.0;
        }
        return (this._model.canvasinfo.CanvasHeight / this._model.canvasinfo.PixelsPerUnit);
    }
    saveParameters() {
        const parameterCount = this._model.parameters.count;
        const savedParameterCount = this._savedParameters.getSize();
        for (let i = 0; i < parameterCount; ++i) {
            if (i < savedParameterCount) {
                this._savedParameters.set(i, this._parameterValues[i]);
            }
            else {
                this._savedParameters.pushBack(this._parameterValues[i]);
            }
        }
    }
    getMultiplyColor(index) {
        if (this.getOverrideFlagForModelMultiplyColors() ||
            this.getOverrideFlagForDrawableMultiplyColors(index)) {
            return this._userMultiplyColors.at(index).color;
        }
        const color = this.getDrawableMultiplyColor(index);
        return color;
    }
    getScreenColor(index) {
        if (this.getOverrideFlagForModelScreenColors() ||
            this.getOverrideFlagForDrawableScreenColors(index)) {
            return this._userScreenColors.at(index).color;
        }
        const color = this.getDrawableScreenColor(index);
        return color;
    }
    setMultiplyColorByTextureColor(index, color) {
        this.setMultiplyColorByRGBA(index, color.r, color.g, color.b, color.a);
    }
    setMultiplyColorByRGBA(index, r, g, b, a = 1.0) {
        this._userMultiplyColors.at(index).color.r = r;
        this._userMultiplyColors.at(index).color.g = g;
        this._userMultiplyColors.at(index).color.b = b;
        this._userMultiplyColors.at(index).color.a = a;
    }
    setScreenColorByTextureColor(index, color) {
        this.setScreenColorByRGBA(index, color.r, color.g, color.b, color.a);
    }
    setScreenColorByRGBA(index, r, g, b, a = 1.0) {
        this._userScreenColors.at(index).color.r = r;
        this._userScreenColors.at(index).color.g = g;
        this._userScreenColors.at(index).color.b = b;
        this._userScreenColors.at(index).color.a = a;
    }
    getPartMultiplyColor(partIndex) {
        return this._userPartMultiplyColors.at(partIndex).color;
    }
    getPartScreenColor(partIndex) {
        return this._userPartScreenColors.at(partIndex).color;
    }
    setPartColor(partIndex, r, g, b, a, partColors, drawableColors) {
        partColors.at(partIndex).color.r = r;
        partColors.at(partIndex).color.g = g;
        partColors.at(partIndex).color.b = b;
        partColors.at(partIndex).color.a = a;
        if (partColors.at(partIndex).isOverridden) {
            for (let i = 0; i < this._partChildDrawables.at(partIndex).getSize(); ++i) {
                const drawableIndex = this._partChildDrawables.at(partIndex).at(i);
                drawableColors.at(drawableIndex).color.r = r;
                drawableColors.at(drawableIndex).color.g = g;
                drawableColors.at(drawableIndex).color.b = b;
                drawableColors.at(drawableIndex).color.a = a;
            }
        }
    }
    setPartMultiplyColorByTextureColor(partIndex, color) {
        this.setPartMultiplyColorByRGBA(partIndex, color.r, color.g, color.b, color.a);
    }
    setPartMultiplyColorByRGBA(partIndex, r, g, b, a) {
        this.setPartColor(partIndex, r, g, b, a, this._userPartMultiplyColors, this._userMultiplyColors);
    }
    setPartScreenColorByTextureColor(partIndex, color) {
        this.setPartScreenColorByRGBA(partIndex, color.r, color.g, color.b, color.a);
    }
    setPartScreenColorByRGBA(partIndex, r, g, b, a) {
        this.setPartColor(partIndex, r, g, b, a, this._userPartScreenColors, this._userScreenColors);
    }
    getOverrideFlagForModelParameterRepeat() {
        return this._isOverriddenParameterRepeat;
    }
    setOverrideFlagForModelParameterRepeat(isRepeat) {
        this._isOverriddenParameterRepeat = isRepeat;
    }
    getOverrideFlagForParameterRepeat(parameterIndex) {
        return this._userParameterRepeatDataList.at(parameterIndex).isOverridden;
    }
    setOverrideFlagForParameterRepeat(parameterIndex, value) {
        this._userParameterRepeatDataList.at(parameterIndex).isOverridden = value;
    }
    getRepeatFlagForParameterRepeat(parameterIndex) {
        return this._userParameterRepeatDataList.at(parameterIndex)
            .isParameterRepeated;
    }
    setRepeatFlagForParameterRepeat(parameterIndex, value) {
        this._userParameterRepeatDataList.at(parameterIndex).isParameterRepeated =
            value;
    }
    getOverwriteFlagForModelMultiplyColors() {
        CubismLogWarning('getOverwriteFlagForModelMultiplyColors() is a deprecated function. Please use getOverrideFlagForModelMultiplyColors().');
        return this.getOverrideFlagForModelMultiplyColors();
    }
    getOverrideFlagForModelMultiplyColors() {
        return this._isOverriddenModelMultiplyColors;
    }
    getOverwriteFlagForModelScreenColors() {
        CubismLogWarning('getOverwriteFlagForModelScreenColors() is a deprecated function. Please use getOverrideFlagForModelScreenColors().');
        return this.getOverrideFlagForModelScreenColors();
    }
    getOverrideFlagForModelScreenColors() {
        return this._isOverriddenModelScreenColors;
    }
    setOverwriteFlagForModelMultiplyColors(value) {
        CubismLogWarning('setOverwriteFlagForModelMultiplyColors(value: boolean) is a deprecated function. Please use setOverrideFlagForModelMultiplyColors(value: boolean).');
        this.setOverrideFlagForModelMultiplyColors(value);
    }
    setOverrideFlagForModelMultiplyColors(value) {
        this._isOverriddenModelMultiplyColors = value;
    }
    setOverwriteFlagForModelScreenColors(value) {
        CubismLogWarning('setOverwriteFlagForModelScreenColors(value: boolean) is a deprecated function. Please use setOverrideFlagForModelScreenColors(value: boolean).');
        this.setOverrideFlagForModelScreenColors(value);
    }
    setOverrideFlagForModelScreenColors(value) {
        this._isOverriddenModelScreenColors = value;
    }
    getOverwriteFlagForDrawableMultiplyColors(drawableindex) {
        CubismLogWarning('getOverwriteFlagForDrawableMultiplyColors(drawableindex: number) is a deprecated function. Please use getOverrideFlagForDrawableMultiplyColors(drawableindex: number).');
        return this.getOverrideFlagForDrawableMultiplyColors(drawableindex);
    }
    getOverrideFlagForDrawableMultiplyColors(drawableindex) {
        return this._userMultiplyColors.at(drawableindex).isOverridden;
    }
    getOverwriteFlagForDrawableScreenColors(drawableindex) {
        CubismLogWarning('getOverwriteFlagForDrawableScreenColors(drawableindex: number) is a deprecated function. Please use getOverrideFlagForDrawableScreenColors(drawableindex: number).');
        return this.getOverrideFlagForDrawableScreenColors(drawableindex);
    }
    getOverrideFlagForDrawableScreenColors(drawableindex) {
        return this._userScreenColors.at(drawableindex).isOverridden;
    }
    setOverwriteFlagForDrawableMultiplyColors(drawableindex, value) {
        CubismLogWarning('setOverwriteFlagForDrawableMultiplyColors(drawableindex: number, value: boolean) is a deprecated function. Please use setOverrideFlagForDrawableMultiplyColors(drawableindex: number, value: boolean).');
        this.setOverrideFlagForDrawableMultiplyColors(drawableindex, value);
    }
    setOverrideFlagForDrawableMultiplyColors(drawableindex, value) {
        this._userMultiplyColors.at(drawableindex).isOverridden = value;
    }
    setOverwriteFlagForDrawableScreenColors(drawableindex, value) {
        CubismLogWarning('setOverwriteFlagForDrawableScreenColors(drawableindex: number, value: boolean) is a deprecated function. Please use setOverrideFlagForDrawableScreenColors(drawableindex: number, value: boolean).');
        this.setOverrideFlagForDrawableScreenColors(drawableindex, value);
    }
    setOverrideFlagForDrawableScreenColors(drawableindex, value) {
        this._userScreenColors.at(drawableindex).isOverridden = value;
    }
    getOverwriteColorForPartMultiplyColors(partIndex) {
        CubismLogWarning('getOverwriteColorForPartMultiplyColors(partIndex: number) is a deprecated function. Please use getOverrideColorForPartMultiplyColors(partIndex: number).');
        return this.getOverrideColorForPartMultiplyColors(partIndex);
    }
    getOverrideColorForPartMultiplyColors(partIndex) {
        return this._userPartMultiplyColors.at(partIndex).isOverridden;
    }
    getOverwriteColorForPartScreenColors(partIndex) {
        CubismLogWarning('getOverwriteColorForPartScreenColors(partIndex: number) is a deprecated function. Please use getOverrideColorForPartScreenColors(partIndex: number).');
        return this.getOverrideColorForPartScreenColors(partIndex);
    }
    getOverrideColorForPartScreenColors(partIndex) {
        return this._userPartScreenColors.at(partIndex).isOverridden;
    }
    setOverwriteColorForPartColors(partIndex, value, partColors, drawableColors) {
        CubismLogWarning('setOverwriteColorForPartColors(partIndex: number, value: boolean, partColors: csmVector<PartColorData>, drawableColors: csmVector<DrawableColorData>) is a deprecated function. Please use setOverrideColorForPartColors(partIndex: number, value: boolean, partColors: csmVector<PartColorData>, drawableColors: csmVector<DrawableColorData>).');
        this.setOverrideColorForPartColors(partIndex, value, partColors, drawableColors);
    }
    setOverrideColorForPartColors(partIndex, value, partColors, drawableColors) {
        partColors.at(partIndex).isOverridden = value;
        for (let i = 0; i < this._partChildDrawables.at(partIndex).getSize(); ++i) {
            const drawableIndex = this._partChildDrawables.at(partIndex).at(i);
            drawableColors.at(drawableIndex).isOverridden = value;
            if (value) {
                drawableColors.at(drawableIndex).color.r =
                    partColors.at(partIndex).color.r;
                drawableColors.at(drawableIndex).color.g =
                    partColors.at(partIndex).color.g;
                drawableColors.at(drawableIndex).color.b =
                    partColors.at(partIndex).color.b;
                drawableColors.at(drawableIndex).color.a =
                    partColors.at(partIndex).color.a;
            }
        }
    }
    setOverwriteColorForPartMultiplyColors(partIndex, value) {
        CubismLogWarning('setOverwriteColorForPartMultiplyColors(partIndex: number, value: boolean) is a deprecated function. Please use setOverrideColorForPartMultiplyColors(partIndex: number, value: boolean).');
        this.setOverrideColorForPartMultiplyColors(partIndex, value);
    }
    setOverrideColorForPartMultiplyColors(partIndex, value) {
        this._userPartMultiplyColors.at(partIndex).isOverridden = value;
        this.setOverrideColorForPartColors(partIndex, value, this._userPartMultiplyColors, this._userMultiplyColors);
    }
    setOverwriteColorForPartScreenColors(partIndex, value) {
        CubismLogWarning('setOverwriteColorForPartScreenColors(partIndex: number, value: boolean) is a deprecated function. Please use setOverrideColorForPartScreenColors(partIndex: number, value: boolean).');
        this.setOverrideColorForPartScreenColors(partIndex, value);
    }
    setOverrideColorForPartScreenColors(partIndex, value) {
        this._userPartScreenColors.at(partIndex).isOverridden = value;
        this.setOverrideColorForPartColors(partIndex, value, this._userPartScreenColors, this._userScreenColors);
    }
    getDrawableCulling(drawableIndex) {
        if (this.getOverrideFlagForModelCullings() ||
            this.getOverrideFlagForDrawableCullings(drawableIndex)) {
            return this._userCullings.at(drawableIndex).isCulling;
        }
        const constantFlags = this._model.drawables.constantFlags;
        return !Live2DCubismCore.Utils.hasIsDoubleSidedBit(constantFlags[drawableIndex]);
    }
    setDrawableCulling(drawableIndex, isCulling) {
        this._userCullings.at(drawableIndex).isCulling = isCulling;
    }
    getOverwriteFlagForModelCullings() {
        CubismLogWarning('getOverwriteFlagForModelCullings() is a deprecated function. Please use getOverrideFlagForModelCullings().');
        return this.getOverrideFlagForModelCullings();
    }
    getOverrideFlagForModelCullings() {
        return this._isOverriddenCullings;
    }
    setOverwriteFlagForModelCullings(isOverriddenCullings) {
        CubismLogWarning('setOverwriteFlagForModelCullings(isOverriddenCullings: boolean) is a deprecated function. Please use setOverrideFlagForModelCullings(isOverriddenCullings: boolean).');
        this.setOverrideFlagForModelCullings(isOverriddenCullings);
    }
    setOverrideFlagForModelCullings(isOverriddenCullings) {
        this._isOverriddenCullings = isOverriddenCullings;
    }
    getOverwriteFlagForDrawableCullings(drawableIndex) {
        CubismLogWarning('getOverwriteFlagForDrawableCullings(drawableIndex: number) is a deprecated function. Please use getOverrideFlagForDrawableCullings(drawableIndex: number).');
        return this.getOverrideFlagForDrawableCullings(drawableIndex);
    }
    getOverrideFlagForDrawableCullings(drawableIndex) {
        return this._userCullings.at(drawableIndex).isOverridden;
    }
    setOverwriteFlagForDrawableCullings(drawableIndex, isOverriddenCullings) {
        CubismLogWarning('setOverwriteFlagForDrawableCullings(drawableIndex: number, isOverriddenCullings: boolean) is a deprecated function. Please use setOverrideFlagForDrawableCullings(drawableIndex: number, isOverriddenCullings: boolean).');
        this.setOverrideFlagForDrawableCullings(drawableIndex, isOverriddenCullings);
    }
    setOverrideFlagForDrawableCullings(drawableIndex, isOverriddenCullings) {
        this._userCullings.at(drawableIndex).isOverridden = isOverriddenCullings;
    }
    getModelOapcity() {
        return this._modelOpacity;
    }
    setModelOapcity(value) {
        this._modelOpacity = value;
    }
    getModel() {
        return this._model;
    }
    getPartIndex(partId) {
        let partIndex;
        const partCount = this._model.parts.count;
        for (partIndex = 0; partIndex < partCount; ++partIndex) {
            if (partId == this._partIds.at(partIndex)) {
                return partIndex;
            }
        }
        if (this._notExistPartId.isExist(partId)) {
            return this._notExistPartId.getValue(partId);
        }
        partIndex = partCount + this._notExistPartId.getSize();
        this._notExistPartId.setValue(partId, partIndex);
        this._notExistPartOpacities.appendKey(partIndex);
        return partIndex;
    }
    getPartId(partIndex) {
        const partId = this._model.parts.ids[partIndex];
        return CubismFramework.getIdManager().getId(partId);
    }
    getPartCount() {
        const partCount = this._model.parts.count;
        return partCount;
    }
    getPartParentPartIndices() {
        const parentIndices = this._model.parts.parentIndices;
        return parentIndices;
    }
    setPartOpacityByIndex(partIndex, opacity) {
        if (this._notExistPartOpacities.isExist(partIndex)) {
            this._notExistPartOpacities.setValue(partIndex, opacity);
            return;
        }
        CSM_ASSERT(0 <= partIndex && partIndex < this.getPartCount());
        this._partOpacities[partIndex] = opacity;
    }
    setPartOpacityById(partId, opacity) {
        const index = this.getPartIndex(partId);
        if (index < 0) {
            return;
        }
        this.setPartOpacityByIndex(index, opacity);
    }
    getPartOpacityByIndex(partIndex) {
        if (this._notExistPartOpacities.isExist(partIndex)) {
            return this._notExistPartOpacities.getValue(partIndex);
        }
        CSM_ASSERT(0 <= partIndex && partIndex < this.getPartCount());
        return this._partOpacities[partIndex];
    }
    getPartOpacityById(partId) {
        const index = this.getPartIndex(partId);
        if (index < 0) {
            return 0;
        }
        return this.getPartOpacityByIndex(index);
    }
    getParameterIndex(parameterId) {
        let parameterIndex;
        const idCount = this._model.parameters.count;
        for (parameterIndex = 0; parameterIndex < idCount; ++parameterIndex) {
            if (parameterId != this._parameterIds.at(parameterIndex)) {
                continue;
            }
            return parameterIndex;
        }
        if (this._notExistParameterId.isExist(parameterId)) {
            return this._notExistParameterId.getValue(parameterId);
        }
        parameterIndex =
            this._model.parameters.count + this._notExistParameterId.getSize();
        this._notExistParameterId.setValue(parameterId, parameterIndex);
        this._notExistParameterValues.appendKey(parameterIndex);
        return parameterIndex;
    }
    getParameterCount() {
        return this._model.parameters.count;
    }
    getParameterType(parameterIndex) {
        return this._model.parameters.types[parameterIndex];
    }
    getParameterMaximumValue(parameterIndex) {
        return this._model.parameters.maximumValues[parameterIndex];
    }
    getParameterMinimumValue(parameterIndex) {
        return this._model.parameters.minimumValues[parameterIndex];
    }
    getParameterDefaultValue(parameterIndex) {
        return this._model.parameters.defaultValues[parameterIndex];
    }
    getParameterId(parameterIndex) {
        return CubismFramework.getIdManager().getId(this._model.parameters.ids[parameterIndex]);
    }
    getParameterValueByIndex(parameterIndex) {
        if (this._notExistParameterValues.isExist(parameterIndex)) {
            return this._notExistParameterValues.getValue(parameterIndex);
        }
        CSM_ASSERT(0 <= parameterIndex && parameterIndex < this.getParameterCount());
        return this._parameterValues[parameterIndex];
    }
    getParameterValueById(parameterId) {
        const parameterIndex = this.getParameterIndex(parameterId);
        return this.getParameterValueByIndex(parameterIndex);
    }
    setParameterValueByIndex(parameterIndex, value, weight = 1.0) {
        if (this._notExistParameterValues.isExist(parameterIndex)) {
            this._notExistParameterValues.setValue(parameterIndex, weight == 1
                ? value
                : this._notExistParameterValues.getValue(parameterIndex) *
                    (1 - weight) +
                    value * weight);
            return;
        }
        CSM_ASSERT(0 <= parameterIndex && parameterIndex < this.getParameterCount());
        if (this.isRepeat(parameterIndex)) {
            value = this.getParameterRepeatValue(parameterIndex, value);
        }
        else {
            value = this.getParameterClampValue(parameterIndex, value);
        }
        this._parameterValues[parameterIndex] =
            weight == 1
                ? value
                : (this._parameterValues[parameterIndex] =
                    this._parameterValues[parameterIndex] * (1 - weight) +
                        value * weight);
    }
    setParameterValueById(parameterId, value, weight = 1.0) {
        const index = this.getParameterIndex(parameterId);
        this.setParameterValueByIndex(index, value, weight);
    }
    addParameterValueByIndex(parameterIndex, value, weight = 1.0) {
        this.setParameterValueByIndex(parameterIndex, this.getParameterValueByIndex(parameterIndex) + value * weight);
    }
    addParameterValueById(parameterId, value, weight = 1.0) {
        const index = this.getParameterIndex(parameterId);
        this.addParameterValueByIndex(index, value, weight);
    }
    isRepeat(parameterIndex) {
        if (this._notExistParameterValues.isExist(parameterIndex)) {
            return false;
        }
        CSM_ASSERT(0 <= parameterIndex && parameterIndex < this.getParameterCount());
        let isRepeat;
        if (this._isOverriddenParameterRepeat ||
            this._userParameterRepeatDataList.at(parameterIndex).isOverridden) {
            isRepeat =
                this._userParameterRepeatDataList.at(parameterIndex).isParameterRepeated;
        }
        else {
            isRepeat = this._model.parameters.repeats[parameterIndex] != 0;
        }
        return isRepeat;
    }
    getParameterRepeatValue(parameterIndex, value) {
        if (this._notExistParameterValues.isExist(parameterIndex)) {
            return value;
        }
        CSM_ASSERT(0 <= parameterIndex && parameterIndex < this.getParameterCount());
        const maxValue = this._model.parameters.maximumValues[parameterIndex];
        const minValue = this._model.parameters.minimumValues[parameterIndex];
        const valueSize = maxValue - minValue;
        if (maxValue < value) {
            const overValue = CubismMath.mod(value - maxValue, valueSize);
            if (!Number.isNaN(overValue)) {
                value = minValue + overValue;
            }
            else {
                value = maxValue;
            }
        }
        if (value < minValue) {
            const overValue = CubismMath.mod(minValue - value, valueSize);
            if (!Number.isNaN(overValue)) {
                value = maxValue - overValue;
            }
            else {
                value = minValue;
            }
        }
        return value;
    }
    getParameterClampValue(parameterIndex, value) {
        if (this._notExistParameterValues.isExist(parameterIndex)) {
            return value;
        }
        CSM_ASSERT(0 <= parameterIndex && parameterIndex < this.getParameterCount());
        const maxValue = this._model.parameters.maximumValues[parameterIndex];
        const minValue = this._model.parameters.minimumValues[parameterIndex];
        return CubismMath.clamp(value, minValue, maxValue);
    }
    getParameterRepeats(parameterIndex) {
        return this._model.parameters.repeats[parameterIndex] != 0;
    }
    multiplyParameterValueById(parameterId, value, weight = 1.0) {
        const index = this.getParameterIndex(parameterId);
        this.multiplyParameterValueByIndex(index, value, weight);
    }
    multiplyParameterValueByIndex(parameterIndex, value, weight = 1.0) {
        this.setParameterValueByIndex(parameterIndex, this.getParameterValueByIndex(parameterIndex) *
            (1.0 + (value - 1.0) * weight));
    }
    getDrawableIndex(drawableId) {
        const drawableCount = this._model.drawables.count;
        for (let drawableIndex = 0; drawableIndex < drawableCount; ++drawableIndex) {
            if (this._drawableIds.at(drawableIndex) == drawableId) {
                return drawableIndex;
            }
        }
        return -1;
    }
    getDrawableCount() {
        const drawableCount = this._model.drawables.count;
        return drawableCount;
    }
    getDrawableId(drawableIndex) {
        const parameterIds = this._model.drawables.ids;
        return CubismFramework.getIdManager().getId(parameterIds[drawableIndex]);
    }
    getDrawableRenderOrders() {
        const renderOrders = this._model.drawables.renderOrders;
        return renderOrders;
    }
    getDrawableTextureIndices(drawableIndex) {
        return this.getDrawableTextureIndex(drawableIndex);
    }
    getDrawableTextureIndex(drawableIndex) {
        const textureIndices = this._model.drawables.textureIndices;
        return textureIndices[drawableIndex];
    }
    getDrawableDynamicFlagVertexPositionsDidChange(drawableIndex) {
        const dynamicFlags = this._model.drawables.dynamicFlags;
        return Live2DCubismCore.Utils.hasVertexPositionsDidChangeBit(dynamicFlags[drawableIndex]);
    }
    getDrawableVertexIndexCount(drawableIndex) {
        const indexCounts = this._model.drawables.indexCounts;
        return indexCounts[drawableIndex];
    }
    getDrawableVertexCount(drawableIndex) {
        const vertexCounts = this._model.drawables.vertexCounts;
        return vertexCounts[drawableIndex];
    }
    getDrawableVertices(drawableIndex) {
        return this.getDrawableVertexPositions(drawableIndex);
    }
    getDrawableVertexIndices(drawableIndex) {
        const indicesArray = this._model.drawables.indices;
        return indicesArray[drawableIndex];
    }
    getDrawableVertexPositions(drawableIndex) {
        const verticesArray = this._model.drawables.vertexPositions;
        return verticesArray[drawableIndex];
    }
    getDrawableVertexUvs(drawableIndex) {
        const uvsArray = this._model.drawables.vertexUvs;
        return uvsArray[drawableIndex];
    }
    getDrawableOpacity(drawableIndex) {
        const opacities = this._model.drawables.opacities;
        return opacities[drawableIndex];
    }
    getDrawableMultiplyColor(drawableIndex) {
        const multiplyColors = this._model.drawables.multiplyColors;
        const index = drawableIndex * 4;
        const multiplyColor = new CubismTextureColor();
        multiplyColor.r = multiplyColors[index];
        multiplyColor.g = multiplyColors[index + 1];
        multiplyColor.b = multiplyColors[index + 2];
        multiplyColor.a = multiplyColors[index + 3];
        return multiplyColor;
    }
    getDrawableScreenColor(drawableIndex) {
        const screenColors = this._model.drawables.screenColors;
        const index = drawableIndex * 4;
        const screenColor = new CubismTextureColor();
        screenColor.r = screenColors[index];
        screenColor.g = screenColors[index + 1];
        screenColor.b = screenColors[index + 2];
        screenColor.a = screenColors[index + 3];
        return screenColor;
    }
    getDrawableParentPartIndex(drawableIndex) {
        return this._model.drawables.parentPartIndices[drawableIndex];
    }
    getDrawableBlendMode(drawableIndex) {
        const constantFlags = this._model.drawables.constantFlags;
        return Live2DCubismCore.Utils.hasBlendAdditiveBit(constantFlags[drawableIndex])
            ? CubismBlendMode.CubismBlendMode_Additive
            : Live2DCubismCore.Utils.hasBlendMultiplicativeBit(constantFlags[drawableIndex])
                ? CubismBlendMode.CubismBlendMode_Multiplicative
                : CubismBlendMode.CubismBlendMode_Normal;
    }
    getDrawableInvertedMaskBit(drawableIndex) {
        const constantFlags = this._model.drawables.constantFlags;
        return Live2DCubismCore.Utils.hasIsInvertedMaskBit(constantFlags[drawableIndex]);
    }
    getDrawableMasks() {
        const masks = this._model.drawables.masks;
        return masks;
    }
    getDrawableMaskCounts() {
        const maskCounts = this._model.drawables.maskCounts;
        return maskCounts;
    }
    isUsingMasking() {
        for (let d = 0; d < this._model.drawables.count; ++d) {
            if (this._model.drawables.maskCounts[d] <= 0) {
                continue;
            }
            return true;
        }
        return false;
    }
    getDrawableDynamicFlagIsVisible(drawableIndex) {
        const dynamicFlags = this._model.drawables.dynamicFlags;
        return Live2DCubismCore.Utils.hasIsVisibleBit(dynamicFlags[drawableIndex]);
    }
    getDrawableDynamicFlagVisibilityDidChange(drawableIndex) {
        const dynamicFlags = this._model.drawables.dynamicFlags;
        return Live2DCubismCore.Utils.hasVisibilityDidChangeBit(dynamicFlags[drawableIndex]);
    }
    getDrawableDynamicFlagOpacityDidChange(drawableIndex) {
        const dynamicFlags = this._model.drawables.dynamicFlags;
        return Live2DCubismCore.Utils.hasOpacityDidChangeBit(dynamicFlags[drawableIndex]);
    }
    getDrawableDynamicFlagRenderOrderDidChange(drawableIndex) {
        const dynamicFlags = this._model.drawables.dynamicFlags;
        return Live2DCubismCore.Utils.hasRenderOrderDidChangeBit(dynamicFlags[drawableIndex]);
    }
    getDrawableDynamicFlagBlendColorDidChange(drawableIndex) {
        const dynamicFlags = this._model.drawables.dynamicFlags;
        return Live2DCubismCore.Utils.hasBlendColorDidChangeBit(dynamicFlags[drawableIndex]);
    }
    loadParameters() {
        let parameterCount = this._model.parameters.count;
        const savedParameterCount = this._savedParameters.getSize();
        if (parameterCount > savedParameterCount) {
            parameterCount = savedParameterCount;
        }
        for (let i = 0; i < parameterCount; ++i) {
            this._parameterValues[i] = this._savedParameters.at(i);
        }
    }
    initialize() {
        CSM_ASSERT(this._model);
        this._parameterValues = this._model.parameters.values;
        this._partOpacities = this._model.parts.opacities;
        this._parameterMaximumValues = this._model.parameters.maximumValues;
        this._parameterMinimumValues = this._model.parameters.minimumValues;
        {
            const parameterIds = this._model.parameters.ids;
            const parameterCount = this._model.parameters.count;
            this._parameterIds.prepareCapacity(parameterCount);
            this._userParameterRepeatDataList.prepareCapacity(parameterCount);
            for (let i = 0; i < parameterCount; ++i) {
                this._parameterIds.pushBack(CubismFramework.getIdManager().getId(parameterIds[i]));
                this._userParameterRepeatDataList.pushBack(new ParameterRepeatData(false, false));
            }
        }
        const partCount = this._model.parts.count;
        {
            const partIds = this._model.parts.ids;
            this._partIds.prepareCapacity(partCount);
            for (let i = 0; i < partCount; ++i) {
                this._partIds.pushBack(CubismFramework.getIdManager().getId(partIds[i]));
            }
            this._userPartMultiplyColors.prepareCapacity(partCount);
            this._userPartScreenColors.prepareCapacity(partCount);
            this._partChildDrawables.prepareCapacity(partCount);
        }
        {
            const drawableIds = this._model.drawables.ids;
            const drawableCount = this._model.drawables.count;
            this._userMultiplyColors.prepareCapacity(drawableCount);
            this._userScreenColors.prepareCapacity(drawableCount);
            this._userCullings.prepareCapacity(drawableCount);
            const userCulling = new DrawableCullingData(false, false);
            {
                for (let i = 0; i < partCount; ++i) {
                    const multiplyColor = new CubismTextureColor(1.0, 1.0, 1.0, 1.0);
                    const screenColor = new CubismTextureColor(0.0, 0.0, 0.0, 1.0);
                    const userMultiplyColor = new PartColorData(false, multiplyColor);
                    const userScreenColor = new PartColorData(false, screenColor);
                    this._userPartMultiplyColors.pushBack(userMultiplyColor);
                    this._userPartScreenColors.pushBack(userScreenColor);
                    this._partChildDrawables.pushBack(new csmVector());
                    this._partChildDrawables.at(i).prepareCapacity(drawableCount);
                }
            }
            {
                for (let i = 0; i < drawableCount; ++i) {
                    const multiplyColor = new CubismTextureColor(1.0, 1.0, 1.0, 1.0);
                    const screenColor = new CubismTextureColor(0.0, 0.0, 0.0, 1.0);
                    const userMultiplyColor = new DrawableColorData(false, multiplyColor);
                    const userScreenColor = new DrawableColorData(false, screenColor);
                    this._drawableIds.pushBack(CubismFramework.getIdManager().getId(drawableIds[i]));
                    this._userMultiplyColors.pushBack(userMultiplyColor);
                    this._userScreenColors.pushBack(userScreenColor);
                    this._userCullings.pushBack(userCulling);
                    const parentIndex = this.getDrawableParentPartIndex(i);
                    if (parentIndex >= 0) {
                        this._partChildDrawables.at(parentIndex).pushBack(i);
                    }
                }
            }
        }
    }
    constructor(model) {
        this._model = model;
        this._parameterValues = null;
        this._parameterMaximumValues = null;
        this._parameterMinimumValues = null;
        this._partOpacities = null;
        this._savedParameters = new csmVector();
        this._parameterIds = new csmVector();
        this._drawableIds = new csmVector();
        this._partIds = new csmVector();
        this._isOverriddenParameterRepeat = true;
        this._isOverriddenModelMultiplyColors = false;
        this._isOverriddenModelScreenColors = false;
        this._isOverriddenCullings = false;
        this._modelOpacity = 1.0;
        this._userParameterRepeatDataList = new csmVector();
        this._userMultiplyColors = new csmVector();
        this._userScreenColors = new csmVector();
        this._userCullings = new csmVector();
        this._userPartMultiplyColors = new csmVector();
        this._userPartScreenColors = new csmVector();
        this._partChildDrawables = new csmVector();
        this._notExistPartId = new csmMap();
        this._notExistParameterId = new csmMap();
        this._notExistParameterValues = new csmMap();
        this._notExistPartOpacities = new csmMap();
    }
    release() {
        this._model.release();
        this._model = null;
    }
}
import * as $ from './cubismmodel';
export var Live2DCubismFramework;
(function (Live2DCubismFramework) {
    Live2DCubismFramework.CubismModel = $.CubismModel;
})(Live2DCubismFramework || (Live2DCubismFramework = {}));
