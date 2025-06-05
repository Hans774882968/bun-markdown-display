[TOC]

# Live2D 看板娘实现文档

## 一、基于 pixi-live2d-display 的现代看板娘

### 1. 技术实现

该看板娘基于以下技术栈实现：

- PIXI.js - 用于渲染 2D WebGL 图形
- pixi-live2d-display/cubism4 - Live2D Cubism 4 SDK 的 PIXI.js 实现
- React Hooks - 用于状态管理和生命周期控制

### 2. 核心功能

1. 模型加载与渲染

```typescript
const modelJsonPathList = [
  "/live2d/Haru/Haru.model3.json",
  "/live2d/Hiyori/Hiyori.model3.json",
  "/live2d/Mao/Mao.model3.json",
  "/live2d/Rice/Rice.model3.json",
  "/live2d/Wanko/Wanko.model3.json",
];
```

- 随机加载上述 5 个模型之一
- 使用 PIXI.Application 创建 WebGL 上下文
- 通过 Live2DModel.from 加载模型

2. 交互功能

- 拖拽功能：通过 draggable 函数实现模型的拖拽
- 点击响应：通过 addHitInteraction 实现点击身体和头部的动作
- 自动眼球跟随：通过 autoInteract 配置实现

3. 布局与缩放

- 自适应缩放：根据窗口大小计算模型缩放比例
- 位置调整：通过 modelXMap 配置不同模型的 X 轴偏移
- 固定画布尺寸：宽 340px，高 700px

### 3. 技术实现补充

#### 3.1 PIXI.js 版本锁定

项目将 pixi.js 版本锁定在 v6，主要原因是：

- pixi-live2d-display 0.4.0 版本仅兼容 PIXI.js v6
- PIXI.js v7 对 WebGL 上下文和渲染管线进行了重大重构
- 为确保看板娘的稳定性和兼容性，需要使用经过验证的 PIXI.js v6

#### 3.2 React Hooks 实现

项目使用自定义 Hook `useLive2dHook` 实现看板娘的核心逻辑：

```typescript
export default function useLive2dHook() {
  const live2dCanvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    // 创建 PIXI 应用实例
    const app = new PIXI.Application({
      view: live2dCanvasRef.current || undefined,
      autoStart: true,
      width: 340,
      height: 700,
      backgroundAlpha: 0,
    });

    const init = async () => {
      // 随机选择模型
      const modelJsonPath =
        modelJsonPathList[Math.floor(Math.random() * modelJsonPathList.length)];

      // 加载模型
      const model = await Live2DModel.from(modelJsonPath, {
        autoInteract: true,
      });

      // 缩放处理
      const scaleX = (innerWidth * 0.4) / model.width;
      const scaleY = (innerHeight * 0.8) / model.height;
      model.scale.set(Math.min(scaleX, scaleY));

      // 位置调整
      model.x = modelXMap[modelJsonPath] || 0;
      model.y = innerHeight * 0.1;

      // 添加交互
      draggable(model);
      addHitInteraction(model);

      app.stage.addChild(model);
    };

    init();

    // 清理函数
    return () => {
      app.destroy();
      live2dCanvasRef.current = null;
    };
  }, []);

  return { live2dCanvasRef };
}
```

使用方式：

```tsx
function Layout() {
  const { live2dCanvasRef } = useLive2dHook();

  return (
    <div>
      <canvas ref={live2dCanvasRef} />
    </div>
  );
}
```

## 二、基于 live2d-widget 的传统看板娘

### 1. 技术实现

该看板娘基于以下技术栈实现：

- Live2D SDK (Cubism 2)
- live2d-widget 框架
- 原生 JavaScript

### 2. 核心功能

1. 自动加载系统

```javascript
const live2dPath = "/live2d/";
await Promise.all([
  loadExternalResource(`${live2dPath}waifu.css`, "css"),
  loadExternalResource(`${live2dPath}waifu-tips.js`, "js"),
]);
```

- 异步加载 CSS 和 JS 资源
- 处理图片跨域问题

2. 模型配置

```javascript
initWidget({
  waifuPath: `${live2dPath}waifu-tips.json`,
  cubism2Path: `${live2dPath}live2d.min.js`,
  tools: [
    "hitokoto",
    "asteroids",
    "switch-model",
    "switch-texture",
    "photo",
    "info",
    "quit",
  ],
  logLevel: "warn",
  drag: true,
});
```

- 支持多个经典 Live2D 模型
- 提供工具栏功能
- 可配置的日志级别

3. 交互提示

- 通过 waifu-tips.json 配置各种交互场景的提示语
- 支持鼠标悬停、点击等事件的提示
- 支持节日特殊提示

### 3. 后端实现

项目使用 Bun 实现了一个简单的静态文件服务来处理 live2d 相关请求：

```typescript
export async function handleLive2d(req: Request): Promise<Response> {
  const pathname = new URL(req.url).pathname;
  // 将 /live2d 路径映射到项目的 /models 目录
  const filePath = path.join(
    process.cwd(),
    pathname.replace("/live2d", "/models")
  );
  const file = Bun.file(filePath);

  if (await file.exists()) {
    return new Response(file);
  }
  return new Response(`live2d model ${pathname} not found`, { status: 404 });
}
```

路径映射规则：

- `/live2d/waifu.css` → `/models/waifu.css`
- `/live2d/waifu-tips.js` → `/models/waifu-tips.js`
- `/live2d/model/...` → `/models/model/...`

### 4. 模型文件结构

Live2D 模型（Cubism 2）的标准文件结构如下：

```
模型文件夹/
├── expressions/           # 表情配置
│   └── *.exp.json
├── motions/              # 动作配置
│   └── *.mtn
├── textures.1024/        # 材质图片
│   └── *.png
├── index.json           # 模型配置文件
├── model.moc            # 模型数据文件
├── physics.json         # 物理效果配置
└── textures.cache       # 材质缓存
```

项目中的 7 个模型均遵循此结构，具体包括：

1. Potion-Maker 系列
   - Pio
   - Tia
2. KantaiCollection 系列
   - murakumo
3. HyperdimensionNeptunia 系列
   - nepnep
   - neptune_santa
   - noir_santa
4. 其他
   - sagiri

这些模型的共同特点：

- 均为 Cubism 2 版本的模型
- 包含完整的表情和动作系统
- 支持物理效果模拟
- 支持材质切换
- 遵循标准的文件组织结构

## 三、改进建议及开发计划

### 1. 技术改进

1. 模型加载优化

- 实现模型预加载机制
- 添加加载进度提示
- 优化模型文件大小

2. 性能优化

- 实现 WebGL 上下文复用
- 优化动画性能
- 添加低性能设备的降级方案

3. 交互增强

- 增加语音交互功能
- 实现更多动作响应
- 添加自定义动作编辑器

### 2. 功能扩展

1. 模型管理

- 实现模型在线切换
- 添加模型商店功能
- 支持自定义模型上传

2. 界面优化

- 优化工具栏布局
- 添加可自定义的主题
- 实现响应式布局

3. AI 增强

- 接入大语言模型实现智能对话
- 添加情感识别功能
- 实现上下文感知的互动

### 3. 开发时间线

1. 第一阶段（1-2 月）

- 完成模型加载优化
- 实现基础性能优化
- 添加简单的语音交互

2. 第二阶段（3-4 月）

- 开发模型管理系统
- 优化界面交互
- 实现主题定制

3. 第三阶段（5-6 月）

- 接入 AI 对话系统
- 完善情感交互
- 发布正式版本
