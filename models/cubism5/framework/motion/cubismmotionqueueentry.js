import { ACubismMotion } from './acubismmotion';
export class CubismMotionQueueEntry {
    constructor() {
        this._autoDelete = false;
        this._motion = null;
        this._available = true;
        this._finished = false;
        this._started = false;
        this._startTimeSeconds = -1.0;
        this._fadeInStartTimeSeconds = 0.0;
        this._endTimeSeconds = -1.0;
        this._stateTimeSeconds = 0.0;
        this._stateWeight = 0.0;
        this._lastEventCheckSeconds = 0.0;
        this._motionQueueEntryHandle = this;
        this._fadeOutSeconds = 0.0;
        this._isTriggeredFadeOut = false;
    }
    release() {
        if (this._autoDelete && this._motion) {
            ACubismMotion.delete(this._motion);
        }
    }
    setFadeOut(fadeOutSeconds) {
        this._fadeOutSeconds = fadeOutSeconds;
        this._isTriggeredFadeOut = true;
    }
    startFadeOut(fadeOutSeconds, userTimeSeconds) {
        const newEndTimeSeconds = userTimeSeconds + fadeOutSeconds;
        this._isTriggeredFadeOut = true;
        if (this._endTimeSeconds < 0.0 ||
            newEndTimeSeconds < this._endTimeSeconds) {
            this._endTimeSeconds = newEndTimeSeconds;
        }
    }
    isFinished() {
        return this._finished;
    }
    isStarted() {
        return this._started;
    }
    getStartTime() {
        return this._startTimeSeconds;
    }
    getFadeInStartTime() {
        return this._fadeInStartTimeSeconds;
    }
    getEndTime() {
        return this._endTimeSeconds;
    }
    setStartTime(startTime) {
        this._startTimeSeconds = startTime;
    }
    setFadeInStartTime(startTime) {
        this._fadeInStartTimeSeconds = startTime;
    }
    setEndTime(endTime) {
        this._endTimeSeconds = endTime;
    }
    setIsFinished(f) {
        this._finished = f;
    }
    setIsStarted(f) {
        this._started = f;
    }
    isAvailable() {
        return this._available;
    }
    setIsAvailable(v) {
        this._available = v;
    }
    setState(timeSeconds, weight) {
        this._stateTimeSeconds = timeSeconds;
        this._stateWeight = weight;
    }
    getStateTime() {
        return this._stateTimeSeconds;
    }
    getStateWeight() {
        return this._stateWeight;
    }
    getLastCheckEventSeconds() {
        return this._lastEventCheckSeconds;
    }
    setLastCheckEventSeconds(checkSeconds) {
        this._lastEventCheckSeconds = checkSeconds;
    }
    isTriggeredFadeOut() {
        return this._isTriggeredFadeOut;
    }
    getFadeOutSeconds() {
        return this._fadeOutSeconds;
    }
    getCubismMotion() {
        return this._motion;
    }
}
import * as $ from './cubismmotionqueueentry';
export var Live2DCubismFramework;
(function (Live2DCubismFramework) {
    Live2DCubismFramework.CubismMotionQueueEntry = $.CubismMotionQueueEntry;
})(Live2DCubismFramework || (Live2DCubismFramework = {}));
