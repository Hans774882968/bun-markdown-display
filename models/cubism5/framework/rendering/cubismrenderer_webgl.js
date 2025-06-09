import { csmMap } from '../type/csmmap';
import { csmVector } from '../type/csmvector';
import { CubismLogError } from '../utils/cubismdebug';
import { CubismClippingManager } from './cubismclippingmanager';
import { CubismClippingContext, CubismRenderer } from './cubismrenderer';
import { CubismShaderManager_WebGL } from './cubismshader_webgl';
let s_viewport;
let s_fbo;
export class CubismClippingManager_WebGL extends CubismClippingManager {
    getMaskRenderTexture() {
        if (this._maskTexture && this._maskTexture.textures != null) {
            this._maskTexture.frameNo = this._currentFrameNo;
        }
        else {
            if (this._maskRenderTextures != null) {
                this._maskRenderTextures.clear();
            }
            this._maskRenderTextures = new csmVector();
            if (this._maskColorBuffers != null) {
                this._maskColorBuffers.clear();
            }
            this._maskColorBuffers = new csmVector();
            const size = this._clippingMaskBufferSize;
            for (let index = 0; index < this._renderTextureCount; index++) {
                this._maskColorBuffers.pushBack(this.gl.createTexture());
                this.gl.bindTexture(this.gl.TEXTURE_2D, this._maskColorBuffers.at(index));
                this.gl.texImage2D(this.gl.TEXTURE_2D, 0, this.gl.RGBA, size, size, 0, this.gl.RGBA, this.gl.UNSIGNED_BYTE, null);
                this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_WRAP_S, this.gl.CLAMP_TO_EDGE);
                this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_WRAP_T, this.gl.CLAMP_TO_EDGE);
                this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MIN_FILTER, this.gl.LINEAR);
                this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MAG_FILTER, this.gl.LINEAR);
                this.gl.bindTexture(this.gl.TEXTURE_2D, null);
                this._maskRenderTextures.pushBack(this.gl.createFramebuffer());
                this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, this._maskRenderTextures.at(index));
                this.gl.framebufferTexture2D(this.gl.FRAMEBUFFER, this.gl.COLOR_ATTACHMENT0, this.gl.TEXTURE_2D, this._maskColorBuffers.at(index), 0);
            }
            this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, s_fbo);
            this._maskTexture = new CubismRenderTextureResource(this._currentFrameNo, this._maskRenderTextures);
        }
        return this._maskTexture.textures;
    }
    setGL(gl) {
        this.gl = gl;
    }
    constructor() {
        super(CubismClippingContext_WebGL);
    }
    setupClippingContext(model, renderer) {
        this._currentFrameNo++;
        let usingClipCount = 0;
        for (let clipIndex = 0; clipIndex < this._clippingContextListForMask.getSize(); clipIndex++) {
            const cc = this._clippingContextListForMask.at(clipIndex);
            this.calcClippedDrawTotalBounds(model, cc);
            if (cc._isUsing) {
                usingClipCount++;
            }
        }
        if (usingClipCount > 0) {
            this.gl.viewport(0, 0, this._clippingMaskBufferSize, this._clippingMaskBufferSize);
            this._currentMaskRenderTexture = this.getMaskRenderTexture().at(0);
            renderer.preDraw();
            this.setupLayoutBounds(usingClipCount);
            this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, this._currentMaskRenderTexture);
            if (this._clearedFrameBufferFlags.getSize() != this._renderTextureCount) {
                this._clearedFrameBufferFlags.clear();
                this._clearedFrameBufferFlags = new csmVector(this._renderTextureCount);
            }
            for (let index = 0; index < this._clearedFrameBufferFlags.getSize(); index++) {
                this._clearedFrameBufferFlags.set(index, false);
            }
            for (let clipIndex = 0; clipIndex < this._clippingContextListForMask.getSize(); clipIndex++) {
                const clipContext = this._clippingContextListForMask.at(clipIndex);
                const allClipedDrawRect = clipContext._allClippedDrawRect;
                const layoutBoundsOnTex01 = clipContext._layoutBounds;
                const margin = 0.05;
                let scaleX = 0;
                let scaleY = 0;
                const clipContextRenderTexture = this.getMaskRenderTexture().at(clipContext._bufferIndex);
                if (this._currentMaskRenderTexture != clipContextRenderTexture) {
                    this._currentMaskRenderTexture = clipContextRenderTexture;
                    renderer.preDraw();
                    this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, this._currentMaskRenderTexture);
                }
                this._tmpBoundsOnModel.setRect(allClipedDrawRect);
                this._tmpBoundsOnModel.expand(allClipedDrawRect.width * margin, allClipedDrawRect.height * margin);
                scaleX = layoutBoundsOnTex01.width / this._tmpBoundsOnModel.width;
                scaleY = layoutBoundsOnTex01.height / this._tmpBoundsOnModel.height;
                {
                    this._tmpMatrix.loadIdentity();
                    {
                        this._tmpMatrix.translateRelative(-1.0, -1.0);
                        this._tmpMatrix.scaleRelative(2.0, 2.0);
                    }
                    {
                        this._tmpMatrix.translateRelative(layoutBoundsOnTex01.x, layoutBoundsOnTex01.y);
                        this._tmpMatrix.scaleRelative(scaleX, scaleY);
                        this._tmpMatrix.translateRelative(-this._tmpBoundsOnModel.x, -this._tmpBoundsOnModel.y);
                    }
                    this._tmpMatrixForMask.setMatrix(this._tmpMatrix.getArray());
                }
                {
                    this._tmpMatrix.loadIdentity();
                    {
                        this._tmpMatrix.translateRelative(layoutBoundsOnTex01.x, layoutBoundsOnTex01.y);
                        this._tmpMatrix.scaleRelative(scaleX, scaleY);
                        this._tmpMatrix.translateRelative(-this._tmpBoundsOnModel.x, -this._tmpBoundsOnModel.y);
                    }
                    this._tmpMatrixForDraw.setMatrix(this._tmpMatrix.getArray());
                }
                clipContext._matrixForMask.setMatrix(this._tmpMatrixForMask.getArray());
                clipContext._matrixForDraw.setMatrix(this._tmpMatrixForDraw.getArray());
                const clipDrawCount = clipContext._clippingIdCount;
                for (let i = 0; i < clipDrawCount; i++) {
                    const clipDrawIndex = clipContext._clippingIdList[i];
                    if (!model.getDrawableDynamicFlagVertexPositionsDidChange(clipDrawIndex)) {
                        continue;
                    }
                    renderer.setIsCulling(model.getDrawableCulling(clipDrawIndex) != false);
                    if (!this._clearedFrameBufferFlags.at(clipContext._bufferIndex)) {
                        this.gl.clearColor(1.0, 1.0, 1.0, 1.0);
                        this.gl.clear(this.gl.COLOR_BUFFER_BIT);
                        this._clearedFrameBufferFlags.set(clipContext._bufferIndex, true);
                    }
                    renderer.setClippingContextBufferForMask(clipContext);
                    renderer.drawMeshWebGL(model, clipDrawIndex);
                }
            }
            this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, s_fbo);
            renderer.setClippingContextBufferForMask(null);
            this.gl.viewport(s_viewport[0], s_viewport[1], s_viewport[2], s_viewport[3]);
        }
    }
    getColorBuffer() {
        return this._maskColorBuffers;
    }
    getClippingMaskCount() {
        return this._clippingContextListForMask.getSize();
    }
}
export class CubismRenderTextureResource {
    constructor(frameNo, texture) {
        this.frameNo = frameNo;
        this.textures = texture;
    }
}
export class CubismClippingContext_WebGL extends CubismClippingContext {
    constructor(manager, clippingDrawableIndices, clipCount) {
        super(clippingDrawableIndices, clipCount);
        this._owner = manager;
    }
    getClippingManager() {
        return this._owner;
    }
    setGl(gl) {
        this._owner.setGL(gl);
    }
}
export class CubismRendererProfile_WebGL {
    setGlEnable(index, enabled) {
        if (enabled)
            this.gl.enable(index);
        else
            this.gl.disable(index);
    }
    setGlEnableVertexAttribArray(index, enabled) {
        if (enabled)
            this.gl.enableVertexAttribArray(index);
        else
            this.gl.disableVertexAttribArray(index);
    }
    save() {
        if (this.gl == null) {
            CubismLogError("'gl' is null. WebGLRenderingContext is required.\nPlease call 'CubimRenderer_WebGL.startUp' function.");
            return;
        }
        this._lastArrayBufferBinding = this.gl.getParameter(this.gl.ARRAY_BUFFER_BINDING);
        this._lastElementArrayBufferBinding = this.gl.getParameter(this.gl.ELEMENT_ARRAY_BUFFER_BINDING);
        this._lastProgram = this.gl.getParameter(this.gl.CURRENT_PROGRAM);
        this._lastActiveTexture = this.gl.getParameter(this.gl.ACTIVE_TEXTURE);
        this.gl.activeTexture(this.gl.TEXTURE1);
        this._lastTexture1Binding2D = this.gl.getParameter(this.gl.TEXTURE_BINDING_2D);
        this.gl.activeTexture(this.gl.TEXTURE0);
        this._lastTexture0Binding2D = this.gl.getParameter(this.gl.TEXTURE_BINDING_2D);
        this._lastVertexAttribArrayEnabled[0] = this.gl.getVertexAttrib(0, this.gl.VERTEX_ATTRIB_ARRAY_ENABLED);
        this._lastVertexAttribArrayEnabled[1] = this.gl.getVertexAttrib(1, this.gl.VERTEX_ATTRIB_ARRAY_ENABLED);
        this._lastVertexAttribArrayEnabled[2] = this.gl.getVertexAttrib(2, this.gl.VERTEX_ATTRIB_ARRAY_ENABLED);
        this._lastVertexAttribArrayEnabled[3] = this.gl.getVertexAttrib(3, this.gl.VERTEX_ATTRIB_ARRAY_ENABLED);
        this._lastScissorTest = this.gl.isEnabled(this.gl.SCISSOR_TEST);
        this._lastStencilTest = this.gl.isEnabled(this.gl.STENCIL_TEST);
        this._lastDepthTest = this.gl.isEnabled(this.gl.DEPTH_TEST);
        this._lastCullFace = this.gl.isEnabled(this.gl.CULL_FACE);
        this._lastBlend = this.gl.isEnabled(this.gl.BLEND);
        this._lastFrontFace = this.gl.getParameter(this.gl.FRONT_FACE);
        this._lastColorMask = this.gl.getParameter(this.gl.COLOR_WRITEMASK);
        this._lastBlending[0] = this.gl.getParameter(this.gl.BLEND_SRC_RGB);
        this._lastBlending[1] = this.gl.getParameter(this.gl.BLEND_DST_RGB);
        this._lastBlending[2] = this.gl.getParameter(this.gl.BLEND_SRC_ALPHA);
        this._lastBlending[3] = this.gl.getParameter(this.gl.BLEND_DST_ALPHA);
        this._lastFBO = this.gl.getParameter(this.gl.FRAMEBUFFER_BINDING);
        this._lastViewport = this.gl.getParameter(this.gl.VIEWPORT);
    }
    restore() {
        if (this.gl == null) {
            CubismLogError("'gl' is null. WebGLRenderingContext is required.\nPlease call 'CubimRenderer_WebGL.startUp' function.");
            return;
        }
        this.gl.useProgram(this._lastProgram);
        this.setGlEnableVertexAttribArray(0, this._lastVertexAttribArrayEnabled[0]);
        this.setGlEnableVertexAttribArray(1, this._lastVertexAttribArrayEnabled[1]);
        this.setGlEnableVertexAttribArray(2, this._lastVertexAttribArrayEnabled[2]);
        this.setGlEnableVertexAttribArray(3, this._lastVertexAttribArrayEnabled[3]);
        this.setGlEnable(this.gl.SCISSOR_TEST, this._lastScissorTest);
        this.setGlEnable(this.gl.STENCIL_TEST, this._lastStencilTest);
        this.setGlEnable(this.gl.DEPTH_TEST, this._lastDepthTest);
        this.setGlEnable(this.gl.CULL_FACE, this._lastCullFace);
        this.setGlEnable(this.gl.BLEND, this._lastBlend);
        this.gl.frontFace(this._lastFrontFace);
        this.gl.colorMask(this._lastColorMask[0], this._lastColorMask[1], this._lastColorMask[2], this._lastColorMask[3]);
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this._lastArrayBufferBinding);
        this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, this._lastElementArrayBufferBinding);
        this.gl.activeTexture(this.gl.TEXTURE1);
        this.gl.bindTexture(this.gl.TEXTURE_2D, this._lastTexture1Binding2D);
        this.gl.activeTexture(this.gl.TEXTURE0);
        this.gl.bindTexture(this.gl.TEXTURE_2D, this._lastTexture0Binding2D);
        this.gl.activeTexture(this._lastActiveTexture);
        this.gl.blendFuncSeparate(this._lastBlending[0], this._lastBlending[1], this._lastBlending[2], this._lastBlending[3]);
    }
    setGl(gl) {
        this.gl = gl;
    }
    constructor() {
        this._lastVertexAttribArrayEnabled = new Array(4);
        this._lastColorMask = new Array(4);
        this._lastBlending = new Array(4);
        this._lastViewport = new Array(4);
    }
}
export class CubismRenderer_WebGL extends CubismRenderer {
    initialize(model, maskBufferCount = 1) {
        if (model.isUsingMasking()) {
            this._clippingManager = new CubismClippingManager_WebGL();
            this._clippingManager.initialize(model, maskBufferCount);
        }
        this._sortedDrawableIndexList.resize(model.getDrawableCount(), 0);
        super.initialize(model);
    }
    bindTexture(modelTextureNo, glTexture) {
        this._textures.setValue(modelTextureNo, glTexture);
    }
    getBindedTextures() {
        return this._textures;
    }
    setClippingMaskBufferSize(size) {
        if (!this._model.isUsingMasking()) {
            return;
        }
        const renderTextureCount = this._clippingManager.getRenderTextureCount();
        this._clippingManager.release();
        this._clippingManager = void 0;
        this._clippingManager = null;
        this._clippingManager = new CubismClippingManager_WebGL();
        this._clippingManager.setClippingMaskBufferSize(size);
        this._clippingManager.initialize(this.getModel(), renderTextureCount);
    }
    getClippingMaskBufferSize() {
        return this._model.isUsingMasking()
            ? this._clippingManager.getClippingMaskBufferSize()
            : -1;
    }
    getRenderTextureCount() {
        return this._model.isUsingMasking()
            ? this._clippingManager.getRenderTextureCount()
            : -1;
    }
    constructor() {
        super();
        this._clippingContextBufferForMask = null;
        this._clippingContextBufferForDraw = null;
        this._rendererProfile = new CubismRendererProfile_WebGL();
        this.firstDraw = true;
        this._textures = new csmMap();
        this._sortedDrawableIndexList = new csmVector();
        this._bufferData = {
            vertex: (WebGLBuffer = null),
            uv: (WebGLBuffer = null),
            index: (WebGLBuffer = null)
        };
        this._textures.prepareCapacity(32, true);
    }
    release() {
        if (this._clippingManager) {
            this._clippingManager.release();
            this._clippingManager = void 0;
            this._clippingManager = null;
        }
        if (this.gl == null) {
            return;
        }
        this.gl.deleteBuffer(this._bufferData.vertex);
        this._bufferData.vertex = null;
        this.gl.deleteBuffer(this._bufferData.uv);
        this._bufferData.uv = null;
        this.gl.deleteBuffer(this._bufferData.index);
        this._bufferData.index = null;
        this._bufferData = null;
        this._textures = null;
    }
    doDrawModel() {
        if (this.gl == null) {
            CubismLogError("'gl' is null. WebGLRenderingContext is required.\nPlease call 'CubimRenderer_WebGL.startUp' function.");
            return;
        }
        if (this._clippingManager != null) {
            this.preDraw();
            if (this.isUsingHighPrecisionMask()) {
                this._clippingManager.setupMatrixForHighPrecision(this.getModel(), false);
            }
            else {
                this._clippingManager.setupClippingContext(this.getModel(), this);
            }
        }
        this.preDraw();
        const drawableCount = this.getModel().getDrawableCount();
        const renderOrder = this.getModel().getDrawableRenderOrders();
        for (let i = 0; i < drawableCount; ++i) {
            const order = renderOrder[i];
            this._sortedDrawableIndexList.set(order, i);
        }
        for (let i = 0; i < drawableCount; ++i) {
            const drawableIndex = this._sortedDrawableIndexList.at(i);
            if (!this.getModel().getDrawableDynamicFlagIsVisible(drawableIndex)) {
                continue;
            }
            const clipContext = this._clippingManager != null
                ? this._clippingManager
                    .getClippingContextListForDraw()
                    .at(drawableIndex)
                : null;
            if (clipContext != null && this.isUsingHighPrecisionMask()) {
                if (clipContext._isUsing) {
                    this.gl.viewport(0, 0, this._clippingManager.getClippingMaskBufferSize(), this._clippingManager.getClippingMaskBufferSize());
                    this.preDraw();
                    this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, clipContext
                        .getClippingManager()
                        .getMaskRenderTexture()
                        .at(clipContext._bufferIndex));
                    this.gl.clearColor(1.0, 1.0, 1.0, 1.0);
                    this.gl.clear(this.gl.COLOR_BUFFER_BIT);
                }
                {
                    const clipDrawCount = clipContext._clippingIdCount;
                    for (let index = 0; index < clipDrawCount; index++) {
                        const clipDrawIndex = clipContext._clippingIdList[index];
                        if (!this._model.getDrawableDynamicFlagVertexPositionsDidChange(clipDrawIndex)) {
                            continue;
                        }
                        this.setIsCulling(this._model.getDrawableCulling(clipDrawIndex) != false);
                        this.setClippingContextBufferForMask(clipContext);
                        this.drawMeshWebGL(this._model, clipDrawIndex);
                    }
                }
                {
                    this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, s_fbo);
                    this.setClippingContextBufferForMask(null);
                    this.gl.viewport(s_viewport[0], s_viewport[1], s_viewport[2], s_viewport[3]);
                    this.preDraw();
                }
            }
            this.setClippingContextBufferForDraw(clipContext);
            this.setIsCulling(this.getModel().getDrawableCulling(drawableIndex));
            this.drawMeshWebGL(this._model, drawableIndex);
        }
    }
    drawMeshWebGL(model, index) {
        if (this.isCulling()) {
            this.gl.enable(this.gl.CULL_FACE);
        }
        else {
            this.gl.disable(this.gl.CULL_FACE);
        }
        this.gl.frontFace(this.gl.CCW);
        if (this.isGeneratingMask()) {
            CubismShaderManager_WebGL.getInstance()
                .getShader(this.gl)
                .setupShaderProgramForMask(this, model, index);
        }
        else {
            CubismShaderManager_WebGL.getInstance()
                .getShader(this.gl)
                .setupShaderProgramForDraw(this, model, index);
        }
        {
            const indexCount = model.getDrawableVertexIndexCount(index);
            this.gl.drawElements(this.gl.TRIANGLES, indexCount, this.gl.UNSIGNED_SHORT, 0);
        }
        this.gl.useProgram(null);
        this.setClippingContextBufferForDraw(null);
        this.setClippingContextBufferForMask(null);
    }
    saveProfile() {
        this._rendererProfile.save();
    }
    restoreProfile() {
        this._rendererProfile.restore();
    }
    static doStaticRelease() {
        CubismShaderManager_WebGL.deleteInstance();
    }
    setRenderState(fbo, viewport) {
        s_fbo = fbo;
        s_viewport = viewport;
    }
    preDraw() {
        if (this.firstDraw) {
            this.firstDraw = false;
        }
        this.gl.disable(this.gl.SCISSOR_TEST);
        this.gl.disable(this.gl.STENCIL_TEST);
        this.gl.disable(this.gl.DEPTH_TEST);
        this.gl.frontFace(this.gl.CW);
        this.gl.enable(this.gl.BLEND);
        this.gl.colorMask(true, true, true, true);
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, null);
        this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, null);
        if (this.getAnisotropy() > 0.0 && this._extension) {
            for (let i = 0; i < this._textures.getSize(); ++i) {
                this.gl.bindTexture(this.gl.TEXTURE_2D, this._textures.getValue(i));
                this.gl.texParameterf(this.gl.TEXTURE_2D, this._extension.TEXTURE_MAX_ANISOTROPY_EXT, this.getAnisotropy());
            }
        }
    }
    setClippingContextBufferForMask(clip) {
        this._clippingContextBufferForMask = clip;
    }
    getClippingContextBufferForMask() {
        return this._clippingContextBufferForMask;
    }
    setClippingContextBufferForDraw(clip) {
        this._clippingContextBufferForDraw = clip;
    }
    getClippingContextBufferForDraw() {
        return this._clippingContextBufferForDraw;
    }
    isGeneratingMask() {
        return this.getClippingContextBufferForMask() != null;
    }
    startUp(gl) {
        this.gl = gl;
        if (this._clippingManager) {
            this._clippingManager.setGL(gl);
        }
        CubismShaderManager_WebGL.getInstance().setGlContext(gl);
        this._rendererProfile.setGl(gl);
        this._extension =
            this.gl.getExtension('EXT_texture_filter_anisotropic') ||
                this.gl.getExtension('WEBKIT_EXT_texture_filter_anisotropic') ||
                this.gl.getExtension('MOZ_EXT_texture_filter_anisotropic');
    }
}
CubismRenderer.staticRelease = () => {
    CubismRenderer_WebGL.doStaticRelease();
};
import * as $ from './cubismrenderer_webgl';
export var Live2DCubismFramework;
(function (Live2DCubismFramework) {
    Live2DCubismFramework.CubismClippingContext = $.CubismClippingContext_WebGL;
    Live2DCubismFramework.CubismClippingManager_WebGL = $.CubismClippingManager_WebGL;
    Live2DCubismFramework.CubismRenderTextureResource = $.CubismRenderTextureResource;
    Live2DCubismFramework.CubismRenderer_WebGL = $.CubismRenderer_WebGL;
})(Live2DCubismFramework || (Live2DCubismFramework = {}));
