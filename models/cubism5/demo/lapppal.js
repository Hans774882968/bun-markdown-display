export class LAppPal {
    static loadFileAsBytes(filePath, callback) {
        fetch(filePath)
            .then(response => response.arrayBuffer())
            .then(arrayBuffer => callback(arrayBuffer, arrayBuffer.byteLength));
    }
    static getDeltaTime() {
        return this.deltaTime;
    }
    static updateTime() {
        this.currentFrame = Date.now();
        this.deltaTime = (this.currentFrame - this.lastFrame) / 1000;
        this.lastFrame = this.currentFrame;
    }
    static printMessage(message) {
        console.log(message);
    }
}
LAppPal.lastUpdate = Date.now();
LAppPal.currentFrame = 0.0;
LAppPal.lastFrame = 0.0;
LAppPal.deltaTime = 0.0;
