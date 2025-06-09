[TOC]

# 为 React 19 开发的网站接入 Live2D 看板娘

## 引言

TODO

## 用 pixi-live2d-display 和 pixi.js 6 实现最基础的看板娘

根据[参考链接 1](https://zhuanlan.zhihu.com/p/638474467)，可以用 pixi-live2d-display 0.4.0 和 pixi.js 6（文章说到，pixi-live2d-display 0.4.0 只支持 pixi.js 6）实现一个最基础的看板娘。

```powershell
bun add pixi-live2d-display pixi.js@6
```

看板娘是画在 canvas 上的，因此需要给页面添加一个 canvas 元素，而看参考链接 1，包需要我们传入 dom 元素，所以这里需要一个 ref 。为了把那坨代码从我干净整洁的`src\frontend\components\layout\Layout.tsx`的隔离开，不妨封装一个自定义 hook。`src\frontend\hooks\useLive2dHook.ts`：

```ts
import * as PIXI from "pixi.js";
import { InternalModel, Live2DModel } from "pixi-live2d-display/cubism4";
import { useEffect, useRef } from "react";

// copy from https://codepen.io/guansss/pen/KKgXBOP/left?editors=0010
function draggable(model: Live2DModel<InternalModel>) {
  model.buttonMode = true;
  model.on("pointerdown", (e) => {
    model.dragging = true;
    model._pointerX = e.data.global.x - model.x;
    model._pointerY = e.data.global.y - model.y;
  });
  model.on("pointermove", (e) => {
    if (model.dragging) {
      model.position.x = e.data.global.x - model._pointerX;
      model.position.y = e.data.global.y - model._pointerY;
    }
  });
  model.on("pointerupoutside", () => (model.dragging = false));
  model.on("pointerup", () => (model.dragging = false));
}

function addHitInteraction(model: Live2DModel<InternalModel>) {
  model.on("hit", (hitAreas) => {
    if (hitAreas.includes("Body")) {
      model.motion("TapBody");
    }

    if (hitAreas.includes("Head")) {
      model.expression();
    }
  });
}

window.PIXI = PIXI; // 这一行是必须的，否则，虽然页面不报错，但是看板娘不会动

// 不支持在两个组件中调用，否则会报警告，占用的 WebGL contexts 太多
export default function useLive2dHook() {
  const live2dCanvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const app = new PIXI.Application({
      view: live2dCanvasRef.current || undefined,
      autoStart: true,
      width: 340, // canvas 会挡住页面其他元素，不能太宽
      height: 700,
      // 响应式设计先不要了，因为 canvas 会挡住页面其他元素
      // resizeTo: live2dCanvasRef.current || undefined,
      backgroundAlpha: 0,
    });

    const init = async () => {
      // 引入live2d模型文件
      const modelJsonPathList = [
        "/live2d/Haru/Haru.model3.json",
        "/live2d/Hiyori/Hiyori.model3.json",
        "/live2d/Mao/Mao.model3.json",
        "/live2d/Rice/Rice.model3.json",
        "/live2d/Wanko/Wanko.model3.json",
      ];
      const modelJsonPath =
        modelJsonPathList[Math.floor(Math.random() * modelJsonPathList.length)];
      const model = await Live2DModel.from(modelJsonPath, {
        autoInteract: true, // 眼睛自动跟随功能
      });

      // 调整live2d模型文件缩放比例（文件过大，需要缩小）
      const scaleX = (innerWidth * 0.4) / model.width;
      const scaleY = (innerHeight * 0.8) / model.height;
      model.scale.set(Math.min(scaleX, scaleY));

      const modelXMap: Record<string, number> = {
        "/live2d/Haru/Haru.model3.json": 0,
        "/live2d/Hiyori/Hiyori.model3.json": 0,
        "/live2d/Mao/Mao.model3.json": 0,
        "/live2d/Rice/Rice.model3.json": -200,
        "/live2d/Wanko/Wanko.model3.json": -100,
      };

      model.x = modelXMap[modelJsonPath] || 0;
      model.y = innerHeight * 0.1;

      draggable(model);
      addHitInteraction(model);

      app.stage.addChild(model);
    };

    init();

    return () => {
      app.destroy();
      live2dCanvasRef.current = null;
    };
  }, []);

  return {
    live2dCanvasRef,
  };
}
```

记得在组件卸载时调用`app.destroy();`，否则会有警告：`WebGL: INVALID_OPERATION: bindTexture: object does not belong to this context`。查[参考链接 2](https://www.jianshu.com/p/5d1a06a49c0a)可知，我们需要释放掉 WebGL context ，单个页面同时激活的 WebGL contexts 才不会超过 16 个，才能避免警告。下面的代码来自[参考链接 3](https://developer.mozilla.org/en-US/docs/Web/API/WEBGL_lose_context)，演示了如何通过监听 webglcontextlost 验证`app.destroy();`的确销毁了 WebGL context ：

```typescript
live2dCanvasRef.current?.addEventListener("webglcontextlost", (event) => {
  console.log(event);
});
```

## 用 live2d-widget 实现看板娘

TODO

## 编写一个 Chrome 插件，为网站插入 live2d-widget 的看板娘

TODO

## 参考资料

1. https://zhuanlan.zhihu.com/p/638474467
2. https://www.jianshu.com/p/5d1a06a49c0a
3. https://developer.mozilla.org/en-US/docs/Web/API/WEBGL_lose_context
