export class LAppSprite {
    constructor(x, y, width, height, textureId) {
        this._rect = new Rect();
        this._rect.left = x - width * 0.5;
        this._rect.right = x + width * 0.5;
        this._rect.up = y + height * 0.5;
        this._rect.down = y - height * 0.5;
        this._texture = textureId;
        this._vertexBuffer = null;
        this._uvBuffer = null;
        this._indexBuffer = null;
        this._positionLocation = null;
        this._uvLocation = null;
        this._textureLocation = null;
        this._positionArray = null;
        this._uvArray = null;
        this._indexArray = null;
        this._firstDraw = true;
    }
    release() {
        this._rect = null;
        const gl = this._subdelegate.getGlManager().getGl();
        gl.deleteTexture(this._texture);
        this._texture = null;
        gl.deleteBuffer(this._uvBuffer);
        this._uvBuffer = null;
        gl.deleteBuffer(this._vertexBuffer);
        this._vertexBuffer = null;
        gl.deleteBuffer(this._indexBuffer);
        this._indexBuffer = null;
    }
    getTexture() {
        return this._texture;
    }
    render(programId) {
        if (this._texture == null) {
            return;
        }
        const gl = this._subdelegate.getGlManager().getGl();
        if (this._firstDraw) {
            this._positionLocation = gl.getAttribLocation(programId, 'position');
            gl.enableVertexAttribArray(this._positionLocation);
            this._uvLocation = gl.getAttribLocation(programId, 'uv');
            gl.enableVertexAttribArray(this._uvLocation);
            this._textureLocation = gl.getUniformLocation(programId, 'texture');
            gl.uniform1i(this._textureLocation, 0);
            {
                this._uvArray = new Float32Array([
                    1.0, 0.0, 0.0, 0.0, 0.0, 1.0, 1.0, 1.0
                ]);
                this._uvBuffer = gl.createBuffer();
            }
            {
                const maxWidth = this._subdelegate.getCanvas().width;
                const maxHeight = this._subdelegate.getCanvas().height;
                this._positionArray = new Float32Array([
                    (this._rect.right - maxWidth * 0.5) / (maxWidth * 0.5),
                    (this._rect.up - maxHeight * 0.5) / (maxHeight * 0.5),
                    (this._rect.left - maxWidth * 0.5) / (maxWidth * 0.5),
                    (this._rect.up - maxHeight * 0.5) / (maxHeight * 0.5),
                    (this._rect.left - maxWidth * 0.5) / (maxWidth * 0.5),
                    (this._rect.down - maxHeight * 0.5) / (maxHeight * 0.5),
                    (this._rect.right - maxWidth * 0.5) / (maxWidth * 0.5),
                    (this._rect.down - maxHeight * 0.5) / (maxHeight * 0.5)
                ]);
                this._vertexBuffer = gl.createBuffer();
            }
            {
                this._indexArray = new Uint16Array([0, 1, 2, 3, 2, 0]);
                this._indexBuffer = gl.createBuffer();
            }
            this._firstDraw = false;
        }
        gl.bindBuffer(gl.ARRAY_BUFFER, this._uvBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, this._uvArray, gl.STATIC_DRAW);
        gl.vertexAttribPointer(this._uvLocation, 2, gl.FLOAT, false, 0, 0);
        gl.bindBuffer(gl.ARRAY_BUFFER, this._vertexBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, this._positionArray, gl.STATIC_DRAW);
        gl.vertexAttribPointer(this._positionLocation, 2, gl.FLOAT, false, 0, 0);
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this._indexBuffer);
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, this._indexArray, gl.DYNAMIC_DRAW);
        gl.bindTexture(gl.TEXTURE_2D, this._texture);
        gl.drawElements(gl.TRIANGLES, this._indexArray.length, gl.UNSIGNED_SHORT, 0);
    }
    isHit(pointX, pointY) {
        const { height } = this._subdelegate.getCanvas();
        const y = height - pointY;
        return (pointX >= this._rect.left &&
            pointX <= this._rect.right &&
            y <= this._rect.up &&
            y >= this._rect.down);
    }
    setSubdelegate(subdelegate) {
        this._subdelegate = subdelegate;
    }
}
export class Rect {
}
