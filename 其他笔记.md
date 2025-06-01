# bun-react-tailwind-template

To install dependencies:

```bash
bun install
```

To start a development server:

```bash
bun dev
```

To run for production:

```bash
bun start
```

This project was created using `bun init` in bun v1.2.14. [Bun](https://bun.sh) is a fast all-in-one JavaScript runtime.

控制台输出：

✨ New project configured!

Development - full-stack dev server with hot reload

    bun dev

Static Site - build optimized assets to disk (no backend)

    bun run build

Production - serve a full-stack production build

    bun start

Happy bunning! 🐇

TODO:

1. 主题切换
2. Copyright 组件 MutationObserver
3. 雪花算法生成用户 id
4. 用户添加 isAdmin 并为 admin 提供注册页面
5. 登出
6. 写文章功能
7. 用户主页 只有 admin 能看

## mock 的模块不知道该如何取消 mock

test\testApiLogin.test.ts。这个模块能够单独跑成功，但是和其他模块一起跑，因为 mock 无法取消，所以总是失败。问了 deepseek 拿不到有价值的回答，放弃了。

```ts
import {
  describe,
  test,
  expect,
  mock,
  spyOn,
  beforeEach,
  afterAll,
} from "bun:test";
import { handleLogin } from "@/backend/login";

// Mock 依赖模块
mock.module("@/backend/utils/crypto", () => ({
  comparePasswords: mock(async () => true),
}));

mock.module("@/backend/utils/jwt", () => ({
  generateToken: mock(async () => "mock-token"),
}));

mock.module("@/backend/utils/loadFromEnv", () => ({
  loadAuthConfig: mock(() => ({
    users: [
      { uname: "admin", pwd: "hashed-pwd", isAdmin: true, uid: "1" },
      { uname: "user", pwd: "hashed-pwd", isAdmin: false, uid: "2" },
    ],
    salt1: "salt1",
    salt2: "salt2",
  })),
  loadJwtSecret: mock(() => "jwt-secret"),
}));

mock.module("@/backend/utils/validateLoginInput", () => ({
  validateLoginInput: mock(() => null),
}));

describe("handleLogin", () => {
  beforeEach(() => {
    mock.restore();
  });

  afterAll(async () => {
    const originalCrypto = await import("@/backend/utils/crypto");
    const originalJwt = await import("@/backend/utils/jwt");
    const originalLoadFromEnv = await import("@/backend/utils/loadFromEnv");
    const originalValidateLoginInput = await import(
      "@/backend/utils/validateLoginInput"
    );
    mock.module("@/backend/utils/crypto", () => originalCrypto);
    mock.module("@/backend/utils/jwt", () => originalJwt);
    mock.module("@/backend/utils/loadFromEnv", () => originalLoadFromEnv);
    mock.module(
      "@/backend/utils/validateLoginInput",
      () => originalValidateLoginInput
    );
  });

  test("成功登录返回 token", async () => {
    // 根据 https://bun.net.cn/docs/test/mocks 先 mock.module() 再使用动态 import
    const comparePasswords = await import("@/backend/utils/crypto").then(
      (module) => module.comparePasswords
    );
    const generateToken = await import("@/backend/utils/jwt").then(
      (module) => module.generateToken
    );

    const req = new Request("http://localhost/api/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ uname: "admin", pwd: "correct-pwd" }),
    });

    const response = await handleLogin(req);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.data.token).toBe("mock-token");
    expect(comparePasswords).toHaveBeenCalledTimes(1);
    expect(generateToken).toHaveBeenCalledWith("admin", true, "jwt-secret");
  });

  test("无效用户名返回401", async () => {
    const req = new Request("http://localhost/api/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ uname: "not-exist", pwd: "any" }),
    });

    const response = await handleLogin(req);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.msg).toInclude("用户 not-exist 不存在");
  });

  test("错误密码返回401", async () => {
    const crypto = await import("@/backend/utils/crypto");
    spyOn(crypto, "comparePasswords").mockImplementation(async () => false);

    const req = new Request("http://localhost/api/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ uname: "admin", pwd: "wrong-pwd" }),
    });

    const response = await handleLogin(req);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data).toEqual({
      code: 401,
      msg: "用户 admin 的密码不正确",
      data: null,
    });
  });

  test("无效输入返回400", async () => {
    const req = new Request("http://localhost/api/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ uname: "", pwd: "" }),
    });

    const response = await handleLogin(req);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.msg).toBe("用户  不存在");
  });

  test("异常情况返回500", async () => {
    // 模拟 JSON 解析错误
    const req = new Request("http://localhost/api/login", {
      method: "POST",
      body: "invalid-json",
    });

    const response = await handleLogin(req);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data).toEqual({
      code: 500,
      msg: "登录接口出错",
      data: null,
    });
  });
});
```

## live2d 模型接入 bug

攻略：对于 Version 2 的模型，手动创建`textures.cache`即可。`nepnep`加载时说加载不到`general/pose.json`，就手动复制过来。

这三个模型加载正常：

```json
    "KantaiCollection/murakumo",
    "Potion-Maker/Pio",
    "Potion-Maker/Tia"
```

这些模型加载不出衣服，控制台报错`WebGL: INVALID_OPERATION: texParameter: no texture bound to target`：

```json
    "HyperdimensionNeptunia/nepnep",
    "HyperdimensionNeptunia/neptune_santa",
    "HyperdimensionNeptunia/noir_santa",
```

250601 22:35 更新：改成用`waifu-tips.json`加载，又好了！实在让人摸不着头脑。

## waifu-tips.json 模型信息备份

```json
  "models": [{
    "name": "Potion-Maker/Pio",
    "paths": ["https://fastly.jsdelivr.net/gh/fghrsh/live2d_api/model/Potion-Maker/Pio/index.json"],
    "message": "来自 Potion Maker 的 Pio 酱 ~"
  }, {
    "name": "Potion-Maker/Tia",
    "paths": ["https://fastly.jsdelivr.net/gh/fghrsh/live2d_api/model/Potion-Maker/Tia/index.json"],
    "message": "来自 Potion Maker 的 Tia 酱 ~"
  }, {
    "name": "HyperdimensionNeptunia",
    "paths": [
      "https://fastly.jsdelivr.net/gh/fghrsh/live2d_api/model/HyperdimensionNeptunia/neptune_classic/index.json",
      "https://fastly.jsdelivr.net/gh/fghrsh/live2d_api/model/HyperdimensionNeptunia/nepnep/index.json",
      "https://fastly.jsdelivr.net/gh/fghrsh/live2d_api/model/HyperdimensionNeptunia/neptune_santa/index.json",
      "https://fastly.jsdelivr.net/gh/fghrsh/live2d_api/model/HyperdimensionNeptunia/nepmaid/index.json",
      "https://fastly.jsdelivr.net/gh/fghrsh/live2d_api/model/HyperdimensionNeptunia/nepswim/index.json",
      "https://fastly.jsdelivr.net/gh/fghrsh/live2d_api/model/HyperdimensionNeptunia/noir_classic/index.json",
      "https://fastly.jsdelivr.net/gh/fghrsh/live2d_api/model/HyperdimensionNeptunia/noir/index.json",
      "https://fastly.jsdelivr.net/gh/fghrsh/live2d_api/model/HyperdimensionNeptunia/noir_santa/index.json",
      "https://fastly.jsdelivr.net/gh/fghrsh/live2d_api/model/HyperdimensionNeptunia/noireswim/index.json",
      "https://fastly.jsdelivr.net/gh/fghrsh/live2d_api/model/HyperdimensionNeptunia/blanc_classic/index.json",
      "https://fastly.jsdelivr.net/gh/fghrsh/live2d_api/model/HyperdimensionNeptunia/blanc_normal/index.json",
      "https://fastly.jsdelivr.net/gh/fghrsh/live2d_api/model/HyperdimensionNeptunia/blanc_swimwear/index.json",
      "https://fastly.jsdelivr.net/gh/fghrsh/live2d_api/model/HyperdimensionNeptunia/vert_classic/index.json",
      "https://fastly.jsdelivr.net/gh/fghrsh/live2d_api/model/HyperdimensionNeptunia/vert_normal/index.json",
      "https://fastly.jsdelivr.net/gh/fghrsh/live2d_api/model/HyperdimensionNeptunia/vert_swimwear/index.json",
      "https://fastly.jsdelivr.net/gh/fghrsh/live2d_api/model/HyperdimensionNeptunia/nepgear/index.json",
      "https://fastly.jsdelivr.net/gh/fghrsh/live2d_api/model/HyperdimensionNeptunia/nepgear_extra/index.json",
      "https://fastly.jsdelivr.net/gh/fghrsh/live2d_api/model/HyperdimensionNeptunia/nepgearswim/index.json",
      "https://fastly.jsdelivr.net/gh/fghrsh/live2d_api/model/HyperdimensionNeptunia/histoire/index.json",
      "https://fastly.jsdelivr.net/gh/fghrsh/live2d_api/model/HyperdimensionNeptunia/histoirenohover"
    ],
    "message": "Nep! Nep! 超次元游戏：海王星 系列"
  }, {
    "name": "Hiyori",
    "paths": ["https://fastly.jsdelivr.net/gh/Live2D/CubismWebSamples/Samples/Resources/Hiyori/Hiyori.model3.json"],
    "message": "是 Hiyori 哦 ~"
  }]
```
