export class CubismBreath {
    static create() {
        return new CubismBreath();
    }
    static delete(instance) {
        if (instance != null) {
            instance = null;
        }
    }
    setParameters(breathParameters) {
        this._breathParameters = breathParameters;
    }
    getParameters() {
        return this._breathParameters;
    }
    updateParameters(model, deltaTimeSeconds) {
        this._currentTime += deltaTimeSeconds;
        const t = this._currentTime * 2.0 * Math.PI;
        for (let i = 0; i < this._breathParameters.getSize(); ++i) {
            const data = this._breathParameters.at(i);
            model.addParameterValueById(data.parameterId, data.offset + data.peak * Math.sin(t / data.cycle), data.weight);
        }
    }
    constructor() {
        this._currentTime = 0.0;
    }
}
export class BreathParameterData {
    constructor(parameterId, offset, peak, cycle, weight) {
        this.parameterId = parameterId == undefined ? null : parameterId;
        this.offset = offset == undefined ? 0.0 : offset;
        this.peak = peak == undefined ? 0.0 : peak;
        this.cycle = cycle == undefined ? 0.0 : cycle;
        this.weight = weight == undefined ? 0.0 : weight;
    }
}
import * as $ from './cubismbreath';
export var Live2DCubismFramework;
(function (Live2DCubismFramework) {
    Live2DCubismFramework.BreathParameterData = $.BreathParameterData;
    Live2DCubismFramework.CubismBreath = $.CubismBreath;
})(Live2DCubismFramework || (Live2DCubismFramework = {}));
