var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { CubismDefaultParameterId } from '../framework/cubismdefaultparameterid';
import { CubismModelSettingJson } from '../framework/cubismmodelsettingjson';
import { BreathParameterData, CubismBreath } from '../framework/effect/cubismbreath';
import { CubismEyeBlink } from '../framework/effect/cubismeyeblink';
import { CubismFramework } from '../framework/live2dcubismframework';
import { CubismUserModel } from '../framework/model/cubismusermodel';
import { ACubismMotion } from '../framework/motion/acubismmotion';
import { InvalidMotionQueueEntryHandleValue } from '../framework/motion/cubismmotionqueuemanager';
import { csmMap } from '../framework/type/csmmap';
import { csmVector } from '../framework/type/csmvector';
import { CSM_ASSERT, CubismLogError, CubismLogInfo } from '../framework/utils/cubismdebug';
import * as LAppDefine from './lappdefine';
import { LAppPal } from './lapppal';
import { LAppWavFileHandler } from './lappwavfilehandler';
import { CubismMoc } from '../framework/model/cubismmoc';
var LoadStep;
(function (LoadStep) {
    LoadStep[LoadStep["LoadAssets"] = 0] = "LoadAssets";
    LoadStep[LoadStep["LoadModel"] = 1] = "LoadModel";
    LoadStep[LoadStep["WaitLoadModel"] = 2] = "WaitLoadModel";
    LoadStep[LoadStep["LoadExpression"] = 3] = "LoadExpression";
    LoadStep[LoadStep["WaitLoadExpression"] = 4] = "WaitLoadExpression";
    LoadStep[LoadStep["LoadPhysics"] = 5] = "LoadPhysics";
    LoadStep[LoadStep["WaitLoadPhysics"] = 6] = "WaitLoadPhysics";
    LoadStep[LoadStep["LoadPose"] = 7] = "LoadPose";
    LoadStep[LoadStep["WaitLoadPose"] = 8] = "WaitLoadPose";
    LoadStep[LoadStep["SetupEyeBlink"] = 9] = "SetupEyeBlink";
    LoadStep[LoadStep["SetupBreath"] = 10] = "SetupBreath";
    LoadStep[LoadStep["LoadUserData"] = 11] = "LoadUserData";
    LoadStep[LoadStep["WaitLoadUserData"] = 12] = "WaitLoadUserData";
    LoadStep[LoadStep["SetupEyeBlinkIds"] = 13] = "SetupEyeBlinkIds";
    LoadStep[LoadStep["SetupLipSyncIds"] = 14] = "SetupLipSyncIds";
    LoadStep[LoadStep["SetupLayout"] = 15] = "SetupLayout";
    LoadStep[LoadStep["LoadMotion"] = 16] = "LoadMotion";
    LoadStep[LoadStep["WaitLoadMotion"] = 17] = "WaitLoadMotion";
    LoadStep[LoadStep["CompleteInitialize"] = 18] = "CompleteInitialize";
    LoadStep[LoadStep["CompleteSetupModel"] = 19] = "CompleteSetupModel";
    LoadStep[LoadStep["LoadTexture"] = 20] = "LoadTexture";
    LoadStep[LoadStep["WaitLoadTexture"] = 21] = "WaitLoadTexture";
    LoadStep[LoadStep["CompleteSetup"] = 22] = "CompleteSetup";
})(LoadStep || (LoadStep = {}));
export class LAppModel extends CubismUserModel {
    loadAssets(dir, fileName) {
        this._modelHomeDir = dir;
        fetch(`${this._modelHomeDir}${fileName}`)
            .then(response => response.arrayBuffer())
            .then(arrayBuffer => {
                const setting = new CubismModelSettingJson(arrayBuffer, arrayBuffer.byteLength);
                this._state = LoadStep.LoadModel;
                this.setupModel(setting);
            })
            .catch(error => {
                CubismLogError(`Failed to load file ${this._modelHomeDir}${fileName}`);
            });
    }
    setupModel(setting) {
        this._updating = true;
        this._initialized = false;
        this._modelSetting = setting;
        if (this._modelSetting.getModelFileName() != '') {
            const modelFileName = this._modelSetting.getModelFileName();
            fetch(`${this._modelHomeDir}${modelFileName}`)
                .then(response => {
                    if (response.ok) {
                        return response.arrayBuffer();
                    }
                    else if (response.status >= 400) {
                        CubismLogError(`Failed to load file ${this._modelHomeDir}${modelFileName}`);
                        return new ArrayBuffer(0);
                    }
                })
                .then(arrayBuffer => {
                    this.loadModel(arrayBuffer, this._mocConsistency);
                    this._state = LoadStep.LoadExpression;
                    loadCubismExpression();
                });
            this._state = LoadStep.WaitLoadModel;
        }
        else {
            LAppPal.printMessage('Model data does not exist.');
        }
        const loadCubismExpression = () => {
            if (this._modelSetting.getExpressionCount() > 0) {
                const count = this._modelSetting.getExpressionCount();
                for (let i = 0; i < count; i++) {
                    const expressionName = this._modelSetting.getExpressionName(i);
                    const expressionFileName = this._modelSetting.getExpressionFileName(i);
                    fetch(`${this._modelHomeDir}${expressionFileName}`)
                        .then(response => {
                            if (response.ok) {
                                return response.arrayBuffer();
                            }
                            else if (response.status >= 400) {
                                CubismLogError(`Failed to load file ${this._modelHomeDir}${expressionFileName}`);
                                return new ArrayBuffer(0);
                            }
                        })
                        .then(arrayBuffer => {
                            const motion = this.loadExpression(arrayBuffer, arrayBuffer.byteLength, expressionName);
                            if (this._expressions.getValue(expressionName) != null) {
                                ACubismMotion.delete(this._expressions.getValue(expressionName));
                                this._expressions.setValue(expressionName, null);
                            }
                            this._expressions.setValue(expressionName, motion);
                            this._expressionCount++;
                            if (this._expressionCount >= count) {
                                this._state = LoadStep.LoadPhysics;
                                loadCubismPhysics();
                            }
                        });
                }
                this._state = LoadStep.WaitLoadExpression;
            }
            else {
                this._state = LoadStep.LoadPhysics;
                loadCubismPhysics();
            }
        };
        const loadCubismPhysics = () => {
            if (this._modelSetting.getPhysicsFileName() != '') {
                const physicsFileName = this._modelSetting.getPhysicsFileName();
                fetch(`${this._modelHomeDir}${physicsFileName}`)
                    .then(response => {
                        if (response.ok) {
                            return response.arrayBuffer();
                        }
                        else if (response.status >= 400) {
                            CubismLogError(`Failed to load file ${this._modelHomeDir}${physicsFileName}`);
                            return new ArrayBuffer(0);
                        }
                    })
                    .then(arrayBuffer => {
                        this.loadPhysics(arrayBuffer, arrayBuffer.byteLength);
                        this._state = LoadStep.LoadPose;
                        loadCubismPose();
                    });
                this._state = LoadStep.WaitLoadPhysics;
            }
            else {
                this._state = LoadStep.LoadPose;
                loadCubismPose();
            }
        };
        const loadCubismPose = () => {
            if (this._modelSetting.getPoseFileName() != '') {
                const poseFileName = this._modelSetting.getPoseFileName();
                fetch(`${this._modelHomeDir}${poseFileName}`)
                    .then(response => {
                        if (response.ok) {
                            return response.arrayBuffer();
                        }
                        else if (response.status >= 400) {
                            CubismLogError(`Failed to load file ${this._modelHomeDir}${poseFileName}`);
                            return new ArrayBuffer(0);
                        }
                    })
                    .then(arrayBuffer => {
                        this.loadPose(arrayBuffer, arrayBuffer.byteLength);
                        this._state = LoadStep.SetupEyeBlink;
                        setupEyeBlink();
                    });
                this._state = LoadStep.WaitLoadPose;
            }
            else {
                this._state = LoadStep.SetupEyeBlink;
                setupEyeBlink();
            }
        };
        const setupEyeBlink = () => {
            if (this._modelSetting.getEyeBlinkParameterCount() > 0) {
                this._eyeBlink = CubismEyeBlink.create(this._modelSetting);
                this._state = LoadStep.SetupBreath;
            }
            setupBreath();
        };
        const setupBreath = () => {
            this._breath = CubismBreath.create();
            const breathParameters = new csmVector();
            breathParameters.pushBack(new BreathParameterData(this._idParamAngleX, 0.0, 15.0, 6.5345, 0.5));
            breathParameters.pushBack(new BreathParameterData(this._idParamAngleY, 0.0, 8.0, 3.5345, 0.5));
            breathParameters.pushBack(new BreathParameterData(this._idParamAngleZ, 0.0, 10.0, 5.5345, 0.5));
            breathParameters.pushBack(new BreathParameterData(this._idParamBodyAngleX, 0.0, 4.0, 15.5345, 0.5));
            breathParameters.pushBack(new BreathParameterData(CubismFramework.getIdManager().getId(CubismDefaultParameterId.ParamBreath), 0.5, 0.5, 3.2345, 1));
            this._breath.setParameters(breathParameters);
            this._state = LoadStep.LoadUserData;
            loadUserData();
        };
        const loadUserData = () => {
            if (this._modelSetting.getUserDataFile() != '') {
                const userDataFile = this._modelSetting.getUserDataFile();
                fetch(`${this._modelHomeDir}${userDataFile}`)
                    .then(response => {
                        if (response.ok) {
                            return response.arrayBuffer();
                        }
                        else if (response.status >= 400) {
                            CubismLogError(`Failed to load file ${this._modelHomeDir}${userDataFile}`);
                            return new ArrayBuffer(0);
                        }
                    })
                    .then(arrayBuffer => {
                        this.loadUserData(arrayBuffer, arrayBuffer.byteLength);
                        this._state = LoadStep.SetupEyeBlinkIds;
                        setupEyeBlinkIds();
                    });
                this._state = LoadStep.WaitLoadUserData;
            }
            else {
                this._state = LoadStep.SetupEyeBlinkIds;
                setupEyeBlinkIds();
            }
        };
        const setupEyeBlinkIds = () => {
            const eyeBlinkIdCount = this._modelSetting.getEyeBlinkParameterCount();
            for (let i = 0; i < eyeBlinkIdCount; ++i) {
                this._eyeBlinkIds.pushBack(this._modelSetting.getEyeBlinkParameterId(i));
            }
            this._state = LoadStep.SetupLipSyncIds;
            setupLipSyncIds();
        };
        const setupLipSyncIds = () => {
            const lipSyncIdCount = this._modelSetting.getLipSyncParameterCount();
            for (let i = 0; i < lipSyncIdCount; ++i) {
                this._lipSyncIds.pushBack(this._modelSetting.getLipSyncParameterId(i));
            }
            this._state = LoadStep.SetupLayout;
            setupLayout();
        };
        const setupLayout = () => {
            const layout = new csmMap();
            if (this._modelSetting == null || this._modelMatrix == null) {
                CubismLogError('Failed to setupLayout().');
                return;
            }
            this._modelSetting.getLayoutMap(layout);
            this._modelMatrix.setupFromLayout(layout);
            this._state = LoadStep.LoadMotion;
            loadCubismMotion();
        };
        const loadCubismMotion = () => {
            this._state = LoadStep.WaitLoadMotion;
            this._model.saveParameters();
            this._allMotionCount = 0;
            this._motionCount = 0;
            const group = [];
            const motionGroupCount = this._modelSetting.getMotionGroupCount();
            for (let i = 0; i < motionGroupCount; i++) {
                group[i] = this._modelSetting.getMotionGroupName(i);
                this._allMotionCount += this._modelSetting.getMotionCount(group[i]);
            }
            for (let i = 0; i < motionGroupCount; i++) {
                this.preLoadMotionGroup(group[i]);
            }
            if (motionGroupCount == 0) {
                this._state = LoadStep.LoadTexture;
                this._motionManager.stopAllMotions();
                this._updating = false;
                this._initialized = true;
                this.createRenderer();
                this.setupTextures();
                this.getRenderer().startUp(this._subdelegate.getGlManager().getGl());
            }
        };
    }
    setupTextures() {
        const usePremultiply = true;
        if (this._state == LoadStep.LoadTexture) {
            const textureCount = this._modelSetting.getTextureCount();
            for (let modelTextureNumber = 0; modelTextureNumber < textureCount; modelTextureNumber++) {
                if (this._modelSetting.getTextureFileName(modelTextureNumber) == '') {
                    console.log('getTextureFileName null');
                    continue;
                }
                let texturePath = this._modelSetting.getTextureFileName(modelTextureNumber);
                texturePath = this._modelHomeDir + texturePath;
                const onLoad = (textureInfo) => {
                    this.getRenderer().bindTexture(modelTextureNumber, textureInfo.id);
                    this._textureCount++;
                    if (this._textureCount >= textureCount) {
                        this._state = LoadStep.CompleteSetup;
                    }
                };
                this._subdelegate
                    .getTextureManager()
                    .createTextureFromPngFile(texturePath, usePremultiply, onLoad);
                this.getRenderer().setIsPremultipliedAlpha(usePremultiply);
            }
            this._state = LoadStep.WaitLoadTexture;
        }
    }
    reloadRenderer() {
        this.deleteRenderer();
        this.createRenderer();
        this.setupTextures();
    }
    update() {
        if (this._state != LoadStep.CompleteSetup)
            return;
        const deltaTimeSeconds = LAppPal.getDeltaTime();
        this._userTimeSeconds += deltaTimeSeconds;
        this._dragManager.update(deltaTimeSeconds);
        this._dragX = this._dragManager.getX();
        this._dragY = this._dragManager.getY();
        let motionUpdated = false;
        this._model.loadParameters();
        if (this._motionManager.isFinished()) {
            this.startRandomMotion(LAppDefine.MotionGroupIdle, LAppDefine.PriorityIdle);
        }
        else {
            motionUpdated = this._motionManager.updateMotion(this._model, deltaTimeSeconds);
        }
        this._model.saveParameters();
        if (!motionUpdated) {
            if (this._eyeBlink != null) {
                this._eyeBlink.updateParameters(this._model, deltaTimeSeconds);
            }
        }
        if (this._expressionManager != null) {
            this._expressionManager.updateMotion(this._model, deltaTimeSeconds);
        }
        this._model.addParameterValueById(this._idParamAngleX, this._dragX * 30);
        this._model.addParameterValueById(this._idParamAngleY, this._dragY * 30);
        this._model.addParameterValueById(this._idParamAngleZ, this._dragX * this._dragY * -30);
        this._model.addParameterValueById(this._idParamBodyAngleX, this._dragX * 10);
        this._model.addParameterValueById(this._idParamEyeBallX, this._dragX);
        this._model.addParameterValueById(this._idParamEyeBallY, this._dragY);
        if (this._breath != null) {
            this._breath.updateParameters(this._model, deltaTimeSeconds);
        }
        if (this._physics != null) {
            this._physics.evaluate(this._model, deltaTimeSeconds);
        }
        if (this._lipsync) {
            let value = 0.0;
            this._wavFileHandler.update(deltaTimeSeconds);
            value = this._wavFileHandler.getRms();
            for (let i = 0; i < this._lipSyncIds.getSize(); ++i) {
                this._model.addParameterValueById(this._lipSyncIds.at(i), value, 0.8);
            }
        }
        if (this._pose != null) {
            this._pose.updateParameters(this._model, deltaTimeSeconds);
        }
        this._model.update();
    }
    startMotion(group, no, priority, onFinishedMotionHandler, onBeganMotionHandler) {
        if (priority == LAppDefine.PriorityForce) {
            this._motionManager.setReservePriority(priority);
        }
        else if (!this._motionManager.reserveMotion(priority)) {
            if (this._debugMode) {
                LAppPal.printMessage("[bun-markdown-display] can't start motion.");
            }
            return InvalidMotionQueueEntryHandleValue;
        }
        const motionFileName = this._modelSetting.getMotionFileName(group, no);
        const name = `${group}_${no}`;
        let motion = this._motions.getValue(name);
        let autoDelete = false;
        if (motion == null) {
            fetch(`${this._modelHomeDir}${motionFileName}`)
                .then(response => {
                    if (response.ok) {
                        return response.arrayBuffer();
                    }
                    else if (response.status >= 400) {
                        CubismLogError(`Failed to load file ${this._modelHomeDir}${motionFileName}`);
                        return new ArrayBuffer(0);
                    }
                })
                .then(arrayBuffer => {
                    motion = this.loadMotion(arrayBuffer, arrayBuffer.byteLength, null, onFinishedMotionHandler, onBeganMotionHandler, this._modelSetting, group, no, this._motionConsistency);
                });
            if (motion) {
                motion.setEffectIds(this._eyeBlinkIds, this._lipSyncIds);
                autoDelete = true;
            }
            else {
                CubismLogError("Can't start motion {0} .", motionFileName);
                this._motionManager.setReservePriority(LAppDefine.PriorityNone);
                return InvalidMotionQueueEntryHandleValue;
            }
        }
        else {
            motion.setBeganMotionHandler(onBeganMotionHandler);
            motion.setFinishedMotionHandler(onFinishedMotionHandler);
        }
        const voice = this._modelSetting.getMotionSoundFileName(group, no);
        if (voice.localeCompare('') != 0) {
            let path = voice;
            path = this._modelHomeDir + path;
            this._wavFileHandler.start(path);
        }
        if (this._debugMode) {
            LAppPal.printMessage(`[bun-markdown-display] start motion: [${group}_${no}]`);
        }
        return this._motionManager.startMotionPriority(motion, autoDelete, priority);
    }
    startRandomMotion(group, priority, onFinishedMotionHandler, onBeganMotionHandler) {
        if (this._modelSetting.getMotionCount(group) == 0) {
            return InvalidMotionQueueEntryHandleValue;
        }
        const no = Math.floor(Math.random() * this._modelSetting.getMotionCount(group));
        return this.startMotion(group, no, priority, onFinishedMotionHandler, onBeganMotionHandler);
    }
    setExpression(expressionId) {
        const motion = this._expressions.getValue(expressionId);
        if (this._debugMode) {
            LAppPal.printMessage(`[bun-markdown-display] expression: [${expressionId}]`);
        }
        if (motion != null) {
            this._expressionManager.startMotion(motion, false);
        }
        else {
            if (this._debugMode) {
                LAppPal.printMessage(`[bun-markdown-display] expression[${expressionId}] is null`);
            }
        }
    }
    setRandomExpression() {
        if (this._expressions.getSize() == 0) {
            return;
        }
        const no = Math.floor(Math.random() * this._expressions.getSize());
        for (let i = 0; i < this._expressions.getSize(); i++) {
            if (i == no) {
                const name = this._expressions._keyValues[i].first;
                this.setExpression(name);
                return;
            }
        }
    }
    motionEventFired(eventValue) {
        CubismLogInfo('{0} is fired on LAppModel!!', eventValue.s);
    }
    hitTest(hitArenaName, x, y) {
        if (this._opacity < 1) {
            return false;
        }
        const count = this._modelSetting.getHitAreasCount();
        for (let i = 0; i < count; i++) {
            if (this._modelSetting.getHitAreaName(i) == hitArenaName) {
                const drawId = this._modelSetting.getHitAreaId(i);
                return this.isHit(drawId, x, y);
            }
        }
        return false;
    }
    preLoadMotionGroup(group) {
        for (let i = 0; i < this._modelSetting.getMotionCount(group); i++) {
            const motionFileName = this._modelSetting.getMotionFileName(group, i);
            const name = `${group}_${i}`;
            if (this._debugMode) {
                LAppPal.printMessage(`[bun-markdown-display] load motion: ${motionFileName} => [${name}]`);
            }
            fetch(`${this._modelHomeDir}${motionFileName}`)
                .then(response => {
                    if (response.ok) {
                        return response.arrayBuffer();
                    }
                    else if (response.status >= 400) {
                        CubismLogError(`Failed to load file ${this._modelHomeDir}${motionFileName}`);
                        return new ArrayBuffer(0);
                    }
                })
                .then(arrayBuffer => {
                    const tmpMotion = this.loadMotion(arrayBuffer, arrayBuffer.byteLength, name, null, null, this._modelSetting, group, i, this._motionConsistency);
                    if (tmpMotion != null) {
                        tmpMotion.setEffectIds(this._eyeBlinkIds, this._lipSyncIds);
                        if (this._motions.getValue(name) != null) {
                            ACubismMotion.delete(this._motions.getValue(name));
                        }
                        this._motions.setValue(name, tmpMotion);
                        this._motionCount++;
                    }
                    else {
                        this._allMotionCount--;
                    }
                    if (this._motionCount >= this._allMotionCount) {
                        this._state = LoadStep.LoadTexture;
                        this._motionManager.stopAllMotions();
                        this._updating = false;
                        this._initialized = true;
                        this.createRenderer();
                        this.setupTextures();
                        this.getRenderer().startUp(this._subdelegate.getGlManager().getGl());
                    }
                });
        }
    }
    releaseMotions() {
        this._motions.clear();
    }
    releaseExpressions() {
        this._expressions.clear();
    }
    doDraw() {
        if (this._model == null)
            return;
        const canvas = this._subdelegate.getCanvas();
        const viewport = [0, 0, canvas.width, canvas.height];
        this.getRenderer().setRenderState(this._subdelegate.getFrameBuffer(), viewport);
        this.getRenderer().drawModel();
    }
    draw(matrix) {
        if (this._model == null) {
            return;
        }
        if (this._state == LoadStep.CompleteSetup) {
            matrix.multiplyByMatrix(this._modelMatrix);
            this.getRenderer().setMvpMatrix(matrix);
            this.doDraw();
        }
    }
    hasMocConsistencyFromFile() {
        return __awaiter(this, void 0, void 0, function* () {
            CSM_ASSERT(this._modelSetting.getModelFileName().localeCompare(``));
            if (this._modelSetting.getModelFileName() != '') {
                const modelFileName = this._modelSetting.getModelFileName();
                const response = yield fetch(`${this._modelHomeDir}${modelFileName}`);
                const arrayBuffer = yield response.arrayBuffer();
                this._consistency = CubismMoc.hasMocConsistency(arrayBuffer);
                if (!this._consistency) {
                    CubismLogInfo('Inconsistent MOC3.');
                }
                else {
                    CubismLogInfo('Consistent MOC3.');
                }
                return this._consistency;
            }
            else {
                LAppPal.printMessage('Model data does not exist.');
            }
        });
    }
    setSubdelegate(subdelegate) {
        this._subdelegate = subdelegate;
    }
    constructor() {
        super();
        this._modelSetting = null;
        this._modelHomeDir = null;
        this._userTimeSeconds = 0.0;
        this._eyeBlinkIds = new csmVector();
        this._lipSyncIds = new csmVector();
        this._motions = new csmMap();
        this._expressions = new csmMap();
        this._hitArea = new csmVector();
        this._userArea = new csmVector();
        this._idParamAngleX = CubismFramework.getIdManager().getId(CubismDefaultParameterId.ParamAngleX);
        this._idParamAngleY = CubismFramework.getIdManager().getId(CubismDefaultParameterId.ParamAngleY);
        this._idParamAngleZ = CubismFramework.getIdManager().getId(CubismDefaultParameterId.ParamAngleZ);
        this._idParamEyeBallX = CubismFramework.getIdManager().getId(CubismDefaultParameterId.ParamEyeBallX);
        this._idParamEyeBallY = CubismFramework.getIdManager().getId(CubismDefaultParameterId.ParamEyeBallY);
        this._idParamBodyAngleX = CubismFramework.getIdManager().getId(CubismDefaultParameterId.ParamBodyAngleX);
        if (LAppDefine.MOCConsistencyValidationEnable) {
            this._mocConsistency = true;
        }
        if (LAppDefine.MotionConsistencyValidationEnable) {
            this._motionConsistency = true;
        }
        this._state = LoadStep.LoadAssets;
        this._expressionCount = 0;
        this._textureCount = 0;
        this._motionCount = 0;
        this._allMotionCount = 0;
        this._wavFileHandler = new LAppWavFileHandler();
        this._consistency = false;
    }
}
