import { CSM_ASSERT, CubismLogError } from '../utils/cubismdebug';
import { CubismModel } from './cubismmodel';
export class CubismMoc {
    static create(mocBytes, shouldCheckMocConsistency) {
        let cubismMoc = null;
        if (shouldCheckMocConsistency) {
            const consistency = this.hasMocConsistency(mocBytes);
            if (!consistency) {
                CubismLogError(`Inconsistent MOC3.`);
                return cubismMoc;
            }
        }
        const moc = Live2DCubismCore.Moc.fromArrayBuffer(mocBytes);
        if (moc) {
            cubismMoc = new CubismMoc(moc);
            cubismMoc._mocVersion = Live2DCubismCore.Version.csmGetMocVersion(moc, mocBytes);
        }
        return cubismMoc;
    }
    static delete(moc) {
        moc._moc._release();
        moc._moc = null;
        moc = null;
    }
    createModel() {
        let cubismModel = null;
        const model = Live2DCubismCore.Model.fromMoc(this._moc);
        if (model) {
            cubismModel = new CubismModel(model);
            cubismModel.initialize();
            ++this._modelCount;
        }
        return cubismModel;
    }
    deleteModel(model) {
        if (model != null) {
            model.release();
            model = null;
            --this._modelCount;
        }
    }
    constructor(moc) {
        this._moc = moc;
        this._modelCount = 0;
        this._mocVersion = 0;
    }
    release() {
        CSM_ASSERT(this._modelCount == 0);
        this._moc._release();
        this._moc = null;
    }
    getLatestMocVersion() {
        return Live2DCubismCore.Version.csmGetLatestMocVersion();
    }
    getMocVersion() {
        return this._mocVersion;
    }
    static hasMocConsistency(mocBytes) {
        const isConsistent = Live2DCubismCore.Moc.prototype.hasMocConsistency(mocBytes);
        return isConsistent === 1 ? true : false;
    }
}
import * as $ from './cubismmoc';
export var Live2DCubismFramework;
(function (Live2DCubismFramework) {
    Live2DCubismFramework.CubismMoc = $.CubismMoc;
})(Live2DCubismFramework || (Live2DCubismFramework = {}));
