import useLive2dHook from '../hooks/useLive2dHook';

export default function PixiLive2dDisplay() {
  const { live2dCanvasRef } = useLive2dHook();

  return (
    <>
      <div>Live2d 测试页</div>
      <canvas ref={live2dCanvasRef} style={{ position: 'fixed', top: 0, left: 0 }} />
    </>
  );
}
