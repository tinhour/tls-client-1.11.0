# JA3指纹自定义功能指南

## 概述

TLS-Client CLI现在支持JA3指纹自定义，允许你模拟各种浏览器和客户端的TLS指纹特征，从而更好地绕过指纹检测和访问限制。

## 什么是JA3指纹？

JA3是一种TLS客户端指纹识别方法，通过分析TLS握手过程中的以下字段生成指纹：
- TLS版本
- 支持的密码套件列表
- TLS扩展列表
- 支持的椭圆曲线列表
- 椭圆曲线点格式列表

JA3指纹格式：`TLSVersion,CipherSuites,Extensions,EllipticCurves,EllipticCurvePointFormats`

## CLI使用方式

### 1. 使用简单JA3指纹

```bash
# 使用自定义JA3指纹
./tls-client -url "https://httpbin.org/get" -ja3 "771,4865-4866-4867,23-65281-10-11-35-16-5-13-18-51-45-43-27,29-23-24,0"
```

### 2. 使用完整自定义TLS配置

```bash
# 使用JSON格式的完整TLS配置
./tls-client -url "https://httpbin.org/get" -custom-tls '{
    "ja3String": "771,4865-4866-4867,23-65281-10-11-35-16-5-13-18-51-45-43-27,29-23-24,0",
    "h2Settings": {
        "HEADER_TABLE_SIZE": 65536,
        "MAX_CONCURRENT_STREAMS": 1000,
        "INITIAL_WINDOW_SIZE": 6291456,
        "MAX_HEADER_LIST_SIZE": 262144
    },
    "alpnProtocols": ["h2", "http/1.1"],
    "supportedVersions": ["GREASE", "1.3", "1.2"]
}'
```

## Node.js集成使用

### 基本JA3使用

```javascript
const { createClient } = require('./index');

const client = createClient();

// 使用JA3指纹
const response = await client.requestWithJA3({
    url: 'https://httpbin.org/get',
    headers: {
        'User-Agent': 'CustomClient/1.0'
    }
}, "771,4865-4866-4867,23-65281-10-11-35-16-5-13-18-51-45-43-27,29-23-24,0");

console.log(response);
```

### 使用完整自定义TLS配置

```javascript
const customTlsConfig = {
    ja3String: "771,4865-4866-4867,23-65281-10-11-35-16-5-13-18-51-45-43-27,29-23-24,0",
    h2Settings: {
        "HEADER_TABLE_SIZE": 65536,
        "MAX_CONCURRENT_STREAMS": 1000,
        "INITIAL_WINDOW_SIZE": 6291456,
        "MAX_HEADER_LIST_SIZE": 262144
    },
    h2SettingsOrder: [
        "HEADER_TABLE_SIZE",
        "MAX_CONCURRENT_STREAMS",
        "INITIAL_WINDOW_SIZE",
        "MAX_HEADER_LIST_SIZE"
    ],
    supportedSignatureAlgorithms: [
        "ECDSAWithP256AndSHA256",
        "PSSWithSHA256",
        "PKCS1WithSHA256",
        "ECDSAWithP384AndSHA384",
        "PSSWithSHA384",
        "PKCS1WithSHA384",
        "PSSWithSHA512",
        "PKCS1WithSHA512"
    ],
    supportedVersions: ["GREASE", "1.3", "1.2"],
    keyShareCurves: ["GREASE", "X25519"],
    certCompressionAlgos: ["brotli"],
    alpnProtocols: ["h2", "http/1.1"],
    alpsProtocols: ["h2"],
    pseudoHeaderOrder: [":method", ":authority", ":scheme", ":path"],
    connectionFlow: 15663105
};

const response = await client.requestWithCustomTLS({
    url: 'https://httpbin.org/get',
    headers: {
        'User-Agent': 'CustomTLS-Client/1.0'
    }
}, customTlsConfig);
```

## 常用JA3指纹示例

### Chrome浏览器系列

```bash
# Chrome 120 (Windows)
JA3: "771,4865-4866-4867-49195-49199-49196-49200-52393-52392-49171-49172-156-157-47-53,0-23-65281-10-11-35-16-5-13-18-51-45-43-27-17513,29-23-24,0"

# Chrome 119 (Windows)  
JA3: "771,4865-4866-4867-49195-49199-49196-49200-52393-52392-49171-49172-156-157-47-53,0-23-65281-10-11-35-16-5-13-18-51-45-43-27,29-23-24,0"

# Chrome Mobile (Android)
JA3: "771,4865-4866-4867-49195-49199-49196-49200-52393-52392-49171-49172-156-157-47-53,65281-0-23-13-5-18-16-11-51-45-43-10-27,29-23-24-25,0"
```

### Firefox浏览器系列

```bash
# Firefox 117 (Windows)
JA3: "771,4865-4866-4867-49195-49199-49196-49200-52393-52392-49171-49172-156-157-47-53,0-23-65281-10-11-35-16-5-13-18-51-45-43-27,29-23-24,0"

# Firefox 120 (Windows)
JA3: "771,4865-4866-4867-49195-49199-49196-49200-52393-52392-49171-49172-156-157-47-53,0-23-65281-10-11-35-16-5-13-18-51-45-43-27-17513,29-23-24,0"

# Firefox Mobile (Android)
JA3: "771,4865-4866-4867-49195-49199-49196-49200-52393-52392-49171-49172-156-157-47-53,65281-0-23-13-5-18-16-11-51-45-43-10,29-23-24,0"
```

### Safari浏览器系列

```bash
# Safari 16 (macOS)
JA3: "771,4865-4866-4867-49195-49199-49196-49200-52393-52392-49171-49172-156-157-47-53,65281-0-23-13-5-18-16-11-51-45-43-10,29-23-24-25,0"

# Safari iOS 17
JA3: "771,4865-4866-4867-49195-49199-49196-49200-52393-52392-49171-49172-156-157-47-53,65281-0-23-13-5-18-16-11-51-45-43-10-27,29-23-24-25,0"
```

### 移动应用指纹

```bash
# Android应用通用指纹
JA3: "771,4865-4866-4867,23-65281-10-11-35-16-5-13-18-51-45-43,29-23-24,0"

# iOS应用通用指纹
JA3: "771,4865-4866-4867,65281-0-23-13-5-18-16-11-51-45-43,29-23-24,0"

# OkHttp (Android)
JA3: "771,4865-4866-4867-49195-49199-49196-49200-52393-52392-49171-49172-156-157-47-53,0-23-65281-10-11-35-16-5-13-18-51-45-43,29-23-24,0"
```

## 自定义TLS配置参数说明

### 基本参数

- **ja3String**: JA3指纹字符串（必需）
- **h2Settings**: HTTP/2设置
- **h2SettingsOrder**: HTTP/2设置顺序
- **supportedSignatureAlgorithms**: 支持的签名算法
- **supportedVersions**: 支持的TLS版本
- **keyShareCurves**: 密钥共享曲线
- **alpnProtocols**: ALPN协议列表
- **pseudoHeaderOrder**: 伪头部顺序

### HTTP/2设置示例

```json
{
    "h2Settings": {
        "HEADER_TABLE_SIZE": 65536,
        "ENABLE_PUSH": 1,
        "MAX_CONCURRENT_STREAMS": 1000,
        "INITIAL_WINDOW_SIZE": 6291456,
        "MAX_FRAME_SIZE": 16384,
        "MAX_HEADER_LIST_SIZE": 262144
    },
    "h2SettingsOrder": [
        "HEADER_TABLE_SIZE",
        "ENABLE_PUSH",
        "MAX_CONCURRENT_STREAMS",
        "INITIAL_WINDOW_SIZE",
        "MAX_FRAME_SIZE",
        "MAX_HEADER_LIST_SIZE"
    ]
}
```

### 支持的签名算法

```json
[
    "ECDSAWithP256AndSHA256",
    "PSSWithSHA256", 
    "PKCS1WithSHA256",
    "ECDSAWithP384AndSHA384",
    "PSSWithSHA384",
    "PKCS1WithSHA384",
    "PSSWithSHA512",
    "PKCS1WithSHA512"
]
```

### 支持的TLS版本

```json
["GREASE", "1.3", "1.2", "1.1", "1.0"]
```

### 密钥共享曲线

```json
["GREASE", "X25519", "secp256r1", "secp384r1", "secp521r1"]
```

## 实际应用场景

### 1. 绕过基本浏览器检测

```javascript
// 模拟Chrome浏览器
const chromeJA3 = "771,4865-4866-4867-49195-49199-49196-49200-52393-52392-49171-49172-156-157-47-53,0-23-65281-10-11-35-16-5-13-18-51-45-43-27-17513,29-23-24,0";

const response = await client.requestWithJA3({
    url: 'https://example.com/api',
    headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
    }
}, chromeJA3);
```

### 2. 移动端API模拟

```javascript
// 模拟移动应用
const mobileJA3 = "771,4865-4866-4867,23-65281-10-11-35-16-5-13-18-51-45-43,29-23-24,0";

const response = await client.requestWithJA3({
    url: 'https://api.example.com/mobile/v1/data',
    headers: {
        'User-Agent': 'ExampleApp/1.0 (iOS; Version 17.0)',
        'X-App-Version': '1.0.0',
        'Accept': 'application/json'
    }
}, mobileJA3);
```

### 3. 指纹轮换策略

```javascript
const ja3Pool = [
    "771,4865-4866-4867,23-65281-10-11-35-16-5-13-18-51-45-43-27,29-23-24,0",
    "771,4865-4866-4867-49195-49199,0-23-65281-10-11-35-16-5-13-18-51-45-43,29-23-24,0",
    "771,4865-4866-4867-49195-49199-49196-49200,23-65281-10-11-35-16-5-13-18-51-45,29-23-24,0"
];

// 随机选择JA3指纹
const randomJA3 = ja3Pool[Math.floor(Math.random() * ja3Pool.length)];

const response = await client.requestWithJA3({
    url: 'https://example.com'
}, randomJA3);
```

## 故障排除

### 常见错误

1. **JA3解析失败**
   ```
   错误: 创建自定义TLS配置失败: invalid ja3 string format
   ```
   解决方案: 检查JA3字符串格式，确保包含5个用逗号分隔的部分。

2. **不支持的算法**
   ```
   错误: unsupported signature algorithm
   ```
   解决方案: 使用支持的签名算法列表中的值。

3. **HTTP/2设置错误**
   ```
   错误: invalid h2 setting
   ```
   解决方案: 检查H2设置的键名和值是否正确。

### 调试技巧

1. **验证JA3指纹**
   使用在线JA3测试工具验证生成的指纹：
   ```bash
   ./tls-client -url "https://tls.peet.ws/api/all"
   ```

2. **对比指纹差异**
   ```bash
   # 使用标准配置
   ./tls-client -url "https://tls.peet.ws/api/all" -profile chrome_120
   
   # 使用自定义JA3
   ./tls-client -url "https://tls.peet.ws/api/all" -ja3 "your-ja3-string"
   ```

3. **启用详细日志**
   ```bash
   ./tls-client -url "https://example.com" -ja3 "..." --verbose
   ```

## 高级用法

### 动态JA3生成

```javascript
// 根据目标网站动态调整JA3
function generateJA3ForTarget(targetDomain) {
    const domainProfiles = {
        'google.com': "771,4865-4866-4867-49195-49199-49196-49200-52393-52392-49171-49172-156-157-47-53,0-23-65281-10-11-35-16-5-13-18-51-45-43-27-17513,29-23-24,0",
        'amazon.com': "771,4865-4866-4867,23-65281-10-11-35-16-5-13-18-51-45-43,29-23-24,0",
        'facebook.com': "771,4865-4866-4867-49195-49199,0-23-65281-10-11-35-16-5-13-18-51-45-43,29-23-24,0"
    };
    
    return domainProfiles[targetDomain] || domainProfiles['google.com'];
}

// 使用
const targetDomain = new URL(config.url).hostname;
const ja3 = generateJA3ForTarget(targetDomain);
const response = await client.requestWithJA3(config, ja3);
```

### 配置文件管理

```json
{
    "profiles": {
        "chrome_latest": {
            "ja3String": "771,4865-4866-4867-49195-49199-49196-49200-52393-52392-49171-49172-156-157-47-53,0-23-65281-10-11-35-16-5-13-18-51-45-43-27-17513,29-23-24,0",
            "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
            "headers": {
                "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8",
                "Accept-Language": "en-US,en;q=0.9",
                "Accept-Encoding": "gzip, deflate, br"
            }
        }
    }
}
```

## 注意事项

1. **法律合规**: 确保你的使用符合目标网站的服务条款和当地法律法规。

2. **频率控制**: 避免过于频繁的请求，以免被检测为自动化行为。

3. **指纹更新**: 定期更新JA3指纹以匹配最新的浏览器版本。

4. **测试验证**: 在生产环境使用前，充分测试自定义指纹的有效性。

5. **错误处理**: 实现适当的错误处理和重试机制。

## 相关资源

- [JA3指纹检测工具](https://tls.peet.ws/)
- [TLS指纹数据库](https://tlsfingerprint.io/)
- [JA3官方文档](https://github.com/salesforce/ja3)