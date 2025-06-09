import { CubismFramework } from '../live2dcubismframework';
import { csmVector } from '../type/csmvector';
import { CubismJson } from '../utils/cubismjson';
const Epsilon = 0.001;
const DefaultFadeInSeconds = 0.5;
const FadeIn = 'FadeInTime';
const Link = 'Link';
const Groups = 'Groups';
const Id = 'Id';
export class CubismPose {
    static create(pose3json, size) {
        const json = CubismJson.create(pose3json, size);
        if (!json) {
            return null;
        }
        const ret = new CubismPose();
        const root = json.getRoot();
        if (!root.getValueByString(FadeIn).isNull()) {
            ret._fadeTimeSeconds = root
                .getValueByString(FadeIn)
                .toFloat(DefaultFadeInSeconds);
            if (ret._fadeTimeSeconds < 0.0) {
                ret._fadeTimeSeconds = DefaultFadeInSeconds;
            }
        }
        const poseListInfo = root.getValueByString(Groups);
        const poseCount = poseListInfo.getSize();
        for (let poseIndex = 0; poseIndex < poseCount; ++poseIndex) {
            const idListInfo = poseListInfo.getValueByIndex(poseIndex);
            const idCount = idListInfo.getSize();
            let groupCount = 0;
            for (let groupIndex = 0; groupIndex < idCount; ++groupIndex) {
                const partInfo = idListInfo.getValueByIndex(groupIndex);
                const partData = new PartData();
                const parameterId = CubismFramework.getIdManager().getId(partInfo.getValueByString(Id).getRawString());
                partData.partId = parameterId;
                if (!partInfo.getValueByString(Link).isNull()) {
                    const linkListInfo = partInfo.getValueByString(Link);
                    const linkCount = linkListInfo.getSize();
                    for (let linkIndex = 0; linkIndex < linkCount; ++linkIndex) {
                        const linkPart = new PartData();
                        const linkId = CubismFramework.getIdManager().getId(linkListInfo.getValueByIndex(linkIndex).getString());
                        linkPart.partId = linkId;
                        partData.link.pushBack(linkPart);
                    }
                }
                ret._partGroups.pushBack(partData.clone());
                ++groupCount;
            }
            ret._partGroupCounts.pushBack(groupCount);
        }
        CubismJson.delete(json);
        return ret;
    }
    static delete(pose) {
        if (pose != null) {
            pose = null;
        }
    }
    updateParameters(model, deltaTimeSeconds) {
        if (model != this._lastModel) {
            this.reset(model);
        }
        this._lastModel = model;
        if (deltaTimeSeconds < 0.0) {
            deltaTimeSeconds = 0.0;
        }
        let beginIndex = 0;
        for (let i = 0; i < this._partGroupCounts.getSize(); i++) {
            const partGroupCount = this._partGroupCounts.at(i);
            this.doFade(model, deltaTimeSeconds, beginIndex, partGroupCount);
            beginIndex += partGroupCount;
        }
        this.copyPartOpacities(model);
    }
    reset(model) {
        let beginIndex = 0;
        for (let i = 0; i < this._partGroupCounts.getSize(); ++i) {
            const groupCount = this._partGroupCounts.at(i);
            for (let j = beginIndex; j < beginIndex + groupCount; ++j) {
                this._partGroups.at(j).initialize(model);
                const partsIndex = this._partGroups.at(j).partIndex;
                const paramIndex = this._partGroups.at(j).parameterIndex;
                if (partsIndex < 0) {
                    continue;
                }
                model.setPartOpacityByIndex(partsIndex, j == beginIndex ? 1.0 : 0.0);
                model.setParameterValueByIndex(paramIndex, j == beginIndex ? 1.0 : 0.0);
                for (let k = 0; k < this._partGroups.at(j).link.getSize(); ++k) {
                    this._partGroups.at(j).link.at(k).initialize(model);
                }
            }
            beginIndex += groupCount;
        }
    }
    copyPartOpacities(model) {
        for (let groupIndex = 0; groupIndex < this._partGroups.getSize(); ++groupIndex) {
            const partData = this._partGroups.at(groupIndex);
            if (partData.link.getSize() == 0) {
                continue;
            }
            const partIndex = this._partGroups.at(groupIndex).partIndex;
            const opacity = model.getPartOpacityByIndex(partIndex);
            for (let linkIndex = 0; linkIndex < partData.link.getSize(); ++linkIndex) {
                const linkPart = partData.link.at(linkIndex);
                const linkPartIndex = linkPart.partIndex;
                if (linkPartIndex < 0) {
                    continue;
                }
                model.setPartOpacityByIndex(linkPartIndex, opacity);
            }
        }
    }
    doFade(model, deltaTimeSeconds, beginIndex, partGroupCount) {
        let visiblePartIndex = -1;
        let newOpacity = 1.0;
        const phi = 0.5;
        const backOpacityThreshold = 0.15;
        for (let i = beginIndex; i < beginIndex + partGroupCount; ++i) {
            const partIndex = this._partGroups.at(i).partIndex;
            const paramIndex = this._partGroups.at(i).parameterIndex;
            if (model.getParameterValueByIndex(paramIndex) > Epsilon) {
                if (visiblePartIndex >= 0) {
                    break;
                }
                visiblePartIndex = i;
                if (this._fadeTimeSeconds == 0) {
                    newOpacity = 1.0;
                    continue;
                }
                newOpacity = model.getPartOpacityByIndex(partIndex);
                newOpacity += deltaTimeSeconds / this._fadeTimeSeconds;
                if (newOpacity > 1.0) {
                    newOpacity = 1.0;
                }
            }
        }
        if (visiblePartIndex < 0) {
            visiblePartIndex = 0;
            newOpacity = 1.0;
        }
        for (let i = beginIndex; i < beginIndex + partGroupCount; ++i) {
            const partsIndex = this._partGroups.at(i).partIndex;
            if (visiblePartIndex == i) {
                model.setPartOpacityByIndex(partsIndex, newOpacity);
            }
            else {
                let opacity = model.getPartOpacityByIndex(partsIndex);
                let a1;
                if (newOpacity < phi) {
                    a1 = (newOpacity * (phi - 1)) / phi + 1.0;
                }
                else {
                    a1 = ((1 - newOpacity) * phi) / (1.0 - phi);
                }
                const backOpacity = (1.0 - a1) * (1.0 - newOpacity);
                if (backOpacity > backOpacityThreshold) {
                    a1 = 1.0 - backOpacityThreshold / (1.0 - newOpacity);
                }
                if (opacity > a1) {
                    opacity = a1;
                }
                model.setPartOpacityByIndex(partsIndex, opacity);
            }
        }
    }
    constructor() {
        this._fadeTimeSeconds = DefaultFadeInSeconds;
        this._lastModel = null;
        this._partGroups = new csmVector();
        this._partGroupCounts = new csmVector();
    }
}
export class PartData {
    constructor(v) {
        this.parameterIndex = 0;
        this.partIndex = 0;
        this.link = new csmVector();
        if (v != undefined) {
            this.partId = v.partId;
            for (const ite = v.link.begin(); ite.notEqual(v.link.end()); ite.preIncrement()) {
                this.link.pushBack(ite.ptr().clone());
            }
        }
    }
    assignment(v) {
        this.partId = v.partId;
        for (const ite = v.link.begin(); ite.notEqual(v.link.end()); ite.preIncrement()) {
            this.link.pushBack(ite.ptr().clone());
        }
        return this;
    }
    initialize(model) {
        this.parameterIndex = model.getParameterIndex(this.partId);
        this.partIndex = model.getPartIndex(this.partId);
        model.setParameterValueByIndex(this.parameterIndex, 1);
    }
    clone() {
        const clonePartData = new PartData();
        clonePartData.partId = this.partId;
        clonePartData.parameterIndex = this.parameterIndex;
        clonePartData.partIndex = this.partIndex;
        clonePartData.link = new csmVector();
        for (let ite = this.link.begin(); ite.notEqual(this.link.end()); ite.increment()) {
            clonePartData.link.pushBack(ite.ptr().clone());
        }
        return clonePartData;
    }
}
import * as $ from './cubismpose';
export var Live2DCubismFramework;
(function (Live2DCubismFramework) {
    Live2DCubismFramework.CubismPose = $.CubismPose;
    Live2DCubismFramework.PartData = $.PartData;
})(Live2DCubismFramework || (Live2DCubismFramework = {}));
