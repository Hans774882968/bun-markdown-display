import { Helmet } from 'react-helmet-async';
import useLive2dHook from '../hooks/useLive2dHook';

export default function PixiLive2dDisplay() {
  const { live2dCanvasRef } = useLive2dHook();

  return (
    <>
      <Helmet>
        <title>Live2d 测试页</title>
      </Helmet>
      <div className="text-center font-bold">Live2d 测试页</div>
      <canvas ref={live2dCanvasRef} style={{ position: 'fixed', top: 0, left: 0 }} />
    </>
  );
}
