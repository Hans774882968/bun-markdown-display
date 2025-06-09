import { CubismMath } from '../math/cubismmath';
import { CubismVector2 } from '../math/cubismvector2';
import { csmVector } from '../type/csmvector';
import { CubismPhysicsInput, CubismPhysicsOutput, CubismPhysicsParticle, CubismPhysicsRig, CubismPhysicsSource, CubismPhysicsSubRig, CubismPhysicsTargetType } from './cubismphysicsinternal';
import { CubismPhysicsJson } from './cubismphysicsjson';
const PhysicsTypeTagX = 'X';
const PhysicsTypeTagY = 'Y';
const PhysicsTypeTagAngle = 'Angle';
const AirResistance = 5.0;
const MaximumWeight = 100.0;
const MovementThreshold = 0.001;
const MaxDeltaTime = 5.0;
export class CubismPhysics {
    static create(buffer, size) {
        const ret = new CubismPhysics();
        ret.parse(buffer, size);
        ret._physicsRig.gravity.y = 0;
        return ret;
    }
    static delete(physics) {
        if (physics != null) {
            physics.release();
            physics = null;
        }
    }
    parse(physicsJson, size) {
        this._physicsRig = new CubismPhysicsRig();
        let json = new CubismPhysicsJson(physicsJson, size);
        this._physicsRig.gravity = json.getGravity();
        this._physicsRig.wind = json.getWind();
        this._physicsRig.subRigCount = json.getSubRigCount();
        this._physicsRig.fps = json.getFps();
        this._physicsRig.settings.updateSize(this._physicsRig.subRigCount, CubismPhysicsSubRig, true);
        this._physicsRig.inputs.updateSize(json.getTotalInputCount(), CubismPhysicsInput, true);
        this._physicsRig.outputs.updateSize(json.getTotalOutputCount(), CubismPhysicsOutput, true);
        this._physicsRig.particles.updateSize(json.getVertexCount(), CubismPhysicsParticle, true);
        this._currentRigOutputs.clear();
        this._previousRigOutputs.clear();
        let inputIndex = 0, outputIndex = 0, particleIndex = 0;
        for (let i = 0; i < this._physicsRig.settings.getSize(); ++i) {
            this._physicsRig.settings.at(i).normalizationPosition.minimum =
                json.getNormalizationPositionMinimumValue(i);
            this._physicsRig.settings.at(i).normalizationPosition.maximum =
                json.getNormalizationPositionMaximumValue(i);
            this._physicsRig.settings.at(i).normalizationPosition.defalut =
                json.getNormalizationPositionDefaultValue(i);
            this._physicsRig.settings.at(i).normalizationAngle.minimum =
                json.getNormalizationAngleMinimumValue(i);
            this._physicsRig.settings.at(i).normalizationAngle.maximum =
                json.getNormalizationAngleMaximumValue(i);
            this._physicsRig.settings.at(i).normalizationAngle.defalut =
                json.getNormalizationAngleDefaultValue(i);
            this._physicsRig.settings.at(i).inputCount = json.getInputCount(i);
            this._physicsRig.settings.at(i).baseInputIndex = inputIndex;
            for (let j = 0; j < this._physicsRig.settings.at(i).inputCount; ++j) {
                this._physicsRig.inputs.at(inputIndex + j).sourceParameterIndex = -1;
                this._physicsRig.inputs.at(inputIndex + j).weight = json.getInputWeight(i, j);
                this._physicsRig.inputs.at(inputIndex + j).reflect =
                    json.getInputReflect(i, j);
                if (json.getInputType(i, j) == PhysicsTypeTagX) {
                    this._physicsRig.inputs.at(inputIndex + j).type =
                        CubismPhysicsSource.CubismPhysicsSource_X;
                    this._physicsRig.inputs.at(inputIndex + j).getNormalizedParameterValue =
                        getInputTranslationXFromNormalizedParameterValue;
                }
                else if (json.getInputType(i, j) == PhysicsTypeTagY) {
                    this._physicsRig.inputs.at(inputIndex + j).type =
                        CubismPhysicsSource.CubismPhysicsSource_Y;
                    this._physicsRig.inputs.at(inputIndex + j).getNormalizedParameterValue =
                        getInputTranslationYFromNormalizedParamterValue;
                }
                else if (json.getInputType(i, j) == PhysicsTypeTagAngle) {
                    this._physicsRig.inputs.at(inputIndex + j).type =
                        CubismPhysicsSource.CubismPhysicsSource_Angle;
                    this._physicsRig.inputs.at(inputIndex + j).getNormalizedParameterValue =
                        getInputAngleFromNormalizedParameterValue;
                }
                this._physicsRig.inputs.at(inputIndex + j).source.targetType =
                    CubismPhysicsTargetType.CubismPhysicsTargetType_Parameter;
                this._physicsRig.inputs.at(inputIndex + j).source.id =
                    json.getInputSourceId(i, j);
            }
            inputIndex += this._physicsRig.settings.at(i).inputCount;
            this._physicsRig.settings.at(i).outputCount = json.getOutputCount(i);
            this._physicsRig.settings.at(i).baseOutputIndex = outputIndex;
            const currentRigOutput = new PhysicsOutput();
            currentRigOutput.outputs.resize(this._physicsRig.settings.at(i).outputCount);
            const previousRigOutput = new PhysicsOutput();
            previousRigOutput.outputs.resize(this._physicsRig.settings.at(i).outputCount);
            for (let j = 0; j < this._physicsRig.settings.at(i).outputCount; ++j) {
                currentRigOutput.outputs.set(j, 0.0);
                previousRigOutput.outputs.set(j, 0.0);
                this._physicsRig.outputs.at(outputIndex + j).destinationParameterIndex =
                    -1;
                this._physicsRig.outputs.at(outputIndex + j).vertexIndex =
                    json.getOutputVertexIndex(i, j);
                this._physicsRig.outputs.at(outputIndex + j).angleScale =
                    json.getOutputAngleScale(i, j);
                this._physicsRig.outputs.at(outputIndex + j).weight =
                    json.getOutputWeight(i, j);
                this._physicsRig.outputs.at(outputIndex + j).destination.targetType =
                    CubismPhysicsTargetType.CubismPhysicsTargetType_Parameter;
                this._physicsRig.outputs.at(outputIndex + j).destination.id =
                    json.getOutputDestinationId(i, j);
                if (json.getOutputType(i, j) == PhysicsTypeTagX) {
                    this._physicsRig.outputs.at(outputIndex + j).type =
                        CubismPhysicsSource.CubismPhysicsSource_X;
                    this._physicsRig.outputs.at(outputIndex + j).getValue =
                        getOutputTranslationX;
                    this._physicsRig.outputs.at(outputIndex + j).getScale =
                        getOutputScaleTranslationX;
                }
                else if (json.getOutputType(i, j) == PhysicsTypeTagY) {
                    this._physicsRig.outputs.at(outputIndex + j).type =
                        CubismPhysicsSource.CubismPhysicsSource_Y;
                    this._physicsRig.outputs.at(outputIndex + j).getValue =
                        getOutputTranslationY;
                    this._physicsRig.outputs.at(outputIndex + j).getScale =
                        getOutputScaleTranslationY;
                }
                else if (json.getOutputType(i, j) == PhysicsTypeTagAngle) {
                    this._physicsRig.outputs.at(outputIndex + j).type =
                        CubismPhysicsSource.CubismPhysicsSource_Angle;
                    this._physicsRig.outputs.at(outputIndex + j).getValue =
                        getOutputAngle;
                    this._physicsRig.outputs.at(outputIndex + j).getScale =
                        getOutputScaleAngle;
                }
                this._physicsRig.outputs.at(outputIndex + j).reflect =
                    json.getOutputReflect(i, j);
            }
            this._currentRigOutputs.pushBack(currentRigOutput);
            this._previousRigOutputs.pushBack(previousRigOutput);
            outputIndex += this._physicsRig.settings.at(i).outputCount;
            this._physicsRig.settings.at(i).particleCount = json.getParticleCount(i);
            this._physicsRig.settings.at(i).baseParticleIndex = particleIndex;
            for (let j = 0; j < this._physicsRig.settings.at(i).particleCount; ++j) {
                this._physicsRig.particles.at(particleIndex + j).mobility =
                    json.getParticleMobility(i, j);
                this._physicsRig.particles.at(particleIndex + j).delay =
                    json.getParticleDelay(i, j);
                this._physicsRig.particles.at(particleIndex + j).acceleration =
                    json.getParticleAcceleration(i, j);
                this._physicsRig.particles.at(particleIndex + j).radius =
                    json.getParticleRadius(i, j);
                this._physicsRig.particles.at(particleIndex + j).position =
                    json.getParticlePosition(i, j);
            }
            particleIndex += this._physicsRig.settings.at(i).particleCount;
        }
        this.initialize();
        json.release();
        json = void 0;
        json = null;
    }
    stabilization(model) {
        var _b, _c, _d, _f;
        let totalAngle;
        let weight;
        let radAngle;
        let outputValue;
        const totalTranslation = new CubismVector2();
        let currentSetting;
        let currentInputs;
        let currentOutputs;
        let currentParticles;
        const parameterValues = model.getModel().parameters.values;
        const parameterMaximumValues = model.getModel().parameters.maximumValues;
        const parameterMinimumValues = model.getModel().parameters.minimumValues;
        const parameterDefaultValues = model.getModel().parameters.defaultValues;
        if (((_c = (_b = this._parameterCaches) === null || _b === void 0 ? void 0 : _b.length) !== null && _c !== void 0 ? _c : 0) < model.getParameterCount()) {
            this._parameterCaches = new Float32Array(model.getParameterCount());
        }
        if (((_f = (_d = this._parameterInputCaches) === null || _d === void 0 ? void 0 : _d.length) !== null && _f !== void 0 ? _f : 0) < model.getParameterCount()) {
            this._parameterInputCaches = new Float32Array(model.getParameterCount());
        }
        for (let j = 0; j < model.getParameterCount(); ++j) {
            this._parameterCaches[j] = parameterValues[j];
            this._parameterInputCaches[j] = parameterValues[j];
        }
        for (let settingIndex = 0; settingIndex < this._physicsRig.subRigCount; ++settingIndex) {
            totalAngle = { angle: 0.0 };
            totalTranslation.x = 0.0;
            totalTranslation.y = 0.0;
            currentSetting = this._physicsRig.settings.at(settingIndex);
            currentInputs = this._physicsRig.inputs.get(currentSetting.baseInputIndex);
            currentOutputs = this._physicsRig.outputs.get(currentSetting.baseOutputIndex);
            currentParticles = this._physicsRig.particles.get(currentSetting.baseParticleIndex);
            for (let i = 0; i < currentSetting.inputCount; ++i) {
                weight = currentInputs[i].weight / MaximumWeight;
                if (currentInputs[i].sourceParameterIndex == -1) {
                    currentInputs[i].sourceParameterIndex = model.getParameterIndex(currentInputs[i].source.id);
                }
                currentInputs[i].getNormalizedParameterValue(totalTranslation, totalAngle, parameterValues[currentInputs[i].sourceParameterIndex], parameterMinimumValues[currentInputs[i].sourceParameterIndex], parameterMaximumValues[currentInputs[i].sourceParameterIndex], parameterDefaultValues[currentInputs[i].sourceParameterIndex], currentSetting.normalizationPosition, currentSetting.normalizationAngle, currentInputs[i].reflect, weight);
                this._parameterCaches[currentInputs[i].sourceParameterIndex] =
                    parameterValues[currentInputs[i].sourceParameterIndex];
            }
            radAngle = CubismMath.degreesToRadian(-totalAngle.angle);
            totalTranslation.x =
                totalTranslation.x * CubismMath.cos(radAngle) -
                    totalTranslation.y * CubismMath.sin(radAngle);
            totalTranslation.y =
                totalTranslation.x * CubismMath.sin(radAngle) +
                    totalTranslation.y * CubismMath.cos(radAngle);
            updateParticlesForStabilization(currentParticles, currentSetting.particleCount, totalTranslation, totalAngle.angle, this._options.wind, MovementThreshold * currentSetting.normalizationPosition.maximum);
            for (let i = 0; i < currentSetting.outputCount; ++i) {
                const particleIndex = currentOutputs[i].vertexIndex;
                if (currentOutputs[i].destinationParameterIndex == -1) {
                    currentOutputs[i].destinationParameterIndex = model.getParameterIndex(currentOutputs[i].destination.id);
                }
                if (particleIndex < 1 ||
                    particleIndex >= currentSetting.particleCount) {
                    continue;
                }
                let translation = new CubismVector2();
                translation = currentParticles[particleIndex].position.substract(currentParticles[particleIndex - 1].position);
                outputValue = currentOutputs[i].getValue(translation, currentParticles, particleIndex, currentOutputs[i].reflect, this._options.gravity);
                this._currentRigOutputs.at(settingIndex).outputs.set(i, outputValue);
                this._previousRigOutputs.at(settingIndex).outputs.set(i, outputValue);
                const destinationParameterIndex = currentOutputs[i].destinationParameterIndex;
                const outParameterCaches = !Float32Array.prototype.slice && 'subarray' in Float32Array.prototype
                    ? JSON.parse(JSON.stringify(parameterValues.subarray(destinationParameterIndex)))
                    : parameterValues.slice(destinationParameterIndex);
                updateOutputParameterValue(outParameterCaches, parameterMinimumValues[destinationParameterIndex], parameterMaximumValues[destinationParameterIndex], outputValue, currentOutputs[i]);
                for (let offset = destinationParameterIndex, outParamIndex = 0; offset < this._parameterCaches.length; offset++, outParamIndex++) {
                    parameterValues[offset] = this._parameterCaches[offset] =
                        outParameterCaches[outParamIndex];
                }
            }
        }
    }
    evaluate(model, deltaTimeSeconds) {
        var _b, _c, _d, _f;
        let totalAngle;
        let weight;
        let radAngle;
        let outputValue;
        const totalTranslation = new CubismVector2();
        let currentSetting;
        let currentInputs;
        let currentOutputs;
        let currentParticles;
        if (0.0 >= deltaTimeSeconds) {
            return;
        }
        const parameterValues = model.getModel().parameters.values;
        const parameterMaximumValues = model.getModel().parameters.maximumValues;
        const parameterMinimumValues = model.getModel().parameters.minimumValues;
        const parameterDefaultValues = model.getModel().parameters.defaultValues;
        let physicsDeltaTime;
        this._currentRemainTime += deltaTimeSeconds;
        if (this._currentRemainTime > MaxDeltaTime) {
            this._currentRemainTime = 0.0;
        }
        if (((_c = (_b = this._parameterCaches) === null || _b === void 0 ? void 0 : _b.length) !== null && _c !== void 0 ? _c : 0) < model.getParameterCount()) {
            this._parameterCaches = new Float32Array(model.getParameterCount());
        }
        if (((_f = (_d = this._parameterInputCaches) === null || _d === void 0 ? void 0 : _d.length) !== null && _f !== void 0 ? _f : 0) < model.getParameterCount()) {
            this._parameterInputCaches = new Float32Array(model.getParameterCount());
            for (let j = 0; j < model.getParameterCount(); ++j) {
                this._parameterInputCaches[j] = parameterValues[j];
            }
        }
        if (this._physicsRig.fps > 0.0) {
            physicsDeltaTime = 1.0 / this._physicsRig.fps;
        }
        else {
            physicsDeltaTime = deltaTimeSeconds;
        }
        while (this._currentRemainTime >= physicsDeltaTime) {
            for (let settingIndex = 0; settingIndex < this._physicsRig.subRigCount; ++settingIndex) {
                currentSetting = this._physicsRig.settings.at(settingIndex);
                currentOutputs = this._physicsRig.outputs.get(currentSetting.baseOutputIndex);
                for (let i = 0; i < currentSetting.outputCount; ++i) {
                    this._previousRigOutputs
                        .at(settingIndex)
                        .outputs.set(i, this._currentRigOutputs.at(settingIndex).outputs.at(i));
                }
            }
            const inputWeight = physicsDeltaTime / this._currentRemainTime;
            for (let j = 0; j < model.getParameterCount(); ++j) {
                this._parameterCaches[j] =
                    this._parameterInputCaches[j] * (1.0 - inputWeight) +
                        parameterValues[j] * inputWeight;
                this._parameterInputCaches[j] = this._parameterCaches[j];
            }
            for (let settingIndex = 0; settingIndex < this._physicsRig.subRigCount; ++settingIndex) {
                totalAngle = { angle: 0.0 };
                totalTranslation.x = 0.0;
                totalTranslation.y = 0.0;
                currentSetting = this._physicsRig.settings.at(settingIndex);
                currentInputs = this._physicsRig.inputs.get(currentSetting.baseInputIndex);
                currentOutputs = this._physicsRig.outputs.get(currentSetting.baseOutputIndex);
                currentParticles = this._physicsRig.particles.get(currentSetting.baseParticleIndex);
                for (let i = 0; i < currentSetting.inputCount; ++i) {
                    weight = currentInputs[i].weight / MaximumWeight;
                    if (currentInputs[i].sourceParameterIndex == -1) {
                        currentInputs[i].sourceParameterIndex = model.getParameterIndex(currentInputs[i].source.id);
                    }
                    currentInputs[i].getNormalizedParameterValue(totalTranslation, totalAngle, this._parameterCaches[currentInputs[i].sourceParameterIndex], parameterMinimumValues[currentInputs[i].sourceParameterIndex], parameterMaximumValues[currentInputs[i].sourceParameterIndex], parameterDefaultValues[currentInputs[i].sourceParameterIndex], currentSetting.normalizationPosition, currentSetting.normalizationAngle, currentInputs[i].reflect, weight);
                }
                radAngle = CubismMath.degreesToRadian(-totalAngle.angle);
                totalTranslation.x =
                    totalTranslation.x * CubismMath.cos(radAngle) -
                        totalTranslation.y * CubismMath.sin(radAngle);
                totalTranslation.y =
                    totalTranslation.x * CubismMath.sin(radAngle) +
                        totalTranslation.y * CubismMath.cos(radAngle);
                updateParticles(currentParticles, currentSetting.particleCount, totalTranslation, totalAngle.angle, this._options.wind, MovementThreshold * currentSetting.normalizationPosition.maximum, physicsDeltaTime, AirResistance);
                for (let i = 0; i < currentSetting.outputCount; ++i) {
                    const particleIndex = currentOutputs[i].vertexIndex;
                    if (currentOutputs[i].destinationParameterIndex == -1) {
                        currentOutputs[i].destinationParameterIndex =
                            model.getParameterIndex(currentOutputs[i].destination.id);
                    }
                    if (particleIndex < 1 ||
                        particleIndex >= currentSetting.particleCount) {
                        continue;
                    }
                    const translation = new CubismVector2();
                    translation.x =
                        currentParticles[particleIndex].position.x -
                            currentParticles[particleIndex - 1].position.x;
                    translation.y =
                        currentParticles[particleIndex].position.y -
                            currentParticles[particleIndex - 1].position.y;
                    outputValue = currentOutputs[i].getValue(translation, currentParticles, particleIndex, currentOutputs[i].reflect, this._options.gravity);
                    this._currentRigOutputs.at(settingIndex).outputs.set(i, outputValue);
                    const destinationParameterIndex = currentOutputs[i].destinationParameterIndex;
                    const outParameterCaches = !Float32Array.prototype.slice &&
                        'subarray' in Float32Array.prototype
                        ? JSON.parse(JSON.stringify(this._parameterCaches.subarray(destinationParameterIndex)))
                        : this._parameterCaches.slice(destinationParameterIndex);
                    updateOutputParameterValue(outParameterCaches, parameterMinimumValues[destinationParameterIndex], parameterMaximumValues[destinationParameterIndex], outputValue, currentOutputs[i]);
                    for (let offset = destinationParameterIndex, outParamIndex = 0; offset < this._parameterCaches.length; offset++, outParamIndex++) {
                        this._parameterCaches[offset] = outParameterCaches[outParamIndex];
                    }
                }
            }
            this._currentRemainTime -= physicsDeltaTime;
        }
        const alpha = this._currentRemainTime / physicsDeltaTime;
        this.interpolate(model, alpha);
    }
    interpolate(model, weight) {
        let currentOutputs;
        let currentSetting;
        const parameterValues = model.getModel().parameters.values;
        const parameterMaximumValues = model.getModel().parameters.maximumValues;
        const parameterMinimumValues = model.getModel().parameters.minimumValues;
        for (let settingIndex = 0; settingIndex < this._physicsRig.subRigCount; ++settingIndex) {
            currentSetting = this._physicsRig.settings.at(settingIndex);
            currentOutputs = this._physicsRig.outputs.get(currentSetting.baseOutputIndex);
            for (let i = 0; i < currentSetting.outputCount; ++i) {
                if (currentOutputs[i].destinationParameterIndex == -1) {
                    continue;
                }
                const destinationParameterIndex = currentOutputs[i].destinationParameterIndex;
                const outParameterValues = !Float32Array.prototype.slice && 'subarray' in Float32Array.prototype
                    ? JSON.parse(JSON.stringify(parameterValues.subarray(destinationParameterIndex)))
                    : parameterValues.slice(destinationParameterIndex);
                updateOutputParameterValue(outParameterValues, parameterMinimumValues[destinationParameterIndex], parameterMaximumValues[destinationParameterIndex], this._previousRigOutputs.at(settingIndex).outputs.at(i) *
                    (1 - weight) +
                    this._currentRigOutputs.at(settingIndex).outputs.at(i) * weight, currentOutputs[i]);
                for (let offset = destinationParameterIndex, outParamIndex = 0; offset < parameterValues.length; offset++, outParamIndex++) {
                    parameterValues[offset] = outParameterValues[outParamIndex];
                }
            }
        }
    }
    setOptions(options) {
        this._options = options;
    }
    getOption() {
        return this._options;
    }
    constructor() {
        this._physicsRig = null;
        this._options = new Options();
        this._options.gravity.y = -1.0;
        this._options.gravity.x = 0.0;
        this._options.wind.x = 0.0;
        this._options.wind.y = 0.0;
        this._currentRigOutputs = new csmVector();
        this._previousRigOutputs = new csmVector();
        this._currentRemainTime = 0.0;
        this._parameterCaches = null;
        this._parameterInputCaches = null;
    }
    release() {
        this._physicsRig = void 0;
        this._physicsRig = null;
    }
    initialize() {
        let strand;
        let currentSetting;
        let radius;
        for (let settingIndex = 0; settingIndex < this._physicsRig.subRigCount; ++settingIndex) {
            currentSetting = this._physicsRig.settings.at(settingIndex);
            strand = this._physicsRig.particles.get(currentSetting.baseParticleIndex);
            strand[0].initialPosition = new CubismVector2(0.0, 0.0);
            strand[0].lastPosition = new CubismVector2(strand[0].initialPosition.x, strand[0].initialPosition.y);
            strand[0].lastGravity = new CubismVector2(0.0, -1.0);
            strand[0].lastGravity.y *= -1.0;
            strand[0].velocity = new CubismVector2(0.0, 0.0);
            strand[0].force = new CubismVector2(0.0, 0.0);
            for (let i = 1; i < currentSetting.particleCount; ++i) {
                radius = new CubismVector2(0.0, 0.0);
                radius.y = strand[i].radius;
                strand[i].initialPosition = new CubismVector2(strand[i - 1].initialPosition.x + radius.x, strand[i - 1].initialPosition.y + radius.y);
                strand[i].position = new CubismVector2(strand[i].initialPosition.x, strand[i].initialPosition.y);
                strand[i].lastPosition = new CubismVector2(strand[i].initialPosition.x, strand[i].initialPosition.y);
                strand[i].lastGravity = new CubismVector2(0.0, -1.0);
                strand[i].lastGravity.y *= -1.0;
                strand[i].velocity = new CubismVector2(0.0, 0.0);
                strand[i].force = new CubismVector2(0.0, 0.0);
            }
        }
    }
}
export class Options {
    constructor() {
        this.gravity = new CubismVector2(0, 0);
        this.wind = new CubismVector2(0, 0);
    }
}
export class PhysicsOutput {
    constructor() {
        this.outputs = new csmVector(0);
    }
}
function sign(value) {
    let ret = 0;
    if (value > 0.0) {
        ret = 1;
    }
    else if (value < 0.0) {
        ret = -1;
    }
    return ret;
}
function getInputTranslationXFromNormalizedParameterValue(targetTranslation, targetAngle, value, parameterMinimumValue, parameterMaximumValue, parameterDefaultValue, normalizationPosition, normalizationAngle, isInverted, weight) {
    targetTranslation.x +=
        normalizeParameterValue(value, parameterMinimumValue, parameterMaximumValue, parameterDefaultValue, normalizationPosition.minimum, normalizationPosition.maximum, normalizationPosition.defalut, isInverted) * weight;
}
function getInputTranslationYFromNormalizedParamterValue(targetTranslation, targetAngle, value, parameterMinimumValue, parameterMaximumValue, parameterDefaultValue, normalizationPosition, normalizationAngle, isInverted, weight) {
    targetTranslation.y +=
        normalizeParameterValue(value, parameterMinimumValue, parameterMaximumValue, parameterDefaultValue, normalizationPosition.minimum, normalizationPosition.maximum, normalizationPosition.defalut, isInverted) * weight;
}
function getInputAngleFromNormalizedParameterValue(targetTranslation, targetAngle, value, parameterMinimumValue, parameterMaximumValue, parameterDefaultValue, normalizaitionPosition, normalizationAngle, isInverted, weight) {
    targetAngle.angle +=
        normalizeParameterValue(value, parameterMinimumValue, parameterMaximumValue, parameterDefaultValue, normalizationAngle.minimum, normalizationAngle.maximum, normalizationAngle.defalut, isInverted) * weight;
}
function getOutputTranslationX(translation, particles, particleIndex, isInverted, parentGravity) {
    let outputValue = translation.x;
    if (isInverted) {
        outputValue *= -1.0;
    }
    return outputValue;
}
function getOutputTranslationY(translation, particles, particleIndex, isInverted, parentGravity) {
    let outputValue = translation.y;
    if (isInverted) {
        outputValue *= -1.0;
    }
    return outputValue;
}
function getOutputAngle(translation, particles, particleIndex, isInverted, parentGravity) {
    let outputValue;
    if (particleIndex >= 2) {
        parentGravity = particles[particleIndex - 1].position.substract(particles[particleIndex - 2].position);
    }
    else {
        parentGravity = parentGravity.multiplyByScaler(-1.0);
    }
    outputValue = CubismMath.directionToRadian(parentGravity, translation);
    if (isInverted) {
        outputValue *= -1.0;
    }
    return outputValue;
}
function getRangeValue(min, max) {
    const maxValue = CubismMath.max(min, max);
    const minValue = CubismMath.min(min, max);
    return CubismMath.abs(maxValue - minValue);
}
function getDefaultValue(min, max) {
    const minValue = CubismMath.min(min, max);
    return minValue + getRangeValue(min, max) / 2.0;
}
function getOutputScaleTranslationX(translationScale, angleScale) {
    return JSON.parse(JSON.stringify(translationScale.x));
}
function getOutputScaleTranslationY(translationScale, angleScale) {
    return JSON.parse(JSON.stringify(translationScale.y));
}
function getOutputScaleAngle(translationScale, angleScale) {
    return JSON.parse(JSON.stringify(angleScale));
}
function updateParticles(strand, strandCount, totalTranslation, totalAngle, windDirection, thresholdValue, deltaTimeSeconds, airResistance) {
    let delay;
    let radian;
    let direction = new CubismVector2(0.0, 0.0);
    let velocity = new CubismVector2(0.0, 0.0);
    let force = new CubismVector2(0.0, 0.0);
    let newDirection = new CubismVector2(0.0, 0.0);
    strand[0].position = new CubismVector2(totalTranslation.x, totalTranslation.y);
    const totalRadian = CubismMath.degreesToRadian(totalAngle);
    const currentGravity = CubismMath.radianToDirection(totalRadian);
    currentGravity.normalize();
    for (let i = 1; i < strandCount; ++i) {
        strand[i].force = currentGravity
            .multiplyByScaler(strand[i].acceleration)
            .add(windDirection);
        strand[i].lastPosition = new CubismVector2(strand[i].position.x, strand[i].position.y);
        delay = strand[i].delay * deltaTimeSeconds * 30.0;
        direction = strand[i].position.substract(strand[i - 1].position);
        radian =
            CubismMath.directionToRadian(strand[i].lastGravity, currentGravity) /
                airResistance;
        direction.x =
            CubismMath.cos(radian) * direction.x -
                direction.y * CubismMath.sin(radian);
        direction.y =
            CubismMath.sin(radian) * direction.x +
                direction.y * CubismMath.cos(radian);
        strand[i].position = strand[i - 1].position.add(direction);
        velocity = strand[i].velocity.multiplyByScaler(delay);
        force = strand[i].force.multiplyByScaler(delay).multiplyByScaler(delay);
        strand[i].position = strand[i].position.add(velocity).add(force);
        newDirection = strand[i].position.substract(strand[i - 1].position);
        newDirection.normalize();
        strand[i].position = strand[i - 1].position.add(newDirection.multiplyByScaler(strand[i].radius));
        if (CubismMath.abs(strand[i].position.x) < thresholdValue) {
            strand[i].position.x = 0.0;
        }
        if (delay != 0.0) {
            strand[i].velocity = strand[i].position.substract(strand[i].lastPosition);
            strand[i].velocity = strand[i].velocity.divisionByScalar(delay);
            strand[i].velocity = strand[i].velocity.multiplyByScaler(strand[i].mobility);
        }
        strand[i].force = new CubismVector2(0.0, 0.0);
        strand[i].lastGravity = new CubismVector2(currentGravity.x, currentGravity.y);
    }
}
function updateParticlesForStabilization(strand, strandCount, totalTranslation, totalAngle, windDirection, thresholdValue) {
    let force = new CubismVector2(0.0, 0.0);
    strand[0].position = new CubismVector2(totalTranslation.x, totalTranslation.y);
    const totalRadian = CubismMath.degreesToRadian(totalAngle);
    const currentGravity = CubismMath.radianToDirection(totalRadian);
    currentGravity.normalize();
    for (let i = 1; i < strandCount; ++i) {
        strand[i].force = currentGravity
            .multiplyByScaler(strand[i].acceleration)
            .add(windDirection);
        strand[i].lastPosition = new CubismVector2(strand[i].position.x, strand[i].position.y);
        strand[i].velocity = new CubismVector2(0.0, 0.0);
        force = strand[i].force;
        force.normalize();
        force = force.multiplyByScaler(strand[i].radius);
        strand[i].position = strand[i - 1].position.add(force);
        if (CubismMath.abs(strand[i].position.x) < thresholdValue) {
            strand[i].position.x = 0.0;
        }
        strand[i].force = new CubismVector2(0.0, 0.0);
        strand[i].lastGravity = new CubismVector2(currentGravity.x, currentGravity.y);
    }
}
function updateOutputParameterValue(parameterValue, parameterValueMinimum, parameterValueMaximum, translation, output) {
    let value;
    const outputScale = output.getScale(output.translationScale, output.angleScale);
    value = translation * outputScale;
    if (value < parameterValueMinimum) {
        if (value < output.valueBelowMinimum) {
            output.valueBelowMinimum = value;
        }
        value = parameterValueMinimum;
    }
    else if (value > parameterValueMaximum) {
        if (value > output.valueExceededMaximum) {
            output.valueExceededMaximum = value;
        }
        value = parameterValueMaximum;
    }
    const weight = output.weight / MaximumWeight;
    if (weight >= 1.0) {
        parameterValue[0] = value;
    }
    else {
        value = parameterValue[0] * (1.0 - weight) + value * weight;
        parameterValue[0] = value;
    }
}
function normalizeParameterValue(value, parameterMinimum, parameterMaximum, parameterDefault, normalizedMinimum, normalizedMaximum, normalizedDefault, isInverted) {
    let result = 0.0;
    const maxValue = CubismMath.max(parameterMaximum, parameterMinimum);
    if (maxValue < value) {
        value = maxValue;
    }
    const minValue = CubismMath.min(parameterMaximum, parameterMinimum);
    if (minValue > value) {
        value = minValue;
    }
    const minNormValue = CubismMath.min(normalizedMinimum, normalizedMaximum);
    const maxNormValue = CubismMath.max(normalizedMinimum, normalizedMaximum);
    const middleNormValue = normalizedDefault;
    const middleValue = getDefaultValue(minValue, maxValue);
    const paramValue = value - middleValue;
    switch (sign(paramValue)) {
        case 1: {
            const nLength = maxNormValue - middleNormValue;
            const pLength = maxValue - middleValue;
            if (pLength != 0.0) {
                result = paramValue * (nLength / pLength);
                result += middleNormValue;
            }
            break;
        }
        case -1: {
            const nLength = minNormValue - middleNormValue;
            const pLength = minValue - middleValue;
            if (pLength != 0.0) {
                result = paramValue * (nLength / pLength);
                result += middleNormValue;
            }
            break;
        }
        case 0: {
            result = middleNormValue;
            break;
        }
        default: {
            break;
        }
    }
    return isInverted ? result : result * -1.0;
}
import * as $ from './cubismphysics';
export var Live2DCubismFramework;
(function (Live2DCubismFramework) {
    Live2DCubismFramework.CubismPhysics = $.CubismPhysics;
    Live2DCubismFramework.Options = $.Options;
})(Live2DCubismFramework || (Live2DCubismFramework = {}));
