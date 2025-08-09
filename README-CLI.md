# TLS-Client CLI

基于 [bogdanfinn/tls-client](https://github.com/bogdanfinn/tls-client) 的命令行工具，专为 Node.js 系统调用而设计。

## 🌟 特性

- ✅ **真实浏览器指纹**: 支持 Chrome、Firefox、Safari、Edge 等多种浏览器配置
- ✅ **完整的 HTTP 支持**: GET、POST、PUT、DELETE 等所有 HTTP 方法
- ✅ **代理支持**: HTTP/HTTPS/SOCKS5 代理
- ✅ **Cookie 管理**: 自动处理 Cookie
- ✅ **JSON 输出**: 结构化输出，便于程序调用
- ✅ **配置文件**: 支持 JSON 配置文件
- ✅ **性能优化**: 高效的网络请求处理
- ✅ **Node.js 集成**: 提供完整的 Node.js 包装器

## 📦 安装

### 方式一：从源码构建

```bash
# 克隆仓库
git clone https://github.com/bogdanfinn/tls-client.git
cd tls-client

# 构建（需要 Go 1.19+）
make build

# 或使用构建脚本
./build.sh
```

### 方式二：下载预编译版本

从 [Releases](https://github.com/tinhour/tls-client/build) 页面下载对应平台的可执行文件。

## 🚀 快速开始

### 基本用法

```bash
# 简单 GET 请求
./build/tls-client -url "https://httpbin.org/get"

# POST 请求
./build/tls-client \
  -url "https://httpbin.org/post" \
  -method "POST" \
  -headers '{"Content-Type":"application/json"}' \
  -body '{"message":"Hello World"}'

# 使用不同的浏览器配置
./build/tls-client -url "https://httpbin.org/get" -profile firefox_117

# 使用代理
./build/tls-client -url "https://httpbin.org/get" -proxy "http://127.0.0.1:8080"
```

### 配置文件方式

创建配置文件 `request.json`:

```json
{
  "url": "https://httpbin.org/post",
  "method": "POST",
  "headers": {
    "Content-Type": "application/json",
    "User-Agent": "TLS-Client/1.11.0"
  },
  "body": "{\"key\":\"value\"}",
  "timeout": 30,
  "profile": "chrome_120",
  "followRedirects": true
}
```

执行请求:

```bash
./build/tls-client -config request.json
```

## 📖 命令行参数

| 参数 | 类型 | 描述 | 默认值 |
|------|------|------|--------|
| `-url` | string | 请求URL（必需） | - |
| `-method` | string | HTTP方法 | GET |
| `-headers` | string | 请求头（JSON格式） | - |
| `-body` | string | 请求体内容 | - |
| `-timeout` | int | 超时时间（秒） | 30 |
| `-profile` | string | 浏览器配置文件 | chrome_120 |
| `-proxy` | string | 代理地址 | - |
| `-follow-redirects` | bool | 是否跟随重定向 | true |
| `-insecure` | bool | 跳过TLS证书验证 | false |
| `-config` | string | JSON配置文件路径 | - |
| `-list-profiles` | bool | 列出支持的浏览器配置 | false |
| `-version` | bool | 显示版本信息 | false |
| `-help` | bool | 显示帮助信息 | false |

## 🌐 支持的浏览器配置

```bash
# 查看支持的配置
./build/tls-client -list-profiles
```

主要支持的配置文件：

**Chrome 系列：**
- `chrome_103` ~ `chrome_112`, `chrome_117` ~ `chrome_120`, `chrome_124`, `chrome_131`, `chrome_133`

**Firefox 系列：**
- `firefox_102`, `firefox_104` ~ `firefox_106`, `firefox_108`, `firefox_110`, `firefox_117`, `firefox_120`, `firefox_123`, `firefox_132`, `firefox_133`, `firefox_135`

**Safari 系列：**
- `safari_15_6_1`, `safari_16_0`, `safari_16_5`, `safari_17_0`
- iOS: `safari_ios_15_5`, `safari_ios_15_6`, `safari_ios_16_0`, `safari_ios_17_0`, `safari_ios_18_0`, `safari_ios_18_5`
- iPad: `safari_ipad_15_6`

**Opera 系列：**
- `opera_89`, `opera_90`, `opera_91`

**移动端应用：**
- `zalando_android_mobile`, `zalando_ios_mobile`
- `nike_android_mobile`, `nike_ios_mobile`
- `mesh_android`, `mesh_ios`
- `confirmed_android`, `confirmed_ios`
- `mms_ios`

**其他：**
- `cloudscraper` (Cloudflare绕过)
- `okhttp4_android_7` ~ `okhttp4_android_13` (Android OkHttp)
- `edge_107`, `edge_99` (向前兼容)

## 📄 响应格式

所有响应都以 JSON 格式输出：

```json
{
  "statusCode": 200,
  "headers": {
    "Content-Type": "application/json",
    "Content-Length": "1024"
  },
  "body": "响应内容",
  "cookies": [
    {
      "name": "sessionid",
      "value": "abc123",
      "domain": "example.com",
      "path": "/",
      "expires": "2024-12-31T23:59:59Z",
      "httpOnly": true,
      "secure": false
    }
  ],
  "requestTime": 1500,
  "contentType": "application/json",
  "size": 1024,
  "error": null
}
```

## 🔧 Node.js 集成

### 安装

```bash
cd nodejs-integration
npm install
```

### 基本使用

```javascript
const { createClient } = require('./nodejs-integration');

async function example() {
  // 创建客户端
  const client = createClient({
    profile: 'chrome_120',
    timeout: 30
  });

  // GET 请求
  const response = await client.get('https://httpbin.org/get');
  console.log('状态码:', response.statusCode);
  console.log('响应体:', response.body);

  // POST 请求
  const postResponse = await client.post('https://httpbin.org/post', {
    message: 'Hello from Node.js!'
  });
  console.log('POST 响应:', postResponse.statusCode);
}

example().catch(console.error);
```

### 高级用法

```javascript
const { createClient } = require('./nodejs-integration');

async function advanced() {
  const client = createClient({
    profile: 'firefox_117',
    proxy: 'http://127.0.0.1:8080',
    followRedirects: false
  });

  // 自定义请求头
  const response = await client.get('https://httpbin.org/get', {
    headers: {
      'User-Agent': 'Custom-Agent/1.0',
      'Accept': 'application/json',
      'X-Custom-Header': 'value'
    }
  });

  // 并发请求
  const promises = [
    client.get('https://httpbin.org/delay/1'),
    client.get('https://httpbin.org/delay/2'),
    client.get('https://httpbin.org/delay/1')
  ];

  const responses = await Promise.all(promises);
  console.log('并发请求完成:', responses.length);
}

advanced().catch(console.error);
```

### 配置文件方式

```javascript
const { createClient } = require('./nodejs-integration');

async function useConfig() {
  const client = createClient();
  
  // 使用配置文件
  const response = await client.requestFromConfig('./config/request.json');
  console.log('配置文件请求结果:', response.statusCode);
}
```

## 📝 示例

查看 `nodejs-integration/examples/` 目录获取更多示例：

- `basic-usage.js` - 基本使用示例
- `config-file-example.js` - 配置文件示例

运行示例：

```bash
cd nodejs-integration
node examples/basic-usage.js
node examples/config-file-example.js
```

## 🧪 测试

```bash
# Go 测试
make test

# Node.js 测试
cd nodejs-integration
npm test
```

## 🔨 构建

```bash
# 构建当前平台
make build

# 构建所有平台
make build-all

# 使用构建脚本
./build.sh all
```

## 🐳 Docker 构建

```dockerfile
FROM golang:1.21-alpine AS builder
WORKDIR /app
COPY . .
RUN go mod download
RUN go build -ldflags="-s -w" -o tls-client ./cmd/cli

FROM alpine:latest
RUN apk --no-cache add ca-certificates
WORKDIR /root/
COPY --from=builder /app/tls-client .
CMD ["./tls-client"]
```

## 🤝 Node.js 调用最佳实践

### 1. 错误处理

```javascript
try {
  const response = await client.get('https://example.com');
  // 处理成功响应
} catch (error) {
  console.error('请求失败:', error.message);
  // 处理错误
}
```

### 2. 超时设置

```javascript
const client = createClient({
  timeout: 10 // 10秒超时
});
```

### 3. 代理轮换

```javascript
const proxies = [
  'http://proxy1:8080',
  'http://proxy2:8080',
  'http://proxy3:8080'
];

let currentProxy = 0;

function getNextProxy() {
  const proxy = proxies[currentProxy];
  currentProxy = (currentProxy + 1) % proxies.length;
  return proxy;
}

const client = createClient();
client.setProxy(getNextProxy());
```

### 4. 并发控制

```javascript
const pLimit = require('p-limit');
const limit = pLimit(5); // 最多5个并发请求

const urls = ['url1', 'url2', 'url3', /* ... */];
const responses = await Promise.all(
  urls.map(url => limit(() => client.get(url)))
);
```

## 📋 常见问题

### Q: 如何处理CAPTCHA？
A: 此工具主要用于模拟浏览器指纹，无法自动处理CAPTCHA。需要其他验证码处理服务。

### Q: 支持WebSocket吗？
A: 目前只支持HTTP/HTTPS请求，不支持WebSocket。

### Q: 如何设置自定义TLS配置？
A: 可以通过选择不同的浏览器配置文件来改变TLS指纹。

### Q: 性能如何？
A: 基于Go构建，性能优秀。支持并发请求，适合高并发场景。

## 📄 许可证

基于原项目许可证。请查看 [LICENSE](LICENSE) 文件。

## 🙏 致谢

- [bogdanfinn/tls-client](https://github.com/bogdanfinn/tls-client) - 原始项目
- [bogdanfinn/fhttp](https://github.com/bogdanfinn/fhttp) - HTTP库
- [bogdanfinn/utls](https://github.com/bogdanfinn/utls) - TLS库

## 📞 支持

如有问题，请提交 Issue 或查看原项目文档。
