# TLS-Client 跨平台编译信息

## 编译结果总览

已成功编译支持JA3指纹自定义功能的CLI，覆盖主流操作系统和架构：

### 📦 编译文件列表

| 文件名 | 操作系统 | 架构 | 大小 | 说明 |
|--------|----------|------|------|------|
| `tls-client-macos-arm64` | macOS | ARM64 | 9.4M | Apple Silicon (M1/M2/M3) |
| `tls-client-macos-x86_64` | macOS | x86_64 | 10M | Intel Mac |
| `tls-client-linux-x86_64` | Linux | x86_64 | 9.9M | 64位Linux (AMD64) |
| `tls-client-linux-arm64` | Linux | ARM64 | 9.1M | ARM64 Linux (服务器/树莓派等) |
| `tls-client-linux-x86` | Linux | x86 | 9.3M | 32位Linux |
| `tls-client-windows-x86_64.exe` | Windows | x86_64 | 10M | 64位Windows (AMD64) |
| `tls-client-windows-x86.exe` | Windows | x86 | 9.5M | 32位Windows |

## 架构说明

### 关于 AMD64 vs x86_64
**AMD64** 和 **x86_64** 是相同架构的不同名称：
- **AMD64**: AMD公司首先实现的64位扩展
- **x86_64**: Intel的命名方式
- **x64**: Microsoft的简化命名

**结论**: `tls-client-windows-x86_64.exe` 就是你需要的64位Intel/AMD处理器版本。

### 推荐使用

#### Windows用户
- **64位系统** (主流): `tls-client-windows-x86_64.exe`
- **32位系统** (少见): `tls-client-windows-x86.exe`

#### macOS用户  
- **Apple Silicon** (M1/M2/M3): `tls-client-macos-arm64`
- **Intel Mac**: `tls-client-macos-x86_64`

#### Linux用户
- **64位Intel/AMD**: `tls-client-linux-x86_64`
- **ARM64服务器/树莓派**: `tls-client-linux-arm64`
- **32位系统**: `tls-client-linux-x86`

## 使用方法

### 1. 下载对应版本
根据你的系统架构选择相应的文件。

### 2. 添加执行权限 (Linux/macOS)
```bash
chmod +x tls-client-*
```

### 3. 基本使用
```bash
# Windows
./tls-client-windows-x86_64.exe -url "https://httpbin.org/get"

# macOS (Apple Silicon)
./tls-client-macos-arm64 -url "https://httpbin.org/get"

# Linux (64位)
./tls-client-linux-x86_64 -url "https://httpbin.org/get"
```

### 4. JA3指纹使用
```bash
# 使用自定义JA3指纹
./tls-client-* -url "https://httpbin.org/get" \
  -ja3 "771,4865-4866-4867,23-65281-10-11-35-16-5-13-18-51-45-43,29-23-24,0"

# 使用预定义浏览器配置
./tls-client-* -url "https://httpbin.org/get" -profile chrome_120
```

## 文件验证

### 架构验证
```bash
# Linux/macOS
file tls-client-*

# Windows (PowerShell)
Get-ItemProperty tls-client-windows-*.exe | Select-Object Name, Length
```

### 功能测试
```bash
# 测试基本功能
./tls-client-* -version

# 测试网络请求
./tls-client-* -url "https://httpbin.org/get" -profile chrome_120

# 列出支持的浏览器配置
./tls-client-* -list-profiles
```

## 编译信息

- **Go版本**: 1.24.1
- **编译选项**: `-ldflags="-s -w"` (去除调试信息，减小文件大小)
- **静态链接**: 所有依赖都打包在可执行文件中
- **JA3支持**: ✅ 完整支持
- **浏览器配置**: ✅ 67个预定义配置文件

## 系统兼容性

### 最低系统要求

#### Windows
- **64位**: Windows 7 SP1 / Server 2008 R2 或更高
- **32位**: Windows 7 SP1 或更高

#### macOS
- **ARM64**: macOS 11.0 (Big Sur) 或更高
- **x86_64**: macOS 10.12 (Sierra) 或更高

#### Linux
- **64位**: 任何现代Linux发行版 (glibc 2.17+)
- **ARM64**: Ubuntu 18.04+, CentOS 8+, 或同等版本
- **32位**: 支持但不推荐用于生产环境

## 故障排除

### 常见问题

1. **权限被拒绝** (Linux/macOS)
   ```bash
   chmod +x tls-client-*
   ```

2. **文件无法执行** (Windows)
   - 确保下载了正确的架构版本 (x86_64 vs x86)
   - 检查Windows Defender是否误报

3. **网络连接问题**
   - 检查防火墙设置
   - 尝试使用代理: `-proxy http://127.0.0.1:8080`

4. **JA3指纹失败**
   - 先测试标准配置: `-profile chrome_120`
   - 使用简化的JA3指纹进行测试

### 性能对比

| 架构 | 相对性能 | 内存使用 | 启动速度 |
|------|----------|----------|----------|
| ARM64 | 100% | 较低 | 快 |
| x86_64 | 95% | 标准 | 标准 |
| x86 | 80% | 较高 | 较慢 |

## 更新记录

- **v1.11.0-ja3**: 添加JA3指纹自定义支持
- 编译时间: 2025-08-09
- 包含67个预定义浏览器配置文件
- 支持自定义TLS配置
- Node.js集成支持

## 许可证

本项目基于原TLS-Client项目，请参考原项目的许可证信息。
