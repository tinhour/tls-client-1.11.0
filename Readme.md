# TLS-Client CLI with JA3 Fingerprint Support

基于 [bogdanfinn/tls-client](https://github.com/bogdanfinn/tls-client) 的增强版命令行工具，专为 Node.js 系统调用而设计，支持JA3指纹自定义。

## 🌟 核心特性

### 🎯 TLS指纹模拟
- ✅ **JA3指纹自定义**: 支持自定义JA3指纹字符串和完整TLS配置
- ✅ **67+浏览器配置**: Chrome、Firefox、Safari、Edge、Opera等预定义配置
- ✅ **移动端支持**: iOS、Android、平板等移动设备指纹
- ✅ **反检测能力**: 模拟真实浏览器行为，绕过指纹检测

### 🚀 网络功能  
- ✅ **完整HTTP支持**: GET、POST、PUT、DELETE等所有HTTP方法
- ✅ **HTTP/2和HTTP/3**: 现代协议支持
- ✅ **代理支持**: HTTP/HTTPS/SOCKS5代理，支持认证
- ✅ **Cookie管理**: 自动处理Cookie和会话
- ✅ **重定向控制**: 可控的重定向跟随

### 💻 开发集成
- ✅ **JSON输出**: 结构化输出，便于程序调用
- ✅ **Node.js集成**: 完整的JavaScript包装器和示例
- ✅ **配置文件**: 支持JSON配置文件和批量操作
- ✅ **跨平台**: 支持Windows、macOS、Linux多种架构

## 📦 快速安装

### 预编译版本 (推荐)

根据你的系统选择对应版本：

| 操作系统 | 架构 | 下载文件 | 说明 |
|----------|------|----------|------|
| **Windows** | 64位 | `tls-client-windows-x86_64.exe` | 主流Windows系统 |
| **Windows** | 32位 | `tls-client-windows-x86.exe` | 老旧系统 |
| **macOS** | Apple Silicon | `tls-client-macos-arm64` | M1/M2/M3芯片 |
| **macOS** | Intel | `tls-client-macos-x86_64` | Intel芯片 |
| **Linux** | 64位 | `tls-client-linux-x86_64` | 主流Linux发行版 |
| **Linux** | ARM64 | `tls-client-linux-arm64` | ARM服务器/树莓派 |
| **Linux** | 32位 | `tls-client-linux-x86` | 老旧系统 |

```bash
# 下载后添加执行权限 (Linux/macOS)
chmod +x tls-client-*

# Windows直接运行
./tls-client-windows-x86_64.exe -help
```

### 从源码构建

```bash
# 克隆仓库
git clone <your-repository-url>
cd tls-client-1.11.0

# 安装Go依赖
go mod download

# 编译当前平台
go build -ldflags="-s -w" -o build/tls-client ./cmd/cli

# 编译所有平台 (可选)
./build.sh
```

## 🚀 快速开始

### 基本HTTP请求

```bash
# 简单GET请求
./tls-client -url "https://httpbin.org/get"

# POST请求 
./tls-client \
  -url "https://httpbin.org/post" \
  -method "POST" \
  -headers '{"Content-Type":"application/json"}' \
  -body '{"message":"Hello World"}'

# 使用Chrome浏览器配置
./tls-client -url "https://httpbin.org/get" -profile chrome_120

# 使用代理
./tls-client -url "https://httpbin.org/get" -proxy "http://127.0.0.1:8080"
```

### JA3指纹自定义 🔥

```bash
# 使用自定义JA3指纹
./tls-client -url "https://httpbin.org/get" \
  -ja3 "771,4865-4866-4867,23-65281-10-11-35-16-5-13-18-51-45-43,29-23-24,0"

# 使用完整自定义TLS配置
./tls-client -url "https://httpbin.org/get" \
  -custom-tls '{
    "ja3String": "771,4865-4866-4867,23-65281-10-11-35-16-5-13-18-51-45-43,29-23-24,0",
    "alpnProtocols": ["h2", "http/1.1"],
    "supportedVersions": ["1.3", "1.2"]
  }'

# 测试JA3指纹效果
./tls-client -url "https://tls.peet.ws/api/all" -ja3 "your-ja3-string"
```

### 配置文件方式

创建 `request.json`:

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
  "followRedirects": true,
  "customTls": {
    "ja3String": "771,4865-4866-4867,23-65281-10-11-35-16-5-13-18-51-45-43,29-23-24,0"
  }
}
```

```bash
./tls-client -config request.json
```

## 📖 完整命令参数

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
| **`-ja3`** | **string** | **自定义JA3指纹字符串** | - |
| **`-custom-tls`** | **string** | **自定义TLS配置(JSON)** | - |
| `-list-profiles` | bool | 列出支持的浏览器配置 | false |
| `-version` | bool | 显示版本信息 | false |
| `-help` | bool | 显示帮助信息 | false |

## 🌐 支持的浏览器配置 (67+)

```bash
# 查看所有支持的配置
./tls-client -list-profiles
```

### 主流浏览器

**Chrome 系列 (18个):**
- `chrome_103` ~ `chrome_112`, `chrome_117` ~ `chrome_120`
- `chrome_124`, `chrome_131`, `chrome_133`

**Firefox 系列 (13个):**
- `firefox_102`, `firefox_104` ~ `firefox_106`, `firefox_108`
- `firefox_110`, `firefox_117` ~ `firefox_120`, `firefox_123`
- `firefox_132`, `firefox_133`, `firefox_135`

**Safari 系列 (11个):**
- 桌面版: `safari_15_6_1`, `safari_16_0`, `safari_16_5`, `safari_17_0`
- iOS版: `safari_ios_15_5` ~ `safari_ios_18_5`
- iPad版: `safari_ipad_15_6`

**其他浏览器:**
- Opera: `opera_89`, `opera_90`, `opera_91`
- Edge: `edge_107`, `edge_99`

### 移动端应用 (25个)

**品牌应用:**
- Nike: `nike_android_mobile`, `nike_ios_mobile`
- Zalando: `zalando_android_mobile`, `zalando_ios_mobile`

**Android OkHttp:**
- `okhttp4_android_7` ~ `okhttp4_android_13`

**其他移动应用:**
- Mesh: `mesh_android`, `mesh_ios`
- MMS: `mms_ios_1`, `mms_ios_2`, `mms_ios_3`
- Confirmed: `confirmed_android`, `confirmed_ios`

**特殊配置:**
- `cloudscraper` (Cloudflare绕过优化)

## 🔧 Node.js 集成

### 安装和基本使用

```bash
cd nodejs-integration
npm install
```

```javascript
const { createClient } = require('./nodejs-integration');

async function main() {
  // 创建客户端
  const client = createClient({
    profile: 'chrome_120',
    timeout: 30
  });

  // 基本请求
  const response = await client.get('https://httpbin.org/get');
  console.log('状态码:', response.statusCode);
  console.log('响应时间:', response.requestTime + 'ms');
}
```

### JA3指纹在Node.js中的使用

```javascript
const { createClient } = require('./nodejs-integration');

async function ja3Example() {
  const client = createClient();

  // 使用JA3指纹
  const response = await client.requestWithJA3({
    url: 'https://httpbin.org/headers',
    headers: {
      'User-Agent': 'CustomClient/1.0'
    }
  }, "771,4865-4866-4867,23-65281-10-11-35-16-5-13-18-51-45-43,29-23-24,0");

  console.log('JA3请求成功:', response.statusCode);

  // 使用完整自定义TLS配置
  const customResponse = await client.requestWithCustomTLS({
    url: 'https://httpbin.org/get'
  }, {
    ja3String: "771,4865-4866-4867,23-65281-10-11-35-16-5-13-18-51-45-43,29-23-24,0",
    alpnProtocols: ["h2", "http/1.1"],
    supportedVersions: ["1.3", "1.2"]
  });

  console.log('自定义TLS请求成功:', customResponse.statusCode);
}

ja3Example().catch(console.error);
```

### 高级用法和错误处理

```javascript
async function advancedUsage() {
  const client = createClient({
    timeout: 15,
    proxy: 'http://127.0.0.1:8080'
  });

  try {
    // 尝试使用JA3指纹
    const response = await client.requestWithJA3({
      url: 'https://httpbin.org/get'
    }, "771,4865-4866-4867,23-65281-10-11-35-16-5-13-18-51-45-43,29-23-24,0");
    
    console.log('JA3请求成功:', response.statusCode);
  } catch (error) {
    console.log('JA3失败，使用标准配置:', error.message);
    
    // 回退到标准浏览器配置
    const fallbackResponse = await client.request({
      url: 'https://httpbin.org/get',
      profile: 'chrome_120'
    });
    
    console.log('标准配置成功:', fallbackResponse.statusCode);
  }
}
```

## 📝 示例和测试

### 运行示例

```bash
cd nodejs-integration

# 基本使用示例
npm run example:basic

# 浏览器配置示例
npm run example:browsers

# JA3指纹示例
npm run example:ja3

# 运行所有示例
npm run examples:all
```

### 可用示例文件

- `examples/basic-usage.js` - 基本使用和API调用
- `examples/browser-profiles-example.js` - 浏览器配置对比
- `examples/ja3-fingerprint-example.js` - JA3指纹完整示例
- `examples/simple-ja3-test.js` - 简化的JA3测试
- `examples/config-file-example.js` - 配置文件使用

### 测试

```bash
# Node.js集成测试
cd nodejs-integration
npm test

# Go单元测试 (可选)
cd ..
go test ./tests/...
```

## 📄 响应格式

所有响应都以JSON格式输出：

```json
{
  "statusCode": 200,
  "headers": {
    "Content-Type": "application/json",
    "Content-Length": "287"
  },
  "body": "响应内容字符串",
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
  "size": 287,
  "error": null
}
```

## 🎯 JA3指纹最佳实践

### 1. 常用JA3指纹

```bash
# Chrome风格 (简化版)
JA3="771,4865-4866-4867,23-65281-10-11-35-16-5-13-18-51-45-43,29-23-24,0"

# Firefox风格
JA3="771,4865-4866-4867,0-23-65281-10-11-35-16-5-13-18-51-45-43,29-23-24,0"

# 基础TLS 1.3
JA3="771,4865-4866,23-65281,29-23,0"
```

### 2. 指纹轮换策略

```javascript
const ja3Pool = [
  "771,4865-4866-4867,23-65281-10-11-35-16-5-13-18-51-45-43,29-23-24,0",
  "771,4865-4866,23-65281-10-11-35-16-5-13-18,29-23,0", 
  "771,4865-4866-4867,0-23-65281-10-11-35-16-5-13-18-51-45-43,29-23-24,0"
];

const randomJA3 = ja3Pool[Math.floor(Math.random() * ja3Pool.length)];
const response = await client.requestWithJA3(config, randomJA3);
```

### 3. 错误处理和回退

```javascript
async function reliableRequest(config) {
  try {
    // 首先尝试JA3
    return await client.requestWithJA3(config, customJA3);
  } catch (error) {
    console.log('JA3失败，回退到标准配置');
    // 回退到标准配置文件
    return await client.request({...config, profile: 'chrome_120'});
  }
}
```

## 🔧 构建和开发

### 本地开发环境

```bash
# 安装Go 1.24+ 
# 设置Go模块代理 (中国用户)
export GOPROXY=https://goproxy.cn,direct
export GOSUMDB=off

# 安装依赖
go mod download

# 编译当前平台
go build -ldflags="-s -w" -o build/tls-client ./cmd/cli
```

### 跨平台编译

```bash
# 编译所有平台 (推荐)
./build.sh

# 手动编译特定平台
GOOS=linux GOARCH=amd64 go build -ldflags="-s -w" -o build/tls-client-linux-x86_64 ./cmd/cli
GOOS=windows GOARCH=amd64 go build -ldflags="-s -w" -o build/tls-client-windows-x86_64.exe ./cmd/cli
```

### Git和版本控制

项目已配置完善的`.gitignore`，自动忽略：
- 编译输出 (`build/`)
- Go工具链 (`go/`)
- 依赖包 (`vendor/`, `node_modules/`)
- 大文件 (`*.tar.gz`)

## 📋 常见问题

### Q: JA3指纹请求失败怎么办？
A: 1) 先测试标准配置: `-profile chrome_120`  
   2) 使用简化JA3: `"771,4865-4866,23-65281,29-23,0"`  
   3) 检查网络和代理设置

### Q: 如何验证JA3指纹效果？
A: 使用TLS测试网站: `./tls-client -url "https://tls.peet.ws/api/all" -ja3 "your-ja3"`

### Q: Windows AMD64和x86_64是同一个版本吗？
A: 是的，AMD64 = x86_64 = x64，都指64位Intel/AMD处理器架构。

### Q: 支持自动CAPTCHA处理吗？
A: 不支持。此工具专注于TLS指纹模拟，需要结合其他验证码处理服务。

### Q: 性能如何？
A: 基于Go构建，性能优秀。支持并发请求，适合高并发场景。单个请求通常在1-3秒内完成。

## 📚 文档

- [JA3指纹功能完整指南](JA3_FINGERPRINT_GUIDE.md)
- [跨平台编译信息](BUILD_PLATFORMS_INFO.md)
- [浏览器配置文件列表](BROWSER_PROFILES.md)
- [实现总结](JA3_IMPLEMENTATION_SUMMARY.md)

## 📄 许可证

基于原项目许可证。请查看 [LICENSE](LICENSE) 文件。

## 🙏 致谢

- [bogdanfinn/tls-client](https://github.com/bogdanfinn/tls-client) - 原始TLS客户端项目
- [bogdanfinn/fhttp](https://github.com/bogdanfinn/fhttp) - 增强的HTTP库
- [bogdanfinn/utls](https://github.com/bogdanfinn/utls) - 用户空间TLS库

## 📞 支持和贡献

- 提交Issue反馈问题
- 参考文档获取详细使用说明
- 查看示例代码学习最佳实践

---

**TLS-Client v1.11.0 with JA3 Support** - 让网络请求更像真实浏览器 🚀