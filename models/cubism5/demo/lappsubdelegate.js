import * as LAppDefine from './lappdefine';
import { LAppGlManager } from './lappglmanager';
import { LAppLive2DManager } from './lapplive2dmanager';
import { LAppPal } from './lapppal';
import { LAppTextureManager } from './lapptexturemanager';
import { LAppView } from './lappview';
export class LAppSubdelegate {
    constructor() {
        this._canvas = null;
        this._glManager = new LAppGlManager();
        this._textureManager = new LAppTextureManager();
        this._live2dManager = new LAppLive2DManager();
        this._view = new LAppView();
        this._frameBuffer = null;
        this._captured = false;
    }
    release() {
        this._resizeObserver.unobserve(this._canvas);
        this._resizeObserver.disconnect();
        this._resizeObserver = null;
        this._live2dManager.release();
        this._live2dManager = null;
        this._view.release();
        this._view = null;
        this._textureManager.release();
        this._textureManager = null;
        this._glManager.release();
        this._glManager = null;
    }
    initialize(canvas) {
        if (!this._glManager.initialize(canvas)) {
            return false;
        }
        this._canvas = canvas;
        if (LAppDefine.CanvasSize === 'auto') {
            this.resizeCanvas();
        }
        else {
            canvas.width = LAppDefine.CanvasSize.width;
            canvas.height = LAppDefine.CanvasSize.height;
        }
        this._textureManager.setGlManager(this._glManager);
        const gl = this._glManager.getGl();
        if (!this._frameBuffer) {
            this._frameBuffer = gl.getParameter(gl.FRAMEBUFFER_BINDING);
        }
        gl.enable(gl.BLEND);
        gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
        this._view.initialize(this);
        this._view.initializeSprite();
        this._live2dManager.initialize(this);
        this._resizeObserver = new ResizeObserver((entries, observer) => this.resizeObserverCallback.call(this, entries, observer));
        this._resizeObserver.observe(this._canvas);
        return true;
    }
    onResize() {
        this.resizeCanvas();
        this._view.initialize(this);
        this._view.initializeSprite();
    }
    resizeObserverCallback(entries, observer) {
        if (LAppDefine.CanvasSize === 'auto') {
            this._needResize = true;
        }
    }
    update() {
        if (this._glManager.getGl().isContextLost()) {
            return;
        }
        if (this._needResize) {
            this.onResize();
            this._needResize = false;
        }
        const gl = this._glManager.getGl();
        gl.clearColor(0.0, 0.0, 0.0, 1.0);
        gl.enable(gl.DEPTH_TEST);
        gl.depthFunc(gl.LEQUAL);
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
        gl.clearDepth(1.0);
        gl.enable(gl.BLEND);
        gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
        this._view.render();
    }
    createShader() {
        const gl = this._glManager.getGl();
        const vertexShaderId = gl.createShader(gl.VERTEX_SHADER);
        if (vertexShaderId == null) {
            LAppPal.printMessage('failed to create vertexShader');
            return null;
        }
        const vertexShader = 'precision mediump float;' +
            'attribute vec3 position;' +
            'attribute vec2 uv;' +
            'varying vec2 vuv;' +
            'void main(void)' +
            '{' +
            '   gl_Position = vec4(position, 1.0);' +
            '   vuv = uv;' +
            '}';
        gl.shaderSource(vertexShaderId, vertexShader);
        gl.compileShader(vertexShaderId);
        const fragmentShaderId = gl.createShader(gl.FRAGMENT_SHADER);
        if (fragmentShaderId == null) {
            LAppPal.printMessage('failed to create fragmentShader');
            return null;
        }
        const fragmentShader = 'precision mediump float;' +
            'varying vec2 vuv;' +
            'uniform sampler2D texture;' +
            'void main(void)' +
            '{' +
            '   gl_FragColor = texture2D(texture, vuv);' +
            '}';
        gl.shaderSource(fragmentShaderId, fragmentShader);
        gl.compileShader(fragmentShaderId);
        const programId = gl.createProgram();
        gl.attachShader(programId, vertexShaderId);
        gl.attachShader(programId, fragmentShaderId);
        gl.deleteShader(vertexShaderId);
        gl.deleteShader(fragmentShaderId);
        gl.linkProgram(programId);
        gl.useProgram(programId);
        return programId;
    }
    getTextureManager() {
        return this._textureManager;
    }
    getFrameBuffer() {
        return this._frameBuffer;
    }
    getCanvas() {
        return this._canvas;
    }
    getGlManager() {
        return this._glManager;
    }
    getLive2DManager() {
        return this._live2dManager;
    }
    resizeCanvas() {
        this._canvas.width = this._canvas.clientWidth * window.devicePixelRatio;
        this._canvas.height = this._canvas.clientHeight * window.devicePixelRatio;
        const gl = this._glManager.getGl();
        gl.viewport(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight);
    }
    onPointBegan(pageX, pageY) {
        if (!this._view) {
            LAppPal.printMessage('view notfound');
            return;
        }
        this._captured = true;
        const localX = pageX - this._canvas.offsetLeft;
        const localY = pageY - this._canvas.offsetTop;
        this._view.onTouchesBegan(localX, localY);
    }
    onPointMoved(pageX, pageY) {
        if (!this._captured) {
            return;
        }
        const localX = pageX - this._canvas.offsetLeft;
        const localY = pageY - this._canvas.offsetTop;
        this._view.onTouchesMoved(localX, localY);
    }
    onPointEnded(pageX, pageY) {
        this._captured = false;
        if (!this._view) {
            LAppPal.printMessage('view notfound');
            return;
        }
        const localX = pageX - this._canvas.offsetLeft;
        const localY = pageY - this._canvas.offsetTop;
        this._view.onTouchesEnded(localX, localY);
    }
    onTouchCancel(pageX, pageY) {
        this._captured = false;
        if (!this._view) {
            LAppPal.printMessage('view notfound');
            return;
        }
        const localX = pageX - this._canvas.offsetLeft;
        const localY = pageY - this._canvas.offsetTop;
        this._view.onTouchesEnded(localX, localY);
    }
    isContextLost() {
        return this._glManager.getGl().isContextLost();
    }
}
