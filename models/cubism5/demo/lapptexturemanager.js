import { csmVector } from '../framework/type/csmvector';
export class LAppTextureManager {
    constructor() {
        this._textures = new csmVector();
    }
    release() {
        for (let ite = this._textures.begin(); ite.notEqual(this._textures.end()); ite.preIncrement()) {
            this._glManager.getGl().deleteTexture(ite.ptr().id);
        }
        this._textures = null;
    }
    createTextureFromPngFile(fileName, usePremultiply, callback) {
        for (let ite = this._textures.begin(); ite.notEqual(this._textures.end()); ite.preIncrement()) {
            if (ite.ptr().fileName == fileName &&
                ite.ptr().usePremultply == usePremultiply) {
                ite.ptr().img = new Image();
                ite
                    .ptr()
                    .img.addEventListener('load', () => callback(ite.ptr()), {
                        passive: true
                    });
                ite.ptr().img.src = fileName;
                return;
            }
        }
        const img = new Image();
        img.addEventListener('load', () => {
            const tex = this._glManager.getGl().createTexture();
            this._glManager
                .getGl()
                .bindTexture(this._glManager.getGl().TEXTURE_2D, tex);
            this._glManager
                .getGl()
                .texParameteri(this._glManager.getGl().TEXTURE_2D, this._glManager.getGl().TEXTURE_MIN_FILTER, this._glManager.getGl().LINEAR_MIPMAP_LINEAR);
            this._glManager
                .getGl()
                .texParameteri(this._glManager.getGl().TEXTURE_2D, this._glManager.getGl().TEXTURE_MAG_FILTER, this._glManager.getGl().LINEAR);
            if (usePremultiply) {
                this._glManager
                    .getGl()
                    .pixelStorei(this._glManager.getGl().UNPACK_PREMULTIPLY_ALPHA_WEBGL, 1);
            }
            this._glManager
                .getGl()
                .texImage2D(this._glManager.getGl().TEXTURE_2D, 0, this._glManager.getGl().RGBA, this._glManager.getGl().RGBA, this._glManager.getGl().UNSIGNED_BYTE, img);
            this._glManager
                .getGl()
                .generateMipmap(this._glManager.getGl().TEXTURE_2D);
            this._glManager
                .getGl()
                .bindTexture(this._glManager.getGl().TEXTURE_2D, null);
            const textureInfo = new TextureInfo();
            if (textureInfo != null) {
                textureInfo.fileName = fileName;
                textureInfo.width = img.width;
                textureInfo.height = img.height;
                textureInfo.id = tex;
                textureInfo.img = img;
                textureInfo.usePremultply = usePremultiply;
                if (this._textures != null) {
                    this._textures.pushBack(textureInfo);
                }
            }
            callback(textureInfo);
        }, { passive: true });
        img.src = fileName;
    }
    releaseTextures() {
        for (let i = 0; i < this._textures.getSize(); i++) {
            this._glManager.getGl().deleteTexture(this._textures.at(i).id);
            this._textures.set(i, null);
        }
        this._textures.clear();
    }
    releaseTextureByTexture(texture) {
        for (let i = 0; i < this._textures.getSize(); i++) {
            if (this._textures.at(i).id != texture) {
                continue;
            }
            this._glManager.getGl().deleteTexture(this._textures.at(i).id);
            this._textures.set(i, null);
            this._textures.remove(i);
            break;
        }
    }
    releaseTextureByFilePath(fileName) {
        for (let i = 0; i < this._textures.getSize(); i++) {
            if (this._textures.at(i).fileName == fileName) {
                this._glManager.getGl().deleteTexture(this._textures.at(i).id);
                this._textures.set(i, null);
                this._textures.remove(i);
                break;
            }
        }
    }
    setGlManager(glManager) {
        this._glManager = glManager;
    }
}
export class TextureInfo {
    constructor() {
        this.id = null;
        this.width = 0;
        this.height = 0;
    }
}
