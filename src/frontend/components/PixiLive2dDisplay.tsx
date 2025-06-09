import { Helmet } from 'react-helmet-async';
import useLive2dHook from '../hooks/useLive2dHook';

const title = 'Live2D 测试页 - pixi-live2d-display';

export default function PixiLive2dDisplay() {
  const { live2dCanvasRef } = useLive2dHook();

  return (
    <>
      <Helmet>
        <title>{title}</title>
      </Helmet>
      <div className="text-center font-bold">{title}</div>
      <canvas ref={live2dCanvasRef} style={{ position: 'fixed', top: 0, left: 0 }} />
    </>
  );
}
