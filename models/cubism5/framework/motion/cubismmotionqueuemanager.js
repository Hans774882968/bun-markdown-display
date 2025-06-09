import { CubismMotionQueueEntry } from './cubismmotionqueueentry';
import { csmVector } from '../type/csmvector';
export class CubismMotionQueueManager {
    constructor() {
        this._userTimeSeconds = 0.0;
        this._eventCallBack = null;
        this._eventCustomData = null;
        this._motions = new csmVector();
    }
    release() {
        for (let i = 0; i < this._motions.getSize(); ++i) {
            if (this._motions.at(i)) {
                this._motions.at(i).release();
                this._motions.set(i, null);
            }
        }
        this._motions = null;
    }
    startMotion(motion, autoDelete, userTimeSeconds) {
        if (motion == null) {
            return InvalidMotionQueueEntryHandleValue;
        }
        let motionQueueEntry = null;
        for (let i = 0; i < this._motions.getSize(); ++i) {
            motionQueueEntry = this._motions.at(i);
            if (motionQueueEntry == null) {
                continue;
            }
            motionQueueEntry.setFadeOut(motionQueueEntry._motion.getFadeOutTime());
        }
        motionQueueEntry = new CubismMotionQueueEntry();
        motionQueueEntry._autoDelete = autoDelete;
        motionQueueEntry._motion = motion;
        this._motions.pushBack(motionQueueEntry);
        return motionQueueEntry._motionQueueEntryHandle;
    }
    isFinished() {
        for (let ite = this._motions.begin(); ite.notEqual(this._motions.end());) {
            let motionQueueEntry = ite.ptr();
            if (motionQueueEntry == null) {
                ite = this._motions.erase(ite);
                continue;
            }
            const motion = motionQueueEntry._motion;
            if (motion == null) {
                motionQueueEntry.release();
                motionQueueEntry = null;
                ite = this._motions.erase(ite);
                continue;
            }
            if (!motionQueueEntry.isFinished()) {
                return false;
            }
            else {
                ite.preIncrement();
            }
        }
        return true;
    }
    isFinishedByHandle(motionQueueEntryNumber) {
        for (let ite = this._motions.begin(); ite.notEqual(this._motions.end()); ite.increment()) {
            const motionQueueEntry = ite.ptr();
            if (motionQueueEntry == null) {
                continue;
            }
            if (motionQueueEntry._motionQueueEntryHandle == motionQueueEntryNumber &&
                !motionQueueEntry.isFinished()) {
                return false;
            }
        }
        return true;
    }
    stopAllMotions() {
        for (let ite = this._motions.begin(); ite.notEqual(this._motions.end());) {
            let motionQueueEntry = ite.ptr();
            if (motionQueueEntry == null) {
                ite = this._motions.erase(ite);
                continue;
            }
            motionQueueEntry.release();
            motionQueueEntry = null;
            ite = this._motions.erase(ite);
        }
    }
    getCubismMotionQueueEntries() {
        return this._motions;
    }
    getCubismMotionQueueEntry(motionQueueEntryNumber) {
        for (let ite = this._motions.begin(); ite.notEqual(this._motions.end()); ite.preIncrement()) {
            const motionQueueEntry = ite.ptr();
            if (motionQueueEntry == null) {
                continue;
            }
            if (motionQueueEntry._motionQueueEntryHandle == motionQueueEntryNumber) {
                return motionQueueEntry;
            }
        }
        return null;
    }
    setEventCallback(callback, customData = null) {
        this._eventCallBack = callback;
        this._eventCustomData = customData;
    }
    doUpdateMotion(model, userTimeSeconds) {
        let updated = false;
        for (let ite = this._motions.begin(); ite.notEqual(this._motions.end());) {
            let motionQueueEntry = ite.ptr();
            if (motionQueueEntry == null) {
                ite = this._motions.erase(ite);
                continue;
            }
            const motion = motionQueueEntry._motion;
            if (motion == null) {
                motionQueueEntry.release();
                motionQueueEntry = null;
                ite = this._motions.erase(ite);
                continue;
            }
            motion.updateParameters(model, motionQueueEntry, userTimeSeconds);
            updated = true;
            const firedList = motion.getFiredEvent(motionQueueEntry.getLastCheckEventSeconds() -
                motionQueueEntry.getStartTime(), userTimeSeconds - motionQueueEntry.getStartTime());
            for (let i = 0; i < firedList.getSize(); ++i) {
                this._eventCallBack(this, firedList.at(i), this._eventCustomData);
            }
            motionQueueEntry.setLastCheckEventSeconds(userTimeSeconds);
            if (motionQueueEntry.isFinished()) {
                motionQueueEntry.release();
                motionQueueEntry = null;
                ite = this._motions.erase(ite);
            }
            else {
                if (motionQueueEntry.isTriggeredFadeOut()) {
                    motionQueueEntry.startFadeOut(motionQueueEntry.getFadeOutSeconds(), userTimeSeconds);
                }
                ite.preIncrement();
            }
        }
        return updated;
    }
}
export const InvalidMotionQueueEntryHandleValue = -1;
import * as $ from './cubismmotionqueuemanager';
export var Live2DCubismFramework;
(function (Live2DCubismFramework) {
    Live2DCubismFramework.CubismMotionQueueManager = $.CubismMotionQueueManager;
    Live2DCubismFramework.InvalidMotionQueueEntryHandleValue = $.InvalidMotionQueueEntryHandleValue;
})(Live2DCubismFramework || (Live2DCubismFramework = {}));
