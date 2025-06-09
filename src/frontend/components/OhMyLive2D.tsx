import { Helmet } from 'react-helmet-async';
import { loadOml2d } from 'oh-my-live2d';
import { useEffect, useRef } from 'react';
import { toast } from 'sonner';

const title = 'Live2D 测试页 - oh-my-live2d';

export default function OhMyLive2D() {
  const live2dDivRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const oml2d = loadOml2d({
      parentElement: live2dDivRef.current || undefined,
      models: [
        {
          path: '/live2d/Haru/Haru.model3.json',
        },
        {
          path: '/live2d/model/sagiri/2048.json',
        },
        {
          path: '/live2d/model/Potion-Maker/Pio/index.json',
        },
        {
          path: '/live2d/model/Potion-Maker/Tia/index.json',
        },
        {
          path: '/live2d/Hiyori/Hiyori.model3.json',
        },
        {
          path: '/live2d/Mao/Mao.model3.json',
        },
        {
          path: '/live2d/Rice/Rice.model3.json',
        },
        {
          path: '/live2d/Wanko/Wanko.model3.json',
        },
      ],
      primaryColor: 'pink',
      tips: {
        idleTips: {
          wordTheDay: true,
          interval: 120000,
        },
      },
    });

    oml2d.onLoad((state) => {
      if (state === 'fail') {
        toast.error('oh-my-live2d 模型加载失败');
      }
    });

    return () => {
      // oh-my-live2d 源码没有调用，所以我在此手动调用。该 destroy 方法来自于 pixi-live2d-display
      oml2d.models.model.destroy();
    };
  }, []);

  return (
    <>
      <Helmet>
        <title>{title}</title>
      </Helmet>
      <div className="text-center font-bold">{title}</div>
      <div ref={live2dDivRef} />
    </>
  );
}
