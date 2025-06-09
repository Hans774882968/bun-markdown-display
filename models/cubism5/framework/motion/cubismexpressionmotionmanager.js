import { csmDelete } from '../live2dcubismframework';
import { csmVector } from '../type/csmvector';
import { CubismExpressionMotion } from './cubismexpressionmotion';
import { CubismMotionQueueManager } from './cubismmotionqueuemanager';
import { CubismLogInfo } from '../utils/cubismdebug';
export class ExpressionParameterValue {
}
export class CubismExpressionMotionManager extends CubismMotionQueueManager {
    constructor() {
        super();
        this._currentPriority = 0;
        this._reservePriority = 0;
        this._expressionParameterValues = new csmVector();
        this._fadeWeights = new csmVector();
    }
    release() {
        if (this._expressionParameterValues) {
            csmDelete(this._expressionParameterValues);
            this._expressionParameterValues = null;
        }
        if (this._fadeWeights) {
            csmDelete(this._fadeWeights);
            this._fadeWeights = null;
        }
    }
    getCurrentPriority() {
        CubismLogInfo('CubismExpressionMotionManager.getCurrentPriority() is deprecated because a priority value is not actually used during expression motion playback.');
        return this._currentPriority;
    }
    getReservePriority() {
        CubismLogInfo('CubismExpressionMotionManager.getReservePriority() is deprecated because a priority value is not actually used during expression motion playback.');
        return this._reservePriority;
    }
    getFadeWeight(index) {
        if (index < 0 ||
            this._fadeWeights.getSize() < 1 ||
            index >= this._fadeWeights.getSize()) {
            console.warn('Failed to get the fade weight value. The element at that index does not exist.');
            return -1;
        }
        return this._fadeWeights.at(index);
    }
    setFadeWeight(index, expressionFadeWeight) {
        if (index < 0 ||
            this._fadeWeights.getSize() < 1 ||
            this._fadeWeights.getSize() <= index) {
            console.warn('Failed to set the fade weight value. The element at that index does not exist.');
            return;
        }
        this._fadeWeights.set(index, expressionFadeWeight);
    }
    setReservePriority(priority) {
        CubismLogInfo('CubismExpressionMotionManager.setReservePriority() is deprecated because a priority value is not actually used during expression motion playback.');
        this._reservePriority = priority;
    }
    startMotionPriority(motion, autoDelete, priority) {
        CubismLogInfo('CubismExpressionMotionManager.startMotionPriority() is deprecated because a priority value is not actually used during expression motion playback.');
        if (priority == this.getReservePriority()) {
            this.setReservePriority(0);
        }
        this._currentPriority = priority;
        return this.startMotion(motion, autoDelete);
    }
    updateMotion(model, deltaTimeSeconds) {
        this._userTimeSeconds += deltaTimeSeconds;
        let updated = false;
        const motions = this.getCubismMotionQueueEntries();
        let expressionWeight = 0.0;
        let expressionIndex = 0;
        if (this._fadeWeights.getSize() !== motions.getSize()) {
            const difference = motions.getSize() - this._fadeWeights.getSize();
            for (let i = 0; i < difference; i++) {
                this._fadeWeights.pushBack(0.0);
            }
        }
        for (let ite = this._motions.begin(); ite.notEqual(this._motions.end());) {
            const motionQueueEntry = ite.ptr();
            if (motionQueueEntry == null) {
                ite = motions.erase(ite);
                continue;
            }
            const expressionMotion = (motionQueueEntry.getCubismMotion());
            if (expressionMotion == null) {
                csmDelete(motionQueueEntry);
                ite = motions.erase(ite);
                continue;
            }
            const expressionParameters = expressionMotion.getExpressionParameters();
            if (motionQueueEntry.isAvailable()) {
                for (let i = 0; i < expressionParameters.getSize(); ++i) {
                    if (expressionParameters.at(i).parameterId == null) {
                        continue;
                    }
                    let index = -1;
                    for (let j = 0; j < this._expressionParameterValues.getSize(); ++j) {
                        if (this._expressionParameterValues.at(j).parameterId !=
                            expressionParameters.at(i).parameterId) {
                            continue;
                        }
                        index = j;
                        break;
                    }
                    if (index >= 0) {
                        continue;
                    }
                    const item = new ExpressionParameterValue();
                    item.parameterId = expressionParameters.at(i).parameterId;
                    item.additiveValue = CubismExpressionMotion.DefaultAdditiveValue;
                    item.multiplyValue = CubismExpressionMotion.DefaultMultiplyValue;
                    item.overwriteValue = model.getParameterValueById(item.parameterId);
                    this._expressionParameterValues.pushBack(item);
                }
            }
            expressionMotion.setupMotionQueueEntry(motionQueueEntry, this._userTimeSeconds);
            this.setFadeWeight(expressionIndex, expressionMotion.updateFadeWeight(motionQueueEntry, this._userTimeSeconds));
            expressionMotion.calculateExpressionParameters(model, this._userTimeSeconds, motionQueueEntry, this._expressionParameterValues, expressionIndex, this.getFadeWeight(expressionIndex));
            expressionWeight +=
                expressionMotion.getFadeInTime() == 0.0
                    ? 1.0
                    : CubismMath.getEasingSine((this._userTimeSeconds - motionQueueEntry.getFadeInStartTime()) /
                        expressionMotion.getFadeInTime());
            updated = true;
            if (motionQueueEntry.isTriggeredFadeOut()) {
                motionQueueEntry.startFadeOut(motionQueueEntry.getFadeOutSeconds(), this._userTimeSeconds);
            }
            ite.preIncrement();
            ++expressionIndex;
        }
        if (motions.getSize() > 1) {
            const latestFadeWeight = this.getFadeWeight(this._fadeWeights.getSize() - 1);
            if (latestFadeWeight >= 1.0) {
                for (let i = motions.getSize() - 2; i >= 0; --i) {
                    const motionQueueEntry = motions.at(i);
                    csmDelete(motionQueueEntry);
                    motions.remove(i);
                    this._fadeWeights.remove(i);
                }
            }
        }
        if (expressionWeight > 1.0) {
            expressionWeight = 1.0;
        }
        for (let i = 0; i < this._expressionParameterValues.getSize(); ++i) {
            const expressionParameterValue = this._expressionParameterValues.at(i);
            model.setParameterValueById(expressionParameterValue.parameterId, (expressionParameterValue.overwriteValue +
                expressionParameterValue.additiveValue) *
                expressionParameterValue.multiplyValue, expressionWeight);
            expressionParameterValue.additiveValue =
                CubismExpressionMotion.DefaultAdditiveValue;
            expressionParameterValue.multiplyValue =
                CubismExpressionMotion.DefaultMultiplyValue;
        }
        return updated;
    }
}
import * as $ from './cubismexpressionmotionmanager';
import { CubismMath } from '../math/cubismmath';
export var Live2DCubismFramework;
(function (Live2DCubismFramework) {
    Live2DCubismFramework.CubismExpressionMotionManager = $.CubismExpressionMotionManager;
})(Live2DCubismFramework || (Live2DCubismFramework = {}));
