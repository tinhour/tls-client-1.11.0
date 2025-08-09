# 浏览器配置文件完整列表

## 📋 概述

TLS-Client CLI 现在支持超过70种浏览器配置文件，覆盖主流桌面浏览器、移动端浏览器和专业应用的TLS指纹。

## 🌐 桌面浏览器配置

### Chrome 系列
```
chrome_103, chrome_104, chrome_105, chrome_106, chrome_107,
chrome_108, chrome_109, chrome_110, chrome_111, chrome_112,
chrome_116, chrome_117, chrome_118, chrome_119, chrome_120,
chrome_124, chrome_131, chrome_133
```

**使用示例：**
```bash
# 使用Chrome 120配置
./build/tls-client -url "https://httpbin.org/get" -profile chrome_120

# 使用Chrome 103配置（较老版本）
./build/tls-client -url "https://httpbin.org/get" -profile chrome_103
```

### Firefox 系列
```
firefox_102, firefox_104, firefox_105, firefox_106, firefox_108,
firefox_110, firefox_117, firefox_118, firefox_119, firefox_120,
firefox_123, firefox_132, firefox_133, firefox_135
```

**使用示例：**
```bash
# 使用Firefox 117配置
./build/tls-client -url "https://httpbin.org/get" -profile firefox_117

# 使用最新Firefox 135配置
./build/tls-client -url "https://httpbin.org/get" -profile firefox_135
```

### Safari 系列（桌面版）
```
safari_15_6_1, safari_16_0, safari_16_5, safari_17_0
```

**使用示例：**
```bash
# 使用Safari 16.0配置
./build/tls-client -url "https://httpbin.org/get" -profile safari_16_0
```

### Opera 系列
```
opera_89, opera_90, opera_91
```

**使用示例：**
```bash
# 使用Opera 91配置
./build/tls-client -url "https://httpbin.org/get" -profile opera_91
```

## 📱 移动端配置

### Safari iOS 系列
```
safari_ios_15_5, safari_ios_15_6, safari_ios_16_0,
safari_ios_17_0, safari_ios_18_0, safari_ios_18_5
```

**使用示例：**
```bash
# 使用iOS 17.0 Safari配置
./build/tls-client -url "https://httpbin.org/get" -profile safari_ios_17_0 \
  -headers '{"User-Agent":"Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1"}'
```

### Safari iPad 系列
```
safari_ipad_15_6
```

### 移动应用配置
```
zalando_android_mobile, zalando_ios_mobile,
nike_android_mobile, nike_ios_mobile,
mesh_android, mesh_ios,
confirmed_android, confirmed_ios
```

**使用示例：**
```bash
# 使用Nike iOS应用配置
./build/tls-client -url "https://api.nike.com/cic/browse/v2" -profile nike_ios_mobile \
  -headers '{"User-Agent":"Nike/7.8.0 (iPhone; iOS 17.0; Scale/3.00)"}'

# 使用Zalando Android应用配置
./build/tls-client -url "https://www.zalando.com/api/" -profile zalando_android_mobile \
  -headers '{"User-Agent":"Zalando/24.5.1 (Android 13; Samsung SM-G998B)"}'
```

## 🔧 专业/技术配置

### Android OkHttp 系列
```
okhttp4_android_7, okhttp4_android_8, okhttp4_android_9,
okhttp4_android_10, okhttp4_android_11, okhttp4_android_12,
okhttp4_android_13
```

**使用示例：**
```bash
# 使用OkHttp 4.11配置
./build/tls-client -url "https://httpbin.org/get" -profile okhttp4_android_11 \
  -headers '{"User-Agent":"okhttp/4.11.0"}'
```

### 特殊用途配置
```
cloudscraper     # Cloudflare绕过
mms_ios          # MMS iOS应用
mms_ios_1        # MMS iOS变体1
mms_ios_2        # MMS iOS变体2
mms_ios_3        # MMS iOS变体3
mesh_ios_1       # Mesh iOS变体1
mesh_ios_2       # Mesh iOS变体2
mesh_android_1   # Mesh Android变体1
mesh_android_2   # Mesh Android变体2
```

**使用示例：**
```bash
# 使用Cloudflare绕过配置
./build/tls-client -url "https://example.com" -profile cloudscraper
```

### 向前兼容配置
```
edge_107, edge_99    # 使用Chrome配置兼容Edge
```

## 🚀 Node.js 使用示例

### 基本使用
```javascript
const { createClient } = require('./nodejs-integration');

// 创建Chrome 120客户端
const chromeClient = createClient({
    profile: 'chrome_120',
    timeout: 30
});

// 创建iPhone Safari客户端
const iosClient = createClient({
    profile: 'safari_ios_17_0',
    timeout: 30
});

// 创建Android应用客户端
const androidClient = createClient({
    profile: 'nike_android_mobile',
    timeout: 30
});
```

### 配置文件轮换
```javascript
const profiles = [
    'chrome_120', 'chrome_117', 'chrome_110',
    'firefox_117', 'firefox_120', 'firefox_135',
    'safari_16_0', 'safari_ios_17_0',
    'opera_91'
];

let currentIndex = 0;

function getNextProfile() {
    const profile = profiles[currentIndex];
    currentIndex = (currentIndex + 1) % profiles.length;
    return profile;
}

// 使用轮换的配置文件
const client = createClient({
    profile: getNextProfile(),
    timeout: 30
});
```

### 移动端应用模拟
```javascript
// Nike应用模拟
const nikeClient = createClient({
    profile: 'nike_ios_mobile'
});

const nikeResponse = await nikeClient.get('https://api.nike.com/cic/browse/v2', {
    headers: {
        'User-Agent': 'Nike/7.8.0 (iPhone; iOS 17.0; Scale/3.00)',
        'Accept': 'application/json',
        'X-Nike-VisitorId': 'unique-visitor-id'
    }
});

// Zalando应用模拟
const zalandoClient = createClient({
    profile: 'zalando_android_mobile'
});

const zalandoResponse = await zalandoClient.get('https://www.zalando.com/api/catalog', {
    headers: {
        'User-Agent': 'Zalando/24.5.1 (Android 13; Samsung SM-G998B)',
        'Accept': 'application/json'
    }
});
```

## 📊 配置文件特点对比

| 配置类型 | TLS版本 | HTTP版本 | 特点 | 适用场景 |
|---------|---------|----------|------|----------|
| Chrome 系列 | TLS 1.3 | HTTP/2, HTTP/3 | 现代化TLS扩展 | 通用爬虫，API调用 |
| Firefox 系列 | TLS 1.3 | HTTP/2 | 独特的TLS指纹 | 反检测，多样化 |
| Safari 系列 | TLS 1.3 | HTTP/2 | Apple生态特征 | iOS/macOS环境 |
| 移动应用 | TLS 1.3 | HTTP/2 | 应用特定指纹 | 应用API调用 |
| OkHttp | TLS 1.3 | HTTP/2 | Android原生库 | Android应用模拟 |

## 🔍 选择建议

### 通用爬虫
推荐使用：`chrome_120`, `chrome_117`, `firefox_117`

### 移动端模拟
推荐使用：`safari_ios_17_0`, `safari_ios_18_0`

### 应用API调用
推荐使用对应的应用配置：`nike_ios_mobile`, `zalando_android_mobile`

### 反检测场景
推荐轮换使用多种配置文件

### 高并发场景
推荐使用：`okhttp4_android_11`, `chrome_117`

## 🧪 测试配置文件

```bash
# 列出所有支持的配置文件
./build/tls-client -list-profiles

# 测试特定配置文件
./build/tls-client -url "https://tls.peet.ws/api/all" -profile chrome_120

# 批量测试（使用配置文件）
for profile in chrome_120 firefox_117 safari_16_0; do
    echo "Testing $profile..."
    ./build/tls-client -url "https://httpbin.org/get" -profile "$profile"
done
```

## 📈 性能建议

1. **启动性能**：所有配置文件启动时间相近（<50ms）
2. **内存占用**：基本配置约15-20MB，复杂配置约20-25MB
3. **网络性能**：HTTP/2配置通常比HTTP/1.1快10-30%
4. **并发性能**：建议单个配置文件处理100-500并发

## 🔄 版本更新

随着浏览器版本更新，新的配置文件会持续添加。建议：

1. 定期更新到最新版本
2. 测试新配置文件的兼容性
3. 逐步迁移到新版本配置文件
4. 保留旧版本配置文件作为备用

## ⚠️ 注意事项

1. **配置文件映射**：某些版本号可能映射到相同的实际配置
2. **兼容性**：移动端配置文件可能不适用于桌面环境
3. **更新频率**：浏览器厂商更新频率影响配置文件有效性
4. **检测对抗**：高级反爬虫系统可能检测到模拟行为

---

*最后更新：2024年1月 | TLS-Client CLI v1.11.0*
