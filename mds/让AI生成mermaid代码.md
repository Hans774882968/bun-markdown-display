Prompt：

> 你是一名专家后端工程师，你打算在一个名为 SSC 的多系统应用群中实现单点登录。该应用群的系统主要有 Pickup、LineHaul、Delivery。请编写能够渲染出时序图的 mermaid 代码

```mermaid
%%{init: {
    'theme': 'base',
    'themeVariables': {
        'background': '#FFE8D6',
        'primaryColor': '#FF6B35',
        'primaryBorderColor': '#FF6B35',
        'lineColor': '#FF9A1F',
        'actorBkg': '#FF9A1F',
        'actorBorder': '#D14505',
        'noteBkgColor': '#292929',
        'noteTextColor': '#FFE8D6',
        'signalColor': '#292929',
        'signalTextColor': '#FFE8D6'
    },
    'themeCSS': '
        .actor > text { fill: #292929 !important; font-weight: bold; }
        .messageText { fill: #292929 !important; }
        #arrowhead path { fill: #D14505 !important; stroke: #D14505 !important; }
        .sequenceNumber { fill: white !important; }
    '
}}%%
sequenceDiagram
  autonumber
  actor User as 用户
  participant P as Pickup系统
  participant SSO as SSC认证中心
  participant L as LineHaul系统
  participant D as Delivery系统

  User->>P: 访问受限资源
  P->>User: 返回未登录跳转(带回调地址)

  User->>SSO: 重定向到登录页
  SSO->>User: 显示统一登录表单

  User->>SSO: 提交凭证(用户名/密码)
  SSO->>SSO: 验证凭证并生成全局会话
  SSO->>User: 返回带Token的重定向(到Pickup)

  User->>P: 携带Token访问回调地址
  P->>SSO: 请求验证Token有效性
  SSO->>P: 返回验证结果(用户信息)

  alt 首次访问LineHaul
    User->>L: 访问受限资源
    L->>SSO: 检查已有会话
    SSO->>L: 返回已验证状态
    L->>User: 直接授予访问权限
  end

  alt 首次访问Delivery
    User->>D: 访问受限资源
    D->>SSO: 检查已有会话
    SSO->>D: 返回已验证状态
    D->>User: 直接授予访问权限
  end

  P->>User: 返回请求的受限资源
```

动态渲染流程：

```mermaid
graph LR
A[解析mermaid代码] --> B[应用init配置] --> C[生成SVG/Canvas] --> D[注入CSS样式]
```
