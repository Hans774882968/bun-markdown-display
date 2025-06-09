import { CubismMath } from './cubismmath';
const FrameRate = 30;
const Epsilon = 0.01;
export class CubismTargetPoint {
    constructor() {
        this._faceTargetX = 0.0;
        this._faceTargetY = 0.0;
        this._faceX = 0.0;
        this._faceY = 0.0;
        this._faceVX = 0.0;
        this._faceVY = 0.0;
        this._lastTimeSeconds = 0.0;
        this._userTimeSeconds = 0.0;
    }
    update(deltaTimeSeconds) {
        this._userTimeSeconds += deltaTimeSeconds;
        const faceParamMaxV = 40.0 / 10.0;
        const maxV = (faceParamMaxV * 1.0) / FrameRate;
        if (this._lastTimeSeconds == 0.0) {
            this._lastTimeSeconds = this._userTimeSeconds;
            return;
        }
        const deltaTimeWeight = (this._userTimeSeconds - this._lastTimeSeconds) * FrameRate;
        this._lastTimeSeconds = this._userTimeSeconds;
        const timeToMaxSpeed = 0.15;
        const frameToMaxSpeed = timeToMaxSpeed * FrameRate;
        const maxA = (deltaTimeWeight * maxV) / frameToMaxSpeed;
        const dx = this._faceTargetX - this._faceX;
        const dy = this._faceTargetY - this._faceY;
        if (CubismMath.abs(dx) <= Epsilon && CubismMath.abs(dy) <= Epsilon) {
            return;
        }
        const d = CubismMath.sqrt(dx * dx + dy * dy);
        const vx = (maxV * dx) / d;
        const vy = (maxV * dy) / d;
        let ax = vx - this._faceVX;
        let ay = vy - this._faceVY;
        const a = CubismMath.sqrt(ax * ax + ay * ay);
        if (a < -maxA || a > maxA) {
            ax *= maxA / a;
            ay *= maxA / a;
        }
        this._faceVX += ax;
        this._faceVY += ay;
        {
            const maxV = 0.5 *
                (CubismMath.sqrt(maxA * maxA + 16.0 * maxA * d - 8.0 * maxA * d) -
                    maxA);
            const curV = CubismMath.sqrt(this._faceVX * this._faceVX + this._faceVY * this._faceVY);
            if (curV > maxV) {
                this._faceVX *= maxV / curV;
                this._faceVY *= maxV / curV;
            }
        }
        this._faceX += this._faceVX;
        this._faceY += this._faceVY;
    }
    getX() {
        return this._faceX;
    }
    getY() {
        return this._faceY;
    }
    set(x, y) {
        this._faceTargetX = x;
        this._faceTargetY = y;
    }
}
import * as $ from './cubismtargetpoint';
export var Live2DCubismFramework;
(function (Live2DCubismFramework) {
    Live2DCubismFramework.CubismTargetPoint = $.CubismTargetPoint;
})(Live2DCubismFramework || (Live2DCubismFramework = {}));
