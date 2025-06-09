import { CubismFramework } from '../live2dcubismframework';
import { csmString } from '../type/csmstring';
import { csmVector } from '../type/csmvector';
import { CubismModelUserDataJson } from './cubismmodeluserdatajson';
const ArtMesh = 'ArtMesh';
export class CubismModelUserDataNode {
}
export class CubismModelUserData {
    static create(buffer, size) {
        const ret = new CubismModelUserData();
        ret.parseUserData(buffer, size);
        return ret;
    }
    static delete(modelUserData) {
        if (modelUserData != null) {
            modelUserData.release();
            modelUserData = null;
        }
    }
    getArtMeshUserDatas() {
        return this._artMeshUserDataNode;
    }
    parseUserData(buffer, size) {
        let json = new CubismModelUserDataJson(buffer, size);
        if (!json) {
            json.release();
            json = void 0;
            return;
        }
        const typeOfArtMesh = CubismFramework.getIdManager().getId(ArtMesh);
        const nodeCount = json.getUserDataCount();
        for (let i = 0; i < nodeCount; i++) {
            const addNode = new CubismModelUserDataNode();
            addNode.targetId = json.getUserDataId(i);
            addNode.targetType = CubismFramework.getIdManager().getId(json.getUserDataTargetType(i));
            addNode.value = new csmString(json.getUserDataValue(i));
            this._userDataNodes.pushBack(addNode);
            if (addNode.targetType == typeOfArtMesh) {
                this._artMeshUserDataNode.pushBack(addNode);
            }
        }
        json.release();
        json = void 0;
    }
    constructor() {
        this._userDataNodes = new csmVector();
        this._artMeshUserDataNode = new csmVector();
    }
    release() {
        for (let i = 0; i < this._userDataNodes.getSize(); ++i) {
            this._userDataNodes.set(i, null);
        }
        this._userDataNodes = null;
    }
}
import * as $ from './cubismmodeluserdata';
export var Live2DCubismFramework;
(function (Live2DCubismFramework) {
    Live2DCubismFramework.CubismModelUserData = $.CubismModelUserData;
    Live2DCubismFramework.CubismModelUserDataNode = $.CubismModelUserDataNode;
})(Live2DCubismFramework || (Live2DCubismFramework = {}));
