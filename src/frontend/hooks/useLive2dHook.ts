import * as PIXI from 'pixi.js';
import { InternalModel, Live2DModel } from 'pixi-live2d-display/cubism4';
import { useEffect, useRef } from 'react';

// copy from https://codepen.io/guansss/pen/KKgXBOP/left?editors=0010
function draggable(model: Live2DModel<InternalModel>) {
  model.buttonMode = true;
  model.on('pointerdown', (e) => {
    model.dragging = true;
    model._pointerX = e.data.global.x - model.x;
    model._pointerY = e.data.global.y - model.y;
  });
  model.on('pointermove', (e) => {
    if (model.dragging) {
      model.position.x = e.data.global.x - model._pointerX;
      model.position.y = e.data.global.y - model._pointerY;
    }
  });
  model.on('pointerupoutside', () => (model.dragging = false));
  model.on('pointerup', () => (model.dragging = false));
}

function addHitInteraction(model: Live2DModel<InternalModel>) {
  model.on('hit', (hitAreas) => {
    if (hitAreas.includes('Body')) {
      model.motion('TapBody');
    }

    if (hitAreas.includes('Head')) {
      model.expression();
    }
  });
}

window.PIXI = PIXI; // 这一行是必须的，否则，虽然页面不报错，但是看板娘不会动

export default function useLive2dHook() {
  const live2dCanvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const init = async () => {
      const app = new PIXI.Application({
        view: live2dCanvasRef.current || undefined,
        autoStart: true,
        width: 340, // canvas 会挡住页面其他元素，不能太宽
        height: 700,
        // 响应式设计先不要了，因为 canvas 会挡住页面其他元素
        // resizeTo: live2dCanvasRef.current || undefined,
        backgroundAlpha: 0,
      });
      // 引入live2d模型文件
      const modelJsonPathList = [
        '/live2d/Haru/Haru.model3.json',
        '/live2d/Hiyori/Hiyori.model3.json',
        '/live2d/Mao/Mao.model3.json',
        '/live2d/Rice/Rice.model3.json',
        '/live2d/Wanko/Wanko.model3.json',
      ];
      const modelJsonPath = modelJsonPathList[Math.floor(Math.random() * modelJsonPathList.length)];
      const model = await Live2DModel.from(modelJsonPath, {
        autoInteract: true, // 眼睛自动跟随功能
      });

      // 调整live2d模型文件缩放比例（文件过大，需要缩小）
      const scaleX = (innerWidth * 0.4) / model.width;
      const scaleY = (innerHeight * 0.8) / model.height;
      model.scale.set(Math.min(scaleX, scaleY));

      const modelXMap: Record<string, number> = {
        '/live2d/Haru/Haru.model3.json': 0,
        '/live2d/Hiyori/Hiyori.model3.json': 0,
        '/live2d/Mao/Mao.model3.json': 0,
        '/live2d/Rice/Rice.model3.json': -200,
        '/live2d/Wanko/Wanko.model3.json': -100,
      };

      model.x = modelXMap[modelJsonPath] || 0;
      model.y = innerHeight * 0.1;

      draggable(model);
      addHitInteraction(model);

      app.stage.addChild(model);
    };
    init();
  }, []);

  return {
    live2dCanvasRef,
  };
}
