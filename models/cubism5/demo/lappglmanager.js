export class LAppGlManager {
    constructor() {
        this._gl = null;
        this._gl = null;
    }
    initialize(canvas) {
        this._gl = canvas.getContext('webgl2');
        if (!this._gl) {
            alert('Cannot initialize WebGL. This browser does not support.');
            this._gl = null;
            return false;
        }
        return true;
    }
    release() { }
    getGl() {
        return this._gl;
    }
}
