import { CubismFramework } from '../live2dcubismframework';
import { csmString } from '../type/csmstring';
import { CSM_ASSERT, CubismLogWarning } from '../utils/cubismdebug';
import { CubismJson } from '../utils/cubismjson';
import { CubismMotionSegmentType } from './cubismmotioninternal';
const Meta = 'Meta';
const Duration = 'Duration';
const Loop = 'Loop';
const AreBeziersRestricted = 'AreBeziersRestricted';
const CurveCount = 'CurveCount';
const Fps = 'Fps';
const TotalSegmentCount = 'TotalSegmentCount';
const TotalPointCount = 'TotalPointCount';
const Curves = 'Curves';
const Target = 'Target';
const Id = 'Id';
const FadeInTime = 'FadeInTime';
const FadeOutTime = 'FadeOutTime';
const Segments = 'Segments';
const UserData = 'UserData';
const UserDataCount = 'UserDataCount';
const TotalUserDataSize = 'TotalUserDataSize';
const Time = 'Time';
const Value = 'Value';
export class CubismMotionJson {
    constructor(buffer, size) {
        this._json = CubismJson.create(buffer, size);
    }
    release() {
        CubismJson.delete(this._json);
    }
    getMotionDuration() {
        return this._json
            .getRoot()
            .getValueByString(Meta)
            .getValueByString(Duration)
            .toFloat();
    }
    isMotionLoop() {
        return this._json
            .getRoot()
            .getValueByString(Meta)
            .getValueByString(Loop)
            .toBoolean();
    }
    hasConsistency() {
        let result = true;
        if (!this._json || !this._json.getRoot()) {
            return false;
        }
        const actualCurveListSize = this._json
            .getRoot()
            .getValueByString(Curves)
            .getVector()
            .getSize();
        let actualTotalSegmentCount = 0;
        let actualTotalPointCount = 0;
        for (let curvePosition = 0; curvePosition < actualCurveListSize; ++curvePosition) {
            for (let segmentPosition = 0; segmentPosition < this.getMotionCurveSegmentCount(curvePosition);) {
                if (segmentPosition == 0) {
                    actualTotalPointCount += 1;
                    segmentPosition += 2;
                }
                const segment = this.getMotionCurveSegment(curvePosition, segmentPosition);
                switch (segment) {
                    case CubismMotionSegmentType.CubismMotionSegmentType_Linear:
                        actualTotalPointCount += 1;
                        segmentPosition += 3;
                        break;
                    case CubismMotionSegmentType.CubismMotionSegmentType_Bezier:
                        actualTotalPointCount += 3;
                        segmentPosition += 7;
                        break;
                    case CubismMotionSegmentType.CubismMotionSegmentType_Stepped:
                        actualTotalPointCount += 1;
                        segmentPosition += 3;
                        break;
                    case CubismMotionSegmentType.CubismMotionSegmentType_InverseStepped:
                        actualTotalPointCount += 1;
                        segmentPosition += 3;
                        break;
                    default:
                        CSM_ASSERT(0);
                        break;
                }
                ++actualTotalSegmentCount;
            }
        }
        if (actualCurveListSize != this.getMotionCurveCount()) {
            CubismLogWarning('The number of curves does not match the metadata.');
            result = false;
        }
        if (actualTotalSegmentCount != this.getMotionTotalSegmentCount()) {
            CubismLogWarning('The number of segment does not match the metadata.');
            result = false;
        }
        if (actualTotalPointCount != this.getMotionTotalPointCount()) {
            CubismLogWarning('The number of point does not match the metadata.');
            result = false;
        }
        return result;
    }
    getEvaluationOptionFlag(flagType) {
        if (EvaluationOptionFlag.EvaluationOptionFlag_AreBeziersRistricted == flagType) {
            return this._json
                .getRoot()
                .getValueByString(Meta)
                .getValueByString(AreBeziersRestricted)
                .toBoolean();
        }
        return false;
    }
    getMotionCurveCount() {
        return this._json
            .getRoot()
            .getValueByString(Meta)
            .getValueByString(CurveCount)
            .toInt();
    }
    getMotionFps() {
        return this._json
            .getRoot()
            .getValueByString(Meta)
            .getValueByString(Fps)
            .toFloat();
    }
    getMotionTotalSegmentCount() {
        return this._json
            .getRoot()
            .getValueByString(Meta)
            .getValueByString(TotalSegmentCount)
            .toInt();
    }
    getMotionTotalPointCount() {
        return this._json
            .getRoot()
            .getValueByString(Meta)
            .getValueByString(TotalPointCount)
            .toInt();
    }
    isExistMotionFadeInTime() {
        return !this._json
            .getRoot()
            .getValueByString(Meta)
            .getValueByString(FadeInTime)
            .isNull();
    }
    isExistMotionFadeOutTime() {
        return !this._json
            .getRoot()
            .getValueByString(Meta)
            .getValueByString(FadeOutTime)
            .isNull();
    }
    getMotionFadeInTime() {
        return this._json
            .getRoot()
            .getValueByString(Meta)
            .getValueByString(FadeInTime)
            .toFloat();
    }
    getMotionFadeOutTime() {
        return this._json
            .getRoot()
            .getValueByString(Meta)
            .getValueByString(FadeOutTime)
            .toFloat();
    }
    getMotionCurveTarget(curveIndex) {
        return this._json
            .getRoot()
            .getValueByString(Curves)
            .getValueByIndex(curveIndex)
            .getValueByString(Target)
            .getRawString();
    }
    getMotionCurveId(curveIndex) {
        return CubismFramework.getIdManager().getId(this._json
            .getRoot()
            .getValueByString(Curves)
            .getValueByIndex(curveIndex)
            .getValueByString(Id)
            .getRawString());
    }
    isExistMotionCurveFadeInTime(curveIndex) {
        return !this._json
            .getRoot()
            .getValueByString(Curves)
            .getValueByIndex(curveIndex)
            .getValueByString(FadeInTime)
            .isNull();
    }
    isExistMotionCurveFadeOutTime(curveIndex) {
        return !this._json
            .getRoot()
            .getValueByString(Curves)
            .getValueByIndex(curveIndex)
            .getValueByString(FadeOutTime)
            .isNull();
    }
    getMotionCurveFadeInTime(curveIndex) {
        return this._json
            .getRoot()
            .getValueByString(Curves)
            .getValueByIndex(curveIndex)
            .getValueByString(FadeInTime)
            .toFloat();
    }
    getMotionCurveFadeOutTime(curveIndex) {
        return this._json
            .getRoot()
            .getValueByString(Curves)
            .getValueByIndex(curveIndex)
            .getValueByString(FadeOutTime)
            .toFloat();
    }
    getMotionCurveSegmentCount(curveIndex) {
        return this._json
            .getRoot()
            .getValueByString(Curves)
            .getValueByIndex(curveIndex)
            .getValueByString(Segments)
            .getVector()
            .getSize();
    }
    getMotionCurveSegment(curveIndex, segmentIndex) {
        return this._json
            .getRoot()
            .getValueByString(Curves)
            .getValueByIndex(curveIndex)
            .getValueByString(Segments)
            .getValueByIndex(segmentIndex)
            .toFloat();
    }
    getEventCount() {
        return this._json
            .getRoot()
            .getValueByString(Meta)
            .getValueByString(UserDataCount)
            .toInt();
    }
    getTotalEventValueSize() {
        return this._json
            .getRoot()
            .getValueByString(Meta)
            .getValueByString(TotalUserDataSize)
            .toInt();
    }
    getEventTime(userDataIndex) {
        return this._json
            .getRoot()
            .getValueByString(UserData)
            .getValueByIndex(userDataIndex)
            .getValueByString(Time)
            .toFloat();
    }
    getEventValue(userDataIndex) {
        return new csmString(this._json
            .getRoot()
            .getValueByString(UserData)
            .getValueByIndex(userDataIndex)
            .getValueByString(Value)
            .getRawString());
    }
}
export var EvaluationOptionFlag;
(function (EvaluationOptionFlag) {
    EvaluationOptionFlag[EvaluationOptionFlag["EvaluationOptionFlag_AreBeziersRistricted"] = 0] = "EvaluationOptionFlag_AreBeziersRistricted";
})(EvaluationOptionFlag || (EvaluationOptionFlag = {}));
import * as $ from './cubismmotionjson';
export var Live2DCubismFramework;
(function (Live2DCubismFramework) {
    Live2DCubismFramework.CubismMotionJson = $.CubismMotionJson;
})(Live2DCubismFramework || (Live2DCubismFramework = {}));
