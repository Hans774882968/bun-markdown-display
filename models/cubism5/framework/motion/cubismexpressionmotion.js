import { CubismFramework } from '../live2dcubismframework';
import { csmVector } from '../type/csmvector';
import { CubismJson } from '../utils/cubismjson';
import { ACubismMotion } from './acubismmotion';
const ExpressionKeyFadeIn = 'FadeInTime';
const ExpressionKeyFadeOut = 'FadeOutTime';
const ExpressionKeyParameters = 'Parameters';
const ExpressionKeyId = 'Id';
const ExpressionKeyValue = 'Value';
const ExpressionKeyBlend = 'Blend';
const BlendValueAdd = 'Add';
const BlendValueMultiply = 'Multiply';
const BlendValueOverwrite = 'Overwrite';
const DefaultFadeTime = 1.0;
export class CubismExpressionMotion extends ACubismMotion {
    static create(buffer, size) {
        const expression = new CubismExpressionMotion();
        expression.parse(buffer, size);
        return expression;
    }
    doUpdateParameters(model, userTimeSeconds, weight, motionQueueEntry) {
        for (let i = 0; i < this._parameters.getSize(); ++i) {
            const parameter = this._parameters.at(i);
            switch (parameter.blendType) {
                case ExpressionBlendType.Additive: {
                    model.addParameterValueById(parameter.parameterId, parameter.value, weight);
                    break;
                }
                case ExpressionBlendType.Multiply: {
                    model.multiplyParameterValueById(parameter.parameterId, parameter.value, weight);
                    break;
                }
                case ExpressionBlendType.Overwrite: {
                    model.setParameterValueById(parameter.parameterId, parameter.value, weight);
                    break;
                }
                default:
                    break;
            }
        }
    }
    calculateExpressionParameters(model, userTimeSeconds, motionQueueEntry, expressionParameterValues, expressionIndex, fadeWeight) {
        if (motionQueueEntry == null || expressionParameterValues == null) {
            return;
        }
        if (!motionQueueEntry.isAvailable()) {
            return;
        }
        this._fadeWeight = this.updateFadeWeight(motionQueueEntry, userTimeSeconds);
        for (let i = 0; i < expressionParameterValues.getSize(); ++i) {
            const expressionParameterValue = expressionParameterValues.at(i);
            if (expressionParameterValue.parameterId == null) {
                continue;
            }
            const currentParameterValue = (expressionParameterValue.overwriteValue =
                model.getParameterValueById(expressionParameterValue.parameterId));
            const expressionParameters = this.getExpressionParameters();
            let parameterIndex = -1;
            for (let j = 0; j < expressionParameters.getSize(); ++j) {
                if (expressionParameterValue.parameterId !=
                    expressionParameters.at(j).parameterId) {
                    continue;
                }
                parameterIndex = j;
                break;
            }
            if (parameterIndex < 0) {
                if (expressionIndex == 0) {
                    expressionParameterValue.additiveValue =
                        CubismExpressionMotion.DefaultAdditiveValue;
                    expressionParameterValue.multiplyValue =
                        CubismExpressionMotion.DefaultMultiplyValue;
                    expressionParameterValue.overwriteValue = currentParameterValue;
                }
                else {
                    expressionParameterValue.additiveValue = this.calculateValue(expressionParameterValue.additiveValue, CubismExpressionMotion.DefaultAdditiveValue, fadeWeight);
                    expressionParameterValue.multiplyValue = this.calculateValue(expressionParameterValue.multiplyValue, CubismExpressionMotion.DefaultMultiplyValue, fadeWeight);
                    expressionParameterValue.overwriteValue = this.calculateValue(expressionParameterValue.overwriteValue, currentParameterValue, fadeWeight);
                }
                continue;
            }
            const value = expressionParameters.at(parameterIndex).value;
            let newAdditiveValue, newMultiplyValue, newOverwriteValue;
            switch (expressionParameters.at(parameterIndex).blendType) {
                case ExpressionBlendType.Additive:
                    newAdditiveValue = value;
                    newMultiplyValue = CubismExpressionMotion.DefaultMultiplyValue;
                    newOverwriteValue = currentParameterValue;
                    break;
                case ExpressionBlendType.Multiply:
                    newAdditiveValue = CubismExpressionMotion.DefaultAdditiveValue;
                    newMultiplyValue = value;
                    newOverwriteValue = currentParameterValue;
                    break;
                case ExpressionBlendType.Overwrite:
                    newAdditiveValue = CubismExpressionMotion.DefaultAdditiveValue;
                    newMultiplyValue = CubismExpressionMotion.DefaultMultiplyValue;
                    newOverwriteValue = value;
                    break;
                default:
                    return;
            }
            if (expressionIndex == 0) {
                expressionParameterValue.additiveValue = newAdditiveValue;
                expressionParameterValue.multiplyValue = newMultiplyValue;
                expressionParameterValue.overwriteValue = newOverwriteValue;
            }
            else {
                expressionParameterValue.additiveValue =
                    expressionParameterValue.additiveValue * (1.0 - fadeWeight) +
                        newAdditiveValue * fadeWeight;
                expressionParameterValue.multiplyValue =
                    expressionParameterValue.multiplyValue * (1.0 - fadeWeight) +
                        newMultiplyValue * fadeWeight;
                expressionParameterValue.overwriteValue =
                    expressionParameterValue.overwriteValue * (1.0 - fadeWeight) +
                        newOverwriteValue * fadeWeight;
            }
        }
    }
    getExpressionParameters() {
        return this._parameters;
    }
    getFadeWeight() {
        return this._fadeWeight;
    }
    parse(buffer, size) {
        const json = CubismJson.create(buffer, size);
        if (!json) {
            return;
        }
        const root = json.getRoot();
        this.setFadeInTime(root.getValueByString(ExpressionKeyFadeIn).toFloat(DefaultFadeTime));
        this.setFadeOutTime(root.getValueByString(ExpressionKeyFadeOut).toFloat(DefaultFadeTime));
        const parameterCount = root
            .getValueByString(ExpressionKeyParameters)
            .getSize();
        this._parameters.prepareCapacity(parameterCount);
        for (let i = 0; i < parameterCount; ++i) {
            const param = root
                .getValueByString(ExpressionKeyParameters)
                .getValueByIndex(i);
            const parameterId = CubismFramework.getIdManager().getId(param.getValueByString(ExpressionKeyId).getRawString());
            const value = param
                .getValueByString(ExpressionKeyValue)
                .toFloat();
            let blendType;
            if (param.getValueByString(ExpressionKeyBlend).isNull() ||
                param.getValueByString(ExpressionKeyBlend).getString() == BlendValueAdd) {
                blendType = ExpressionBlendType.Additive;
            }
            else if (param.getValueByString(ExpressionKeyBlend).getString() ==
                BlendValueMultiply) {
                blendType = ExpressionBlendType.Multiply;
            }
            else if (param.getValueByString(ExpressionKeyBlend).getString() ==
                BlendValueOverwrite) {
                blendType = ExpressionBlendType.Overwrite;
            }
            else {
                blendType = ExpressionBlendType.Additive;
            }
            const item = new ExpressionParameter();
            item.parameterId = parameterId;
            item.blendType = blendType;
            item.value = value;
            this._parameters.pushBack(item);
        }
        CubismJson.delete(json);
    }
    calculateValue(source, destination, fadeWeight) {
        return source * (1.0 - fadeWeight) + destination * fadeWeight;
    }
    constructor() {
        super();
        this._parameters = new csmVector();
        this._fadeWeight = 0.0;
    }
}
CubismExpressionMotion.DefaultAdditiveValue = 0.0;
CubismExpressionMotion.DefaultMultiplyValue = 1.0;
export var ExpressionBlendType;
(function (ExpressionBlendType) {
    ExpressionBlendType[ExpressionBlendType["Additive"] = 0] = "Additive";
    ExpressionBlendType[ExpressionBlendType["Multiply"] = 1] = "Multiply";
    ExpressionBlendType[ExpressionBlendType["Overwrite"] = 2] = "Overwrite";
})(ExpressionBlendType || (ExpressionBlendType = {}));
export class ExpressionParameter {
}
import * as $ from './cubismexpressionmotion';
export var Live2DCubismFramework;
(function (Live2DCubismFramework) {
    Live2DCubismFramework.CubismExpressionMotion = $.CubismExpressionMotion;
    Live2DCubismFramework.ExpressionBlendType = $.ExpressionBlendType;
    Live2DCubismFramework.ExpressionParameter = $.ExpressionParameter;
})(Live2DCubismFramework || (Live2DCubismFramework = {}));
