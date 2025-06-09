import { ICubismModelSetting } from './icubismmodelsetting';
import { CubismFramework } from './live2dcubismframework';
import { csmVector } from './type/csmvector';
import { CubismJson } from './utils/cubismjson';
export var FrequestNode;
(function (FrequestNode) {
    FrequestNode[FrequestNode["FrequestNode_Groups"] = 0] = "FrequestNode_Groups";
    FrequestNode[FrequestNode["FrequestNode_Moc"] = 1] = "FrequestNode_Moc";
    FrequestNode[FrequestNode["FrequestNode_Motions"] = 2] = "FrequestNode_Motions";
    FrequestNode[FrequestNode["FrequestNode_Expressions"] = 3] = "FrequestNode_Expressions";
    FrequestNode[FrequestNode["FrequestNode_Textures"] = 4] = "FrequestNode_Textures";
    FrequestNode[FrequestNode["FrequestNode_Physics"] = 5] = "FrequestNode_Physics";
    FrequestNode[FrequestNode["FrequestNode_Pose"] = 6] = "FrequestNode_Pose";
    FrequestNode[FrequestNode["FrequestNode_HitAreas"] = 7] = "FrequestNode_HitAreas";
})(FrequestNode || (FrequestNode = {}));
export class CubismModelSettingJson extends ICubismModelSetting {
    constructor(buffer, size) {
        super();
        this.version = 'Version';
        this.fileReferences = 'FileReferences';
        this.groups = 'Groups';
        this.layout = 'Layout';
        this.hitAreas = 'HitAreas';
        this.moc = 'Moc';
        this.textures = 'Textures';
        this.physics = 'Physics';
        this.pose = 'Pose';
        this.expressions = 'Expressions';
        this.motions = 'Motions';
        this.userData = 'UserData';
        this.name = 'Name';
        this.filePath = 'File';
        this.id = 'Id';
        this.ids = 'Ids';
        this.target = 'Target';
        this.idle = 'Idle';
        this.tapBody = 'TapBody';
        this.pinchIn = 'PinchIn';
        this.pinchOut = 'PinchOut';
        this.shake = 'Shake';
        this.flickHead = 'FlickHead';
        this.parameter = 'Parameter';
        this.soundPath = 'Sound';
        this.fadeInTime = 'FadeInTime';
        this.fadeOutTime = 'FadeOutTime';
        this.centerX = 'CenterX';
        this.centerY = 'CenterY';
        this.x = 'X';
        this.y = 'Y';
        this.width = 'Width';
        this.height = 'Height';
        this.lipSync = 'LipSync';
        this.eyeBlink = 'EyeBlink';
        this.initParameter = 'init_param';
        this.initPartsVisible = 'init_parts_visible';
        this.val = 'val';
        this._json = CubismJson.create(buffer, size);
        if (this.getJson()) {
            this._jsonValue = new csmVector();
            this._jsonValue.pushBack(this.getJson().getRoot().getValueByString(this.groups));
            this._jsonValue.pushBack(this.getJson()
                .getRoot()
                .getValueByString(this.fileReferences)
                .getValueByString(this.moc));
            this._jsonValue.pushBack(this.getJson()
                .getRoot()
                .getValueByString(this.fileReferences)
                .getValueByString(this.motions));
            this._jsonValue.pushBack(this.getJson()
                .getRoot()
                .getValueByString(this.fileReferences)
                .getValueByString(this.expressions));
            this._jsonValue.pushBack(this.getJson()
                .getRoot()
                .getValueByString(this.fileReferences)
                .getValueByString(this.textures));
            this._jsonValue.pushBack(this.getJson()
                .getRoot()
                .getValueByString(this.fileReferences)
                .getValueByString(this.physics));
            this._jsonValue.pushBack(this.getJson()
                .getRoot()
                .getValueByString(this.fileReferences)
                .getValueByString(this.pose));
            this._jsonValue.pushBack(this.getJson().getRoot().getValueByString(this.hitAreas));
        }
    }
    release() {
        CubismJson.delete(this._json);
        this._jsonValue = null;
    }
    getJson() {
        return this._json;
    }
    getModelFileName() {
        if (!this.isExistModelFile()) {
            return '';
        }
        return this._jsonValue.at(FrequestNode.FrequestNode_Moc).getRawString();
    }
    getTextureCount() {
        if (!this.isExistTextureFiles()) {
            return 0;
        }
        return this._jsonValue.at(FrequestNode.FrequestNode_Textures).getSize();
    }
    getTextureDirectory() {
        const texturePath = this._jsonValue
            .at(FrequestNode.FrequestNode_Textures)
            .getValueByIndex(0)
            .getRawString();
        const pathArray = texturePath.split('/');
        const arrayLength = pathArray.length - 1;
        let textureDirectoryStr = '';
        for (let i = 0; i < arrayLength; i++) {
            textureDirectoryStr += pathArray[i];
            if (i < arrayLength - 1) {
                textureDirectoryStr += '/';
            }
        }
        return textureDirectoryStr;
    }
    getTextureFileName(index) {
        return this._jsonValue
            .at(FrequestNode.FrequestNode_Textures)
            .getValueByIndex(index)
            .getRawString();
    }
    getHitAreasCount() {
        if (!this.isExistHitAreas()) {
            return 0;
        }
        return this._jsonValue.at(FrequestNode.FrequestNode_HitAreas).getSize();
    }
    getHitAreaId(index) {
        return CubismFramework.getIdManager().getId(this._jsonValue
            .at(FrequestNode.FrequestNode_HitAreas)
            .getValueByIndex(index)
            .getValueByString(this.id)
            .getRawString());
    }
    getHitAreaName(index) {
        return this._jsonValue
            .at(FrequestNode.FrequestNode_HitAreas)
            .getValueByIndex(index)
            .getValueByString(this.name)
            .getRawString();
    }
    getPhysicsFileName() {
        if (!this.isExistPhysicsFile()) {
            return '';
        }
        return this._jsonValue.at(FrequestNode.FrequestNode_Physics).getRawString();
    }
    getPoseFileName() {
        if (!this.isExistPoseFile()) {
            return '';
        }
        return this._jsonValue.at(FrequestNode.FrequestNode_Pose).getRawString();
    }
    getExpressionCount() {
        if (!this.isExistExpressionFile()) {
            return 0;
        }
        return this._jsonValue.at(FrequestNode.FrequestNode_Expressions).getSize();
    }
    getExpressionName(index) {
        return this._jsonValue
            .at(FrequestNode.FrequestNode_Expressions)
            .getValueByIndex(index)
            .getValueByString(this.name)
            .getRawString();
    }
    getExpressionFileName(index) {
        return this._jsonValue
            .at(FrequestNode.FrequestNode_Expressions)
            .getValueByIndex(index)
            .getValueByString(this.filePath)
            .getRawString();
    }
    getMotionGroupCount() {
        if (!this.isExistMotionGroups()) {
            return 0;
        }
        return this._jsonValue
            .at(FrequestNode.FrequestNode_Motions)
            .getKeys()
            .getSize();
    }
    getMotionGroupName(index) {
        if (!this.isExistMotionGroups()) {
            return null;
        }
        return this._jsonValue
            .at(FrequestNode.FrequestNode_Motions)
            .getKeys()
            .at(index);
    }
    getMotionCount(groupName) {
        if (!this.isExistMotionGroupName(groupName)) {
            return 0;
        }
        return this._jsonValue
            .at(FrequestNode.FrequestNode_Motions)
            .getValueByString(groupName)
            .getSize();
    }
    getMotionFileName(groupName, index) {
        if (!this.isExistMotionGroupName(groupName)) {
            return '';
        }
        return this._jsonValue
            .at(FrequestNode.FrequestNode_Motions)
            .getValueByString(groupName)
            .getValueByIndex(index)
            .getValueByString(this.filePath)
            .getRawString();
    }
    getMotionSoundFileName(groupName, index) {
        if (!this.isExistMotionSoundFile(groupName, index)) {
            return '';
        }
        return this._jsonValue
            .at(FrequestNode.FrequestNode_Motions)
            .getValueByString(groupName)
            .getValueByIndex(index)
            .getValueByString(this.soundPath)
            .getRawString();
    }
    getMotionFadeInTimeValue(groupName, index) {
        if (!this.isExistMotionFadeIn(groupName, index)) {
            return -1.0;
        }
        return this._jsonValue
            .at(FrequestNode.FrequestNode_Motions)
            .getValueByString(groupName)
            .getValueByIndex(index)
            .getValueByString(this.fadeInTime)
            .toFloat();
    }
    getMotionFadeOutTimeValue(groupName, index) {
        if (!this.isExistMotionFadeOut(groupName, index)) {
            return -1.0;
        }
        return this._jsonValue
            .at(FrequestNode.FrequestNode_Motions)
            .getValueByString(groupName)
            .getValueByIndex(index)
            .getValueByString(this.fadeOutTime)
            .toFloat();
    }
    getUserDataFile() {
        if (!this.isExistUserDataFile()) {
            return '';
        }
        return this.getJson()
            .getRoot()
            .getValueByString(this.fileReferences)
            .getValueByString(this.userData)
            .getRawString();
    }
    getLayoutMap(outLayoutMap) {
        const map = this.getJson()
            .getRoot()
            .getValueByString(this.layout)
            .getMap();
        if (map == null) {
            return false;
        }
        let ret = false;
        for (const ite = map.begin(); ite.notEqual(map.end()); ite.preIncrement()) {
            outLayoutMap.setValue(ite.ptr().first, ite.ptr().second.toFloat());
            ret = true;
        }
        return ret;
    }
    getEyeBlinkParameterCount() {
        if (!this.isExistEyeBlinkParameters()) {
            return 0;
        }
        let num = 0;
        for (let i = 0; i < this._jsonValue.at(FrequestNode.FrequestNode_Groups).getSize(); i++) {
            const refI = this._jsonValue
                .at(FrequestNode.FrequestNode_Groups)
                .getValueByIndex(i);
            if (refI.isNull() || refI.isError()) {
                continue;
            }
            if (refI.getValueByString(this.name).getRawString() == this.eyeBlink) {
                num = refI.getValueByString(this.ids).getVector().getSize();
                break;
            }
        }
        return num;
    }
    getEyeBlinkParameterId(index) {
        if (!this.isExistEyeBlinkParameters()) {
            return null;
        }
        for (let i = 0; i < this._jsonValue.at(FrequestNode.FrequestNode_Groups).getSize(); i++) {
            const refI = this._jsonValue
                .at(FrequestNode.FrequestNode_Groups)
                .getValueByIndex(i);
            if (refI.isNull() || refI.isError()) {
                continue;
            }
            if (refI.getValueByString(this.name).getRawString() == this.eyeBlink) {
                return CubismFramework.getIdManager().getId(refI.getValueByString(this.ids).getValueByIndex(index).getRawString());
            }
        }
        return null;
    }
    getLipSyncParameterCount() {
        if (!this.isExistLipSyncParameters()) {
            return 0;
        }
        let num = 0;
        for (let i = 0; i < this._jsonValue.at(FrequestNode.FrequestNode_Groups).getSize(); i++) {
            const refI = this._jsonValue
                .at(FrequestNode.FrequestNode_Groups)
                .getValueByIndex(i);
            if (refI.isNull() || refI.isError()) {
                continue;
            }
            if (refI.getValueByString(this.name).getRawString() == this.lipSync) {
                num = refI.getValueByString(this.ids).getVector().getSize();
                break;
            }
        }
        return num;
    }
    getLipSyncParameterId(index) {
        if (!this.isExistLipSyncParameters()) {
            return null;
        }
        for (let i = 0; i < this._jsonValue.at(FrequestNode.FrequestNode_Groups).getSize(); i++) {
            const refI = this._jsonValue
                .at(FrequestNode.FrequestNode_Groups)
                .getValueByIndex(i);
            if (refI.isNull() || refI.isError()) {
                continue;
            }
            if (refI.getValueByString(this.name).getRawString() == this.lipSync) {
                return CubismFramework.getIdManager().getId(refI.getValueByString(this.ids).getValueByIndex(index).getRawString());
            }
        }
        return null;
    }
    isExistModelFile() {
        const node = this._jsonValue.at(FrequestNode.FrequestNode_Moc);
        return !node.isNull() && !node.isError();
    }
    isExistTextureFiles() {
        const node = this._jsonValue.at(FrequestNode.FrequestNode_Textures);
        return !node.isNull() && !node.isError();
    }
    isExistHitAreas() {
        const node = this._jsonValue.at(FrequestNode.FrequestNode_HitAreas);
        return !node.isNull() && !node.isError();
    }
    isExistPhysicsFile() {
        const node = this._jsonValue.at(FrequestNode.FrequestNode_Physics);
        return !node.isNull() && !node.isError();
    }
    isExistPoseFile() {
        const node = this._jsonValue.at(FrequestNode.FrequestNode_Pose);
        return !node.isNull() && !node.isError();
    }
    isExistExpressionFile() {
        const node = this._jsonValue.at(FrequestNode.FrequestNode_Expressions);
        return !node.isNull() && !node.isError();
    }
    isExistMotionGroups() {
        const node = this._jsonValue.at(FrequestNode.FrequestNode_Motions);
        return !node.isNull() && !node.isError();
    }
    isExistMotionGroupName(groupName) {
        const node = this._jsonValue
            .at(FrequestNode.FrequestNode_Motions)
            .getValueByString(groupName);
        return !node.isNull() && !node.isError();
    }
    isExistMotionSoundFile(groupName, index) {
        const node = this._jsonValue
            .at(FrequestNode.FrequestNode_Motions)
            .getValueByString(groupName)
            .getValueByIndex(index)
            .getValueByString(this.soundPath);
        return !node.isNull() && !node.isError();
    }
    isExistMotionFadeIn(groupName, index) {
        const node = this._jsonValue
            .at(FrequestNode.FrequestNode_Motions)
            .getValueByString(groupName)
            .getValueByIndex(index)
            .getValueByString(this.fadeInTime);
        return !node.isNull() && !node.isError();
    }
    isExistMotionFadeOut(groupName, index) {
        const node = this._jsonValue
            .at(FrequestNode.FrequestNode_Motions)
            .getValueByString(groupName)
            .getValueByIndex(index)
            .getValueByString(this.fadeOutTime);
        return !node.isNull() && !node.isError();
    }
    isExistUserDataFile() {
        const node = this.getJson()
            .getRoot()
            .getValueByString(this.fileReferences)
            .getValueByString(this.userData);
        return !node.isNull() && !node.isError();
    }
    isExistEyeBlinkParameters() {
        if (this._jsonValue.at(FrequestNode.FrequestNode_Groups).isNull() ||
            this._jsonValue.at(FrequestNode.FrequestNode_Groups).isError()) {
            return false;
        }
        for (let i = 0; i < this._jsonValue.at(FrequestNode.FrequestNode_Groups).getSize(); ++i) {
            if (this._jsonValue
                .at(FrequestNode.FrequestNode_Groups)
                .getValueByIndex(i)
                .getValueByString(this.name)
                .getRawString() == this.eyeBlink) {
                return true;
            }
        }
        return false;
    }
    isExistLipSyncParameters() {
        if (this._jsonValue.at(FrequestNode.FrequestNode_Groups).isNull() ||
            this._jsonValue.at(FrequestNode.FrequestNode_Groups).isError()) {
            return false;
        }
        for (let i = 0; i < this._jsonValue.at(FrequestNode.FrequestNode_Groups).getSize(); ++i) {
            if (this._jsonValue
                .at(FrequestNode.FrequestNode_Groups)
                .getValueByIndex(i)
                .getValueByString(this.name)
                .getRawString() == this.lipSync) {
                return true;
            }
        }
        return false;
    }
}
import * as $ from './cubismmodelsettingjson';
export var Live2DCubismFramework;
(function (Live2DCubismFramework) {
    Live2DCubismFramework.CubismModelSettingJson = $.CubismModelSettingJson;
    Live2DCubismFramework.FrequestNode = $.FrequestNode;
})(Live2DCubismFramework || (Live2DCubismFramework = {}));
