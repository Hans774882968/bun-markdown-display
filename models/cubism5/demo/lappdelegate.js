import { csmVector } from '../framework/type/csmvector';
import { CubismFramework, Option } from '../framework/live2dcubismframework';
import * as LAppDefine from './lappdefine';
import { LAppPal } from './lapppal';
import { LAppSubdelegate } from './lappsubdelegate';
import { CubismLogError } from '../framework/utils/cubismdebug';
export let s_instance = null;
export class LAppDelegate {
    static getInstance() {
        if (s_instance == null) {
            s_instance = new LAppDelegate();
        }
        return s_instance;
    }
    static releaseInstance() {
        if (s_instance != null) {
            s_instance.release();
        }
        s_instance = null;
    }
    onPointerBegan(e) {
        for (let ite = this._subdelegates.begin(); ite.notEqual(this._subdelegates.end()); ite.preIncrement()) {
            ite.ptr().onPointBegan(e.pageX, e.pageY);
        }
    }
    onPointerMoved(e) {
        for (let ite = this._subdelegates.begin(); ite.notEqual(this._subdelegates.end()); ite.preIncrement()) {
            ite.ptr().onPointMoved(e.pageX, e.pageY);
        }
    }
    onPointerEnded(e) {
        for (let ite = this._subdelegates.begin(); ite.notEqual(this._subdelegates.end()); ite.preIncrement()) {
            ite.ptr().onPointEnded(e.pageX, e.pageY);
        }
    }
    onPointerCancel(e) {
        for (let ite = this._subdelegates.begin(); ite.notEqual(this._subdelegates.end()); ite.preIncrement()) {
            ite.ptr().onTouchCancel(e.pageX, e.pageY);
        }
    }
    onResize() {
        for (let i = 0; i < this._subdelegates.getSize(); i++) {
            this._subdelegates.at(i).onResize();
        }
    }
    run() {
        const loop = () => {
            if (s_instance == null) {
                return;
            }
            LAppPal.updateTime();
            for (let i = 0; i < this._subdelegates.getSize(); i++) {
                this._subdelegates.at(i).update();
            }
            requestAnimationFrame(loop);
        };
        loop();
    }
    release() {
        this.releaseEventListener();
        this.releaseSubdelegates();
        CubismFramework.dispose();
        this._cubismOption = null;
    }
    releaseEventListener() {
        document.removeEventListener('pointerup', this.pointBeganEventListener);
        this.pointBeganEventListener = null;
        document.removeEventListener('pointermove', this.pointMovedEventListener);
        this.pointMovedEventListener = null;
        document.removeEventListener('pointerdown', this.pointEndedEventListener);
        this.pointEndedEventListener = null;
        document.removeEventListener('pointerdown', this.pointCancelEventListener);
        this.pointCancelEventListener = null;
    }
    releaseSubdelegates() {
        for (let ite = this._subdelegates.begin(); ite.notEqual(this._subdelegates.end()); ite.preIncrement()) {
            ite.ptr().release();
        }
        this._subdelegates.clear();
        this._subdelegates = null;
    }
    initialize() {
        this.initializeCubism();
        this.initializeSubdelegates();
        this.initializeEventListener();
        return true;
    }
    initializeEventListener() {
        this.pointBeganEventListener = this.onPointerBegan.bind(this);
        this.pointMovedEventListener = this.onPointerMoved.bind(this);
        this.pointEndedEventListener = this.onPointerEnded.bind(this);
        this.pointCancelEventListener = this.onPointerCancel.bind(this);
        document.addEventListener('pointerdown', this.pointBeganEventListener, {
            passive: true
        });
        document.addEventListener('pointermove', this.pointMovedEventListener, {
            passive: true
        });
        document.addEventListener('pointerup', this.pointEndedEventListener, {
            passive: true
        });
        document.addEventListener('pointercancel', this.pointCancelEventListener, {
            passive: true
        });
    }
    initializeCubism() {
        LAppPal.updateTime();
        this._cubismOption.logFunction = LAppPal.printMessage;
        this._cubismOption.loggingLevel = LAppDefine.CubismLoggingLevel;
        CubismFramework.startUp(this._cubismOption);
        CubismFramework.initialize();
    }
    initializeSubdelegates() {
        let width = 100;
        let height = 100;
        if (LAppDefine.CanvasNum > 3) {
            const widthunit = Math.ceil(Math.sqrt(LAppDefine.CanvasNum));
            const heightUnit = Math.ceil(LAppDefine.CanvasNum / widthunit);
            width = 100.0 / widthunit;
            height = 100.0 / heightUnit;
        }
        else {
            width = 100.0 / LAppDefine.CanvasNum;
        }
        this._canvases.prepareCapacity(LAppDefine.CanvasNum);
        this._subdelegates.prepareCapacity(LAppDefine.CanvasNum);
        for (let i = 0; i < LAppDefine.CanvasNum; i++) {
            const canvas = document.createElement('canvas');
            this._canvases.pushBack(canvas);
            canvas.style.width = `${width}vw`;
            canvas.style.height = `${height}vh`;
            document.body.appendChild(canvas);
        }
        for (let i = 0; i < this._canvases.getSize(); i++) {
            const subdelegate = new LAppSubdelegate();
            subdelegate.initialize(this._canvases.at(i));
            this._subdelegates.pushBack(subdelegate);
        }
        for (let i = 0; i < LAppDefine.CanvasNum; i++) {
            if (this._subdelegates.at(i).isContextLost()) {
                CubismLogError(`The context for Canvas at index ${i} was lost, possibly because the acquisition limit for WebGLRenderingContext was reached.`);
            }
        }
    }
    constructor() {
        this._cubismOption = new Option();
        this._subdelegates = new csmVector();
        this._canvases = new csmVector();
    }
}
